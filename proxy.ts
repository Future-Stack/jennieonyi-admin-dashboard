import {
  ACCESS_TOKEN_COOKIE,
  checkAdminSession,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/lib/server/admin-auth";
import { BackendHttpError } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";

function loginRedirect(request: NextRequest): NextResponse {
  const destination = request.nextUrl.clone();
  destination.pathname = "/";
  destination.search = "";
  const response = NextResponse.redirect(destination);
  clearAuthCookies(response);
  return response;
}

export async function proxy(request: NextRequest) {
  try {
    const result = await checkAdminSession(
      request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
    );

    if (result.kind !== "authenticated") return loginRedirect(request);

    const response = NextResponse.next();
    if (result.rotated) setAuthCookies(response, result.tokens);
    return response;
  } catch (error) {
    if (error instanceof BackendHttpError) {
      return NextResponse.json(
        {
          statusCode: error.status,
          message: "Admin authentication could not be verified.",
          meta: null,
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof TypeError) {
      return NextResponse.json(
        {
          statusCode: 503,
          message: "Admin API is unavailable.",
          meta: null,
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    console.error("[Admin route protection]", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Admin authentication could not be verified.",
        meta: null,
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
