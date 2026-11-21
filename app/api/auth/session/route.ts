import {
  ACCESS_TOKEN_COOKIE,
  checkAdminSession,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/lib/server/admin-auth";
import { apiError, errorResponse } from "@/lib/server/responses";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const result = await checkAdminSession(
      request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
    );

    if (result.kind !== "authenticated") {
      const response = apiError(
        result.kind === "forbidden" ? 403 : 401,
        result.kind === "forbidden"
          ? "This account does not have Admin access."
          : "Your Admin session has expired.",
      );
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json(
      {
        statusCode: 200,
        message: "Admin session loaded.",
        meta: null,
        data: result.user,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
    if (result.rotated) setAuthCookies(response, result.tokens);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
