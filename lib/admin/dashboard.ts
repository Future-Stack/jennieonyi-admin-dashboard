import { useQuery } from "@tanstack/react-query";
import {
  dashboardActivitySchema,
  dashboardAnalyticsSchema,
  dashboardOverviewSchema,
  dashboardOrderSchema,
  dashboardPendingApprovalSchema,
  type DashboardAnalytics,
  type DashboardOverview,
  type Kpi,
} from "@/lib/api/contracts";
import { BackendProtocolError } from "@/lib/api/errors";
import { apiClient } from "@/lib/api-client";

export type AnalyticsPeriod = "week" | "month" | "year" | "all";
export type AnalyticsType = "revenue" | "vendor_sales" | "bookings" | "commission";

export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  type: AnalyticsType;
  startDate?: string;
  endDate?: string;
}

export const dashboardQueryKeys = {
  all: ["admin", "dashboard"] as const,
  overview: ["admin", "dashboard", "overview"] as const,
  analytics: (filters: AnalyticsFilters) =>
    [
      "admin",
      "dashboard",
      "analytics",
      filters.period,
      filters.type,
      filters.startDate ?? null,
      filters.endDate ?? null,
    ] as const,
  recentOrders: ["admin", "dashboard", "recent-orders"] as const,
  pendingApprovals: ["admin", "dashboard", "pending-approvals"] as const,
  activity: ["admin", "dashboard", "activity"] as const,
  orderCount: (period: AnalyticsPeriod, startDate?: string, endDate?: string) =>
    ["admin", "dashboard", "order-count", period, startDate ?? null, endDate ?? null] as const,
};

function parseWithSchema<T>(schema: {
  safeParse: (input: unknown) =>
    | { success: true; data: T }
    | { success: false };
}): (data: unknown) => T {
  return (data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new BackendProtocolError("The Admin API returned invalid dashboard data.");
    }
    return result.data;
  };
}

export function buildAnalyticsPath(filters: AnalyticsFilters): string {
  const params = new URLSearchParams({
    period: filters.period,
    type: filters.type,
  });
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  return `dashboard/analytics?${params.toString()}`;
}

export function buildDashboardYearRange(
  year: number,
  now = new Date(),
): {
  startDate: string;
  endDate: string;
} {
  const lagosOffsetMs = 60 * 60 * 1000;
  const currentYear = Number(
    new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      timeZone: "Africa/Lagos",
    }).format(now),
  );
  const endDate =
    year < currentYear
      ? Date.UTC(year + 1, 0, 1) - lagosOffsetMs
      : now.getTime();
  return {
    startDate: new Date(Date.UTC(year, 0, 1) - lagosOffsetMs).toISOString(),
    endDate: new Date(endDate).toISOString(),
  };
}

export function buildAnalyticsPeriodRange(
  period: AnalyticsPeriod,
  now = new Date(),
): { startDate?: string; endDate?: string } {
  if (period === "all") return {};

  const dateParts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Lagos",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(dateParts.find((item) => item.type === type)?.value);
  const year = part("year");
  const month = part("month");
  const day = part("day");
  const currentDay = Date.UTC(year, month - 1, day);
  let startDay: number;

  if (period === "week") {
    const weekday = new Date(currentDay).getUTCDay();
    const daysSinceMonday = (weekday + 6) % 7;
    startDay = currentDay - daysSinceMonday * 24 * 60 * 60 * 1000;
  } else if (period === "month") {
    startDay = Date.UTC(year, month - 1, 1);
  } else {
    startDay = Date.UTC(year, 0, 1);
  }

  const lagosOffsetMs = 60 * 60 * 1000;
  return {
    startDate: new Date(startDay - lagosOffsetMs).toISOString(),
    endDate: now.toISOString(),
  };
}

export function buildRecentOrdersPath(
  limit: number,
  startDate?: string,
  endDate?: string,
): string {
  const params = new URLSearchParams({ page: "1", limit: String(limit) });
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return `dashboard/recent-orders?${params.toString()}`;
}

