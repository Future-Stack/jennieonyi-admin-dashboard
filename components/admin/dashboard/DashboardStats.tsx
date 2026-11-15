"use client";

import {
  Award,
  Building2,
  CalendarCheck,
  DollarSign,
  Package,
  Scissors,
  Shield,
  ShoppingCart,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { DashboardAnalytics, DashboardOverview } from "@/lib/api/contracts";
import {
  projectDashboardStats,
  type DashboardStat,
} from "@/lib/admin/dashboard";

const STAT_ICONS: Record<string, LucideIcon> = {
  customers: Users,
  stylists: Scissors,
  vendors: Building2,
  agents: Award,
  video: Video,
  "pending-vendors": Building2,
  "today-bookings": CalendarCheck,
  "today-orders": ShoppingCart,
  revenue: DollarSign,
  escrow: Shield,
  "vendor-revenue": Package,
};

const STAT_COLORS: Record<string, { iconColor: string; iconBg: string }> = {
  customers: { iconColor: "text-[#7C3AED]", iconBg: "bg-[#F3F0FF]" },
  stylists: { iconColor: "text-[#0EA5E9]", iconBg: "bg-[#F0F9FF]" },
  vendors: { iconColor: "text-[#10B981]", iconBg: "bg-[#F0FDF4]" },
  agents: { iconColor: "text-[#F97316]", iconBg: "bg-[#FFF7ED]" },
  video: { iconColor: "text-[#7C3AED]", iconBg: "bg-[#F3F0FF]" },
  "pending-vendors": { iconColor: "text-[#0EA5E9]", iconBg: "bg-[#F0F9FF]" },
  "today-bookings": { iconColor: "text-[#10B981]", iconBg: "bg-[#F0FDF4]" },
  "today-orders": { iconColor: "text-[#F97316]", iconBg: "bg-[#FFF7ED]" },
  revenue: { iconColor: "text-[#F97316]", iconBg: "bg-[#FFF7ED]" },
  escrow: { iconColor: "text-[#EF4444]", iconBg: "bg-[#FFF1F2]" },
  "vendor-revenue": { iconColor: "text-[#10B981]", iconBg: "bg-[#F0FDF4]" },
};

interface DashboardStatsProps {
  overview?: DashboardOverview;
  analytics?: DashboardAnalytics;
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
}

function SkeletonCard() {
  return (
    <div
      className="h-[138px] animate-pulse rounded-[8px] border border-[#F0F1F3] bg-[#F0F1F3] p-5"
      aria-hidden="true"
    >
      <div className="h-4 w-2/5 rounded bg-gray-200" />
      <div className="mt-7 h-7 w-1/3 rounded bg-gray-200" />
      <div className="mt-4 h-3 w-1/2 rounded bg-gray-200" />
    </div>
  );
}

function StatsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      role="alert"
    >
      <p>{message}</p>
      <button
        className="mt-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
        onClick={onRetry}
        type="button"
      >
        Retry dashboard metrics
      </button>
    </div>
  );
}

function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = STAT_ICONS[stat.key];
  const colors = STAT_COLORS[stat.key];
  const changeColor =
    stat.changeTone === "positive"
      ? "text-[#3BB515]"
      : stat.changeTone === "negative"
        ? "text-[#E11D48]"
        : "text-[#8390A2]";
  const arrow =
    stat.changeTone === "positive"
      ? "↗ "
      : stat.changeTone === "negative"
        ? "↘ "
        : "";

  return (
    <div className="flex h-[138px] items-start justify-between rounded-[8px] border border-[#F0F1F3] bg-[#F0F1F3] p-5 shadow">
      <div className="flex h-full flex-col justify-between">
        <p className="text-[14px] font-medium text-gray-500">{stat.title}</p>
        <p className="text-[28px] font-bold leading-none text-gray-900">
          {stat.value}
        </p>
        <p className={`text-[12px] font-medium ${changeColor}`}>
          {arrow}
          {stat.change}
        </p>
      </div>
      <div
        className={`flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[8px] ${colors.iconBg}`}
      >
        <Icon className={`h-[18px] w-[18px] ${colors.iconColor}`} strokeWidth={2} />
      </div>
    </div>
  );
}

export function DashboardStats({
  overview,
  analytics,
  isLoading,
  error,
  onRetry,
}: DashboardStatsProps) {
  if ((!overview || !analytics) && isLoading) {
    return (
      <div className="mb-6 flex flex-col gap-5" aria-label="Loading dashboard metrics">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: row === 2 ? 3 : 4 }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!overview || !analytics) {
    return (
      <StatsError
        message={error ?? "Dashboard metrics are unavailable."}
        onRetry={onRetry}
      />
    );
  }

  const stats = projectDashboardStats(overview, analytics);
  return (
    <div className="mb-6 flex flex-col gap-5">
      {error && (
        <p
          className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          role="alert"
        >
          Showing the last loaded metrics. {error}
          <button
            className="ml-2 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </p>
      )}
      {[0, 4, 8].map((offset) => (
        <div
          key={offset}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.slice(offset, offset + 4).map((stat) => (
            <StatCard key={stat.key} stat={stat} />
          ))}
        </div>
      ))}
    </div>
  );
}
