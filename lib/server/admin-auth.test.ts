import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/api/contracts";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import {
  ACCESS_TOKEN_COOKIE,
  checkAdminSession,
  getBackendApiBaseUrl,
  loginTokensFromBody,
  setAuthCookies,
  tokenMaxAge,
} from "@/lib/server/admin-auth";

const envelopeBody = (data: unknown, statusCode = 200) => ({
    statusCode,
    message: "OK",
    meta: null,
    data,
    timestamp: new Date().toISOString(),
  });
const envelope = (data: unknown, statusCode = 200) =>
  Response.json(envelopeBody(data, statusCode), { status: statusCode });

const adminProfile = {
  userId: "admin-1",
  name: "Platform Admin",
  email: "admin@example.com",
  role: "ADMIN",
};

describe("Admin authentication contracts", () => {
  beforeEach(() => {
    process.env.BACKEND_API_BASE_URL = "http://backend.test/api/v1";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses the local backend default in development when no URL is configured", () => {
    delete process.env.BACKEND_API_BASE_URL;
    vi.stubEnv("NODE_ENV", "development");
    expect(getBackendApiBaseUrl()).toBe("http://127.0.0.1:5001/api/v1");
  });

  it("falls back to the local backend when a development URL is malformed", () => {
    process.env.BACKEND_API_BASE_URL = "localhost:3000";
    vi.stubEnv("NODE_ENV", "development");
    expect(getBackendApiBaseUrl()).toBe("http://127.0.0.1:5001/api/v1");
  });

  it("keeps production configuration explicit", () => {
    delete process.env.BACKEND_API_BASE_URL;
    vi.stubEnv("NODE_ENV", "production");
    expect(() => getBackendApiBaseUrl()).toThrow("BACKEND_API_BASE_URL is not configured.");
  });

  it("rejects malformed login input before sending it to the backend", () => {
    expect(adminLoginSchema.safeParse({ email: "not-an-email", password: "" }).success).toBe(
      false,
    );
    expect(
      adminLoginSchema.safeParse({
        email: " ADMIN@example.com ",
        password: "secret",
      }),
    ).toMatchObject({
      success: true,
      data: { email: "admin@example.com", password: "secret" },
    });
  });

  it("reads tokens only from the documented login response envelope", () => {
    expect(
      loginTokensFromBody(
        envelopeBody({
          message: "Login successful",
          tokens: { accessToken: "access", refreshToken: "refresh" },
        }),
      ),
    ).toEqual({ accessToken: "access", refreshToken: "refresh" });
    expect(() => loginTokensFromBody({ accessToken: "access" })).toThrow(
      "The API returned an invalid response.",
    );
  });

  it("denies authenticated non-Admin profiles", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      envelope({ ...adminProfile, role: "CUSTOMER" }),
    );

    await expect(checkAdminSession("access", "refresh")).resolves.toEqual({
      kind: "forbidden",
    });
  });

  it("rotates an expired access token before accepting an Admin session", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(envelope(null, 401))
      .mockResolvedValueOnce(
        envelope({ accessToken: "new-access", refreshToken: "new-refresh" }),
      )
      .mockResolvedValueOnce(envelope(adminProfile));

    await expect(checkAdminSession("old-access", "old-refresh")).resolves.toEqual({
      kind: "authenticated",
      user: adminProfile,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      rotated: true,
    });
  });

  it("derives cookie lifetime from token expiry and rejects expired tokens", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = `header.${Buffer.from(JSON.stringify({ exp: now + 60 })).toString("base64url")}.signature`;
    expect(tokenMaxAge(token)).toBeGreaterThan(0);

    const expiredToken = `header.${Buffer.from(JSON.stringify({ exp: now - 1 })).toString("base64url")}.signature`;
    expect(() => tokenMaxAge(expiredToken)).toThrow("The API returned an expired token.");
  });

  it("sets opaque tokens only in secure, HttpOnly cookies in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const now = Math.floor(Date.now() / 1000);
    const token = `header.${Buffer.from(JSON.stringify({ exp: now + 60 })).toString("base64url")}.signature`;
    const response = NextResponse.next();
    setAuthCookies(response, { accessToken: token, refreshToken: token });

    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  });

  it("keeps login tokens in HttpOnly cookies and returns only the Admin profile", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = `header.${Buffer.from(JSON.stringify({ exp: now + 300 })).toString("base64url")}.signature`;
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        envelope({
          message: "Login successful",
          tokens: { accessToken: token, refreshToken: token },
        }),
      )
      .mockResolvedValueOnce(envelope(adminProfile));

    const request = new NextRequest("http://frontend.test/api/auth/login", {
      method: "POST",
      headers: {
        origin: "http://frontend.test",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "admin@example.com", password: "secret" }),
    });
    const response = await loginRoute(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(adminProfile);
    expect(body.data.tokens).toBeUndefined();
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)?.httpOnly).toBe(true);
  });

  it("does not issue cookies to a non-Admin login", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = `header.${Buffer.from(JSON.stringify({ exp: now + 300 })).toString("base64url")}.signature`;
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        envelope({
          message: "Login successful",
          tokens: { accessToken: token, refreshToken: token },
        }),
      )
      .mockResolvedValueOnce(envelope({ ...adminProfile, role: "CUSTOMER" }));

    const request = new NextRequest("http://frontend.test/api/auth/login", {
      method: "POST",
      headers: {
        origin: "http://frontend.test",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "customer@example.com", password: "secret" }),
    });
    const response = await loginRoute(request);

    expect(response.status).toBe(403);
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)).toBeUndefined();
  });
});
