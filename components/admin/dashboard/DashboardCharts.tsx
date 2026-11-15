"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAnalytics } from "@/lib/api/contracts";
import { formatNaira } from "@/lib/admin/dashboard";

interface DashboardChartsProps {
  analytics?: DashboardAnalytics;
  isLoading: boolean;
  error?: string | null;
  year: number;
  onYearChange: (year: number) => void;
  onRetry: () => void;
}

function ChartSkeleton() {
  return (
    <div
      className="h-[303px] animate-pulse rounded-[16px] border border-[#F3F4F6] bg-white p-5"
      aria-hidden="true"
    >
      <div className="h-5 w-1/3 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
      <div className="mt-8 h-[200px] rounded bg-gray-100" />
    </div>
  );
}

function ChartError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex h-[303px] flex-col items-center justify-center rounded-[16px] border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700"
      role="alert"
    >
      <p>{message}</p>
      <button
        className="mt-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
        onClick={onRetry}
        type="button"
      >
        Retry charts
      </button>
    </div>
  );
}

export function DashboardCharts({
  analytics,
  isLoading,
  error,
  year,
  onYearChange,
  onRetry,
}: DashboardChartsProps) {
  if (!analytics && isLoading) {
    return (
      <div
        className="mb-[24px] grid grid-cols-1 gap-[24px] lg:grid-cols-5"
        aria-label="Loading dashboard charts"
      >
        <div className="lg:col-span-3">
          <ChartSkeleton />
        </div>
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <ChartError message={error ?? "Dashboard charts are unavailable."} onRetry={onRetry} />;
  }

  const revenueData = analytics.monthly.map((month) => ({
    name: new Intl.DateTimeFormat("en-NG", {
      month: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date(`${month.month}-01T12:00:00.000Z`)),
    service: month.serviceRevenue,
    marketplace: month.productRevenue,
  }));
  const bookingsData = analytics.bookingsThisWeek.map((day) => ({
    day: new Intl.DateTimeFormat("en-NG", {
      weekday: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date(`${day.date}T12:00:00.000Z`)),
    count: day.count,
  }));
  const availableYears = [year, year - 1, year - 2];

  return (
    <div className="mb-[24px]">
      {error && (
        <p
          className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          role="alert"
        >
          Showing the last loaded charts. {error}
          <button
            className="ml-2 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </p>
      )}
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-5">
        <div className="h-[303px] rounded-[16px] border border-[#F3F4F6] bg-[#FFFFF7] p-[20px] shadow lg:col-span-3">
          <div className="mb-[20px] flex shrink-0 items-start justify-between">
            <div>
              <h3 className="text-[18px] font-bold leading-tight text-gray-900">
                Revenue Overview
              </h3>
              <p className="mt-[4px] text-[13px] text-[#8390A2]">
                Service + Marketplace revenue · {year}
              </p>
            </div>
            <label className="sr-only" htmlFor="dashboard-revenue-year">
              Revenue chart year
            </label>
            <select
              id="dashboard-revenue-year"
              className="rounded-[8px] border border-gray-200 bg-white px-[12px] py-[6px] text-[13px] font-medium text-gray-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
              onChange={(event) => onYearChange(Number(event.target.value))}
              value={year}
            >
              {availableYears.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              ))}
            </select>
          </div>

          {revenueData.length === 0 ? (
            <div className="flex h-[210px] items-center justify-center text-sm text-gray-500" role="status">
              No revenue data for {year}.
            </div>
          ) : (
            <div
              className="h-[205px] w-full -ml-[10px]"
              role="img"
              aria-label={`Monthly service and marketplace revenue for ${year}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="serviceRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4D145D" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#4D145D" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="marketplaceRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8390A2", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8390A2", fontSize: 11 }}
                    tickFormatter={(value: number) =>
                      value === 0 ? "₦0" : `₦${Math.round(value / 1000)}k`
                    }
                    dx={-10}
                  />
                  <Tooltip
                    formatter={(value) => formatNaira(Number(value))}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{
                      color: "#8390A2",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="service"
                    name="Service"
                    stroke="#4D145D"
                    strokeWidth={2}
                    fill="url(#serviceRevenueFill)"
                    activeDot={{ r: 6, fill: "#4D145D", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="marketplace"
                    name="Marketplace"
                    stroke="#F97316"
                    strokeWidth={2}
                    fill="url(#marketplaceRevenueFill)"
                    activeDot={{ r: 6, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="flex h-[303px] flex-col rounded-[16px] border border-[#F3F4F6] bg-[#FFFFF7] p-[20px] shadow lg:col-span-2">
          <div className="mb-[20px] shrink-0">
            <h3 className="text-[18px] font-bold leading-tight text-gray-900">
              Bookings This Week
            </h3>
            <p className="mt-[4px] text-[13px] text-[#8390A2]">
              Daily bookings trend
            </p>
          </div>
          {bookingsData.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500" role="status">
              No weekly booking data is available.
            </div>
          ) : (
            <div
              className="min-h-0 flex-1 w-full -ml-[15px]"
              role="img"
              aria-label="Daily bookings for the current week"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8390A2", fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8390A2", fontSize: 11 }}
                    dx={-5}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{
                      color: "#8390A2",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Bookings"
                    fill="#4D145D"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
