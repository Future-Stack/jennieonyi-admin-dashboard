import {
  ACCESS_TOKEN_COOKIE,
  fetchBackend,
} from "@/lib/server/admin-auth";
import {
  apiError,
  errorResponse,
  hasTrustedOrigin,
} from "@/lib/server/responses";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

const forwardedHeaders = [
  "accept",
  "content-type",
  "content-disposition",
  "if-match",
  "if-none-match",
  // Required by every financial mutation (release, refund, payout, cancel, confirm delivery).
  "idempotency-key",
  "x-request-id",
];

async function proxyAdminRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const method = request.method.toUpperCase();
  if (method !== "GET" && !hasTrustedOrigin(request)) {
    return apiError(403, "Cross-origin requests are not allowed.");
  }

  const { path } = await context.params;
  if (path.length === 0 || path.some((part) => !part || part === "." || part === "..")) {
    return apiError(400, "Invalid Admin API path.");
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    if (!accessToken) {
      return apiError(401, "Your Admin session has expired.");
    }

    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : await request.arrayBuffer();
    const headers = new Headers();
    for (const name of forwardedHeaders) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("Authorization", `Bearer ${accessToken}`);

    const targetPath = `/admin/${path.map(encodeURIComponent).join("/")}`;
    const init: RequestInit = { method, headers, body };
    const backendResponse = await fetchBackend(
      `${targetPath}${request.nextUrl.search}`,
      init,
    );

    const responseHeaders = new Headers();
    for (const name of ["content-type", "content-disposition", "cache-control", "x-request-id"]) {
      const value = backendResponse.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("Cache-Control", "no-store");

    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = proxyAdminRequest;
export const POST = proxyAdminRequest;
export const PUT = proxyAdminRequest;
export const PATCH = proxyAdminRequest;
export const DELETE = proxyAdminRequest;
