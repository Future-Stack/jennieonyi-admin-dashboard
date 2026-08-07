import React from 'react';
import { X, CheckCircle2, Circle, KeyRound } from 'lucide-react';
import Image from 'next/image';

interface BookingType {
  id: string;
  customer: { name: string; image: string };
  stylist: { name: string; image: string };
  service: string;
  date: string;
  time: string;
  amount: string;
  status: string;
  escrow: string;
}

interface BookingDetailsModalProps {
  booking: BookingType;
  onClose: () => void;
}

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  // Simple logic to determine timeline state based on status
  const isCompleted = booking.status === 'Completed';
  const isActive = booking.status === 'Active' || isCompleted;
  
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[540px] flex flex-col relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-h-[90vh] overflow-y-auto hide-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
          <h2 className="text-[20px] font-bold text-[#1E293B]">Booking Details</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Top Row: ID & Badges */}
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold text-gray-900">{booking.id}</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                booking.status === 'Confirmed' ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]' :
                booking.status === 'Active' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                booking.status === 'Completed' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                booking.status === 'Pending' ? 'bg-[#FFF7ED] text-[#F59E0B] border border-[#FFEDD5]' :
                'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]'
              }`}>
                {booking.status === 'Confirmed' ? 'Dispatched' : booking.status}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                booking.escrow === 'Held' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' :
                booking.escrow === 'Released' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                booking.escrow === 'Pending' ? 'bg-[#FFF7ED] text-[#F59E0B] border border-[#FFEDD5]' :
                'bg-[#FAF5FF] text-[#A855F7] border border-[#E9D5FF]'
              }`}>
                {booking.escrow}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Service</p>
              <p className="text-[14px] font-bold text-gray-900">{booking.service}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Amount</p>
              <p className="text-[14px] font-bold text-gray-900">{booking.amount}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Date</p>
              <p className="text-[14px] font-bold text-gray-900">{booking.date}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Time</p>
              <p className="text-[14px] font-bold text-gray-900">{booking.time}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center col-span-1">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Escrow</p>
              <p className="text-[14px] font-bold text-gray-900">{booking.escrow}</p>
            </div>
          </div>

          {/* Profiles Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#EFF6FF] rounded-[16px] p-4 flex flex-col">
              <p className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider mb-4">Customer</p>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full overflow-hidden shrink-0 bg-white border border-white/50">
                  <Image src={booking.customer.image} alt={booking.customer.name} width={32} height={32} className="object-cover w-full h-full" />
                </div>
                <p className="text-[14px] font-bold text-gray-900">{booking.customer.name}</p>
              </div>
            </div>
            <div className="bg-[#FFF7ED] rounded-[16px] p-4 flex flex-col">
              <p className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider mb-4">Stylist</p>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full overflow-hidden shrink-0 bg-white border border-white/50">
                  <Image src={booking.stylist.image} alt={booking.stylist.name} width={32} height={32} className="object-cover w-full h-full" />
                </div>
                <p className="text-[14px] font-bold text-gray-900">{booking.stylist.name}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex flex-col mt-2">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Booking Timeline</h4>
            <div className="flex flex-col gap-4 relative">
              {/* Connecting Line */}
              <div className="absolute left-[11px] top-[14px] bottom-[14px] w-[2px] bg-gray-100 z-0"></div>
              
              <div className="flex items-center gap-3 z-10">
                <CheckCircle2 className="w-6 h-6 text-[#10B981] bg-white rounded-full" />
                <span className="text-[14px] font-bold text-gray-900">Booking Created</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                <CheckCircle2 className="w-6 h-6 text-[#10B981] bg-white rounded-full" />
                <span className="text-[14px] font-bold text-gray-900">Payment Escrowed</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                <CheckCircle2 className="w-6 h-6 text-[#10B981] bg-white rounded-full" />
                <span className="text-[14px] font-bold text-gray-900">Stylist Confirmed</span>
              </div>
              
              <div className="flex items-center gap-3 z-10">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-[#10B981] bg-white rounded-full" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 fill-gray-100 bg-white rounded-full" />
                )}
                <span className={`text-[14px] font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>Service Completed</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                {booking.escrow === 'Released' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#10B981] bg-white rounded-full" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 fill-gray-100 bg-white rounded-full" />
                )}
                <span className={`text-[14px] font-bold ${booking.escrow === 'Released' ? 'text-gray-900' : 'text-gray-400'}`}>Payment Released</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          {booking.escrow === 'Held' && (
            <div className="bg-[#F5F3FF] border border-[#DDD6FF] rounded-[14px] p-4 flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#A855F7]" />
                <h4 className="text-[13px] font-bold text-[#7E22CE]">OTP Delivery Confirmation</h4>
              </div>
              <p className="text-[12px] font-medium text-[#9333EA]">Customer has received OTP. Confirm OTP to release escrow to vendor.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
