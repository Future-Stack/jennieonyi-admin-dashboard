"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// TypeScript Interfaces
export type PerformerType = "stylist" | "vendor";

export interface Performer {
  id: string;
  name: string;
  initials: string;
  category: string;
  revenue: string;
  rating: number;
  status: "Verified" | "Approved";
  type: PerformerType;
  avatarBg: string; // Tailwind color class for initials badge
}


interface TopPerformersTableProps {
  data?: Performer[];
  className?: string;
}

export function TopPerformersTable({
  data=[],
  className,
}: TopPerformersTableProps) {
  const [activeTab, setActiveTab] = useState<"all" | "stylist" | "vendor">("all");

  // Filter list based on selected tab (or show all if default)
  const filteredData = data.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  return (
    <div
      className={cn(
        "w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm",
        className
      )}
    >
      {/* Table Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>

        {/* Stylists / Vendors Segmented Control */}
        <div className="flex items-center bg-[#F7F7F8] p-1 rounded-2xl border border-gray-100/60">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "stylist" ? "all" : "stylist")}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer",
              activeTab === "stylist"
                ? "bg-[#4B1B54] text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            Stylists
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "vendor" ? "all" : "vendor")}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer",
              activeTab === "vendor"
                ? "bg-[#4B1B54] text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            Vendors
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll for Small Screens */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400">
              <th className="pb-4 font-semibold w-[35%]">Name</th>
              <th className="pb-4 font-semibold w-[25%]">Category</th>
              <th className="pb-4 font-semibold w-[15%]">Revenue</th>
              <th className="pb-4 font-semibold w-[12%]">Rating</th>
              <th className="pb-4 font-semibold w-[13%] text-right sm:text-left">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm font-medium">
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Name with Initials Avatar */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                          row.avatarBg
                        )}
                      >
                        {row.initials}
                      </div>
                      <span className="font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 pr-4 text-gray-500 font-normal">
                    {row.category}
                  </td>

                  {/* Revenue */}
                  <td className="py-4 pr-4 font-bold text-[#10B981]">
                    {row.revenue}
                  </td>

                  {/* Rating */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Star className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                      <span>{row.rating.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Status Tag */}
                  <td className="py-4 text-right sm:text-left">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#10B981] border border-[#D1F2E0]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No performers found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}