"use client";

import { RefreshCw, Download } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-[24px]">
      <div>
        <h2 className="text-[28px] font-bold text-gray-900 leading-tight">Overview</h2>
        <p className="text-[14px] text-[#8390A2] font-normal leading-[21px] mt-[4px]">
          Wednesday, December 23, 2024 &nbsp;·&nbsp; Good morning, Admin
        </p>
      </div>
      <div className="flex items-center gap-[12px]">
        <button className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[#EAE8E8] border border-[#CFD4DB] text-gray-700 rounded-[6px] hover:bg-gray-200 transition-colors font-medium text-[13px]">
          <Download className="w-[14px] h-[14px]" />
          Export Report
        </button>
        <button
          onClick={onRefresh}
          className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[#D95C30] text-white rounded-[6px] hover:opacity-90 transition-opacity font-medium text-[13px]"
        >
          <RefreshCw className="w-[14px] h-[14px]" />
          Refresh
        </button>
      </div>
    </div>
  );
}
