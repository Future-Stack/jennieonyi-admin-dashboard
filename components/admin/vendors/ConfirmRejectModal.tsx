import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface VendorType {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  categoryColor: string;
  products: number;
  orders: number;
  revenue: string;
  rating: string;
  commission: string;
  status: string;
  action: string;
  joined: string;
  payout: string;
}

interface ConfirmRejectModalProps {
  vendor: VendorType;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmRejectModal({ vendor, onClose, onConfirm }: ConfirmRejectModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] w-[380px] flex flex-col relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-[20px] border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-[#1E293B]">Confirm Action</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-[20px]">
          <div className="bg-[#FFFBEB] rounded-[14px] p-4 flex items-start gap-3 mb-5">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <p className="text-[14px] text-[#92400E] leading-relaxed">
              Are you sure you want to <span className="font-bold">Reject<br/>{vendor.name.split(' ')[0]} {vendor.name.split(' ')[1] || ''}?</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="cursor-pointer px-5 h-[42px] rounded-[14px] border border-gray-200 bg-white text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="cursor-pointer flex-1 h-[42px] rounded-[14px] bg-[#FF332C] text-white text-[14px] font-bold hover:bg-[#E62E28] transition-colors"
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
