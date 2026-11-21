"use client";

import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { connectNotificationRealtime } from "@/lib/admin/notification-realtime";
import { apiClient } from "@/lib/api-client";
import {
  adminNotificationHref,
  badgeLabel,
  INBOX_FILTERS,
  relativeTime,
  type InboxFilter,
  type InboxNotification,
} from "@/lib/admin/notifications";

/**
 * Admin header bell (TASK-057): live unread badge over socket.io and a
 * dropdown inbox with All / Unread / Read. Replaces the decorative bell.
 */
export function NotificationBell() {
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const filterRef = useRef<InboxFilter>("all");
  const loadAbort = useRef<AbortController | null>(null);
  const countVersion = useRef(0);

  const load = useCallback(async (next: InboxFilter, signal?: AbortSignal) => {
    const version = countVersion.current;
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.notifications.list(next, 1, signal);
      if (signal?.aborted) return;
      setItems(result.items);
      setPage(1);
      setTotalPages(result.meta.totalPages);
      if (version === countVersion.current) setUnread(result.meta.unreadCount);
    } catch (e) {
      if (!signal?.aborted) {
        setError(e instanceof Error ? e.message : "Could not load notifications.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Initial badge.
  useEffect(() => {
    const controller = new AbortController();
    const version = countVersion.current;
    apiClient.notifications
      .unreadCount(controller.signal)
      .then((count) => {
        if (!controller.signal.aborted && version === countVersion.current) setUnread(count);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  // Realtime: a fresh one-handshake ticket for every (re)connect.
  useEffect(() => {
    return connectNotificationRealtime({
      ticket: () => apiClient.notifications.socketTicket(),
      onCount: (count) => { countVersion.current++; setUnread(count); },
      onConnect: () => {
        // Reconcile events missed while the browser was asleep/disconnected.
        // The gateway sends its authoritative count on every connection.
        if (loadAbort.current) {
          loadAbort.current.abort();
          const controller = new AbortController();
          loadAbort.current = controller;
          void load(filterRef.current, controller.signal);
        }
      },
      onNew: (n) => setItems((current) =>
        current.some((i) => i.id === n.id) || filterRef.current === "read" ? current : [n, ...current],
      ),
    });
  }, [load]);

  // Loads are triggered by user events (open / tab change); a newer load
  // aborts the previous one so stale pages never overwrite fresh ones.
  const reload = useCallback(
    (next: InboxFilter) => {
      loadAbort.current?.abort();
      const controller = new AbortController();
      loadAbort.current = controller;
      void load(next, controller.signal);
    },
    [load],
  );
  useEffect(() => () => loadAbort.current?.abort(), []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) reload(filterRef.current);
  }

  function selectFilter(next: InboxFilter) {
    filterRef.current = next;
    setFilter(next);
    reload(next);
  }

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function openItem(n: InboxNotification) {
    if (!n.isRead) {
      setItems((current) =>
        filter === "unread"
          ? current.filter((i) => i.id !== n.id)
          : current.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)),
      );
      setUnread((u) => Math.max(0, u - 1));
      apiClient.notifications.markRead(n.id).catch(() => {
        // Restore on failure so the state never lies.
        setUnread((u) => u + 1);
        reload(filter);
      });
    }
    const href = adminNotificationHref(n);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  }

  async function markAll() {
    if (markingAll || unread === 0) return;
    setMarkingAll(true);
    try {
      await apiClient.notifications.markAllRead();
      setUnread(0);
      await load(filter);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  }

  async function loadMore() {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const result = await apiClient.notifications.list(filter, page + 1);
      setItems((current) => [
        ...current,
        ...result.items.filter((n) => !current.some((c) => c.id === n.id)),
      ]);
      setPage(page + 1);
      setTotalPages(result.meta.totalPages);
    } catch {
      // Keep the current list; the button stays available to retry.
    } finally {
      setLoadingMore(false);
    }
  }

  const badge = badgeLabel(unread);

  return (
    <div ref={rootRef} className="relative flex-shrink-0">
      <button
        type="button"
        aria-label={badge ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className="relative w-[40px] h-[40px] md:w-[52px] md:h-[52px] flex items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors"
      >
        <Bell className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-white" />
        {badge && (
          <span
            data-testid="notification-badge"
            className="absolute -top-[4px] -right-[4px] min-w-[18px] h-[18px] px-[4px] rounded-full bg-[#F97316] border-2 border-admin-primary text-[10px] leading-[14px] font-bold text-white text-center"
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(92vw,380px)] rounded-[14px] bg-white shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-[15px] font-bold text-gray-900">Notifications</h2>
            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0 || markingAll}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#D95C30] disabled:text-gray-300"
            >
              {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Mark all read
            </button>
          </div>

          <div role="tablist" aria-label="Filter notifications" className="mx-4 mb-2 grid grid-cols-3 gap-1 rounded-[10px] bg-purple-50 p-1">
            {INBOX_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => selectFilter(f.value)}
                className={`rounded-[8px] py-1.5 text-[12px] font-semibold transition-colors ${
                  filter === f.value ? "bg-white text-admin-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.value === "unread" && unread > 0 ? `Unread (${badge})` : f.label}
              </button>
            ))}
          </div>

          <div className="max-h-[420px] overflow-y-auto px-2 pb-2">
            {loading && items.length === 0 ? (
              <ul aria-label="Loading notifications" className="space-y-2 p-2">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="h-[60px] rounded-[10px] bg-gray-100 animate-pulse" />
                ))}
              </ul>
            ) : error && items.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[13px] text-gray-600">{error}</p>
                <button type="button" onClick={() => void load(filter)} className="mt-2 text-[13px] font-semibold text-[#D95C30]">
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto text-purple-300" />
                <p className="mt-2 text-[14px] font-semibold text-gray-800">
                  {filter === "unread" ? "You’re all caught up" : filter === "read" ? "No read notifications yet" : "No notifications yet"}
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  New verifications, payouts and support tickets appear here in real time.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void openItem(n)}
                      className={`w-full text-left flex gap-3 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-primary ${
                        n.isRead ? "" : "bg-purple-50/70"
                      }`}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="flex items-start justify-between gap-2">
                          <span className={`text-[13px] ${n.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>
                            {n.title || "PlaitAm update"}
                          </span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{relativeTime(n.createdAt)}</span>
                        </span>
                        {n.body && <span className="mt-0.5 block text-[12px] text-gray-500 line-clamp-2">{n.body}</span>}
                      </span>
                      {!n.isRead && (
                        <span aria-label="Unread" className="mt-1.5 w-2 h-2 rounded-full bg-[#F97316] flex-shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
                {page < totalPages && (
                  <li>
                    <button
                      type="button"
                      onClick={() => void loadMore()}
                      disabled={loadingMore}
                      className="w-full py-2 text-[12px] font-semibold text-admin-primary disabled:text-gray-400"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
