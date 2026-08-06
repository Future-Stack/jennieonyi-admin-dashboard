import React from 'react';
import { Store, X, Check, FileText, AlertCircle, AlertTriangle } from 'lucide-react';

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

interface SuspendedVendorModalProps {
  vendor: VendorType;
  onClose: () => void;
  onEditCommission: () => void;
}

export function SuspendedVendorModal({ vendor, onClose, onEditCommission }: SuspendedVendorModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] w-[540px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col relative"
        style={{ padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Title */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[18px] font-bold text-gray-900">Vendor Profile</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner & Avatar */}
        <div 
          className="relative w-full h-24 shrink-0 rounded-[16px] mb-[44px] flex items-center justify-center" 
          style={{ background: 'linear-gradient(135deg, #4D145D 0%, #7B2796 100%)' }}
        >
          <Store className="w-10 h-10 text-white/20" />
          <div 
            className="absolute -bottom-[20px] left-4 w-14 h-14 rounded-[16px] border-[4px] border-white flex items-center justify-center shrink-0 shadow-md" 
            style={{ background: 'linear-gradient(135deg, #4D145D 0%, #7B2796 100%)' }}
          >
            <Store className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Vendor Name & Status */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[20px] font-bold text-gray-900 leading-tight">HairGlow Pro</h3>
            <p className="text-[13px] text-gray-500 mt-1">Hair Care • Yetunde Fashola</p>
          </div>
          <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-medium bg-white text-[#EF4444] border border-[#EF4444]">
            Suspended
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-[#F9FAFB] rounded-[10px] py-3 flex flex-col items-center justify-center">
            <p className="text-[18px] font-bold text-gray-900 leading-none">15</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Products</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-[10px] py-3 flex flex-col items-center justify-center">
            <p className="text-[18px] font-bold text-gray-900 leading-none">89</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Orders</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-[10px] py-3 flex flex-col items-center justify-center">
            <p className="text-[18px] font-bold text-gray-900 leading-none">$3,200</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Revenue</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-[10px] py-3 flex flex-col items-center justify-center">
            <p className="text-[18px] font-bold text-gray-900 leading-none">3.2</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Rating</p>
          </div>
        </div>

        {/* Details List */}
        <div className="flex flex-col mb-6">
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Email</span>
            <span className="font-bold text-gray-900">yetunde@hairglow.com</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Phone</span>
            <span className="font-bold text-gray-900">+1 555-3006</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Category</span>
            <span className="font-bold text-gray-900">Hair Care</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Joined</span>
            <span className="font-bold text-gray-900">Aug 14, 2024</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Commission Rate</span>
            <span className="font-bold text-gray-900">12%</span>
          </div>
          <div className="flex justify-between items-center text-[13px] pt-[14px]">
            <span className="text-gray-400 font-medium">Pending Payout</span>
            <span className="font-bold text-gray-900">$0</span>
          </div>
        </div>

        {/* Seller Quality Metrics */}
        <div className="mb-6">
          <h4 className="text-[14px] font-bold text-gray-900 mb-3">Seller Quality Metrics</h4>
          <div className="bg-[#FEF2F2] border border-[#FFC9C9] rounded-[16px] p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Refund Rate</p>
                <p className="text-[28px] font-bold text-[#EF4444] leading-none">14.6%</p>
              </div>
              <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#EF4444] px-2 py-1 rounded-[6px] text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3" strokeWidth={3} /> High Risk
              </span>
            </div>
            
            <div className="w-full bg-[#FEE2E2] h-2.5 rounded-full mb-4">
              <div className="bg-[#EF4444] h-2.5 rounded-full w-[65%]"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-[8px] py-2 flex flex-col items-center justify-center">
                <p className="text-[14px] font-bold text-gray-900">13</p>
                <p className="text-[10px] text-gray-500 font-medium">Total Returns</p>
              </div>
              <div className="bg-white rounded-[8px] py-2 flex flex-col items-center justify-center">
                <p className="text-[14px] font-bold text-gray-900">11</p>
                <p className="text-[10px] text-gray-500 font-medium">Vendor Fault</p>
              </div>
              <div className="bg-white rounded-[8px] py-2 flex flex-col items-center justify-center">
                <p className="text-[14px] font-bold text-gray-900">$48.50</p>
                <p className="text-[10px] text-gray-500 font-medium">Penalty Balance</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 bg-[#FFFBEB] border border-[#FEF3C6] rounded-[10px] px-3 py-3 mt-3">
            <AlertCircle className="w-4 h-4 text-[#FE9A00] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#BB4D00] leading-snug">
              <span className="font-bold">Return Shipping Liability:</span> 11 returns are due to vendor error (damaged/incorrect goods). Vendor bears full return logistics cost per platform policy.
            </p>
          </div>

          <button className="w-full mt-3 flex items-center justify-center gap-2 cursor-pointer h-[40px] rounded-[14px] bg-[#FB2C36] text-white text-[14px] font-bold hover:bg-[#E01F29] transition-colors">
            <AlertCircle className="w-4 h-4" /> Issue Penalty Notice
          </button>
        </div>

        {/* Registration Details */}
        <div className="bg-[#F9FAFB] rounded-[16px] p-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <FileText className="w-3.5 h-3.5" /> Registration Details (Submitted by Vendor)
          </p>
          
          <p className="text-[12px] text-[#99A1AF] font-bold mb-3">Step 1 — Personal Details</p>
          <div className="flex flex-col gap-2 mb-5">
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Full Name</p>
                <p className="text-[13px] font-bold text-[#1E2939]">Yetunde Fashola</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Email</p>
                <p className="text-[13px] font-bold text-[#1E2939]">Yetunde@Hairglow.com</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Phone Number</p>
                <p className="text-[13px] font-bold text-[#1E2939]">+1 555-3006</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Password</p>
                <p className="text-[13px] font-bold text-[#1E2939]">••••••••</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
          </div>

          <p className="text-[12px] text-[#99A1AF] font-bold mb-3">Step 2 — Business Info</p>
          <div className="flex flex-col gap-2">
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Business / Store Name</p>
                <p className="text-[13px] font-bold text-[#1E2939]">HairGlow Pro</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Product Category</p>
                <p className="text-[13px] font-bold text-[#1E2939]">Hair Care</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Business Document</p>
                <p className="text-[13px] font-bold text-[#1E2939]">NIN/CAC • Uploaded</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Bank Account (Payout)</p>
                <p className="text-[13px] font-bold text-[#1E2939]">••••••3812 • Verified</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
