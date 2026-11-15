"use client";

import { RefreshCw, Download } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing: boolean;
  exportDisabled: boolean;
}

export function DashboardHeader({
  onRefresh,
  onExport,
  isRefreshing,
  exportDisabled,
}: DashboardHeaderProps) {
  const date = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date());

  return (
    <div className="flex items-center justify-between flex-wrap mb-6">
      <div>
        <h2 className="text-[28px] font-bold text-gray-900 leading-tight">Overview</h2>
        <p className="text-[14px] text-[#8390A2] font-normal leading-[21px] mt-[4px]">
          {date} &nbsp;·&nbsp; Good morning, Admin
        </p>
      </div>
      <div className="flex items-center gap-[12px]">
        <button
          className="flex items-center gap-[6px] rounded-[6px] border border-[#CFD4DB] bg-[#EAE8E8] px-[16px] py-[10px] text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={exportDisabled}
          onClick={onExport}
          type="button"
        >
          <Download className="w-[14px] h-[14px]" />
          Export Report
        </button>
        <button
          onClick={onRefresh}
          aria-busy={isRefreshing}
          className="flex items-center gap-[6px] rounded-[6px] bg-[#D95C30] px-[16px] py-[10px] text-[13px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          disabled={isRefreshing}
          type="button"
        >
          <RefreshCw className={`w-[14px] h-[14px] ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
