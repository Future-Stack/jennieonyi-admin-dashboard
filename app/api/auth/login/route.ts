import { adminLoginSchema } from "@/lib/api/contracts";
import {
  checkAdminSession,
  fetchBackend,
  loginTokensFromBody,
  readBackendJson,
  setAuthCookies,
} from "@/lib/server/admin-auth";
import { apiError, errorResponse, hasTrustedOrigin } from "@/lib/server/responses";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return apiError(403, "Cross-origin requests are not allowed.");
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "Invalid JSON request body.");
    }
    if (error instanceof TypeError) {
      return apiError(400, "Invalid JSON request body.");
    }
    throw error;
  }

  const parsedInput = adminLoginSchema.safeParse(input);
  if (!parsedInput.success) {
    return apiError(400, "Enter a valid email address and password.", [
      ...new Set(parsedInput.error.issues.map((issue) => issue.message)),
    ]);
  }

  try {
    const backendResponse = await fetchBackend("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedInput.data),
    });
    const backendBody = await readBackendJson(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(backendBody, {
        status: backendResponse.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const tokens = loginTokensFromBody(backendBody);
    const session = await checkAdminSession(
      tokens.accessToken,
      tokens.refreshToken,
    );

    if (session.kind === "unauthenticated") {
      return apiError(401, "The sign-in session could not be verified.");
    }
    if (session.kind === "forbidden") {
      return apiError(403, "This account does not have Admin access.");
    }

    const response = NextResponse.json(
      {
        statusCode: 200,
        message: "Login successful.",
        meta: null,
        data: session.user,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
    setAuthCookies(response, session.tokens);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
