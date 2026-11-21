import { z } from "zod";

/** TASK-057: Admin notification inbox — pure parsing and routing helpers. */
export const inboxNotificationSchema = z.object({
  id: z.string().min(1),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  createdAt: z.string(),
  readAt: z.string().nullable(),
  isRead: z.boolean(),
});
export type InboxNotification = z.infer<typeof inboxNotificationSchema>;

export const inboxMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  unreadCount: z.number(),
});
export type InboxMeta = z.infer<typeof inboxMetaSchema>;

export type InboxFilter = "all" | "unread" | "read";
export const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export function parseInboxPage(body: unknown): {
  items: InboxNotification[];
  meta: InboxMeta;
} {
  const envelope = z
    .object({ data: z.array(z.unknown()), meta: inboxMetaSchema })
    .parse(body);
  return {
    // Malformed rows are skipped rather than breaking the whole panel.
    items: envelope.data.flatMap((row) => {
      const parsed = inboxNotificationSchema.safeParse(row);
      return parsed.success ? [parsed.data] : [];
    }),
    meta: envelope.meta,
  };
}

export function parseUnread(body: unknown): number {
  return z.object({ data: z.object({ unread: z.number() }) }).parse(body).data
    .unread;
}

export function parseTicket(body: unknown): { ticket: string; socketUrl: string } {
  const data = z
    .object({ data: z.object({ ticket: z.string().min(1), socketUrl: z.string().url() }) })
    .parse(body).data;
  return { ticket: data.ticket, socketUrl: data.socketUrl };
}

/** Where a notification opens in the Admin dashboard (null = nowhere). */
export function adminNotificationHref(n: Pick<InboxNotification, "entityType" | "entityId">): string | null {
  const routes: Record<string, string> = {
    TICKET: "support", STYLIST_SERVICE: "video-verification", PAYOUT: "payments",
    VENDOR: "vendors", STYLIST: "stylists", STREET_AGENT: "agents", BOOKING: "bookings", ORDER: "orders",
  };
  const route = routes[n.entityType.toUpperCase()];
  if (!route || !n.entityId.trim()) return null;
  return `/dashboard/${route}?entityId=${encodeURIComponent(n.entityId)}`;
}

export function relativeTime(iso: string, now: Date = new Date()): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function badgeLabel(unread: number): string | null {
  if (unread <= 0) return null;
  return unread > 99 ? "99+" : String(unread);
}
