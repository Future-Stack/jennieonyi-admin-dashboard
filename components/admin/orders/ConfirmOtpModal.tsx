import React from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';

interface OrderType {
  id: string;
  customer: { name: string; image: string };
  vendor: { name: string };
  amount: string;
  productName?: string;
}

interface ConfirmOtpModalProps {
  order: OrderType;
  onClose: () => void;
}

export function ConfirmOtpModal({ order, onClose }: ConfirmOtpModalProps) {
  const productName = order.productName || 'Kanekalon Braiding Hair 3X (x3)';

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[400px] flex flex-col relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-50">
          <h2 className="text-[18px] font-bold text-[#1E293B]">Confirm Delivery OTP</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 pt-4">
          
          {/* Order Summary Box */}
          <div className="bg-[#F5F3FF] border border-[#EDE9FE] rounded-[16px] pt-6 pr-6 pb-4 pl-6 flex flex-col items-center text-center gap-1">
            <KeyRound className="w-10 h-10 text-[#A855F7] mb-2 transform -rotate-45" strokeWidth={1.5} />
            <h3 className="text-[16px] font-bold text-[#1E293B]">Order {order.id}</h3>
            <p className="text-[14px] text-gray-500 mb-2">{productName}</p>
            <p className="text-[24px] font-bold text-[#4D145D]">{order.amount}</p>
          </div>

          {/* Details List */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500">Customer</span>
              <span className="font-bold text-gray-900">{order.customer.name}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500">Vendor</span>
              <span className="font-bold text-gray-900">{order.vendor.name}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500">After Confirmation</span>
              <span className="font-bold text-[#10B981]">Escrow auto-releases to vendor</span>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-[#FFFBEB] rounded-[14px] p-[12px] flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-[#FE9A00] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#BB4D00] leading-relaxed">
              Confirm only after physical delivery has been verified. This action is irreversible.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button 
              onClick={onClose}
              className="flex-1 h-[44px] rounded-[12px] border border-gray-200 bg-white text-gray-700 text-[14px] font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              className="flex-[2] h-[44px] rounded-[12px] bg-[#3BB515] text-white text-[14px] font-bold hover:bg-[#2A8F0E] transition-colors"
            >
              Confirm & Release Escrow
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
