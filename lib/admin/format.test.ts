import { describe, expect, it } from "vitest";
import { deliveryState, formatClock, formatDate, formatDateTime, formatSlot, initials, statusTone, titleCase } from "@/lib/admin/format";

describe("admin formatting helpers", () => {
  it("formats API dates as Lagos-time 'Mon D, YYYY' and tolerates missing/invalid values", () => {
    expect(formatDate("2026-11-14T00:00:00.000Z")).toBe("Nov 14, 2026");
    // 23:30 UTC on the 14th is already the 15th in Lagos (UTC+1).
    expect(formatDate("2026-11-14T23:30:00.000Z")).toBe("Nov 15, 2026");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
    expect(formatClock("2026-11-14T09:05:00.000Z")).toBe("10:05 AM");
    expect(formatDateTime(undefined)).toBe("—");
  });

  it("turns 24h booking slots into 12h clock text", () => {
    expect(formatSlot("10:00")).toBe("10:00 AM");
    expect(formatSlot("14:30")).toBe("2:30 PM");
    expect(formatSlot("00:15")).toBe("12:15 AM");
    expect(formatSlot("12:00")).toBe("12:00 PM");
    expect(formatSlot("Morning")).toBe("Morning");
    expect(formatSlot(null)).toBe("—");
  });

  it("title-cases enum values and derives avatar initials", () => {
    expect(titleCase("UNDER_REVIEW")).toBe("Under Review");
    expect(titleCase("OUT_FOR_DELIVERY")).toBe("Out For Delivery");
    expect(titleCase(undefined)).toBe("—");
    expect(initials("Ada Okafor")).toBe("AO");
    expect(initials("Temi")).toBe("T");
    expect(initials("  ")).toBe("?");
  });

  it("maps lifecycle statuses to the Figma pill tones", () => {
    expect(statusTone("HELD")).toBe("amber");
    expect(statusTone("released")).toBe("green");
    expect(statusTone("REFUNDED")).toBe("purple");
    expect(statusTone("CANCELLED")).toBe("red");
    expect(statusTone("SOMETHING_NEW")).toBe("gray");
  });

  it("derives the order 'Delivery' column from the order status", () => {
    expect(deliveryState("PENDING")).toEqual({ label: "Not Dispatched", tone: "gray" });
    expect(deliveryState("PROCESSING").label).toBe("Not Dispatched");
    expect(deliveryState("SHIPPED").label).toBe("Awaiting OTP");
    expect(deliveryState("OUT_FOR_DELIVERY").label).toBe("Awaiting OTP");
    expect(deliveryState("DELIVERED")).toEqual({ label: "OTP Confirmed", tone: "green" });
    expect(deliveryState("CANCELLED").label).toBe("Cancelled");
  });
});
