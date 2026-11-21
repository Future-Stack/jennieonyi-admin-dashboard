import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const adminProfileSchema = z
  .object({
    userId: z.string().min(1),
    name: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    role: z.string().min(1),
  })
  .passthrough();

export const loginDataSchema = z.object({
  message: z.string(),
  tokens: tokenPairSchema,
});

export const adminSearchResultSchema = z.object({
  users: z.array(
    z.object({
      userId: z.string(),
      name: z.string(),
      role: z.string(),
    }),
  ),
  bookings: z.array(z.object({ id: z.string(), bookingNumber: z.string() })),
  orders: z.array(z.object({ id: z.string(), orderNumber: z.string() })),
  tickets: z.array(z.object({ id: z.string(), ticketNumber: z.string() })),
  products: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const kpiSchema = z.object({
  value: z.number(),
  previous: z.number().nullable(),
  changePercent: z.number().nullable(),
});

const personProjectionSchema = z
  .object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    status: z.string(),
  })
  .passthrough();

export const dashboardOverviewSchema = z.object({
  kpis: z.object({
    customers: kpiSchema,
    stylists: kpiSchema,
    vendors: kpiSchema,
    agents: kpiSchema,
    bookings: kpiSchema,
    orders: kpiSchema,
    revenue: kpiSchema,
    escrowBalance: kpiSchema,
    pendingVideoReviews: kpiSchema,
    pendingVendors: kpiSchema,
    pendingPayouts: kpiSchema,
  }),
  today: z.object({
    bookings: z.number(),
    orders: z.number(),
  }),
});

export const dashboardAnalyticsSchema = z.object({
  kpis: z.object({
    revenue: kpiSchema,
    vendorSales: kpiSchema,
    bookings: kpiSchema,
    commission: kpiSchema,
  }),
  monthly: z.array(
    z.object({
      month: z.string(),
      serviceRevenue: z.number(),
      productRevenue: z.number(),
      bookings: z.number(),
      serviceCommission: z.number(),
      productCommission: z.number(),
    }),
  ),
  bookingsThisWeek: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    }),
  ),
  topStylists: z.array(
    personProjectionSchema.extend({
      specialties: z.array(z.string()),
      rating: z.number(),
      revenue: z.number(),
    }),
  ),
  topVendors: z.array(
    personProjectionSchema.extend({
      storeName: z.string(),
      rating: z.number(),
      revenue: z.number(),
    }),
  ),
});

export const dashboardOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customer: personProjectionSchema,
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
  orderStatus: z.string(),
  paymentStatus: z.string(),
  totalAmount: z.number(),
  createdAt: z.string(),
});

export const dashboardPendingApprovalSchema = z.object({
  id: z.string(),
  type: z.enum(["VIDEO", "VENDOR", "PAYOUT", "DISPUTE"]),
  reference: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const dashboardActivitySchema = z.object({
  id: z.string(),
  actorId: z.string().nullable(),
  actorRole: z.string().nullable(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  reason: z.string().nullable(),
  createdAt: z.string(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type AdminProfile = z.infer<typeof adminProfileSchema>;
export type AdminSearchResults = z.infer<typeof adminSearchResultSchema>;
export type Kpi = z.infer<typeof kpiSchema>;
export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
export type DashboardAnalytics = z.infer<typeof dashboardAnalyticsSchema>;
export type DashboardOrder = z.infer<typeof dashboardOrderSchema>;
export type DashboardPendingApproval = z.infer<
  typeof dashboardPendingApprovalSchema
>;
export type DashboardActivityEntry = z.infer<typeof dashboardActivitySchema>;

export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  meta: unknown;
  data: T;
  timestamp?: string;
}

export function parseEnvelopeData<T>(
  value: unknown,
  schema: z.ZodType<T>,
): { envelope: ApiEnvelope<T>; data: T } {
  const parsed = z
    .object({
      statusCode: z.number(),
      message: z.string(),
      meta: z.unknown().nullable().optional(),
      data: z.unknown(),
      timestamp: z.string().optional(),
    })
    .safeParse(value);

  if (!parsed.success) {
    throw new Error("The API returned an invalid response.");
  }

  const parsedData = schema.safeParse(parsed.data.data);
  if (!parsedData.success) {
    throw new Error("The API returned an invalid response.");
  }

  const envelope: ApiEnvelope<T> = {
    statusCode: parsed.data.statusCode,
    message: parsed.data.message,
    meta: parsed.data.meta ?? null,
    data: parsedData.data,
    ...(parsed.data.timestamp ? { timestamp: parsed.data.timestamp } : {}),
  };

  return { envelope, data: parsedData.data };
}
