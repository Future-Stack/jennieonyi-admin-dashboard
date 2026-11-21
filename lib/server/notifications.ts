import { getBackendApiBaseUrl } from "@/lib/server/admin-auth";

/**
 * TASK-057: the only notification routes the Admin BFF forwards. Everything
 * is owner-scoped on the backend; the BFF just attaches the cookie token.
 */
export function allowedNotificationRoute(
  method: string,
  path: string[],
): boolean {
  const [first, second, ...rest] = path;
  if (rest.length) return false;
  if (method === "GET" && path.length === 0) return true; // list
  if (method === "GET" && first === "unread-count" && !second) return true;
  if (method === "PATCH" && first === "read-all" && !second) return true;
  if (method === "POST" && first === "socket-ticket" && !second) return true;
  return (
    method === "PATCH" &&
    second === "read" &&
    /^[0-9a-f-]{36}$/i.test(first ?? "")
  );
}

/**
 * Public socket.io origin for the browser. Defaults to the backend origin
 * (Next route handlers cannot proxy websockets); `SOCKET_PUBLIC_URL`
 * overrides it when the API is only reachable internally.
 */
export function socketPublicUrl(): string {
  const configured = process.env.SOCKET_PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(getBackendApiBaseUrl()).origin;
}
