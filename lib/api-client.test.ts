import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { apiClient } from "@/lib/api-client";

describe("Admin API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes validation failures without treating them as successful data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            statusCode: 422,
            message: "Validation failed",
            meta: null,
            data: null,
          },
          { status: 422 },
        ),
      ),
    );

    await expect(
      apiClient.admin.request("users", { method: "POST" }, (data) => data),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Validation failed",
      status: 422,
    } satisfies Partial<ApiError>);
  });

  it("reports invalid response JSON as a protocol error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("{", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(
      apiClient.admin.request("users", { method: "GET" }, (data) => data),
    ).rejects.toThrow("The Admin API returned invalid JSON.");
  });

  it("normalizes network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));

    await expect(
      apiClient.admin.request("users", { method: "GET" }, (data) => data),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Unable to reach the Admin API. Check your connection.",
      status: 0,
    });
  });

  it("downloads Admin CSV through the authenticated same-origin client", async () => {
    const click = vi.fn();
    const anchor = { href: "", download: "", click };
    const createObjectURL = vi.fn().mockReturnValue("blob:admin-export");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", { createElement: vi.fn().mockReturnValue(anchor) });
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const fetch = vi.fn().mockResolvedValue(
      new Response("name,email\r\nAda,ada@example.test", {
        status: 200,
        headers: { "Content-Type": "text/csv" },
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await apiClient.admin.download(
      "customers?format=csv&page=1",
      "customers.csv",
    );

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/customers?format=csv&page=1",
      expect.objectContaining({ method: "GET", credentials: "same-origin", cache: "no-store" }),
    );
    expect(anchor).toMatchObject({
      href: "blob:admin-export",
      download: "customers.csv",
    });
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:admin-export");
  });

  it("shares one refresh request across concurrent expired-token calls", async () => {
    const calls: string[] = [];
    const attempts = new Map<string, number>();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const path = String(input);
        calls.push(path);

        if (path === "/api/auth/session") {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return Response.json({
            statusCode: 200,
            message: "Session refreshed",
            meta: null,
            data: {
              userId: "admin-1",
              email: "admin@example.com",
              name: "Platform Admin",
              role: "ADMIN",
            },
          });
        }

        const count = (attempts.get(path) ?? 0) + 1;
        attempts.set(path, count);
        if (count === 1) {
          return Response.json(
            { statusCode: 401, message: "Expired", meta: null, data: null },
            { status: 401 },
          );
        }
        return Response.json({
          statusCode: 200,
          message: "OK",
          meta: null,
          data: { ok: true },
        });
      }),
    );

    const [first, second] = await Promise.all([
      apiClient.admin.request("users", { method: "GET" }, (data) => data),
      apiClient.admin.request("orders", { method: "GET" }, (data) => data),
    ]);

    expect(first.data).toEqual({ ok: true });
    expect(second.data).toEqual({ ok: true });
    expect(calls.filter((path) => path === "/api/auth/session")).toHaveLength(1);
  });
});
