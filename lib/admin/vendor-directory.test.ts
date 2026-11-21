import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { vendorDisplayName, vendorSchema } from "@/lib/admin/vendors-agents";

// TASK-059: mixed vendor directory pages (normal, deleted/inactive, profile-missing).
const person = {
  userId: "u-1", name: "Funke Adebayo", email: "funke@store.ng", phone: "+2348000000001", role: "VENDOR",
  status: "ACTIVE", avatar: null, createdAt: "2026-11-01T00:00:00.000Z", location: "Lagos", isFlagged: false, flagReason: null,
};
const shared = { commissionRate: null, refundRate: 0, risk: "HEALTHY", categories: [], productCount: 0, orderCount: 0 };
const normal = { ...person, ...shared, profileComplete: true, vendorId: "v-1", storeName: "Funke Hair Hub", revenue: 54600, rating: 4.5, categories: ["Wigs"], productCount: 4, orderCount: 9 };
const deleted = { ...normal, userId: "u-2", vendorId: "v-2", name: "Deleted account", email: "deleted-u-2@anonymized.invalid", phone: "deleted-u-2", status: "INACTIVE", storeName: "Closed Store", revenue: 0, rating: 0 };
const missing = { ...person, ...shared, userId: "u-3", name: "Ada Vendor", email: "ada@vendor.ng", status: "SUSPEND", profileComplete: false, vendorId: null, storeName: null, revenue: null, rating: null };
const page = z.array(vendorSchema);

describe("Admin vendor directory contract (TASK-059)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps every row of a mixed page: normal, deleted/inactive and profile-missing", () => {
    const rows = page.parse([normal, deleted, missing]);
    expect(rows.map((r) => r.profileComplete)).toEqual([true, true, false]);
    expect(rows[2]).toMatchObject({ vendorId: null, storeName: null, revenue: null, rating: null });
    expect(rows.map(vendorDisplayName)).toEqual(["Funke Hair Hub", "Closed Store", "Ada Vendor"]);
  });

  it("accepts complete rows from older API builds without profileComplete", () => {
    const { profileComplete: _omit, ...legacy } = normal;
    expect(vendorSchema.parse(legacy).profileComplete).toBe(true);
  });

  it("still rejects nulls on a row that does not declare an incomplete profile", () => {
    expect(vendorSchema.safeParse({ ...normal, storeName: null }).success).toBe(false);
    const { profileComplete: _omit, ...legacy } = missing;
    expect(vendorSchema.safeParse(legacy).success).toBe(false);
  });

  it("rejects invented store facts on an incomplete row", () => {
    expect(vendorSchema.safeParse({ ...missing, revenue: 0 }).success).toBe(false);
    expect(vendorSchema.safeParse({ ...missing, vendorId: "v-9" }).success).toBe(false);
  });

  it("shows a readable error instead of raw validation issues when a row breaks the contract", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ statusCode: 200, message: "Vendors fetched successfully", meta: null, data: [normal, { ...normal, userId: "u-9", storeName: null }] })));
    const failure = await apiClient.admin.request("vendors", { method: "GET" }, (data) => page.parse(data)).catch((e: unknown) => e);
    expect(failure).toMatchObject({ name: "BackendProtocolError" });
    expect((failure as Error).message).toBe("Some records returned by the server could not be displayed. Please retry; if this continues, contact support.");
    expect((failure as Error).message).not.toMatch(/invalid_type|storeName|\[/);
  });
});
