import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { findNotificationTarget } from "./notification-target";

/* ---------- shared list plumbing ---------- */

const metaSchema = z
  .object({
    total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number(),
    stats: z.record(z.string(), z.number()).optional(),
    counts: z.record(z.string(), z.number()).optional(),
  })
  .passthrough();
export type ListMeta = z.infer<typeof metaSchema>;
export type ListParams = Record<string, string | number | undefined>;

const money = z.number();
const escrowSchema = z.object({
  state: z.enum(["UNPAID", "HELD", "LOCKED", "RELEASED", "REFUNDED"]),
  heldAmount: money, releasedAmount: money, refundedAmount: money, platformFee: money, tax: money, netAmount: money,
});
export type Escrow = z.infer<typeof escrowSchema>;
const personRef = z.object({ userId: z.string(), name: z.string(), avatar: z.string().nullable(), email: z.string().optional(), phone: z.string().optional() }).passthrough();
const timelineSchema = z.array(z.object({ action: z.string(), at: z.string(), reason: z.string().nullable() }));

export function listPath(resource: string, params: ListParams, format?: "csv"): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") query.set(key, String(value));
  if (format) query.set("format", format);
  const text = query.toString();
  return text ? `${resource}?${text}` : resource;
}

function useAdminList<T>(key: string, resource: string, schema: z.ZodType<T>, params: ListParams) {
  return useQuery({
    queryKey: ["admin", key, params],
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const result = await apiClient.admin.request(listPath(resource, params), { method: "GET", signal }, (data) => z.array(schema).parse(data));
      return { rows: result.data, meta: metaSchema.parse(result.meta) };
    },
  });
}

function useAdminDetail<T>(key: string, path: string | null, schema: z.ZodType<T>) {
  return useQuery({
    queryKey: ["admin", key, "detail", path],
    enabled: !!path,
    queryFn: async ({ signal }) => (await apiClient.admin.request(path!, { method: "GET", signal }, (data) => schema.parse(data))).data,
  });
}

type Method = "POST" | "PATCH" | "PUT" | "DELETE";
function useAdminWrite<TInput>(opts: { keys: string[]; method: Method; path: (input: TInput) => string; body?: (input: TInput) => unknown; idempotent?: boolean }) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => {
      const payload = opts.body?.(input);
      const headers: Record<string, string> = {};
      if (payload !== undefined) headers["Content-Type"] = "application/json";
      if (opts.idempotent) headers["Idempotency-Key"] = crypto.randomUUID();
      return apiClient.admin.request(opts.path(input), { method: opts.method, headers, ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) }, (data) => data);
    },
    onSuccess: () => {
      for (const key of [...opts.keys, "dashboard"]) void client.invalidateQueries({ queryKey: ["admin", key] });
    },
  });
}

const enc = encodeURIComponent;

/* ---------- bookings ---------- */

export const bookingSchema = z.object({
  id: z.string(), bookingNumber: z.string(), customer: personRef, stylist: personRef,
  services: z.array(z.object({ id: z.string(), name: z.string(), price: money })),
  bookingDate: z.string(), timeSlot: z.string(), serviceType: z.string(), address: z.string().nullable().optional(),
  status: z.string(), isPaid: z.boolean(), totalAmount: money, escrow: escrowSchema, createdAt: z.string(), pointsEarned: z.number().optional(),
  timeline: timelineSchema.optional(),
}).passthrough();
export type Booking = z.infer<typeof bookingSchema>;
export const useBookings = (params: ListParams) => useAdminList("bookings", "bookings", bookingSchema, params);
export const useBookingDetail = (id: string | null) => useAdminDetail("bookings", id ? `bookings/${enc(id)}` : null, bookingSchema);
export const useCancelBooking = () => useAdminWrite<{ id: string; reason: string }>({ keys: ["bookings", "payments"], method: "PATCH", idempotent: true, path: (x) => `bookings/${enc(x.id)}/cancel`, body: (x) => ({ reason: x.reason }) });

/* ---------- product orders ---------- */

export const orderSchema = z.object({
  id: z.string(), orderNumber: z.string(), customer: personRef, vendorId: z.string().nullable(), vendorName: z.string().nullable().optional(),
  items: z.array(z.object({ productId: z.string(), name: z.string(), quantity: z.number(), unitPrice: money })),
  orderStatus: z.string(), paymentStatus: z.string(), totalAmount: money, deliveryFee: money, escrow: escrowSchema, createdAt: z.string(),
  timeline: timelineSchema.optional(), faultParty: z.string().nullable().optional(), pointsEarned: z.number().optional(),
}).passthrough();
export type Order = z.infer<typeof orderSchema>;
export const useOrders = (params: ListParams) => useAdminList("orders", "orders", orderSchema, params);
export const useOrderDetail = (id: string | null) => useAdminDetail("orders", id ? `orders/${enc(id)}` : null, orderSchema);
export const useConfirmDelivery = () => useAdminWrite<{ id: string; reason: string; otp?: string }>({ keys: ["orders", "payments"], method: "POST", idempotent: true, path: (x) => `orders/${enc(x.id)}/confirm-delivery`, body: (x) => ({ reason: x.reason, ...(x.otp ? { otp: x.otp } : {}) }) });

