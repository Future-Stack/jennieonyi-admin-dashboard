import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminNotificationHref,
  badgeLabel,
  parseInboxPage,
  parseTicket,
  parseUnread,
  relativeTime,
} from "@/lib/admin/notifications";
import { allowedNotificationRoute, socketPublicUrl } from "@/lib/server/notifications";

const fetchBackend = vi.fn();
vi.mock("@/lib/server/admin-auth", async (original) => ({
  ...(await original<typeof import("@/lib/server/admin-auth")>()),
  fetchBackend: (...args: unknown[]) => fetchBackend(...args),
}));

const row = (id: string, isRead = false) => ({
  id,
  type: "TICKET_CREATED",
  title: "New support ticket",
  body: "Vendor ticket TK-1",
  entityType: "TICKET",
  entityId: "t1",
  createdAt: "2026-11-18T10:00:00.000Z",
  readAt: isRead ? "2026-11-18T10:05:00.000Z" : null,
  isRead,
});

describe("TASK-057 admin notification helpers", () => {
  it("parses a page, skipping malformed rows", () => {
    const page = parseInboxPage({
      data: [row("a"), { id: 5 }, row("b", true)],
      meta: { total: 2, page: 1, limit: 15, totalPages: 1, unreadCount: 1 },
    });
    expect(page.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(page.meta.unreadCount).toBe(1);
    expect(parseUnread({ data: { unread: 4 } })).toBe(4);
    expect(parseTicket({ data: { ticket: "t", expiresIn: 60, socketUrl: "http://127.0.0.1:5001" } })).toEqual({
      ticket: "t",
      socketUrl: "http://127.0.0.1:5001",
    });
  });

  it("preserves exact entity IDs in every supported destination", () => {
    for (const [entityType, route] of Object.entries({ TICKET: "support", STYLIST_SERVICE: "video-verification", PAYOUT: "payments", VENDOR: "vendors", STYLIST: "stylists", STREET_AGENT: "agents", BOOKING: "bookings", ORDER: "orders" })) {
      expect(adminNotificationHref({ entityType, entityId: "owned/id?x=2" })).toBe(`/dashboard/${route}?entityId=owned%2Fid%3Fx%3D2`);
    }
    expect(adminNotificationHref({ entityType: "TICKET", entityId: "" })).toBeNull();
    expect(adminNotificationHref({ entityType: "SOMETHING", entityId: "t1" })).toBeNull();
  });

  it("badge and relative time", () => {
    expect(badgeLabel(0)).toBeNull();
    expect(badgeLabel(7)).toBe("7");
    expect(badgeLabel(120)).toBe("99+");
    const now = new Date("2026-11-18T12:00:00.000Z");
    expect(relativeTime("2026-11-18T11:59:40.000Z", now)).toBe("Just now");
    expect(relativeTime("2026-11-18T11:30:00.000Z", now)).toBe("30m ago");
    expect(relativeTime("2026-11-17T11:00:00.000Z", now)).toBe("Yesterday");
  });

  it("BFF forwards only the five inbox routes", () => {
    const uuid = "0f3c5d4e-9a7b-4c21-8e3f-5a6b7c8d9e01";
    expect(allowedNotificationRoute("GET", [])).toBe(true);
    expect(allowedNotificationRoute("GET", ["unread-count"])).toBe(true);
    expect(allowedNotificationRoute("PATCH", ["read-all"])).toBe(true);
    expect(allowedNotificationRoute("PATCH", [uuid, "read"])).toBe(true);
    expect(allowedNotificationRoute("POST", ["socket-ticket"])).toBe(true);
    expect(allowedNotificationRoute("POST", ["test-send"])).toBe(false);
    expect(allowedNotificationRoute("DELETE", ["device-token"])).toBe(false);
    expect(allowedNotificationRoute("PATCH", ["../admin", "read"])).toBe(false);
    expect(allowedNotificationRoute("GET", ["unread-count", "x"])).toBe(false);
  });
});

describe("TASK-057 notifications BFF route", () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env.BACKEND_API_BASE_URL = "http://127.0.0.1:5001/api/v1";
    delete process.env.SOCKET_PUBLIC_URL;
  });
  afterEach(() => {
    process.env = { ...env };
  });

  const call = async (method: string, path: string[], init: { cookie?: boolean; origin?: string } = {}) => {
    const { GET, POST, PATCH } = await import("@/app/api/notifications/[[...path]]/route");
    const handler = { GET, POST, PATCH }[method as "GET" | "POST" | "PATCH"];
    const headers = new Headers();
    if (init.cookie !== false) headers.set("cookie", "plaitam_admin_access=admin-token");
    if (init.origin) headers.set("origin", init.origin);
    const request = new NextRequest(`http://localhost:3000/api/notifications/${path.join("/")}?status=unread`, {
      method,
      headers,
    });
    return handler(request, { params: Promise.resolve({ path }) });
  };

  it("forwards list with the cookie token as Bearer", async () => {
    fetchBackend.mockResolvedValue(new Response(JSON.stringify({ data: [], meta: {} }), { status: 200 }));
    const res = await call("GET", []);
    expect(res.status).toBe(200);
    const [target, init] = fetchBackend.mock.calls[0];
    expect(target).toBe("/notifications?status=unread");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer admin-token");
  });

  it("adds the public socket URL to the ticket", async () => {
    fetchBackend.mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, message: "ok", data: { ticket: "t", expiresIn: 60 } }), { status: 200 }),
    );
    const body = await (await call("POST", ["socket-ticket"])).json();
    expect(body.data).toEqual({ ticket: "t", expiresIn: 60, socketUrl: "http://127.0.0.1:5001" });
    process.env.SOCKET_PUBLIC_URL = "https://realtime.plaitam.ng/";
    expect(socketPublicUrl()).toBe("https://realtime.plaitam.ng");
  });

  it("refuses unknown paths, missing session and cross-origin writes", async () => {
    expect((await call("POST", ["test-send"])).status).toBe(404);
    expect((await call("GET", [], { cookie: false })).status).toBe(401);
    expect((await call("PATCH", ["read-all"], { origin: "https://evil.example" })).status).toBe(403);
    expect(fetchBackend).not.toHaveBeenCalled();
  });
});
