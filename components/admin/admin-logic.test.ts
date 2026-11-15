import { describe, expect, it } from "vitest";
import { pageWindow } from "@/components/admin/common/kit";
import { feeBreakdown } from "@/components/admin/categories/CategoryDetailsModal";
import { canConfirmDelivery, DISPATCHED } from "@/components/admin/orders/OrderDetailsModal";

const escrow = (state: "UNPAID" | "HELD" | "LOCKED" | "RELEASED" | "REFUNDED") => ({ state, heldAmount: 0, releasedAmount: 0, refundedAmount: 0, platformFee: 0, tax: 0, netAmount: 0 });

describe("Admin screen business rules", () => {
  it("only offers delivery confirmation for dispatched orders whose escrow is held (not locked by a dispute)", () => {
    expect(DISPATCHED).toEqual(["SHIPPED", "OUT_FOR_DELIVERY"]);
    expect(canConfirmDelivery({ orderStatus: "SHIPPED", escrow: escrow("HELD") })).toBe(true);
    expect(canConfirmDelivery({ orderStatus: "OUT_FOR_DELIVERY", escrow: escrow("HELD") })).toBe(true);
    expect(canConfirmDelivery({ orderStatus: "SHIPPED", escrow: escrow("LOCKED") })).toBe(false);
    expect(canConfirmDelivery({ orderStatus: "PROCESSING", escrow: escrow("HELD") })).toBe(false);
    expect(canConfirmDelivery({ orderStatus: "DELIVERED", escrow: escrow("RELEASED") })).toBe(false);
  });

  it("explains category fees per ₦100 of vendor price (customer fee on top, commission deducted)", () => {
    const b = feeBreakdown({ platformFeeRate: 5, commissionRate: 12 });
    expect(b.fee).toBe(5);
    expect(b.commission).toBe(12);
    expect(b.customerPays).toBe(105);
    expect(b.vendorNet).toBe(88);
    expect(b.platformEarns).toBe(17);
  });

  it("builds a compact page window with gaps for long result sets", () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(1, 12)).toEqual([1, 2, "gap", 12]);
    expect(pageWindow(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
    expect(pageWindow(12, 12)).toEqual([1, "gap", 11, 12]);
  });
});
