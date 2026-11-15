"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export function AdminProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 30_000 },
          mutations: { retry: false },
        },
      }),
  );
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    let active = true;
    const handleUnauthorized = () => router.replace("/");
    window.addEventListener("admin:unauthorized", handleUnauthorized);
    apiClient.auth
      .session()
      .then((user) => {
        if (active) {
          setSessionError(null);
          setUser(user);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        clearUser();
        setSessionError(
          error instanceof ApiError
            ? error.message
            : "Unable to load the Admin session. Please try again.",
        );
      });

    return () => {
      active = false;
      window.removeEventListener("admin:unauthorized", handleUnauthorized);
    };
  }, [clearUser, router, sessionAttempt, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      {sessionError && (
        <div
          className="fixed right-4 top-4 z-[100] flex max-w-md items-center gap-3 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700 shadow-lg"
          role="alert"
        >
          <span>{sessionError}</span>
          <button
            className="shrink-0 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            onClick={() => setSessionAttempt((attempt) => attempt + 1)}
            type="button"
          >
            Retry
          </button>
        </div>
      )}
      {children}
    </QueryClientProvider>
  );
}
