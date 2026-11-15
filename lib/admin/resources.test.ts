import { describe, expect, it } from "vitest";
import { bookingSchema, categoryDetailSchema, categorySchema, commissionChartSchema, couponSchema, escrowOverviewSchema, listPath, messageSchema, orderSchema, payoutSchema, ticketSchema, transactionSchema } from "@/lib/admin/resources";

// Payload shapes captured from the live Admin API (docs/08-api-contract.md §7.2/§7.3).
const person = { userId: "u1", name: "Ada Okafor", email: "ada@example.test", phone: "+2348012345678", role: "CUSTOMER", status: "ACTIVE", avatar: null, createdAt: "2026-11-15T02:45:37.871Z", location: null, isFlagged: false, flagReason: null };
const escrow = { state: "HELD", heldAmount: 1070, releasedAmount: 0, refundedAmount: 0, platformFee: 50, tax: 20, netAmount: 1000 };

describe("Admin list query building", () => {
  it("drops empty values, keeps zero, encodes search and appends CSV format", () => {
    expect(listPath("bookings", { page: 1, limit: 10, status: undefined, search: "", escrowState: "HELD" })).toBe("bookings?page=1&limit=10&escrowState=HELD");
    expect(listPath("orders", { orderStatus: "SHIPPED,OUT_FOR_DELIVERY", page: 0 })).toBe("orders?orderStatus=SHIPPED%2COUT_FOR_DELIVERY&page=0");
    expect(listPath("coupons", { search: "WELCOME 10" }, "csv")).toBe("coupons?search=WELCOME+10&format=csv");
    expect(listPath("tickets", {})).toBe("tickets");
  });
});

describe("Admin API response schemas", () => {
  it("parses a booking list row and rejects an unknown escrow state", () => {
    const row = { id: "b1", bookingNumber: "BK-1", customer: person, stylist: { ...person, role: "STYLIST", stylistId: "s1", tier: "Bronze" }, services: [{ id: "braids", name: "Knotless braids", price: 1000 }], bookingDate: "2026-11-14T00:00:00.000Z", timeSlot: "10:00", serviceType: "SALON", address: null, status: "CONFIRMED", isPaid: true, totalAmount: 1070, escrow, createdAt: "2026-11-15T02:45:37.877Z", pointsEarned: 0 };
    expect(bookingSchema.parse(row).escrow.netAmount).toBe(1000);
    expect(() => bookingSchema.parse({ ...row, escrow: { ...escrow, state: "WEIRD" } })).toThrow();
  });

  it("parses orders including the additive vendorName", () => {
    const row = { id: "o1", orderNumber: "ORD-1", customer: person, vendorId: "v1", vendorName: "Lagos Hair Supply", items: [{ productId: "p1", name: "Pre-stretched braiding hair", quantity: 2, unitPrice: 1000 }], orderStatus: "SHIPPED", paymentStatus: "PAID", totalAmount: 3570, deliveryFee: 1500, escrow, createdAt: "2026-11-15T02:45:37.830Z", faultParty: null, pointsEarned: 0 };
    expect(orderSchema.parse(row).vendorName).toBe("Lagos Hair Supply");
    expect(orderSchema.parse({ ...row, vendorId: null, vendorName: null }).vendorId).toBeNull();
  });

  it("parses ledger rows with and without the enriched parties", () => {
    const base = { id: "t1", reference: "REL-1", createdAt: "2026-11-15T02:45:37.714Z", type: "RELEASE", source: "BOOKING", sourceId: "b1", amount: 1000, fee: 0, netAmount: 1000, status: "COMPLETED" };
    expect(transactionSchema.parse(base).from).toBeUndefined();
    expect(transactionSchema.parse({ ...base, sourceNumber: "BK-1", from: "PlaitAm Escrow", to: "Bisi Adeyemi" }).to).toBe("Bisi Adeyemi");
    expect(() => transactionSchema.parse({ ...base, amount: "1000" })).toThrow();
  });

  it("parses payouts, escrow overview and the commission chart", () => {
    expect(payoutSchema.parse({ id: "p1", reference: "WD-1", ownerType: "STYLIST", ownerId: "s1", amount: 1000, fee: 0, netAmount: 1000, status: "FAILED", holdReason: null, failureReason: "Bank rejected", bankName: "GTBank", maskedAccount: "******6789", createdAt: "2026-11-15T02:45:37.462Z", processedAt: null }).status).toBe("FAILED");
    expect(escrowOverviewSchema.parse({ serviceHeld: { amount: 1, count: 1 }, productHeld: { amount: 2, count: 2 }, releasedThisMonth: { amount: 3, count: 3 }, pendingPayouts: { amount: 4, count: 4 } }).productHeld.count).toBe(2);
    expect(commissionChartSchema.parse({ currency: "NGN", months: [{ month: "2026-11", serviceCommission: 2050, productCommission: 0 }], total: 2050 }).total).toBe(2050);
  });

  it("parses categories (list + detail with top products) and coupons", () => {
    const category = { id: "c1", name: "Braiding Hair", slug: "braiding-hair", description: null, commissionRate: 12, platformFeeRate: 5, status: "ACTIVE", sortOrder: 0, productCount: 3, unitsSold: 10, revenue: 28000, commissionEarned: 3360, createdAt: "2026-11-15T02:31:14.049Z" };
    expect(categorySchema.parse(category).commissionRate).toBe(12);
    expect(categoryDetailSchema.parse({ ...category, topProducts: [{ id: "p1", name: "Xpression 1B" }] }).topProducts?.[0].name).toBe("Xpression 1B");
    const coupon = { id: "k1", code: "WELCOME10", description: "10% off", discountType: "PERCENTAGE", discountValue: 10, maxDiscount: 3000, minOrderAmount: 5000, scope: "BOOKING", usageLimit: null, perUserLimit: 1, usedCount: 0, startsAt: "2026-11-15T09:15:43.135Z", expiresAt: null, isActive: true, status: "ACTIVE", ownerId: null, createdAt: "2026-11-15T09:15:43.135Z" };
    expect(couponSchema.parse(coupon).usageLimit).toBeNull();
    expect(() => couponSchema.parse({ ...coupon, discountType: "BOGO" })).toThrow();
  });

  it("parses tickets with the additive user fields and messages with sender names", () => {
    const ticket = { id: "t1", ticketNumber: "TK-1", userId: "u1", userName: "Ada Okafor", userAvatar: null, audience: "CUSTOMER", type: "GENERAL_SUPPORT", issueCategory: "GENERAL", subject: "Service payment", description: "Review captured service payment", attachments: [], priority: "MEDIUM", status: "PENDING", bookingId: "b1", orderId: null, replyCount: 0, createdAt: "2026-11-15T02:45:37.878Z", resolvedAt: null, timeline: [] };
    expect(ticketSchema.parse(ticket).userName).toBe("Ada Okafor");
    expect(ticketSchema.parse({ ...ticket, userName: undefined }).userName).toBeUndefined();
    const message = { id: "m1", ticketId: "t1", senderId: "a1", senderName: "Platform Administrator", senderRole: "ADMIN", message: "Looking into it", attachments: [], isInternal: false, createdAt: "2026-11-15T03:00:00.000Z" };
    expect(messageSchema.parse(message).senderName).toBe("Platform Administrator");
    expect(messageSchema.parse({ ...message, senderName: null }).senderName).toBeNull();
  });
});
