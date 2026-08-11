"use client";

import { Users, Scissors, Building2, UserCheck2, Video, Clock, CalendarCheck, ShoppingBag, DollarSign, Wallet, TrendingUp, MapPin, ShoppingCart, Shield, Award, Package } from "lucide-react";

const statsRows = [
  [
    { title: "Total customers", value: "24,851", change: "+12.4% vs last month", positive: true, icon: Users, iconColor: "text-[#7C3AED]", iconBg: "bg-[#F3F0FF]" },
    { title: "Total Stylists", value: "1,247", change: "+8.2% vs last month", positive: true, icon: Scissors, iconColor: "text-[#0EA5E9]", iconBg: "bg-[#F0F9FF]" },
    { title: "Total Vendors", value: "156", change: "+14.1% vs last month", positive: true, icon: Building2, iconColor: "text-[#10B981]", iconBg: "bg-[#F0FDF4]" },
    { title: "Street Agents", value: "342", change: "+9.5% vs last month", positive: true, icon: Award, iconColor: "text-[#F97316]", iconBg: "bg-[#FFF7ED]" },
  ],
  [
    { title: "Video Queue", value: "23", change: "+5 today vs last month", positive: true, icon: Video, iconColor: "text-[#7C3AED]", iconBg: "bg-[#F3F0FF]" },
    { title: "Pending Vendors", value: "2", change: "Needs review vs last month", positive: false, icon: Building2, iconColor: "text-[#0EA5E9]", iconBg: "bg-[#F0F9FF]" },
    { title: "Today's Bookings", value: "156", change: "+23.1% vs last month", positive: true, icon: CalendarCheck, iconColor: "text-[#10B981]", iconBg: "bg-[#F0FDF4]" },
    { title: "Today's Orders", value: "47", change: "+31.2% vs last month", positive: true, icon: ShoppingCart, iconColor: "text-[#F97316]", iconBg: "bg-[#FFF7ED]" },
  ],
  [
    { title: "Platform Revenue", value: "$72,882", change: "+17.3% vs last month", positive: true, icon: DollarSign, iconColor: "text-[#F97316]", iconBg: "bg-[#FFF7ED]" },
    { title: "Escrow Balance", value: "$12,840", change: "-2.1% vs last month", positive: false, isError: true, icon: Shield, iconColor: "text-[#EF4444]", iconBg: "bg-[#FFF1F2]" },
    { title: "Vendor Revenue", value: "$24,490", change: "+28.4% vs last month", positive: true, icon: Package, iconColor: "text-[#10B981]", iconBg: "bg-[#F0FDF4]" },
    { title: "Street Agents", value: "$48,392", change: "+10.5% vs last month", positive: true, icon: Award, iconColor: "text-[#7C3AED]", iconBg: "bg-[#F3F0FF]" },
  ],
];

export function DashboardStats() {
  return (
    <div className="flex flex-col gap-5 mb-6">
      {statsRows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {row.map((stat, i) => (
            <div key={i} className="bg-[#F0F1F3] rounded-[8px] p-5 h-[138px] shadow border border-[#F0F1F3] flex justify-between items-start">
              <div className="flex flex-col justify-between h-full">
                <p className="text-[14px] text-gray-500 font-medium">{stat.title}</p>
                <p className="text-[28px] font-bold text-gray-900 leading-none">{stat.value}</p>
                <p className={`text-[12px] font-medium ${stat.isError ? "text-[#E11D48]" : "text-[#3BB515]"}`}>
                  {stat.positive ? "↗ " : "↘ "}{stat.change}
                </p>
              </div>
              <div className={`w-[36px] h-[36px] rounded-[8px] ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-[18px] h-[18px] ${stat.iconColor}`} strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
