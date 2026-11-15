"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { DashboardPendingApproval } from "@/lib/api/contracts";

interface PendingApprovalsProps {
  items?: DashboardPendingApproval[];
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
}

const APPROVAL_DESTINATIONS: Record<DashboardPendingApproval["type"], string> = {
  VIDEO: "/dashboard/video-verification",
  VENDOR: "/dashboard/vendors",
  PAYOUT: "/dashboard/payments",
  DISPUTE: "/dashboard/support",
};

const APPROVAL_LABELS: Record<DashboardPendingApproval["type"], string> = {
  VIDEO: "Video Verification",
  VENDOR: "Vendor Registration",
  PAYOUT: "Payout Request",
  DISPUTE: "Product Dispute",
};

function ApprovalSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between rounded-[14px] bg-[#F0F1F3] p-[12px]" aria-hidden="true">
      <div className="flex items-center gap-[16px]">
        <div className="h-[36px] w-[36px] rounded-full bg-gray-200" />
        <div>
          <div className="h-4 w-36 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-52 rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-8 w-20 rounded bg-gray-200" />
    </div>
  );
}

function formatCreatedAt(value: string): string {
  const timestamp = new Date(value);
  if (!Number.isFinite(timestamp.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(timestamp);
}

export function PendingApprovals({
  items,
  isLoading,
  error,
  onRetry,
}: PendingApprovalsProps) {
  return (
    <div className="flex flex-col rounded-[16px] border border-[#F3F4F6] bg-[#FFFFF7] p-[20px] shadow">
      <h3 className="mb-[20px] shrink-0 text-[18px] font-bold text-gray-900">
        Pending Approvals
      </h3>

      {isLoading && !items ? (
        <div className="flex flex-col gap-[12px]" aria-label="Loading pending approvals">
          {[0, 1, 2, 3].map((item) => <ApprovalSkeleton key={item} />)}
        </div>
      ) : error && !items ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>{error}</p>
          <button
            className="mt-2 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            onClick={onRetry}
            type="button"
          >
            Retry pending approvals
          </button>
        </div>
      ) : !items ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>Pending approvals are unavailable.</p>
          <button
            className="mt-2 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            onClick={onRetry}
            type="button"
          >
            Retry pending approvals
          </button>
        </div>
      ) : (
        <>
          {error && (
            <p className="mb-3 text-sm text-amber-800" role="alert">
              Showing the last loaded approvals. {error}
              <button className="ml-2 font-semibold underline" onClick={onRetry} type="button">
                Retry
              </button>
            </p>
          )}
          {items.length === 0 ? (
            <p className="rounded-md bg-gray-50 p-5 text-center text-sm text-gray-500" role="status">
              There are no pending approvals.
            </p>
          ) : <div className="flex flex-col gap-[12px]">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between gap-4 rounded-[14px] bg-[#F0F1F3] p-[12px] transition-colors hover:bg-gray-200"
              >
                <div className="flex min-w-0 items-center gap-[16px]">
                  <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
                    <Clock className="h-[18px] w-[18px] text-[#F97316]" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold leading-tight text-gray-900">
                      {APPROVAL_LABELS[item.type]}
                    </p>
                    <p className="mt-[2px] truncate text-[12px] text-gray-500">
                      {item.name} · {item.reference} · {formatCreatedAt(item.createdAt)}
                    </p>
                  </div>
                </div>
                <Link
                  href={APPROVAL_DESTINATIONS[item.type]}
                  className="flex-shrink-0 rounded-[8px] bg-[#4D145D] px-[20px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#3d0f4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-admin-primary"
                >
                  {item.type === "PAYOUT" ? "Process" : "Review"}
                </Link>
              </div>
            ))}
          </div>}
        </>
      )}
    </div>
  );
}
