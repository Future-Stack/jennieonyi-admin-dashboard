/** Exact-ID lookup for contracts that expose only paginated lists. */
export async function findNotificationTarget<T>(
  id: string,
  fetchPage: (page: number) => Promise<{ rows: T[]; totalPages: number }>,
  identify: (row: T) => string,
  signal: AbortSignal,
): Promise<T> {
  for (let page = 1; ; page++) {
    signal.throwIfAborted();
    const result = await fetchPage(page);
    signal.throwIfAborted();
    const target = result.rows.find((row) => identify(row) === id);
    if (target) return target;
    if (page >= result.totalPages) throw new Error("Notification item is unavailable.");
  }
}
