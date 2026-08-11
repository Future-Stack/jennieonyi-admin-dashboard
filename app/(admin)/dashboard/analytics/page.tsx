"use client"
import AnalyticStateCard from "@/components/admin/analytics/AnalyticStateCard";
import OverviewChart from "@/components/admin/analytics/OverviewChart";
import { TopPerformersTable } from "@/components/admin/analytics/TopPerformersTable";
import TrendBarChart from "@/components/admin/analytics/TrendBarChart";
import Headers from "@/components/admin/common/Headers";
import { bookingData, commissionBookingData, commissionData, dummyPerformers, dummyPerformers2, productBookingData, revenueBookingData, revenueData, statCardsData, vendorSalesBookingData, vendorSalesData } from "@/data/analytics";
import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type TabType = "Revenues" | "Vendor Sales" | "Bookings" | "Commissions";

const TAB_CONFIG: Record<TabType, { strokeColor: string; fillColor: string }> = {
  "Revenues": { strokeColor: "#4D145D", fillColor: "#4D145D" },
  "Vendor Sales": { strokeColor: "#D95C30", fillColor: "#D95C30" },
  "Bookings": { strokeColor: "#009966", fillColor: "#009966" },
  "Commissions": { strokeColor: "#FFB900", fillColor: "#FFB900" },
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Revenues");
  const [chartData, setChartData] = useState<any[]>(revenueData);
  const [trendChartData, setTrendChartData] = useState<any[]>(revenueBookingData);
  const [performerData, setPerformerData] = useState<any[]>(dummyPerformers);

  useEffect(() => {
    // assign data based on active tab
    switch (activeTab) {
      case "Revenues":
        setChartData(revenueData);
        setTrendChartData(revenueBookingData);
        setPerformerData(dummyPerformers);
        break;
      case "Vendor Sales":
        setChartData(vendorSalesData);
        setTrendChartData(vendorSalesBookingData);
        setPerformerData(dummyPerformers2);
        break;
      case "Bookings":
        setChartData(bookingData);
        setTrendChartData(productBookingData);
        setPerformerData(dummyPerformers);
        break;
      case "Commissions":
        setChartData(commissionData);
        setTrendChartData(commissionBookingData);
        setPerformerData(dummyPerformers2);
        break;

      default:
        break;
    }
  }, [activeTab]);

  const currentTabConfig = TAB_CONFIG[activeTab];

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white py-8 overflow-y-auto">
      <Headers
        title="Analytics & Reports"
        description="Platform insights across services, vendors, bookings, and growth"
        buttonOneIcon={<Download className="w-4 h-4" />}
        buttonOneText="Export CSV"
        buttonOneAction={() => { }}
        buttonTwoIcon={<RefreshCw className="w-4 h-4" />}
        buttonTwoText="Refresh"
        buttonTwoAction={() => { }}
      />

      {/* cards  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {
          statCardsData.map((card, index) => (
            <AnalyticStateCard key={index} {...card} />
          ))
        }
      </div>

      {/* active button  */}
      <div className="flex items-center my-6">
        <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-1 shadow-2xs h-11">
          {(["Revenues", "Vendor Sales", "Bookings", "Commissions"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const tabColor = TAB_CONFIG[tab].strokeColor;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={isActive ? { backgroundColor: "#4D145D", color: "#FFFFFF" } : {}}
                className={`px-4 h-8.5 rounded-lg text-[13px] font-semibold flex items-center justify-center transition-all ${
                  isActive
                    ? "shadow-xs"
                    : "bg-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* analytics charts and tables  */}
      <div className="space-y-6">
        <OverviewChart
          data={chartData}
          chartName={activeTab}
          strokeColor={currentTabConfig.strokeColor}
          fillColor={currentTabConfig.fillColor}
        />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="">
            <TopPerformersTable data={performerData} />
          </div>
          <div className="">
            <TrendBarChart data={trendChartData} chartName={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}

