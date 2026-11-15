import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookies,
  fetchBackend,
  readBackendJson,
  refreshTokens,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/server/admin-auth";
import { apiError, errorResponse, hasTrustedOrigin } from "@/lib/server/responses";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return apiError(403, "Cross-origin requests are not allowed.");
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    const response = NextResponse.json({
      statusCode: 200,
      message: "Already signed out.",
      meta: null,
      data: { message: "Already signed out." },
      timestamp: new Date().toISOString(),
    });
    clearAuthCookies(response);
    return response;
  }

  try {
    let activeAccessToken = accessToken;
    let rotatedTokens;
    let backendResponse: Response | undefined;

    if (!activeAccessToken && refreshToken) {
      rotatedTokens = await refreshTokens(refreshToken);
      activeAccessToken = rotatedTokens?.accessToken;
    }

    if (activeAccessToken) {
      backendResponse = await fetchBackend("/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${activeAccessToken}` },
      });

      if (backendResponse.status === 401 && refreshToken && !rotatedTokens) {
        rotatedTokens = await refreshTokens(refreshToken);
        if (rotatedTokens) {
          backendResponse = await fetchBackend("/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${rotatedTokens.accessToken}` },
          });
        }
      }

      if (!backendResponse || !backendResponse.ok) {
        const body = backendResponse
          ? await readBackendJson(backendResponse)
          : null;
        if (
          backendResponse &&
          (backendResponse.status === 401 || backendResponse.status === 403)
        ) {
          const response = NextResponse.json(body, {
            status: backendResponse.status,
            headers: { "Cache-Control": "no-store" },
          });
          clearAuthCookies(response);
          return response;
        }
        return backendResponse
          ? NextResponse.json(body, {
              status: backendResponse.status,
              headers: { "Cache-Control": "no-store" },
            })
          : apiError(401, "Your Admin session has expired.");
      }

      await readBackendJson(backendResponse);
    }

    const response = NextResponse.json({
      statusCode: 200,
      message: "Logout successful.",
      meta: null,
      data: { message: "Logout successful." },
      timestamp: new Date().toISOString(),
    });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    const response = errorResponse(error);
    if (error instanceof Error && error.name === "BackendProtocolError") {
      clearAuthCookies(response);
    }
    return response;
  }
}
