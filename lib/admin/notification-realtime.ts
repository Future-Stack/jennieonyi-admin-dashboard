import { io, type Socket } from "socket.io-client";
import { inboxNotificationSchema, type InboxNotification } from "./notifications";

type Ticket = { ticket: string; socketUrl: string };
type Options = {
  ticket: () => Promise<Ticket>;
  onCount: (unread: number) => void;
  onNew: (notification: InboxNotification) => void;
  onConnect: () => void;
};

/** Socket.IO does not reconnect after a server-initiated expiry disconnect. */
export function connectNotificationRealtime(options: Options, createSocket: typeof io = io) {
  let socket: Socket | undefined;
  let stopped = false;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let attempts = 0;
  const schedule = (action: () => void) => {
    if (stopped || retry) return;
    retry = setTimeout(() => {
      retry = undefined;
      if (!stopped) action();
    }, Math.min(2000 * 2 ** attempts++, 30000));
  };
  const start = async () => {
    try {
      const first = await options.ticket();
      if (stopped) return;
      let initial: Ticket | undefined = first;
      socket = createSocket(`${first.socketUrl}/notifications`, {
        autoConnect: false,
        transports: ["websocket"],
        reconnectionDelay: 2000,
        reconnectionDelayMax: 30000,
        auth: (callback) => {
          const pending = initial ? Promise.resolve(initial) : options.ticket();
          initial = undefined;
          void pending.then(({ ticket }) => {
            if (!stopped) callback({ token: ticket });
          }).catch(() => {
            if (!stopped) callback({ token: "" });
          });
        },
      });
      socket.on("connect", () => { attempts = 0; options.onConnect(); });
      socket.on("notification:count", (payload: { unread?: unknown }) => {
        if (typeof payload?.unread === "number" && Number.isInteger(payload.unread) && payload.unread >= 0) options.onCount(payload.unread);
      });
      socket.on("notification:new", (payload: unknown) => {
        const parsed = inboxNotificationSchema.safeParse(payload);
        if (parsed.success) options.onNew(parsed.data);
      });
      socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") schedule(() => socket?.connect());
      });
      socket.on("connect_error", () => {
        // Namespace auth rejection is not retried by the Socket.IO Manager.
        if (!socket?.active) schedule(() => socket?.connect());
      });
      socket.connect();
    } catch {
      schedule(() => void start());
    }
  };
  void start();
  return () => {
    stopped = true;
    if (retry) clearTimeout(retry);
    socket?.removeAllListeners();
    socket?.disconnect();
  };
}
