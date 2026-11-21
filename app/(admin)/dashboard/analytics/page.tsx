"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import AnalyticStateCard from "@/components/admin/analytics/AnalyticStateCard";
import OverviewChart from "@/components/admin/analytics/OverviewChart";
import {
  TopPerformersTable,
} from "@/components/admin/analytics/TopPerformersTable";
import TrendBarChart from "@/components/admin/analytics/TrendBarChart";
import Headers from "@/components/admin/common/Headers";
import {
  buildAnalyticsPeriodRange,
  formatKpiChange,
  formatNaira,
  projectMonthlyTrend,
  projectTopPerformers,
  useDashboardAnalytics,
  useDashboardOrderCount,
  type AnalyticsType,
} from "@/lib/admin/dashboard";
import { downloadCsv, toCsv } from "@/lib/admin/csv";
import type { Kpi } from "@/lib/api/contracts";
import { ApiError } from "@/lib/api/errors";

type TabType = "Revenues" | "Vendor Sales" | "Bookings" | "Commissions";

const TAB_CONFIG: Record<
  TabType,
  { type: AnalyticsType; strokeColor: string; fillColor: string; valueType: "currency" | "count" }
> = {
  Revenues: {
    type: "revenue",
    strokeColor: "#4D145D",
    fillColor: "#4D145D",
    valueType: "currency",
  },
  "Vendor Sales": {
    type: "vendor_sales",
    strokeColor: "#D95C30",
    fillColor: "#D95C30",
    valueType: "currency",
  },
  Bookings: {
    type: "bookings",
    strokeColor: "#009966",
    fillColor: "#009966",
    valueType: "count",
  },
  Commissions: {
    type: "commission",
    strokeColor: "#FFB900",
    fillColor: "#FFB900",
    valueType: "currency",
  },
};

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof ApiError
    ? error.message
    : "Analytics data could not be loaded. Please try again.";
}

function metricCard(title: string, kpi: Kpi, currency = true) {
  const change = formatKpiChange(kpi);
  return {
    title,
    value: currency ? formatNaira(kpi.value) : new Intl.NumberFormat("en-NG").format(kpi.value),
    change: change.label,
    positive: change.tone === "positive",
    isError: change.tone === "negative",
    isNeutral: change.tone === "neutral",
  };
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading analytics">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="h-[140px] animate-pulse rounded-[8px] border border-[#F0F1F3] bg-[#F0F1F3] p-5" key={index}>
            <div className="h-4 w-2/5 rounded bg-gray-200" />
            <div className="mt-7 h-7 w-1/2 rounded bg-gray-200" />
            <div className="mt-4 h-3 w-2/3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-[303px] animate-pulse rounded-[16px] bg-gray-100" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-[360px] animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-[303px] animate-pulse rounded-[16px] bg-gray-100" />
      </div>
    </div>
  );
}

function AnalyticsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">
      <p>{message}</p>
      <button
        className="mt-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
        onClick={onRetry}
        type="button"
      >
        Retry analytics
      </button>
    </div>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Revenues");
  const activeConfig = TAB_CONFIG[activeTab];
  const periodRange = useMemo(() => buildAnalyticsPeriodRange("month"), []);
  const analyticsQuery = useDashboardAnalytics({
    period: "month",
    type: activeConfig.type,
    ...periodRange,
  });
  const orderCountQuery = useDashboardOrderCount({
    period: "month",
    ...periodRange,
  });
  const analytics = analyticsQuery.data;
  const isLoading = analyticsQuery.isLoading || orderCountQuery.isLoading;
  const isFetching = analyticsQuery.isFetching || orderCountQuery.isFetching;
  const analyticsError = getErrorMessage(analyticsQuery.error);
  const orderCountError = getErrorMessage(orderCountQuery.error);
  const monthlyData = analytics
    ? projectMonthlyTrend(analytics.monthly, activeConfig.type)
    : [];
  const weeklyData = analytics?.bookingsThisWeek.map((day) => ({
    day: new Intl.DateTimeFormat("en-NG", {
      weekday: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date(`${day.date}T12:00:00.000Z`)),
    count: day.count,
  })) ?? [];
  const performers = analytics
    ? projectTopPerformers(analytics)
    : [];
  const serviceRevenue = analytics?.monthly.reduce(
    (total, month) => total + month.serviceRevenue,
    0,
  ) ?? 0;
  const cards = analytics
    ? [
        metricCard("Total Revenue", analytics.kpis.revenue),
        metricCard("Vendor Sales", analytics.kpis.vendorSales),
        {
          title: "Service Revenue",
          value: formatNaira(serviceRevenue),
          change: "Comparison unavailable",
          positive: false,
          isError: false,
          isNeutral: true,
        },
        metricCard("Total Bookings", analytics.kpis.bookings, false),
        {
          title: "Product Orders",
          value: orderCountError
            ? "Unavailable"
            : orderCountQuery.data === undefined
              ? "—"
              : new Intl.NumberFormat("en-NG").format(orderCountQuery.data),
          change: orderCountError ?? "Selected period",
          positive: false,
          isError: Boolean(orderCountError),
          isNeutral: !orderCountError,
        },
      ]
    : [];

  const refresh = () => {
    void Promise.all([analyticsQuery.refetch(), orderCountQuery.refetch()]);
  };

  const exportReport = () => {
    if (!analytics) return;
    const rows = [
      ...cards.map((card) => [card.title, card.value, card.change]),
      ...monthlyData.map((item) => [item.name, item.value, activeTab]),
      ...performers.map((performer) => [
        performer.name,
        performer.revenue,
        performer.status,
      ]),
    ];
    downloadCsv(
      `admin-analytics-${activeTab.toLowerCase().replaceAll(" ", "-")}-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(["Metric or period", "Value", "Details"], rows),
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col overflow-y-auto bg-white py-8">
      <Headers
        title="Analytics & Reports"
        description="Platform insights across services, vendors, bookings, and growth"
        buttonOneIcon={<Download className="h-4 w-4" />}
        buttonOneText="Export CSV"
        buttonOneAction={exportReport}
        buttonOneDisabled={!analytics}
        buttonTwoIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />}
        buttonTwoText={isFetching ? "Refreshing" : "Refresh"}
        buttonTwoAction={refresh}
        buttonTwoDisabled={isFetching}
      />

      {analyticsError && !analytics ? (
        <AnalyticsError message={analyticsError} onRetry={refresh} />
      ) : isLoading && !analytics ? (
        <AnalyticsSkeleton />
      ) : analytics ? (
        <>
          {(analyticsError || orderCountError) && (
            <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
              {analyticsError ?? orderCountError}
              <button
                className="ml-2 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
                onClick={refresh}
                type="button"
              >
                Retry
              </button>
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
              <AnalyticStateCard key={card.title} {...card} />
            ))}
          </div>

          <div className="my-6 flex items-center">
            <div className="flex h-11 items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1 shadow-2xs">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    aria-pressed={isActive}
                    className={`flex h-[34px] items-center justify-center rounded-lg px-4 text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary ${
                      isActive
                        ? "bg-[#4D145D] text-white shadow-xs"
                        : "bg-transparent text-gray-500 hover:text-gray-900"
                    }`}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {monthlyData.length === 0 ? (
              <div className="flex h-80 items-center justify-center rounded-[16px] border border-[#F3F4F6] p-5 text-sm text-gray-500" role="status">
                No {activeTab.toLowerCase()} data is available for this period.
              </div>
            ) : (
              <OverviewChart
                data={monthlyData}
                chartName={activeTab}
                strokeColor={activeConfig.strokeColor}
                fillColor={activeConfig.fillColor}
                valueType={activeConfig.valueType}
              />
            )}
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
              <TopPerformersTable data={performers} />
              {weeklyData.length === 0 ? (
                <div className="flex h-[303px] items-center justify-center rounded-[16px] border border-[#F3F4F6] p-5 text-sm text-gray-500" role="status">
                  No weekly booking data is available.
                </div>
              ) : (
                <TrendBarChart data={weeklyData} />
              )}
            </div>
          </div>
        </>
      ) : (
        <AnalyticsError
          message="Analytics data is unavailable."
          onRetry={refresh}
        />
      )}
    </div>
  );
}
