"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BarChart2,
  CalendarDays,
  CheckCircle,
  DollarSign,
  FileText,
  Key,
  ShoppingCart,
  Store,
  Video,
} from "lucide-react";
import type {
  DashboardActivityEntry,
  DashboardOrder,
  DashboardPendingApproval,
} from "@/lib/api/contracts";
import { formatNaira } from "@/lib/admin/dashboard";
import { PendingApprovals } from "./PendingApprovals";

interface DashboardActivityProps {
  orders?: DashboardOrder[];
  approvals?: DashboardPendingApproval[];
  activity?: DashboardActivityEntry[];
  ordersLoading: boolean;
  approvalsLoading: boolean;
  activityLoading: boolean;
  ordersError?: string | null;
  approvalsError?: string | null;
  activityError?: string | null;
  retryOrders: () => void;
  retryApprovals: () => void;
  retryActivity: () => void;
}

const QUICK_ACTIONS = [
  { label: "Video Queue", href: "/dashboard/video-verification", icon: Video, bg: "bg-[#FFE4E6]", text: "text-[#E11D48]" },
  { label: "New Vendors", href: "/dashboard/vendors", icon: Store, bg: "bg-[#F3E8FF]", text: "text-[#9333EA]" },
  { label: "Product Orders", href: "/dashboard/orders", icon: ShoppingCart, bg: "bg-[#E0E7FF]", text: "text-[#4F46E5]" },
  { label: "Escrow", href: "/dashboard/payments", icon: FileText, bg: "bg-[#FFEDD5]", text: "text-[#D97706]" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2, bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
  { label: "Disputes", href: "/dashboard/support", icon: AlertTriangle, bg: "bg-[#FFE4E6]", text: "text-[#E11D48]" },
];

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-[#1E3A8A]",
  PROCESSING: "bg-[#166534]",
  SHIPPED: "bg-[#701A75]",
  OUT_FOR_DELIVERY: "bg-[#B45309]",
  DELIVERED: "bg-[#22C55E]",
  CANCELLED: "bg-[#6B7280]",
};

function displayStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function orderProductSummary(order: DashboardOrder): string {
  const [first, ...remaining] = order.items;
  if (!first) return "No product items recorded";
  const quantity = first.quantity > 1 ? ` (×${first.quantity})` : "";
  const rest = remaining.length > 0 ? ` +${remaining.length} more` : "";
  return `${first.name}${quantity}${rest}`;
}

function ActivityIcon({ entityType }: { entityType: string }) {
  const normalizedType = entityType.toLowerCase();
  const Icon =
    normalizedType.includes("order") || normalizedType.includes("booking")
      ? CalendarDays
      : normalizedType.includes("payout") || normalizedType.includes("escrow")
        ? DollarSign
        : normalizedType.includes("vendor")
          ? Store
          : normalizedType.includes("verification") || normalizedType.includes("stylist")
            ? CheckCircle
            : normalizedType.includes("ticket") || normalizedType.includes("dispute")
              ? AlertTriangle
              : Key;

  return <Icon className="h-[14px] w-[14px] text-blue-500" strokeWidth={2} />;
}

function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-5 text-sm text-red-700" role="alert">
      <p>{message}</p>
      <button
        className="mt-2 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
        onClick={onRetry}
        type="button"
      >
        Retry
      </button>
    </div>
  );
}

function OrderRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[0, 1, 2, 3, 4].map((cell) => (
        <td className="px-[16px] py-[16px]" key={cell}>
          <div className="h-4 rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  );
}

export function DashboardActivity({
  orders,
  approvals,
  activity,
  ordersLoading,
  approvalsLoading,
  activityLoading,
  ordersError,
  approvalsError,
  activityError,
  retryOrders,
  retryApprovals,
  retryActivity,
}: DashboardActivityProps) {
  return (
    <div className="mb-[24px] flex flex-col gap-[24px]">
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-3">
        <div className="flex h-[570px] flex-col rounded-[8px] border border-[#E4E6E7] bg-[#FFFFF7] p-[16px] shadow lg:col-span-2">
          <h3 className="mb-[18px] shrink-0 text-[18px] font-bold text-gray-900">
            Recent Orders
          </h3>
          <div className="flex-1 overflow-hidden rounded-[8px]">
            <div className="no-scrollbar h-full overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[#4D145D] text-[13px] font-medium text-white">
                    <th className="w-[15%] whitespace-nowrap px-[16px] py-[12px] font-medium">Order ID</th>
                    <th className="w-[30%] px-[16px] py-[12px] font-medium">Customer</th>
                    <th className="w-[30%] px-[16px] py-[12px] text-center font-medium">Product</th>
                    <th className="w-[15%] px-[16px] py-[12px] text-center font-medium">Amount</th>
                    <th className="w-[10%] px-[16px] py-[12px] text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {ordersLoading && !orders ? (
                    [0, 1, 2, 3, 4].map((row) => <OrderRowSkeleton key={row} />)
                  ) : ordersError && !orders ? (
                    <tr>
                      <td colSpan={5}>
                        <SectionError message={ordersError} onRetry={retryOrders} />
                      </td>
                    </tr>
                  ) : !orders ? (
                    <tr>
                      <td colSpan={5}>
                        <SectionError message="Recent orders are unavailable." onRetry={retryOrders} />
                      </td>
                    </tr>
                  ) : orders?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-gray-500" role={ordersError ? "alert" : "status"}>
                        {ordersError ? (
                          <>
                            No recent orders are available. {ordersError}
                            <button className="ml-2 font-semibold underline" onClick={retryOrders} type="button">
                              Retry
                            </button>
                          </>
                        ) : "No recent orders."}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {ordersError && (
                        <tr>
                          <td colSpan={5} className="bg-amber-50 p-3 text-sm text-amber-800" role="alert">
                            Showing the last loaded orders. {ordersError}
                            <button className="ml-2 font-semibold underline" onClick={retryOrders} type="button">
                              Retry
                            </button>
                          </td>
                        </tr>
                      )}
                      {orders?.map((order) => (
                        <tr className="transition-colors hover:bg-gray-50" key={order.id}>
                          <td className="px-[16px] py-[16px]">
                            <Link
                              className="text-[13px] font-medium text-[#D95C30] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
                              href="/dashboard/orders"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-[16px] py-[16px]">
                            <div className="flex items-center gap-[12px]">
                                <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-[#F3E8FF] text-[12px] font-semibold text-[#4D145D]">
                                  {getInitials(order.customer.name)}
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-[13px] font-semibold text-gray-900">
                                  {order.customer.name}
                                </span>
                                <span className="truncate text-[11px] text-[#8390A2]">
                                  {order.customer.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-[16px] py-[16px] text-center">
                            <span className="mx-auto block max-w-[160px] text-[12px] leading-tight text-gray-700">
                              {orderProductSummary(order)}
                            </span>
                          </td>
                          <td className="px-[16px] py-[16px] text-center">
                            <span className="text-[14px] font-bold text-gray-900">
                              {formatNaira(order.totalAmount)}
                            </span>
                          </td>
                          <td className="px-[16px] py-[16px] text-center">
                            <span className={`inline-flex w-[96px] items-center justify-center rounded-full px-[10px] py-[4px] text-[11px] font-medium text-white ${ORDER_STATUS_COLORS[order.orderStatus] ?? "bg-gray-600"}`}>
                              {displayStatus(order.orderStatus)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[24px] lg:col-span-1">
          <div className="shrink-0 rounded-[8px] border border-[#E4E6E7] bg-[#FFFFF7] p-[16px] shadow">
            <h3 className="mb-[16px] text-[18px] font-bold text-gray-900">
              Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-[12px]">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  className={`flex items-center justify-center gap-[6px] rounded-[8px] px-[8px] py-[10px] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary ${action.bg}`}
                  href={action.href}
                  key={action.label}
                >
                  <action.icon className={`h-[14px] w-[14px] ${action.text}`} strokeWidth={2} />
                  <span className={`whitespace-nowrap text-[11px] font-semibold ${action.text}`}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex-1 rounded-[8px] border border-[#E4E6E7] bg-[#FFFFF7] p-[16px] shadow">
            <h3 className="mb-[20px] text-[18px] font-bold text-gray-900">
              Recent Activity
            </h3>
            {activityLoading && !activity ? (
              <div className="flex flex-col gap-[18px]" aria-label="Loading recent activity">
                {[0, 1, 2, 3, 4].map((item) => (
                  <div className="flex animate-pulse items-center gap-3" key={item}>
                    <div className="h-7 w-7 rounded bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityError && !activity ? (
              <SectionError message={activityError} onRetry={retryActivity} />
            ) : (
              <>
                {activityError && (
                  <p className="mb-3 text-xs text-amber-800" role="alert">
                    Showing last loaded activity. {activityError}
                    <button className="ml-2 font-semibold underline" onClick={retryActivity} type="button">
                      Retry
                    </button>
                  </p>
                )}
                {!activity ? (
                  <SectionError message="Recent activity is unavailable." onRetry={retryActivity} />
                ) : activity.length === 0 ? (
                  <p className="rounded-md bg-gray-50 p-5 text-center text-sm text-gray-500" role="status">
                    No recent activity.
                  </p>
                ) : <div className="flex flex-col gap-[18px]">
                  {activity.map((item) => (
                    <div className="flex items-center justify-between gap-2" key={item.id}>
                      <div className="flex min-w-0 items-center gap-[12px]">
                        <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[6px] bg-blue-50">
                          <ActivityIcon entityType={item.entityType} />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-[13px] font-semibold text-gray-900">
                            {displayStatus(item.action)}
                          </span>
                          <span className="truncate text-[11px] text-[#8390A2]">
                            {item.reason ?? `${displayStatus(item.entityType)}${item.entityId ? ` · ${item.entityId}` : ""}`}
                          </span>
                        </div>
                      </div>
                      <span className="ml-[8px] whitespace-nowrap text-[11px] text-gray-400">
                        {formatCreatedAt(item.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>}
              </>
            )}
          </div>
        </div>
      </div>

      <PendingApprovals
        items={approvals}
        isLoading={approvalsLoading}
        error={approvalsError}
        onRetry={retryApprovals}
      />
    </div>
  );
}
