import React from 'react';
import { X, CheckCircle2, Circle, KeyRound, Store } from 'lucide-react';
import Image from 'next/image';

interface OrderType {
  id: string;
  customer: { name: string; image: string };
  vendor: { name: string };
  amount: string;
  date: string;
  status: string;
  delivery: string;
  escrow: string;
  tracking: string;
  productName?: string;
}

interface OrderDetailsModalProps {
  order: OrderType;
  onClose: () => void;
  onConfirmOtp?: () => void;
}

export function OrderDetailsModal({ order, onClose, onConfirmOtp }: OrderDetailsModalProps) {
  // Simple logic to determine timeline state based on status
  const isCompleted = order.status === 'Completed' || order.status === 'Delivered';
  const isDispatched = order.status === 'Dispatched' || isCompleted;
  
  // Use a mock product name if not provided (since it's not in the main table data but is in the modal)
  const productName = order.productName || 'Kanekalon Braiding Hair 3X (x3)';

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
          <h2 className="text-[20px] font-bold text-[#1E293B]">Order Details</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Top Row: ID & Badges */}
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold text-[#4D145D]">{order.id}</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                order.status === 'Processing' ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]' :
                order.status === 'Dispatched' ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]' :
                order.status === 'Delivered' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                order.status === 'Completed' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                order.status === 'Pending' ? 'bg-[#FFF7ED] text-[#F59E0B] border border-[#FFEDD5]' :
                'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]'
              }`}>
                {order.status}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                order.escrow === 'Held' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' :
                order.escrow === 'Released' ? 'bg-[#F0FDF4] text-[#10B981] border border-[#BBF7D0]' :
                order.escrow === 'Refunded' ? 'bg-[#FAF5FF] text-[#A855F7] border border-[#E9D5FF]' :
                'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {order.escrow}
              </span>
            </div>
          </div>

          {/* Product Info Box */}
          <div className="bg-[#FAF5FF] rounded-[14px] p-4 flex flex-col gap-2">
            <p className="text-[11px] font-bold text-[#A855F7] uppercase tracking-wider">Product</p>
            <p className="text-[15px] font-bold text-gray-900">{productName}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-[12px] font-medium text-gray-500">Order Amount</p>
              <p className="text-[20px] font-bold text-[#4D145D]">{order.amount}</p>
            </div>
          </div>

          {/* Profiles Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#EFF6FF] rounded-[16px] p-4 flex flex-col">
              <p className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider mb-4">Customer</p>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full overflow-hidden shrink-0 bg-[#4D145D] text-white flex items-center justify-center text-[12px] font-bold border border-white/50">
                  {order.customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="text-[14px] font-bold text-gray-900">{order.customer.name}</p>
              </div>
            </div>
            <div className="bg-[#FFF7ED] rounded-[16px] p-4 flex flex-col">
              <p className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider mb-4">Vendor</p>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#7B2796] flex items-center justify-center shrink-0 border border-white/50">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <p className="text-[14px] font-bold text-gray-900">{order.vendor.name}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Order Date</p>
              <p className="text-[14px] font-bold text-gray-900">{order.date}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Tracking</p>
              <p className="text-[14px] font-bold text-gray-900">{order.tracking}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Delivery Status</p>
              <p className="text-[14px] font-bold text-gray-900">{order.delivery}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-[14px] p-3 flex flex-col justify-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Escrow</p>
              <p className="text-[14px] font-bold text-gray-900">{order.escrow}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex flex-col mt-2">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Order Lifecycle</h4>
            <div className="flex flex-col gap-4 relative">
              {/* Connecting Line */}
              <div className="absolute left-[11px] top-[14px] bottom-[14px] w-[2px] bg-gray-100 z-0"></div>
              
              <div className="flex items-center gap-3 z-10">
                <div className="w-[20px] h-[20px] rounded-full bg-[#3BB515] flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[14px] font-bold text-gray-900">Order Placed</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                <div className="w-[20px] h-[20px] rounded-full bg-[#3BB515] flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[14px] font-bold text-gray-900">Payment Escrowed</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                <div className="w-[20px] h-[20px] rounded-full bg-[#3BB515] flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[14px] font-bold text-gray-900">Vendor Confirmed</span>
              </div>
              
              <div className="flex items-center gap-3 z-10">
                {isDispatched ? (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#3BB515] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
                <span className={`text-[14px] font-bold ${isDispatched ? 'text-gray-900' : 'text-[#99A1AF]'}`}>Order Dispatched</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                {isDispatched ? (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#3BB515] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
                <span className={`text-[14px] font-bold ${isDispatched ? 'text-gray-900' : 'text-[#99A1AF]'}`}>OTP Sent to Customer</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                {isCompleted ? (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#3BB515] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
                <span className={`text-[14px] font-bold ${isCompleted ? 'text-gray-900' : 'text-[#99A1AF]'}`}>Delivery OTP Confirmed</span>
              </div>
              <div className="flex items-center gap-3 z-10">
                {order.escrow === 'Released' ? (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#3BB515] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
                <span className={`text-[14px] font-bold ${order.escrow === 'Released' ? 'text-gray-900' : 'text-[#99A1AF]'}`}>Escrow Released to Vendor</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          {order.escrow === 'Held' && (
            <div className="bg-[#F5F3FF] border border-[#DDD6FF] rounded-[14px] p-4 flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#A855F7]" />
                <h4 className="text-[13px] font-bold text-[#310A3C]">OTP Delivery Confirmation</h4>
              </div>
              <p className="text-[12px] font-medium text-[#9333EA]">Customer has received OTP. Confirm OTP to release escrow to vendor.</p>
            </div>
          )}

          {/* Main Action Button */}
          {order.escrow === 'Held' && (
            <button 
              onClick={() => {
                if (onConfirmOtp) {
                  onClose();
                  onConfirmOtp();
                }
              }}
              className="w-full h-[40px] flex items-center justify-center bg-[#370E42] text-white rounded-[14px] text-[14px] font-bold hover:bg-[#4D145D] transition-colors mt-2 cursor-pointer"
            >
              Confirm Delivery OTP
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
