import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchBackend = vi.fn();
vi.mock("@/lib/server/admin-auth", () => ({
  ACCESS_TOKEN_COOKIE: "plaitam_admin_access",
  fetchBackend: (...args: unknown[]) => fetchBackend(...args),
}));

import { PATCH, POST } from "./[...path]/route";

function request(method: string, path: string, headers: Record<string, string> = {}, body?: string) {
  return new NextRequest(`http://localhost:3001/api/admin/${path}`, {
    method,
    headers: { cookie: "plaitam_admin_access=token-123", origin: "http://localhost:3001", ...headers },
    body,
  });
}
const ctx = (path: string[]) => ({ params: Promise.resolve({ path }) });

describe("Admin BFF proxy", () => {
  beforeEach(() => {
    fetchBackend.mockResolvedValue(new Response(JSON.stringify({ statusCode: 200, message: "ok", meta: null, data: {} }), { status: 200, headers: { "content-type": "application/json" } }));
  });

  it("forwards Idempotency-Key so financial mutations are accepted by the API", async () => {
    const key = "0b1c2d3e-4f50-4a6b-8c7d-9e0f1a2b3c4d";
    await POST(request("POST", "escrow/release", { "content-type": "application/json", "idempotency-key": key }, "{}"), ctx(["escrow", "release"]));
    const [path, init] = fetchBackend.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/admin/escrow/release");
    const sent = new Headers(init.headers);
    expect(sent.get("idempotency-key")).toBe(key);
    expect(sent.get("authorization")).toBe("Bearer token-123");
  });

  it("forwards Idempotency-Key on PATCH (booking cancel)", async () => {
    const key = "11111111-2222-4333-8444-555555555555";
    await PATCH(request("PATCH", "bookings/abc/cancel", { "content-type": "application/json", "idempotency-key": key }, '{"reason":"Stylist unavailable"}'), ctx(["bookings", "abc", "cancel"]));
    expect(new Headers((fetchBackend.mock.calls[0] as [string, RequestInit])[1].headers).get("idempotency-key")).toBe(key);
  });

  it("does not forward arbitrary browser headers or cookies", async () => {
    await POST(request("POST", "coupons", { "content-type": "application/json", "x-forwarded-host": "evil.test", "x-custom": "1" }, "{}"), ctx(["coupons"]));
    const sent = new Headers((fetchBackend.mock.calls[0] as [string, RequestInit])[1].headers);
    expect(sent.get("x-custom")).toBeNull();
    expect(sent.get("cookie")).toBeNull();
  });

  it("rejects cross-origin mutations before reaching the API", async () => {
    const response = await POST(request("POST", "coupons", { origin: "https://evil.test" }, "{}"), ctx(["coupons"]));
    expect(response.status).toBe(403);
    expect(fetchBackend).not.toHaveBeenCalled();
  });

  it("rejects path traversal", async () => {
    const response = await POST(request("POST", "x", { "content-type": "application/json" }, "{}"), ctx(["..", "auth"]));
    expect(response.status).toBe(400);
    expect(fetchBackend).not.toHaveBeenCalled();
  });
});
