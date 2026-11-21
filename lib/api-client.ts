import { parseInboxPage, parseTicket, parseUnread, type InboxFilter } from "@/lib/admin/notifications";
import {
  adminProfileSchema,
  adminSearchResultSchema,
  type AdminLoginInput,
  type AdminProfile,
  type AdminSearchResults,
  type ApiEnvelope,
} from "@/lib/api/contracts";
import { ApiError, BackendProtocolError } from "@/lib/api/errors";
import { ZodError } from "zod";

let sessionRefreshInFlight: Promise<void> | null = null;

async function fetchResponse(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError("Unable to reach the Admin API. Check your connection.", 0);
    }
    throw error;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new BackendProtocolError("The Admin API returned invalid JSON.");
    }
    throw error;
  }
}

function refreshAdminSession(): Promise<void> {
  if (!sessionRefreshInFlight) {
    sessionRefreshInFlight = (async () => {
      const response = await fetchResponse("/api/auth/session", { method: "GET" });
      const body = await readResponseBody(response);
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "Your Admin session could not be refreshed.";
        throw new ApiError(message, response.status, body);
      }
      parseAdminProfile(body);
    })().finally(() => {
      sessionRefreshInFlight = null;
    });
  }
  return sessionRefreshInFlight;
}

async function request<T>(
  path: string,
  init: RequestInit,
  parse: (value: unknown) => T,
  retriedAfterRefresh = false,
): Promise<T> {
  const response = await fetchResponse(path, init);

  if (
    response.status === 401 &&
    (path.startsWith("/api/admin/") || path.startsWith("/api/notifications")) &&
    !retriedAfterRefresh
  ) {
    try {
      await refreshAdminSession();
      return request(path, init, parse, true);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403) &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(new Event("admin:unauthorized"));
      }
      throw error;
    }
  }

  const body = await readResponseBody(response);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "The Admin API request failed.";

    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      path !== "/api/auth/login"
    ) {
      window.dispatchEvent(new Event("admin:unauthorized"));
    }
    throw new ApiError(message, response.status, body);
  }

  return parse(body);
}

function parseEnvelope<T>(
  body: unknown,
  parseData: (data: unknown) => T,
): ApiEnvelope<T> {
  if (
    typeof body !== "object" ||
    body === null ||
    !("statusCode" in body) ||
    typeof body.statusCode !== "number" ||
    !("message" in body) ||
    typeof body.message !== "string" ||
    !("data" in body)
  ) {
    throw new BackendProtocolError("The Admin API returned an invalid response.");
  }

  let data: T;
  try {
    data = parseData(body.data);
  } catch (cause) {
    // TASK-059: a contract mismatch still rejects the data, but never shows raw validation issues to admins.
    if (cause instanceof ZodError) {
      console.error("Admin API contract mismatch", cause.issues);
      throw new BackendProtocolError(
        "Some records returned by the server could not be displayed. Please retry; if this continues, contact support.",
      );
    }
    throw cause;
  }

  return {
    statusCode: body.statusCode,
    message: body.message,
    meta: "meta" in body ? body.meta : null,
    data,
    ...("timestamp" in body && typeof body.timestamp === "string"
      ? { timestamp: body.timestamp }
      : {}),
  };
}

function parseAdminProfile(body: unknown): ApiEnvelope<AdminProfile> {
  return parseEnvelope(body, (data) => {
    const result = adminProfileSchema.safeParse(data);
    if (!result.success) {
      throw new BackendProtocolError("The Admin API returned an invalid user profile.");
    }
    return result.data;
  });
}

function parseMessage(body: unknown): ApiEnvelope<{ message: string }> {
  return parseEnvelope(body, (data) => {
    if (
      typeof data !== "object" ||
      data === null ||
      !("message" in data) ||
      typeof data.message !== "string"
    ) {
      throw new BackendProtocolError("The Admin API returned an invalid response.");
    }
    return { message: data.message };
  });
}

function parseSearchResults(body: unknown): ApiEnvelope<AdminSearchResults> {
  return parseEnvelope(body, (data) => {
    const result = adminSearchResultSchema.safeParse(data);
    if (!result.success) {
      throw new BackendProtocolError("The Admin API returned invalid search results.");
    }
    return result.data;
  });
}

export const apiClient = {
  // TASK-057: Admin notification inbox (BFF → backend /notifications).
  notifications: {
    list(filter: InboxFilter, page = 1, signal?: AbortSignal) {
      const params = new URLSearchParams({ status: filter, page: String(page), limit: "15" });
      return request(`/api/notifications?${params.toString()}`, { method: "GET", signal }, parseInboxPage);
    },
    unreadCount(signal?: AbortSignal) {
      return request("/api/notifications/unread-count", { method: "GET", signal }, parseUnread);
    },
    markRead(id: string) {
      return request(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }, (body) => body);
    },
    markAllRead() {
      return request("/api/notifications/read-all", { method: "PATCH" }, (body) => body);
    },
    socketTicket() {
      return request("/api/notifications/socket-ticket", { method: "POST" }, parseTicket);
    },
  },
  auth: {
    login(input: AdminLoginInput) {
      return request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }, parseAdminProfile).then((response) => response.data);
    },
    session() {
      return request("/api/auth/session", { method: "GET" }, parseAdminProfile).then(
        (response) => response.data,
      );
    },
    logout() {
      return request("/api/auth/logout", { method: "POST" }, parseMessage);
    },
  },
  admin: {
    search(query: string, signal?: AbortSignal) {
      const params = new URLSearchParams({ q: query });
      return request(
        `/api/admin/search?${params.toString()}`,
        { method: "GET", signal },
        parseSearchResults,
      );
    },
    request<T>(
      path: string,
      init: RequestInit,
      parseData: (data: unknown) => T,
    ): Promise<ApiEnvelope<T>> {
      const normalizedPath = path.replace(/^\/+/, "");
      return request(
        `/api/admin/${normalizedPath}`,
        init,
        (body) => parseEnvelope(body, parseData),
      );
    },
    async download(path: string, filename: string): Promise<void> {
      const normalizedPath = path.replace(/^\/+/, "");
      const url = `/api/admin/${normalizedPath}`;
      let response = await fetchResponse(url, { method: "GET" });

      if (response.status === 401) {
        try {
          await refreshAdminSession();
        } catch (error) {
          if (
            error instanceof ApiError &&
            (error.status === 401 || error.status === 403) &&
            typeof window !== "undefined"
          ) {
            window.dispatchEvent(new Event("admin:unauthorized"));
          }
          throw error;
        }
        response = await fetchResponse(url, { method: "GET" });
      }

      if (!response.ok) {
        const body = await readResponseBody(response);
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "The Admin export failed.";
        if (
          response.status === 401 &&
          typeof window !== "undefined"
        ) {
          window.dispatchEvent(new Event("admin:unauthorized"));
        }
        throw new ApiError(message, response.status, body);
      }

      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    },
  },
};
