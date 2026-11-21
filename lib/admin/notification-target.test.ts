import { describe, expect, it, vi } from "vitest";
import { findNotificationTarget } from "./notification-target";

describe("notification target pagination", () => {
  it("finds the requested payout/service beyond the first page without selecting an unrelated row", async () => {
    const fetch = vi.fn(async (page: number) => ({ rows: [{ id: page === 3 ? "wanted" : `unrelated-${page}` }], totalPages: 4 }));
    expect(await findNotificationTarget("wanted", fetch, (row) => row.id, new AbortController().signal)).toEqual({ id: "wanted" });
    expect(fetch.mock.calls.map(([page]) => page)).toEqual([1, 2, 3]);
  });

  it("reports an unavailable target rather than falling back to the first item", async () => {
    await expect(findNotificationTarget("removed", async () => ({ rows: [{ id: "other" }], totalPages: 1 }), (row) => row.id, new AbortController().signal)).rejects.toThrow("unavailable");
  });

  it("aborts an outdated lookup before applying its result", async () => {
    const controller = new AbortController();
    await expect(findNotificationTarget("target", async () => {
      controller.abort();
      return { rows: [{ id: "target" }], totalPages: 1 };
    }, (row) => row.id, controller.signal)).rejects.toThrow();
  });
});
