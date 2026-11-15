import { NextResponse, type NextRequest } from "next/server";

export function apiError(
  statusCode: number,
  message: string,
  errors?: string[],
): NextResponse {
  return NextResponse.json(
    {
      statusCode,
      message,
      meta: null,
      data: null,
      timestamp: new Date().toISOString(),
      ...(errors?.length ? { errors } : {}),
    },
    { status: statusCode, headers: { "Cache-Control": "no-store" } },
  );
}

export function hasTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) return false;
    } catch (error) {
      if (error instanceof TypeError) return false;
      throw error;
    }
  }

  return request.headers.get("sec-fetch-site") !== "cross-site";
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof TypeError) {
    return apiError(502, "The Admin API is unavailable. Please try again.");
  }

  if (error instanceof Error) {
    if (error.message.includes("BACKEND_API_BASE_URL")) {
      return apiError(500, "Admin API configuration is missing or invalid.");
    }
    console.error("[Admin BFF]", error);
  } else {
    console.error("[Admin BFF] Unexpected error", error);
  }

  return apiError(500, "The Admin request could not be completed.");
}
