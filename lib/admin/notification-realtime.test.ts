import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { io, type Socket } from "socket.io-client";
import { connectNotificationRealtime } from "./notification-realtime";

describe("Admin notification connection recovery", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function fixture(ticket = vi.fn().mockResolvedValue({ ticket: "initial", socketUrl: "http://localhost:5101" })) {
    const handlers = new Map<string, (...args: unknown[]) => void>();
    let auth: (callback: (data: { token: string }) => void) => void;
    const credentials: string[] = [];
    const socket = {
      active: false,
      on: vi.fn((name: string, callback: (...args: unknown[]) => void) => handlers.set(name, callback)),
      connect: vi.fn(() => { auth((data) => credentials.push(data.token)); }),
      disconnect: vi.fn(),
      removeAllListeners: vi.fn(() => handlers.clear()),
    };
    const create = vi.fn((_url: string, opts: { auth: typeof auth }) => { auth = opts.auth; return socket as unknown as Socket; });
    const onCount = vi.fn(), onNew = vi.fn(), onConnect = vi.fn();
    const stop = connectNotificationRealtime({ ticket, onCount, onNew, onConnect }, create as unknown as typeof io);
    return { stop, socket, ticket, credentials, create, onCount, onNew, onConnect, emit: (name: string, ...args: unknown[]) => handlers.get(name)?.(...args) };
  }

  it("reconnects after the 60-second server expiry with a fresh ticket", async () => {
    const f = fixture();
    await vi.advanceTimersByTimeAsync(0);
    expect(f.credentials).toEqual(["initial"]);
    f.emit("connect");
    await vi.advanceTimersByTimeAsync(60000);
    f.ticket.mockResolvedValue({ ticket: "renewed", socketUrl: "http://localhost:5101" });
    f.emit("notification:error", { message: "Credential expired" });
    f.emit("disconnect", "io server disconnect");
    await vi.advanceTimersByTimeAsync(2000);
    expect(f.socket.connect).toHaveBeenCalledTimes(2);
    expect(f.credentials).toEqual(["initial", "renewed"]);
    f.emit("connect");
    f.emit("notification:count", { unread: 15 });
    expect(f.onCount).toHaveBeenLastCalledWith(15);
    expect(f.onConnect).toHaveBeenCalledTimes(2);
    f.stop();
  });

  it("recovers when the initial ticket request failed instead of abandoning realtime", async () => {
    const ticket = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ ticket: "recovered", socketUrl: "http://localhost:5101" });
    const f = fixture(ticket);
    await vi.advanceTimersByTimeAsync(2000);
    expect(f.credentials).toEqual(["recovered"]);
    expect(ticket).toHaveBeenCalledTimes(2);
    f.stop();
  });

  it("retries namespace authentication errors, without duplicating manager transport retries", async () => {
    const f = fixture();
    await vi.advanceTimersByTimeAsync(0);
    f.socket.active = true;
    f.emit("connect_error", new Error("transport offline"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(f.socket.connect).toHaveBeenCalledTimes(1);
    f.socket.active = false;
    f.emit("connect_error", new Error("unauthorized"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(f.ticket).toHaveBeenCalledTimes(2);
    expect(f.socket.connect).toHaveBeenCalledTimes(2);
    f.stop();
  });

  it("validates live payloads and removes every listener/retry when unmounted", async () => {
    const f = fixture();
    await vi.advanceTimersByTimeAsync(0);
    f.emit("notification:count", { unread: -2 });
    f.emit("notification:count", { unread: "12" });
    f.emit("notification:new", { id: "malformed" });
    expect(f.onCount).not.toHaveBeenCalled();
    expect(f.onNew).not.toHaveBeenCalled();
    const notice = { id: "t1", type: "TICKET_REPLY", entityType: "TICKET", entityId: "owned", title: "Support reply", body: "Reply from your customer", createdAt: new Date().toISOString(), isRead: false, readAt: null };
    f.emit("notification:new", notice);
    expect(f.onNew).toHaveBeenCalledWith(notice);
    f.emit("disconnect", "io server disconnect");
    f.stop();
    await vi.advanceTimersByTimeAsync(60000);
    expect(f.socket.connect).toHaveBeenCalledTimes(1);
    expect(f.socket.disconnect).toHaveBeenCalledTimes(1);
    f.emit("notification:count", { unread: 20 });
    expect(f.onCount).not.toHaveBeenCalled();
  });

  it("never connects after teardown during a pending ticket request", async () => {
    let resolve!: (value: { ticket: string; socketUrl: string }) => void;
    const f = fixture(vi.fn().mockReturnValue(new Promise((r) => { resolve = r; })));
    f.stop();
    resolve({ ticket: "late", socketUrl: "http://localhost:5101" });
    await vi.advanceTimersByTimeAsync(0);
    expect(f.create).not.toHaveBeenCalled();
  });
});
