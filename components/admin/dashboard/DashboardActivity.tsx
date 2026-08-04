"use client";

import Image from "next/image";
import { Video, Store, ShoppingCart, FileText, BarChart2, AlertTriangle, CheckCircle, Key, DollarSign } from "lucide-react";
import { PendingApprovals } from "./PendingApprovals";

const recentOrders = [
  { id: "ORD-5001", name: "Amara Johnson", email: "sarah.j@email.com", product: "Kanekalon Braiding Hair 3X (×3)", amount: "$37.50", status: "Confirmed", statusBg: "bg-[#1E3A8A]", statusText: "text-white" },
  { id: "ORD-5002", name: "Nkechi Obi", email: "sarah.j@email.com", product: "Premium Loc Extension Pack (×2)", amount: "$44.00", status: "Active", statusBg: "bg-[#166534]", statusText: "text-white" },
  { id: "ORD-5003", name: "Fatima Al-Hassan", email: "sarah.j@email.com", product: "Jamaican Black Castor Oil Set (×1)", amount: "$24.99", status: "Completed", statusBg: "bg-[#0F766E]", statusText: "text-white" },
  { id: "ORD-5004", name: "Nkechi Obi", email: "sarah.j@email.com", product: "Shea Butter Edge Control (×4)", amount: "$75.96", status: "Dispatched", statusBg: "bg-[#701A75]", statusText: "text-white" },
  { id: "ORD-5005", name: "Sarah Johnson", email: "sarah.j@email.com", product: "Marley Braid Hair Pack (×6)", amount: "$59.94", status: "Delivered", statusBg: "bg-[#22C55E]", statusText: "text-white" },
  { id: "ORD-5006", name: "Fatima Al-Hassan", email: "sarah.j@email.com", product: "Scalp Oil Serum (×1)", amount: "$29.99", status: "Processing", statusBg: "bg-[#B45309]", statusText: "text-white" },
];

const quickActions = [
  { label: "Video Queue", icon: Video, bg: "bg-[#FFE4E6]", text: "text-[#E11D48]" },
  { label: "New Vendors", icon: Store, bg: "bg-[#F3E8FF]", text: "text-[#9333EA]" },
  { label: "Product Orders", icon: ShoppingCart, bg: "bg-[#E0E7FF]", text: "text-[#4F46E5]" },
  { label: "Escrow", icon: FileText, bg: "bg-[#FFEDD5]", text: "text-[#D97706]" },
  { label: "Analytics", icon: BarChart2, bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
  { label: "Disputes", icon: AlertTriangle, bg: "bg-[#FFE4E6]", text: "text-[#E11D48]" },
];

const recentActivity = [
  { title: "Vendor approved", desc: "Afro Queen Cosmetics", time: "2m ago", icon: Store, iconColor: "text-green-500", iconBg: "bg-green-50" },
  { title: "OTP confirmed", desc: "ORD-5002 delivered", time: "22m ago", icon: Key, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
  { title: "New vendor registered", desc: "KinkyCurly Boutique", time: "45m ago", icon: Store, iconColor: "text-purple-500", iconBg: "bg-purple-50" },
  { title: "Escrow released", desc: "$44 → BraidQueen", time: "1h ago", icon: DollarSign, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
  { title: "Stylist verified", desc: "Kezia Okafor", time: "3h ago", icon: CheckCircle, iconColor: "text-green-500", iconBg: "bg-green-50" },
];

export function DashboardActivity() {
  return (
    <div className="flex flex-col gap-[24px] mb-[24px]">
      {/* Top Row: Recent Orders (Left) & Quick Actions/Activity (Right) */}
      <div className="grid grid-cols-3 gap-[24px]">

        {/* Recent Orders - 2/3 width */}
        <div className="col-span-2 bg-[#FFFFF7] rounded-[8px] shadow border border-[#E4E6E7] p-[16px] flex flex-col h-[570px]">
          <h3 className="text-[18px] font-bold text-gray-900 mb-[18px] shrink-0">Recent Orders</h3>
          <div className="overflow-hidden rounded-[8px] flex-1">
            <div className="overflow-y-auto h-full no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#4D145D] text-white text-[13px] font-medium sticky top-0 z-10">
                    <th className="py-[12px] px-[16px] font-medium whitespace-nowrap w-[15%]">Order ID</th>
                    <th className="py-[12px] px-[16px] font-medium w-[30%]">Customer</th>
                    <th className="py-[12px] px-[16px] font-medium text-center w-[30%]">Product</th>
                    <th className="py-[12px] px-[16px] font-medium text-center w-[15%]">Amount</th>
                    <th className="py-[12px] px-[16px] font-medium text-center w-[10%]">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-[16px] px-[16px]">
                        <span className="text-[#D95C30] font-medium text-[13px]">{order.id}</span>
                      </td>
                      <td className="py-[16px] px-[16px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0 relative">
                            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.name}`} alt={order.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-gray-900">{order.name}</span>
                            <span className="text-[11px] text-[#8390A2]">{order.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-[16px] px-[16px] text-center">
                        <span className="text-[12px] text-gray-700 leading-tight block max-w-[160px] mx-auto">{order.product}</span>
                      </td>
                      <td className="py-[16px] px-[16px] text-center">
                        <span className="text-[14px] font-bold text-gray-900">{order.amount}</span>
                      </td>
                      <td className="py-[16px] px-[16px] text-center">
                        <span className={`inline-flex items-center justify-center px-[12px] py-[4px] rounded-full text-[11px] font-medium ${order.statusBg} ${order.statusText} w-[80px]`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions & Recent Activity) - 1/3 width */}
        <div className="col-span-1 flex flex-col gap-[24px]">
          {/* Quick Actions */}
          <div className="bg-[#FFFFF7] rounded-[8px] shadow border border-[#E4E6E7] p-[16px] shrink-0">
            <h3 className="text-[18px] font-bold text-gray-900 mb-[16px]">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-[12px]">
              {quickActions.map((action, i) => (
                <button key={i} className={`flex items-center justify-center gap-[6px] py-[10px] px-[8px] rounded-[8px] ${action.bg} hover:opacity-80 transition-opacity`}>
                  <action.icon className={`w-[14px] h-[14px] ${action.text}`} strokeWidth={2} />
                  <span className={`text-[11px] font-semibold ${action.text} whitespace-nowrap`}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#FFFFF7] rounded-[8px] shadow border border-[#E4E6E7] p-[16px] flex-1">
            <h3 className="text-[18px] font-bold text-gray-900 mb-[20px]">Recent Activity</h3>
            <div className="flex flex-col gap-[18px]">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-[12px] min-w-0">
                    <div className={`w-[28px] h-[28px] rounded-[6px] ${activity.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`w-[14px] h-[14px] ${activity.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-gray-900 truncate">{activity.title}</span>
                      <span className="text-[11px] text-[#8390A2] truncate">{activity.desc}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap ml-[8px]">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Pending Approvals (Restricted to 2/3 width) */}
      <div className="grid grid-cols-3 gap-[24px]">
        <div className="col-span-2">
          <PendingApprovals />
        </div>
      </div>
    </div>
  );
}