/* ---------- escrow & payments ---------- */

export const transactionSchema = z.object({ id: z.string(), reference: z.string(), createdAt: z.string(), type: z.string(), source: z.string(), sourceId: z.string(), amount: money, fee: money, netAmount: money, status: z.string(), sourceNumber: z.string().nullable().optional(), from: z.string().nullable().optional(), to: z.string().nullable().optional() }).passthrough();
export type Transaction = z.infer<typeof transactionSchema>;
export const payoutSchema = z.object({ id: z.string(), reference: z.string(), ownerType: z.string(), ownerId: z.string(), amount: money, fee: money, netAmount: money, status: z.string(), holdReason: z.string().nullable(), failureReason: z.string().nullable(), bankName: z.string().nullable(), maskedAccount: z.string().nullable(), createdAt: z.string(), processedAt: z.string().nullable() }).passthrough();
export type Payout = z.infer<typeof payoutSchema>;
const bucket = z.object({ amount: money, count: z.number() });
export const escrowOverviewSchema = z.object({ serviceHeld: bucket, productHeld: bucket, releasedThisMonth: bucket, pendingPayouts: bucket });
export const commissionChartSchema = z.object({ currency: z.string(), months: z.array(z.object({ month: z.string(), serviceCommission: money, productCommission: money })), total: money });
export const useTransactions = (params: ListParams) => useAdminList("payments", "transactions", transactionSchema, params);
export const usePayouts = (params: ListParams) => useAdminList("payments", "payouts", payoutSchema, params);
export const usePayoutDetail = (id: string | null) => useQuery({
  queryKey: ["admin", "payments", "payout-detail", id], enabled: !!id,
  queryFn: ({ signal }) => findNotificationTarget(id!, async (page) => {
    const result = await apiClient.admin.request(listPath("payouts", { page, limit: 50 }), { method: "GET", signal }, (data) => z.array(payoutSchema).parse(data));
    return { rows: result.data, totalPages: metaSchema.parse(result.meta).totalPages };
  }, (row) => row.id, signal),
});
export const useEscrowOverview = () => useQuery({ queryKey: ["admin", "payments", "overview"], queryFn: async ({ signal }) => (await apiClient.admin.request("escrow/overview", { method: "GET", signal }, (d) => escrowOverviewSchema.parse(d))).data });
export const useCommissionChart = () => useQuery({ queryKey: ["admin", "payments", "chart"], queryFn: async ({ signal }) => (await apiClient.admin.request("commissions/chart", { method: "GET", signal }, (d) => commissionChartSchema.parse(d))).data });
export const useReleaseEscrow = () => useAdminWrite<{ source: "BOOKING" | "ORDER"; sourceId: string; reason: string }>({ keys: ["payments", "bookings", "orders"], method: "POST", idempotent: true, path: () => "escrow/release", body: (x) => x });
export const useProcessPayout = () => useAdminWrite<{ id: string; reason: string }>({ keys: ["payments"], method: "POST", idempotent: true, path: (x) => `payouts/${enc(x.id)}/process`, body: (x) => ({ reason: x.reason }) });

/* ---------- categories ---------- */

export const categorySchema = z.object({
  id: z.string(), name: z.string(), slug: z.string(), description: z.string().nullable().optional(), commissionRate: money, platformFeeRate: money,
  status: z.enum(["ACTIVE", "INACTIVE"]), sortOrder: z.number(), productCount: z.number(), unitsSold: z.number(), revenue: money, commissionEarned: money, createdAt: z.string(),
}).passthrough();
export type Category = z.infer<typeof categorySchema>;
export const categoryDetailSchema = categorySchema.extend({ topProducts: z.array(z.object({ id: z.string(), name: z.string(), price: money.optional(), images: z.array(z.string()).optional() }).passthrough()).optional() });
export type CategoryDetail = z.infer<typeof categoryDetailSchema>;
export type CategoryInput = { name: string; slug: string; description?: string; commissionRate: number; platformFeeRate?: number; status?: "ACTIVE" | "INACTIVE"; sortOrder?: number };
export const useCategories = (params: ListParams) => useAdminList("categories", "categories", categorySchema, params);
export const useCategoryDetail = (id: string | null) => useAdminDetail("categories", id ? `categories/${enc(id)}` : null, categoryDetailSchema);
export const useCreateCategory = () => useAdminWrite<CategoryInput>({ keys: ["categories"], method: "POST", path: () => "categories", body: (x) => x });
export const useUpdateCategory = () => useAdminWrite<{ id: string; data: Partial<CategoryInput> }>({ keys: ["categories"], method: "PATCH", path: (x) => `categories/${enc(x.id)}`, body: (x) => x.data });
export const useDeleteCategory = () => useAdminWrite<{ id: string }>({ keys: ["categories"], method: "DELETE", path: (x) => `categories/${enc(x.id)}` });

