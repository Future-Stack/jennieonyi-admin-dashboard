"use client";
import React, { useState } from 'react';
import { Search, Download, Eye, RefreshCw, Store } from 'lucide-react';
import Image from 'next/image';
import { OrderDetailsModal } from '@/components/admin/orders/OrderDetailsModal';
import { ConfirmOtpModal } from '@/components/admin/orders/ConfirmOtpModal';

const ORDERS_DATA = [
  {
    id: 'ORD-5001',
    customer: { name: 'Amara Johnson', image: 'https://i.pravatar.cc/150?u=1' },
    vendor: { name: 'Afro Queen Cosm' },
    amount: '$37.50',
    date: 'Dec 23, 2024',
    status: 'Dispatched',
    delivery: 'Awaiting OTP',
    escrow: 'Held',
    tracking: 'TRK-112233'
  },
  {
    id: 'ORD-5002',
    customer: { name: 'Nkechi Obi', image: 'https://i.pravatar.cc/150?u=3' },
    vendor: { name: 'Afro Queen Cosm' },
    amount: '$44.00',
    date: 'Dec 22, 2024',
    status: 'Delivered',
    delivery: 'OTP Confirmed',
    escrow: 'Released',
    tracking: 'TRK-112234'
  },
  {
    id: 'ORD-5003',
    customer: { name: 'Fatima Al-Hassan', image: 'https://i.pravatar.cc/150?u=5' },
    vendor: { name: 'NaturalCurls Hub' },
    amount: '$24.99',
    date: 'Dec 22, 2024',
    status: 'Processing',
    delivery: 'Not Dispatched',
    escrow: 'Held',
    tracking: '-'
  },
  {
    id: 'ORD-5004',
    customer: { name: 'Zara Williams', image: 'https://i.pravatar.cc/150?u=7' },
    vendor: { name: 'Afro Queen Cosm' },
    amount: '$75.96',
    date: 'Dec 21, 2024',
    status: 'Completed',
    delivery: 'OTP Confirmed',
    escrow: 'Released',
    tracking: 'TRK-112238'
  },
  {
    id: 'ORD-5005',
    customer: { name: 'Yetunde Adeyemi', image: 'https://i.pravatar.cc/150?u=9' },
    vendor: { name: 'BraidQueen Supp' },
    amount: '$59.94',
    date: 'Dec 20, 2024',
    status: 'Pending',
    delivery: 'Not Dispatched',
    escrow: 'Held',
    tracking: '-'
  },
  {
    id: 'ORD-5006',
    customer: { name: 'Chiamaka Eze', image: 'https://i.pravatar.cc/150?u=11' },
    vendor: { name: 'NaturalCurls Hub' },
    amount: '$29.99',
    date: 'Dec 20, 2024',
    status: 'Cancelled',
    delivery: 'Cancelled',
    escrow: 'Refunded',
    tracking: '-'
  }
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [viewOrder, setViewOrder] = useState<typeof ORDERS_DATA[0] | null>(null);
  const [confirmOtpOrder, setConfirmOtpOrder] = useState<typeof ORDERS_DATA[0] | null>(null);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 leading-tight">Product Orders</h1>
          <p className="text-[14px] text-gray-500 mt-1 font-medium">Manage all platform product orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="cursor-pointer flex items-center gap-2 bg-[#F3F4F6] text-gray-700 px-4 py-[10px] rounded-[8px] text-[14px] font-medium hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="cursor-pointer flex items-center gap-2 bg-[#D95C30] text-white px-4 py-[10px] rounded-[8px] text-[14px] font-medium hover:bg-[#C24D25] transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-4 mb-6 shrink-0">
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#F59E0B] leading-[1.5]">1</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Pending</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#3B82F6] leading-[1.5]">1</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Processing</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#4D145D] leading-[1.5]">2</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Dispatched</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#10B981] leading-[1.5]">1</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Delivered</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#7B2796] leading-[1.5]">2</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Completed</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#EF4444] leading-[1.5]">1</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Cancelled</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-[6px] bg-white border border-[#F3F4F6] rounded-[10px] p-[6px] pl-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] h-[46px]">
          {['All Orders', 'Pending', 'Processing', 'Dispatched', 'Delivered', 'Completed', 'Cancelled'].map((tab) => {
            const counts = { 'All Orders': 8, 'Pending': 1, 'Processing': 1, 'Dispatched': 2, 'Delivered': 1, 'Completed': 2, 'Cancelled': 1 };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer flex items-center gap-2 px-3 h-[32px] rounded-[8px] text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-[#4D145D] text-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
                <span className={`px-1.5 h-5 min-w-[20px] flex items-center justify-center rounded-full text-[11px] font-semibold ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[tab as keyof typeof counts]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[6px] h-[40px] bg-white border border-gray-200 rounded-lg px-[12px] w-[260px]">
            <Search className="w-[16px] h-[16px] text-gray-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="bg-transparent border-none outline-none text-[13px] font-normal text-[#1E1E1E] placeholder:text-gray-400 w-full"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden shrink-0">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-max border-collapse">
            <thead>
              <tr className="bg-[#4D145D]">
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] text-center w-[120px]">
                  Order ID
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] w-[200px]">
                  Customer
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] w-[200px]">
                  Vendor
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] text-center w-[100px]">
                  Amount
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] text-center w-[130px]">
                  Order Date
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] text-center w-[120px]">
                  Status
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] text-center w-[140px]">
                  Delivery
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] text-center w-[120px]">
                  Escrow
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-[#6B2B7D] text-center w-[120px]">
                  Tracking
                </th>
                <th className="px-4 py-4 text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap text-center w-[140px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ORDERS_DATA.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 border-r border-[#E4E6E7] text-center">
                    <span className="text-[13px] font-bold text-[#F59E0B]">{order.id}</span>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7]">
                    <div className="flex items-center gap-2">
                      <div className="w-[28px] h-[28px] rounded-full overflow-hidden shrink-0 border border-gray-200">
                        <Image src={order.customer.image} alt={order.customer.name} width={28} height={28} className="object-cover w-full h-full" />
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">{order.customer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7]">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#A855F7]" />
                      <span className="text-[13px] font-medium text-gray-600">{order.vendor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7] text-center">
                    <span className="text-[13px] font-bold text-gray-900">{order.amount}</span>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7] text-center">
                    <span className="text-[13px] font-medium text-gray-600">{order.date}</span>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7] text-center">
                    <span className={`inline-flex px-[10px] py-[4px] rounded-full text-[11px] font-bold border ${
                      order.status === 'Processing' ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#DBEAFE]' :
                      order.status === 'Dispatched' ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#DBEAFE]' :
                      order.status === 'Delivered' ? 'bg-[#F0FDF4] text-[#10B981] border-[#BBF7D0]' :
                      order.status === 'Completed' ? 'bg-[#F0FDF4] text-[#10B981] border-[#BBF7D0]' :
                      order.status === 'Pending' ? 'bg-[#FFF7ED] text-[#F59E0B] border-[#FFEDD5]' :
                      'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7] text-center">
                    <span className={`text-[12px] font-bold ${
                      order.delivery === 'Awaiting OTP' ? 'text-[#7E22CE]' :
                      order.delivery === 'OTP Confirmed' ? 'text-[#10B981]' :
                      order.delivery === 'Not Dispatched' ? 'text-gray-400' :
                      order.delivery === 'Cancelled' ? 'text-[#EF4444]' :
                      'text-gray-900'
                    }`}>
                      {order.delivery}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7] text-center">
                    <span className={`inline-flex px-[10px] py-[4px] rounded-full text-[11px] font-bold border ${
                      order.escrow === 'Held' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' :
                      order.escrow === 'Released' ? 'bg-[#F0FDF4] text-[#10B981] border-[#BBF7D0]' :
                      order.escrow === 'Refunded' ? 'bg-[#FAF5FF] text-[#A855F7] border-[#E9D5FF]' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {order.escrow}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7] text-center">
                    <span className="text-[12px] font-medium text-gray-500">{order.tracking}</span>
                  </td>
                  <td className="px-4 py-4 text-center h-full">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        className="cursor-pointer text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
                        onClick={() => setViewOrder(order)}
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </button>
                      {(order.status === 'Dispatched' || order.status === 'Pending') && (
                        <button 
                          onClick={() => setConfirmOtpOrder(order)}
                          className="cursor-pointer bg-[#310A3C] text-white px-3 py-1.5 rounded-[8px] text-[12px] font-semibold hover:bg-[#4D145D] transition-colors whitespace-nowrap"
                        >
                          Confirm OTP
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 shrink-0">
        <p className="text-[13px] text-gray-400 font-medium">Showing {ORDERS_DATA.length} results</p>
        <div className="flex items-center gap-1">
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-[#4D145D] text-white text-[13px] font-bold">1</button>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">2</button>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">3</button>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">...</span>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">10</button>
        </div>
      </div>

      {/* Order Details Modal */}
      {viewOrder && (
        <OrderDetailsModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onConfirmOtp={() => setConfirmOtpOrder(viewOrder)}
        />
      )}

      {/* Confirm OTP Modal */}
      {confirmOtpOrder && (
        <ConfirmOtpModal
          order={confirmOtpOrder}
          onClose={() => setConfirmOtpOrder(null)}
        />
      )}
    </div>
  );
}
