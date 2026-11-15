import type { NextResponse } from "next/server";
import {
  adminProfileSchema,
  loginDataSchema,
  parseEnvelopeData,
  tokenPairSchema,
  type AdminProfile,
  type TokenPair,
} from "@/lib/api/contracts";
import { BackendProtocolError } from "@/lib/api/errors";

export const ACCESS_TOKEN_COOKIE = "plaitam_admin_access";
export const REFRESH_TOKEN_COOKIE = "plaitam_admin_refresh";

export class BackendHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "BackendHttpError";
  }
}

type AdminSessionCheck =
  | { kind: "authenticated"; user: AdminProfile; tokens: TokenPair; rotated: boolean }
  | { kind: "unauthenticated" }
  | { kind: "forbidden" };

export function getBackendApiBaseUrl(): string {
  // Local admin development and the API both default to port 3000. Keep the
  // production setting explicit so a missing deployment variable fails closed.
  const development = process.env.NODE_ENV !== "production";
  const localDefault = "http://127.0.0.1:5001/api/v1";
  const configuredUrl = process.env.BACKEND_API_BASE_URL?.trim();
  if (!configuredUrl) {
    if (development) return localDefault;
    throw new Error("BACKEND_API_BASE_URL is not configured.");
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch (error) {
    if (error instanceof TypeError) {
      if (development) return localDefault;
      throw new Error("BACKEND_API_BASE_URL must be an absolute URL.");
    }
    throw error;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    if (development) return localDefault;
    throw new Error("BACKEND_API_BASE_URL must use HTTP or HTTPS.");
  }

  return url.toString().replace(/\/+$/, "");
}

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${getBackendApiBaseUrl()}/${path.replace(/^\/+/, "")}`;
  return fetch(url, {
    ...init,
    cache: "no-store",
  });
}

export async function readBackendJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    throw new BackendProtocolError("The API returned an empty response.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new BackendProtocolError("The API returned invalid JSON.");
    }
    throw error;
  }
}

function getErrorMessage(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }
  return "The API request failed.";
}

export async function refreshTokens(
  refreshToken: string,
): Promise<TokenPair | null> {
  const response = await fetchBackend("/auth/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const body = await readBackendJson(response);

  if (response.status === 401 || response.status === 403) {
    return null;
  }
  if (!response.ok) {
    throw new BackendHttpError(getErrorMessage(body), response.status);
  }

  try {
    return parseEnvelopeData(body, tokenPairSchema).data;
  } catch (error) {
    if (error instanceof Error) {
      throw new BackendProtocolError(error.message);
    }
    throw error;
  }
}

export async function checkAdminSession(
  accessToken?: string,
  refreshToken?: string,
): Promise<AdminSessionCheck> {
  let tokens: TokenPair | undefined;
  let rotated = false;

  if (accessToken && refreshToken) {
    tokens = { accessToken, refreshToken };
  }

  if (!tokens && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (!refreshed) return { kind: "unauthenticated" };
    tokens = refreshed;
    rotated = true;
  }

  if (!tokens) return { kind: "unauthenticated" };

  let response = await fetchBackend("/auth/me", {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });

  if (response.status === 401 && refreshToken && !rotated) {
    const refreshed = await refreshTokens(refreshToken);
    if (!refreshed) return { kind: "unauthenticated" };
    tokens = refreshed;
    rotated = true;
    response = await fetchBackend("/auth/me", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
  }

  const body = await readBackendJson(response);
  if (response.status === 401) return { kind: "unauthenticated" };
  if (response.status === 403) return { kind: "forbidden" };
  if (!response.ok) {
    throw new BackendHttpError(getErrorMessage(body), response.status);
  }

  let user: AdminProfile;
  try {
    user = parseEnvelopeData(body, adminProfileSchema).data;
  } catch (error) {
    if (error instanceof Error) {
      throw new BackendProtocolError(error.message);
    }
    throw error;
  }

  if (user.role !== "ADMIN") return { kind: "forbidden" };
  return { kind: "authenticated", user, tokens, rotated };
}

export function tokenMaxAge(token: string): number {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) {
    throw new BackendProtocolError("The API returned a malformed token.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new BackendProtocolError("The API returned a malformed token.");
    }
    throw error;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("exp" in payload) ||
    typeof payload.exp !== "number"
  ) {
    throw new BackendProtocolError("The API returned a token without an expiry.");
  }

  const maxAge = payload.exp - Math.floor(Date.now() / 1000);
  if (maxAge <= 0) {
    throw new BackendProtocolError("The API returned an expired token.");
  }
  return maxAge;
}

export function setAuthCookies(
  response: NextResponse,
  tokens: TokenPair,
): void {
  const commonOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...commonOptions,
    maxAge: tokenMaxAge(tokens.accessToken),
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...commonOptions,
    maxAge: tokenMaxAge(tokens.refreshToken),
  });
}

export function clearAuthCookies(response: NextResponse): void {
  const commonOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", commonOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", commonOptions);
}

export function loginTokensFromBody(body: unknown): TokenPair {
  try {
    return parseEnvelopeData(body, loginDataSchema).data.tokens;
  } catch (error) {
    if (error instanceof Error) {
      throw new BackendProtocolError(error.message);
    }
    throw error;
  }
}
