import { ACCESS_TOKEN_COOKIE, fetchBackend } from "@/lib/server/admin-auth";
import {
  allowedNotificationRoute,
  socketPublicUrl,
} from "@/lib/server/notifications";
import {
  apiError,
  errorResponse,
  hasTrustedOrigin,
} from "@/lib/server/responses";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ path?: string[] }>;
}

/** Admin BFF for the notification inbox (TASK-057). */
async function proxyNotificationRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const method = request.method.toUpperCase();
  if (method !== "GET" && !hasTrustedOrigin(request)) {
    return apiError(403, "Cross-origin requests are not allowed.");
  }
  const { path = [] } = await context.params;
  if (!allowedNotificationRoute(method, path)) {
    return apiError(404, "Not found.");
  }
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return apiError(401, "Your Admin session has expired.");

  try {
    const target = `/notifications${path.length ? `/${path.map(encodeURIComponent).join("/")}` : ""}`;
    const backend = await fetchBackend(`${target}${request.nextUrl.search}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // The ticket response also tells the browser where the socket lives.
    if (path[0] === "socket-ticket" && backend.ok) {
      const json = (await backend.json()) as {
        data?: Record<string, unknown>;
      };
      return NextResponse.json(
        { ...json, data: { ...json.data, socketUrl: socketPublicUrl() } },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return new NextResponse(backend.body, {
      status: backend.status,
      headers: {
        "Content-Type":
          backend.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = proxyNotificationRequest;
export const POST = proxyNotificationRequest;
export const PATCH = proxyNotificationRequest;