export function getListTotal(meta: unknown): number {
  if (
    typeof meta === "object" &&
    meta !== null &&
    "total" in meta &&
    typeof meta.total === "number" &&
    Number.isInteger(meta.total) &&
    meta.total >= 0
  ) {
    return meta.total;
  }
  throw new BackendProtocolError("The Admin API omitted the required list total.");
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

export function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

export type ChangeTone = "positive" | "negative" | "neutral";

export function formatKpiChange(
  kpi: Kpi,
  comparisonLabel = "vs last month",
): { label: string; tone: ChangeTone } {
  if (kpi.changePercent === null) {
    return { label: "Comparison unavailable", tone: "neutral" };
  }

  const sign = kpi.changePercent > 0 ? "+" : "";
  const formattedPercent = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(kpi.changePercent);
  return {
    label: `${sign}${formattedPercent}% ${comparisonLabel}`,
    tone:
      kpi.changePercent > 0
        ? "positive"
        : kpi.changePercent < 0
          ? "negative"
          : "neutral",
  };
}

export interface DashboardStat {
  key: string;
  title: string;
  value: string;
  change: string;
  changeTone: ChangeTone;
}

function kpiStat(
  key: string,
  title: string,
  kpi: Kpi,
  formatter: (value: number) => string = formatCount,
): DashboardStat {
  const change = formatKpiChange(kpi);
  return {
    key,
    title,
    value: formatter(kpi.value),
    change: change.label,
    changeTone: change.tone,
  };
}

export function projectDashboardStats(
  overview: DashboardOverview,
  analytics: DashboardAnalytics,
): DashboardStat[] {
  return [
    kpiStat("customers", "Total customers", overview.kpis.customers),
    kpiStat("stylists", "Total Stylists", overview.kpis.stylists),
    kpiStat("vendors", "Total Vendors", overview.kpis.vendors),
    kpiStat("agents", "Street Agents", overview.kpis.agents),
    kpiStat("video", "Video Queue", overview.kpis.pendingVideoReviews),
    kpiStat("pending-vendors", "Pending Vendors", overview.kpis.pendingVendors),
    {
      key: "today-bookings",
      title: "Today's Bookings",
      value: formatCount(overview.today.bookings),
      change: "Today",
      changeTone: "neutral",
    },
    {
      key: "today-orders",
      title: "Today's Orders",
      value: formatCount(overview.today.orders),
      change: "Today",
      changeTone: "neutral",
    },
    kpiStat("revenue", "Platform Revenue", overview.kpis.revenue, formatNaira),
    kpiStat(
      "escrow",
      "Escrow Balance",
      overview.kpis.escrowBalance,
      formatNaira,
    ),
    kpiStat(
      "vendor-revenue",
      "Vendor Revenue",
      analytics.kpis.vendorSales,
      formatNaira,
    ),
  ];
}

export function projectMonthlyTrend(
  monthly: DashboardAnalytics["monthly"],
  type: AnalyticsType,
): Array<{ name: string; value: number }> {
  return monthly.map((month) => ({
    name: new Intl.DateTimeFormat("en-NG", {
      month: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date(`${month.month}-01T12:00:00.000Z`)),
    value:
      type === "revenue"
        ? month.serviceRevenue + month.productRevenue
        : type === "vendor_sales"
          ? month.productRevenue
          : type === "bookings"
            ? month.bookings
            : month.serviceCommission + month.productCommission,
  }));
}

export interface PerformerProjection {
  id: string;
  name: string;
  initials: string;
  category: string;
  revenue: string;
  rating: number;
  status: string;
  type: "stylist" | "vendor";
  avatarBg: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function displayStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function projectTopPerformers(
  analytics: DashboardAnalytics,
): PerformerProjection[] {
  return [
    ...analytics.topStylists.map((stylist) => ({
      id: stylist.userId,
      name: stylist.name,
      initials: initials(stylist.name),
      category: stylist.specialties.join(", ") || "—",
      revenue: formatNaira(stylist.revenue),
      rating: stylist.rating,
      status: displayStatus(stylist.status),
      type: "stylist" as const,
      avatarBg: "bg-[#7A2871]",
    })),
    ...analytics.topVendors.map((vendor) => ({
      id: vendor.userId,
      name: vendor.name,
      initials: initials(vendor.name),
      category: vendor.storeName,
      revenue: formatNaira(vendor.revenue),
      rating: vendor.rating,
      status: displayStatus(vendor.status),
      type: "vendor" as const,
      avatarBg: "bg-[#D95F32]",
    })),
  ];
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardQueryKeys.overview,
    queryFn: async ({ signal }) =>
      (
        await apiClient.admin.request(
          "dashboard/overview",
          { method: "GET", signal },
          parseWithSchema(dashboardOverviewSchema),
        )
      ).data,
  });
}

export function useDashboardAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: dashboardQueryKeys.analytics(filters),
    queryFn: async ({ signal }) =>
      (
        await apiClient.admin.request(
          buildAnalyticsPath(filters),
          { method: "GET", signal },
          parseWithSchema(dashboardAnalyticsSchema),
        )
      ).data,
  });
}

export function useDashboardRecentOrders(limit = 6) {
  return useQuery({
    queryKey: [...dashboardQueryKeys.recentOrders, limit],
    queryFn: async ({ signal }) =>
      (
        await apiClient.admin.request(
          buildRecentOrdersPath(limit),
          { method: "GET", signal },
          (data) => dashboardOrderSchema.array().parse(data),
        )
      ).data,
  });
}

export function useDashboardPendingApprovals(limit = 5) {
  return useQuery({
    queryKey: [...dashboardQueryKeys.pendingApprovals, limit],
    queryFn: async ({ signal }) =>
      (
        await apiClient.admin.request(
          `dashboard/pending-approvals?page=1&limit=${limit}`,
          { method: "GET", signal },
          (data) => dashboardPendingApprovalSchema.array().parse(data),
        )
      ).data,
  });
}

export function useDashboardActivity(limit = 5) {
  return useQuery({
    queryKey: [...dashboardQueryKeys.activity, limit],
    queryFn: async ({ signal }) =>
      (
        await apiClient.admin.request(
          `activity?page=1&limit=${limit}`,
          { method: "GET", signal },
          (data) => dashboardActivitySchema.array().parse(data),
        )
      ).data,
  });
}

export function useDashboardOrderCount(filters: {
  period: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: dashboardQueryKeys.orderCount(
      filters.period,
      filters.startDate,
      filters.endDate,
    ),
    queryFn: async ({ signal }) => {
      const path = buildRecentOrdersPath(1, filters.startDate, filters.endDate);
      const response = await apiClient.admin.request(
        path,
        { method: "GET", signal },
        (data) => dashboardOrderSchema.array().parse(data),
      );
      return getListTotal(response.meta);
    },
  });
}
