"use client"
import AnalyticStateCard from "@/components/admin/analytics/AnalyticStateCard";
import Headers from "@/components/admin/common/Headers";
import { Download, RefreshCw } from "lucide-react";

const statCardsData = [
  {
    title:"Total Revenue",
    value:"$488,500",
    change:"+12.4% vs last month",
    isError:false,
    positive:true
  },
  {
    title:"Vendor Sales",
    value:"$32,500",
    change:"+8.2% vs last month",
    isError:false,
    positive:true
  },
  {
    title:"Service Revenue",
    value:"$643,500",
    change:"+14.1% vs last month",
    isError:false,
    positive:true
  },
  {
    title:"Total Bookings",
    value:"1070",
    change:"+9.5% vs last month",
    isError:false,
    positive:true
  },
  {
    title:"Product Orders",
    value:"5470",
    change:"+9.5% vs last month",
    isError:false,
    positive:true
  },
]

export default function AnalyticsPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {
          statCardsData.map((card, index) => (
            <AnalyticStateCard key={index} {...card} />
          ))
        }
      </div>
    </div>
  );
}
