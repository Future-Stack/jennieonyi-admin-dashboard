"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { GhostButton } from "@/components/admin/common/Modal";

type Props = { onTarget: (id: string, signal: AbortSignal) => void | Promise<void> };

function Target({ onTarget }: Props) {
  const params = useSearchParams();
  const id = params.get("entityId");
  const router = useRouter();
  const pathname = usePathname();
  const action = useRef(onTarget);
  // Keep the latest handler without writing refs during render.
  useEffect(() => {
    action.current = onTarget;
  });
  const [attempt, setAttempt] = useState(0);
  // One result per (target, attempt); loading = no result for the current key yet.
  const key = id ? `${id}:${attempt}` : null;
  const [result, setResult] = useState<{ key: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (!id || !key) return;
    const controller = new AbortController();
    void Promise.resolve()
      .then(() => action.current(id, controller.signal))
      .then(() => {
        if (controller.signal.aborted) return;
        setResult({ key, ok: true });
        // Consume the target so opening the same notification again also works.
        const remaining = new URLSearchParams(params.toString());
        remaining.delete("entityId");
        const query = remaining.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, ok: false });
      });
    return () => controller.abort();
  }, [id, key, params, pathname, router]);
  if (!id || !key) return null;
  if (result?.key !== key) {
    return (
      <p role="status" className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Opening notification…
      </p>
    );
  }
  if (result.ok) return null;
  return (
    <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      The notification item could not be opened. It may have been removed or already reviewed.{" "}
      <GhostButton onClick={() => setAttempt((value) => value + 1)}>Try again</GhostButton>
    </div>
  );
}

/** The Suspense boundary keeps query-string reads safe during prerendering. */
export function NotificationTarget(props: Props) {
  return <Suspense fallback={null}><Target {...props} /></Suspense>;
}
