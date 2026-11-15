import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { PendingApprovals } from "@/components/admin/dashboard/PendingApprovals";
import { toCsv } from "@/lib/admin/csv";
import {
  buildAnalyticsPath,
  buildAnalyticsPeriodRange,
  buildDashboardYearRange,
  buildRecentOrdersPath,
  dashboardQueryKeys,
  projectDashboardStats,
  projectMonthlyTrend,
} from "@/lib/admin/dashboard";
import type { DashboardAnalytics, DashboardOverview, Kpi } from "@/lib/api/contracts";

const kpi = (value: number, changePercent: number | null = 0): Kpi => ({
  value,
  previous: value,
  changePercent,
});

const overview: DashboardOverview = {
  kpis: {
    customers: kpi(120, null),
    stylists: kpi(30),
    vendors: kpi(18),
    agents: kpi(8),
    bookings: kpi(50),
    orders: kpi(40),
    revenue: kpi(20000),
    escrowBalance: kpi(3000, null),
    pendingVideoReviews: kpi(2, null),
    pendingVendors: kpi(1, null),
    pendingPayouts: kpi(3, null),
  },
  today: { bookings: 4, orders: 2 },
};

const analytics: DashboardAnalytics = {
  kpis: {
    revenue: kpi(12000),
    vendorSales: kpi(8000),
    bookings: kpi(7),
    commission: kpi(900),
  },
  monthly: [
    {
      month: "2025-01",
      serviceRevenue: 4000,
      productRevenue: 2000,
      bookings: 3,
      serviceCommission: 300,
      productCommission: 200,
    },
  ],
  bookingsThisWeek: [],
  topStylists: [],
  topVendors: [],
};

describe("Admin dashboard data projections", () => {
  it("builds endpoint paths with encoded filter parameters", () => {
    expect(
      buildAnalyticsPath({
        period: "month",
        type: "vendor_sales",
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-02-01T00:00:00.000Z",
      }),
    ).toBe(
      "dashboard/analytics?period=month&type=vendor_sales&startDate=2025-01-01T00%3A00%3A00.000Z&endDate=2025-02-01T00%3A00%3A00.000Z",
    );
    expect(buildRecentOrdersPath(1, "2025-01-01T00:00:00.000Z")).toContain(
      "page=1&limit=1&startDate=2025-01-01T00%3A00%3A00.000Z",
    );
  });

  it("creates Lagos-local month ranges with a live end and supports all-time filters", () => {
    const now = new Date("2025-01-15T10:00:00.000Z");
    expect(buildAnalyticsPeriodRange("month", now)).toEqual({
      startDate: "2024-12-31T23:00:00.000Z",
      endDate: now.toISOString(),
    });
    expect(buildAnalyticsPeriodRange("all", now)).toEqual({});
    expect(buildDashboardYearRange(2025, now)).toEqual({
      startDate: "2024-12-31T23:00:00.000Z",
      endDate: now.toISOString(),
    });
  });

  it("projects only API-backed values and neutral comparisons", () => {
    const stats = projectDashboardStats(overview, analytics);
    expect(stats).toHaveLength(11);
    expect(stats.find((stat) => stat.key === "customers")).toMatchObject({
      value: "120",
      change: "Comparison unavailable",
      changeTone: "neutral",
    });
    expect(projectMonthlyTrend(analytics.monthly, "vendor_sales")).toEqual([
      { name: "Jan", value: 2000 },
    ]);
    expect(projectMonthlyTrend(analytics.monthly, "commission")).toEqual([
      { name: "Jan", value: 500 },
    ]);
  });

  it("keeps all dashboard query keys under the refreshable dashboard prefix", () => {
    expect(dashboardQueryKeys.activity.slice(0, 2)).toEqual(
      dashboardQueryKeys.all,
    );
    expect(dashboardQueryKeys.analytics({
      period: "month",
      type: "revenue",
    }).slice(0, 2)).toEqual(dashboardQueryKeys.all);
  });
});

describe("Admin dashboard data states and CSV", () => {
  it("renders dashboard skeletons and explicit API errors instead of success-shaped values", () => {
    const loading = renderToStaticMarkup(
      createElement(DashboardStats, {
        isLoading: true,
        onRetry: vi.fn(),
      }),
    );
    expect(loading).toContain("Loading dashboard metrics");

    const failed = renderToStaticMarkup(
      createElement(DashboardStats, {
        isLoading: false,
        error: "API unavailable",
        onRetry: vi.fn(),
      }),
    );
    expect(failed).toContain("API unavailable");
    expect(failed).not.toContain("Total customers");
  });

  it("renders the pending-approvals empty state", () => {
    const empty = renderToStaticMarkup(
      createElement(PendingApprovals, {
        items: [],
        isLoading: false,
        onRetry: vi.fn(),
      }),
    );
    expect(empty).toContain("There are no pending approvals.");
  });

  it("escapes CSV fields and protects spreadsheet formulas", () => {
    expect(toCsv(["Name", "Value"], [["=IMPORTXML()", 'A "quote"']])).toBe(
      '"Name","Value"\r\n"\'=IMPORTXML()","A ""quote"""',
    );
  });
});
