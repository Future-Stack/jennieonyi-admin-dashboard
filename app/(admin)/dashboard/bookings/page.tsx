"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, Eye, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { BookingDetailsModal } from '@/components/admin/bookings/BookingDetailsModal';

const BOOKINGS_DATA = [
  {
    id: 'BK-2401',
    customer: { name: 'Amara Johnson', image: 'https://i.pravatar.cc/150?u=1' },
    stylist: { name: 'Kezia Okafor', image: 'https://i.pravatar.cc/150?u=2' },
    service: 'Knotless Box Braids',
    date: 'Dec 23, 2024',
    time: '10:00 AM',
    amount: '$180',
    status: 'Confirmed',
    escrow: 'Held'
  },
  {
    id: 'BK-2402',
    customer: { name: 'Nkechi Obi', image: 'https://i.pravatar.cc/150?u=3' },
    stylist: { name: 'Yewande Bello', image: 'https://i.pravatar.cc/150?u=4' },
    service: 'Goddess Locs',
    date: 'Dec 23, 2024',
    time: '2:00 PM',
    amount: '$220',
    status: 'Active',
    escrow: 'Held'
  },
  {
    id: 'BK-2403',
    customer: { name: 'Fatima Al-Hassan', image: 'https://i.pravatar.cc/150?u=5' },
    stylist: { name: 'Amina Diallo', image: 'https://i.pravatar.cc/150?u=6' },
    service: 'TWA Styling',
    date: 'Dec 22, 2024',
    time: '11:00 AM',
    amount: '$85',
    status: 'Completed',
    escrow: 'Released'
  },
  {
    id: 'BK-2404',
    customer: { name: 'Zara Williams', image: 'https://i.pravatar.cc/150?u=7' },
    stylist: { name: 'Chidinma Eze', image: 'https://i.pravatar.cc/150?u=8' },
    service: 'Sisterlocks Install',
    date: 'Dec 22, 2024',
    time: '9:00 AM',
    amount: '$350',
    status: 'Completed',
    escrow: 'Released'
  },
  {
    id: 'BK-2405',
    customer: { name: 'Yetunde Adeyemi', image: 'https://i.pravatar.cc/150?u=9' },
    stylist: { name: 'Temi Fashola', image: 'https://i.pravatar.cc/150?u=10' },
    service: 'Sisterlocks Install',
    date: 'Dec 24, 2024',
    time: '3:00 PM',
    amount: '$160',
    status: 'Pending',
    escrow: 'Pending'
  },
  {
    id: 'BK-2406',
    customer: { name: 'Chiamaka Eze', image: 'https://i.pravatar.cc/150?u=11' },
    stylist: { name: 'Kezia Okafor', image: 'https://i.pravatar.cc/150?u=2' },
    service: 'Kinky Twists',
    date: 'Dec 21, 2024',
    time: '1:00 PM',
    amount: '$140',
    status: 'Cancelled',
    escrow: 'Refunded'
  },
  {
    id: 'BK-2407',
    customer: { name: 'Blessing Mensah', image: 'https://i.pravatar.cc/150?u=12' },
    stylist: { name: 'Funke Odeyemi', image: 'https://i.pravatar.cc/150?u=13' },
    service: 'Feed-In Braids',
    date: 'Dec 25, 2024',
    time: '11:00 AM',
    amount: '$75',
    status: 'Pending',
    escrow: 'Pending'
  },
  {
    id: 'BK-2408',
    customer: { name: 'Adaeze Nwosu', image: 'https://i.pravatar.cc/150?u=14' },
    stylist: { name: 'Amina Diallo', image: 'https://i.pravatar.cc/150?u=6' },
    service: 'Cornrows',
    date: 'Dec 20, 2024',
    time: '4:00 PM',
    amount: '$120',
    status: 'Completed',
    escrow: 'Released'
  }
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [viewBooking, setViewBooking] = useState<typeof BOOKINGS_DATA[0] | null>(null);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white p-8 overflow-y-auto">
      
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">Bookings Overview</h1>
          <p className="text-[14px] text-gray-500 mt-1">Monitor all hair service bookings and their status</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="cursor-pointer flex items-center gap-2 bg-[#F3F4F6] border border-gray-200 px-4 py-[10px] rounded-[8px] text-gray-600 text-[14px] font-medium hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
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
          <p className="text-[26px] font-[800] text-[#4D145D] leading-[1.5]">1,247</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Total</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#F59E0B] leading-[1.5]">89</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Pending</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#3B82F6] leading-[1.5]">234</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Confirmed</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#7B2796] leading-[1.5]">156</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Active</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#10B981] leading-[1.5]">698</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Completed</p>
        </div>
        <div className="bg-[#F0F1F3] rounded-[16px] h-[94px] border border-[#F3F4F6] flex flex-col justify-center items-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] gap-0.5">
          <p className="text-[26px] font-[800] text-[#EF4444] leading-[1.5]">70</p>
          <p className="text-[12px] text-[#6A7282] font-normal">Cancelled</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-[6px] bg-white border border-[#F3F4F6] rounded-[10px] p-[6px] pl-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] h-[46px]">
          {['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'].map((tab) => {
            const counts = { 'All': 8, 'Pending': 2, 'Confirmed': 1, 'Active': 1, 'Completed': 3, 'Cancelled': 1 };
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
              placeholder="Search bookings..." 
              className="bg-transparent border-none outline-none text-[13px] font-normal text-[#1E1E1E] placeholder:text-gray-400 w-full"
            />
          </div>
          <button className="cursor-pointer flex items-center justify-center gap-2 px-4 h-[40px] border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="border border-[#E4E6E7] rounded-[8px] overflow-hidden">
          <table className="w-full text-left border-collapse bg-[#FFFFF7]">
            <thead>
              <tr className="bg-[#4D145D] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">BOOKING ID</th>
                <th className="px-4 py-4">CUSTOMER</th>
                <th className="px-4 py-4">STYLIST</th>
                <th className="px-4 py-4 text-center">SERVICE</th>
                <th className="px-4 py-4 text-center">DATE & TIME</th>
                <th className="px-4 py-4 text-center">AMOUNT</th>
                <th className="px-4 py-4 text-center">STATUS</th>
                <th className="px-4 py-4 text-center">ESCROW</th>
                <th className="px-6 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {BOOKINGS_DATA.filter((booking) => activeTab === 'All' || booking.status === activeTab).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors border-b border-[#E4E6E7] last:border-b-0">
                  <td className="px-6 py-4 border-r border-[#E4E6E7]">
                    <span className="text-[12px] font-medium text-gray-500">{booking.id}</span>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7]">
                    <div className="flex items-center gap-2">
                      <div className="w-[28px] h-[28px] rounded-full overflow-hidden shrink-0 border border-gray-200">
                        <Image src={booking.customer.image} alt={booking.customer.name} width={28} height={28} className="object-cover w-full h-full" />
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">{booking.customer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-[#E4E6E7]">
                    <div className="flex items-center gap-2">
                      <div className="w-[28px] h-[28px] rounded-full overflow-hidden shrink-0 border border-gray-200">
                        <Image src={booking.stylist.image} alt={booking.stylist.name} width={28} height={28} className="object-cover w-full h-full" />
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">{booking.stylist.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-r border-[#E4E6E7]">
                    <span className="text-[13px] font-bold text-gray-900">{booking.service}</span>
                  </td>
                  <td className="px-4 py-4 text-center border-r border-[#E4E6E7]">
                    <div className="flex flex-col items-center">
                      <span className="text-[12px] font-bold text-gray-600">{booking.date}</span>
                      <span className="text-[11px] text-gray-400 mt-0.5">{booking.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-r border-[#E4E6E7]">
                    <span className="text-[13px] font-bold text-gray-900">{booking.amount}</span>
                  </td>
                  <td className="px-4 py-4 text-center border-r border-[#E4E6E7]">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                      booking.status === 'Confirmed' ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]' :
                      booking.status === 'Active' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                      booking.status === 'Completed' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                      booking.status === 'Pending' ? 'bg-[#FFF7ED] text-[#F59E0B] border border-[#FFEDD5]' :
                      'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center border-r border-[#E4E6E7]">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                      booking.escrow === 'Held' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' :
                      booking.escrow === 'Released' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                      booking.escrow === 'Pending' ? 'bg-[#FFF7ED] text-[#F59E0B] border border-[#FFEDD5]' :
                      'bg-[#FAF5FF] text-[#A855F7] border border-[#E9D5FF]'
                    }`}>
                      {booking.escrow}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      className="cursor-pointer text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
                      onClick={() => setViewBooking(booking)}
                    >
                      <Eye className="w-[18px] h-[18px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 shrink-0">
        <p className="text-[13px] text-gray-400 font-medium">Showing 8 results</p>
        <div className="flex items-center gap-1">
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-[#4D145D] text-white text-[13px] font-bold">1</button>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">2</button>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">3</button>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">...</span>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">10</button>
        </div>
      </div>

      {/* Booking Details Modal */}
      {viewBooking && (
        <BookingDetailsModal
          booking={viewBooking}
          onClose={() => setViewBooking(null)}
        />
      )}
    </div>
  );
}