/* ---------- coupons ---------- */

export const couponSchema = z.object({
  id: z.string(), code: z.string(), description: z.string().nullable().optional(), discountType: z.enum(["PERCENTAGE", "FIXED"]), discountValue: money, maxDiscount: money.nullable().optional(),
  minOrderAmount: money, scope: z.string(), usageLimit: z.number().nullable(), perUserLimit: z.number().optional(), usedCount: z.number(), startsAt: z.string().nullable().optional(), expiresAt: z.string().nullable(),
  isActive: z.boolean(), status: z.enum(["ACTIVE", "EXPIRED", "DISABLED", "SCHEDULED"]), createdAt: z.string(),
}).passthrough();
export type Coupon = z.infer<typeof couponSchema>;
export type CouponInput = { code: string; description?: string; discountType: "PERCENTAGE" | "FIXED"; discountValue: number; maxDiscount?: number; minOrderAmount?: number; scope?: string; usageLimit?: number; perUserLimit?: number; startsAt?: string; expiresAt?: string; isActive?: boolean };
export const useCoupons = (params: ListParams) => useAdminList("coupons", "coupons", couponSchema, params);
export const useCreateCoupon = () => useAdminWrite<CouponInput>({ keys: ["coupons"], method: "POST", path: () => "coupons", body: (x) => x });
export const useUpdateCoupon = () => useAdminWrite<{ id: string; data: Partial<CouponInput> }>({ keys: ["coupons"], method: "PATCH", path: (x) => `coupons/${enc(x.id)}`, body: (x) => x.data });
export const useDeleteCoupon = () => useAdminWrite<{ id: string }>({ keys: ["coupons"], method: "DELETE", path: (x) => `coupons/${enc(x.id)}` });

/* ---------- support tickets ---------- */

export const ticketSchema = z.object({
  id: z.string(), ticketNumber: z.string(), userId: z.string(), audience: z.string(), type: z.string(), issueCategory: z.string(), subject: z.string(), description: z.string(),
  attachments: z.array(z.string()), priority: z.string(), status: z.string(), bookingId: z.string().nullable(), orderId: z.string().nullable(), replyCount: z.number(),
  createdAt: z.string(), resolvedAt: z.string().nullable(), timeline: timelineSchema.optional(),
  userName: z.string().optional(), userAvatar: z.string().nullable().optional(),
}).passthrough();
export type Ticket = z.infer<typeof ticketSchema>;
export const messageSchema = z.object({ id: z.string(), ticketId: z.string(), senderId: z.string().nullable(), senderName: z.string().nullable().optional(), senderRole: z.string(), message: z.string(), attachments: z.array(z.string()), isInternal: z.boolean(), createdAt: z.string() }).passthrough();
export type TicketMessage = z.infer<typeof messageSchema>;
export const useTickets = (params: ListParams) => useAdminList("tickets", "tickets", ticketSchema, params);
export const useTicketDetail = (id: string | null) => useAdminDetail("tickets", id ? `tickets/${enc(id)}` : null, ticketSchema);
export const useTicketMessages = (id: string | null) => useAdminList("tickets-messages", id ? `tickets/${enc(id)}/messages` : "tickets/none/messages", messageSchema, { page: 1, limit: 100, _t: id ?? "" }) ;
export const useTicketPriority = () => useAdminWrite<{ id: string; priority: string }>({ keys: ["tickets"], method: "PATCH", path: (x) => `tickets/${enc(x.id)}/priority`, body: (x) => ({ priority: x.priority }) });
export const useTicketStatus = () => useAdminWrite<{ id: string; status: "UNDER_REVIEW" | "RESOLVED" | "REJECTED" | "CLOSED"; resolution?: string }>({ keys: ["tickets"], method: "PATCH", path: (x) => `tickets/${enc(x.id)}/status`, body: (x) => ({ status: x.status, ...(x.resolution ? { resolution: x.resolution } : {}) }) });
export const useIssueRefund = () => useAdminWrite<{ id: string; amount: number; note: string; faultParty: "VENDOR" | "CUSTOMER" | "PLATFORM" | "NONE"; returnShippingCost?: number }>({ keys: ["tickets", "payments", "bookings", "orders"], method: "POST", idempotent: true, path: (x) => `tickets/${enc(x.id)}/refunds`, body: (x) => ({ amount: x.amount, note: x.note, faultParty: x.faultParty, ...(x.returnShippingCost ? { returnShippingCost: x.returnShippingCost } : {}) }) });
export function useTicketReply() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (x: { id: string; message: string; isInternal: boolean }) => {
      const form = new FormData();
      form.set("message", x.message);
      form.set("isInternal", String(x.isInternal));
      return apiClient.admin.request(`tickets/${enc(x.id)}/messages`, { method: "POST", body: form }, (data) => data);
    },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["admin", "tickets-messages"] }); void client.invalidateQueries({ queryKey: ["admin", "tickets"] }); },
  });
}
