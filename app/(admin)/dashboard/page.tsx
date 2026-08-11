"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardActivity } from "@/components/admin/dashboard/DashboardActivity";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className=" h-full overflow-y-auto no-scrollbar">
      <DashboardHeader onRefresh={handleRefresh} />
      
      {loading ? (
        <div className="h-64 flex items-center justify-center border border-dashed border-zinc-300 rounded-2xl">
          <p className="text-zinc-500 font-medium animate-pulse">Refreshing dashboard data...</p>
        </div>
      ) : (
        <>
          <DashboardStats />
          <DashboardCharts />
          <DashboardActivity />
        </>
      )}
    </div>
  );
}
