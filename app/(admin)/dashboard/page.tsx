"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardActivity } from "@/components/admin/dashboard/DashboardActivity";
import { downloadCsv, toCsv } from "@/lib/admin/csv";
import {
  buildDashboardYearRange,
  dashboardQueryKeys,
  formatNaira,
  projectDashboardStats,
  useDashboardActivity,
  useDashboardAnalytics,
  useDashboardOverview,
  useDashboardPendingApprovals,
  useDashboardRecentOrders,
} from "@/lib/admin/dashboard";
import { ApiError } from "@/lib/api/errors";

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof ApiError
    ? error.message
    : "Dashboard data could not be loaded. Please try again.";
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const currentYear = Number(
    new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      timeZone: "Africa/Lagos",
    }).format(new Date()),
  );
  const [year, setYear] = useState(currentYear);
  const yearRange = useMemo(
    () => buildDashboardYearRange(year),
    [year],
  );
  const overviewQuery = useDashboardOverview();
  const analyticsQuery = useDashboardAnalytics({
    period: "year",
    type: "revenue",
    ...yearRange,
  });
  const ordersQuery = useDashboardRecentOrders();
  const approvalsQuery = useDashboardPendingApprovals();
  const activityQuery = useDashboardActivity();
  const isRefreshing = [
    overviewQuery,
    analyticsQuery,
    ordersQuery,
    approvalsQuery,
    activityQuery,
  ].some((query) => query.isFetching);
  const overview = overviewQuery.data;
  const analytics = analyticsQuery.data;
  const orders = ordersQuery.data;
  const approvals = approvalsQuery.data;
  const activity = activityQuery.data;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
  };

  const exportReport = () => {
    if (!overview || !analytics) return;
    const stats = projectDashboardStats(overview, analytics);
    const rows = [
      ...stats.map((stat) => [stat.title, stat.value, stat.change]),
      ...(orders ?? []).map((order) => [
        `Order ${order.orderNumber}`,
        order.customer.name,
        formatNaira(order.totalAmount),
      ]),
    ];
    downloadCsv(
      `admin-dashboard-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(["Metric or order", "Value", "Details"], rows),
    );
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <DashboardHeader
        onRefresh={refresh}
        onExport={exportReport}
        isRefreshing={isRefreshing}
        exportDisabled={!overview || !analytics}
      />
      <DashboardStats
        overview={overview}
        analytics={analytics}
        isLoading={overviewQuery.isLoading || analyticsQuery.isLoading}
        error={
          getErrorMessage(overviewQuery.error) ??
          getErrorMessage(analyticsQuery.error)
        }
        onRetry={refresh}
      />
      <DashboardCharts
        analytics={analytics}
        isLoading={analyticsQuery.isLoading}
        error={getErrorMessage(analyticsQuery.error)}
        year={year}
        onYearChange={setYear}
        onRetry={() => void analyticsQuery.refetch()}
      />
      <DashboardActivity
        orders={orders}
        approvals={approvals}
        activity={activity}
        ordersLoading={ordersQuery.isLoading}
        approvalsLoading={approvalsQuery.isLoading}
        activityLoading={activityQuery.isLoading}
        ordersError={getErrorMessage(ordersQuery.error)}
        approvalsError={getErrorMessage(approvalsQuery.error)}
        activityError={getErrorMessage(activityQuery.error)}
        retryOrders={() => void ordersQuery.refetch()}
        retryApprovals={() => void approvalsQuery.refetch()}
        retryActivity={() => void activityQuery.refetch()}
      />
    </div>
  );
}
