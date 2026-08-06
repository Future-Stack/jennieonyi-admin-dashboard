import React from 'react';
import { Store, X, Check, FileText, AlertCircle } from 'lucide-react';

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

interface ApprovedVendorModalProps {
  vendor: VendorType;
  onClose: () => void;
  onEditCommission: () => void;
}

export function ApprovedVendorModal({ vendor, onClose, onEditCommission }: ApprovedVendorModalProps) {
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
            <h3 className="text-[20px] font-bold text-gray-900 leading-tight">{vendor.name}</h3>
            <p className="text-[13px] text-gray-500 mt-1">{vendor.category} • {vendor.name.split(' ')[0]} Manager</p>
          </div>
          <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
            {vendor.status}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-[#F8F9FA] rounded-[10px] py-3 flex flex-col items-center justify-center border border-gray-100">
            <p className="text-[18px] font-bold text-gray-900 leading-none">{vendor.products}</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Products</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-[10px] py-3 flex flex-col items-center justify-center border border-gray-100">
            <p className="text-[18px] font-bold text-gray-900 leading-none">{vendor.orders}</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Orders</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-[10px] py-3 flex flex-col items-center justify-center border border-gray-100">
            <p className="text-[18px] font-bold text-gray-900 leading-none">{vendor.revenue}</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Revenue</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-[10px] py-3 flex flex-col items-center justify-center border border-gray-100">
            <p className="text-[18px] font-bold text-gray-900 leading-none">{vendor.rating}</p>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Rating</p>
          </div>
        </div>

        {/* Details List */}
        <div className="flex flex-col mb-6">
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Email</span>
            <span className="font-bold text-gray-900">{vendor.email}</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Phone</span>
            <span className="font-bold text-gray-900">{vendor.phone}</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Category</span>
            <span className="font-bold text-gray-900">{vendor.category}</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Joined</span>
            <span className="font-bold text-gray-900">{vendor.joined}</span>
          </div>
          <div className="flex justify-between items-center text-[13px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-gray-400 font-medium">Commission Rate</span>
            <span className="font-bold text-gray-900">{vendor.commission}</span>
          </div>
          <div className="flex justify-between items-center text-[13px] pt-[14px]">
            <span className="text-gray-400 font-medium">Pending Payout</span>
            <span className="font-bold text-gray-900">{vendor.payout}</span>
          </div>
        </div>

        {/* Seller Quality Metrics */}
        <div className="mb-6">
          <h4 className="text-[14px] font-bold text-gray-900 mb-3">Seller Quality Metrics</h4>
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[12px] p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">Refund Rate</p>
                <p className="text-[28px] font-bold text-[#16A34A] leading-none">2.1%</p>
              </div>
              <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#16A34A] px-2 py-1 rounded-full text-[11px] font-bold">
                <Check className="w-3 h-3" strokeWidth={3} /> Healthy
              </span>
            </div>
            
            <div className="w-full bg-[#DCFCE7] h-2.5 rounded-full mb-4">
              <div className="bg-[#16A34A] h-2.5 rounded-full w-[15%]"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/60 rounded-[8px] py-2 flex flex-col items-center justify-center">
                <p className="text-[14px] font-bold text-gray-900">4</p>
                <p className="text-[10px] text-gray-500 font-medium">Total Returns</p>
              </div>
              <div className="bg-white/60 rounded-[8px] py-2 flex flex-col items-center justify-center">
                <p className="text-[14px] font-bold text-gray-900">1</p>
                <p className="text-[10px] text-gray-500 font-medium">Vendor Fault</p>
              </div>
              <div className="bg-white/60 rounded-[8px] py-2 flex flex-col items-center justify-center">
                <p className="text-[14px] font-bold text-gray-900">$0.00</p>
                <p className="text-[10px] text-gray-500 font-medium">Penalty Balance</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 bg-[#FFF7ED] border border-[#FFD6A8] rounded-[14px] p-3 mt-3">
            <AlertCircle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#9F2D00] leading-snug">
              <span className="font-bold">Return Shipping Liability:</span> 1 return is due to vendor error (damaged/incorrect goods). Vendor bears full return logistics cost per platform policy.
            </p>
          </div>
        </div>

        {/* Registration Details */}
        <div className="bg-[#F9FAFB] rounded-[16px] p-4 mb-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <FileText className="w-3.5 h-3.5" /> Registration Details (Submitted by Vendor)
          </p>
          
          <p className="text-[12px] text-[#99A1AF] font-bold mb-3">Step 1 — Personal Details</p>
          <div className="flex flex-col gap-2 mb-5">
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Full Name</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.name.split(' ')[0]} Manager</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Email</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.email}</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Phone Number</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.phone}</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Password</p>
                <p className="text-[13px] font-bold text-[#1E2939]">••••••••</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
          </div>

          <p className="text-[12px] text-[#99A1AF] font-bold mb-3">Step 2 — Business Info</p>
          <div className="flex flex-col gap-2">
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Business / Store Name</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.name}</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Product Category</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.category}</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Business Document</p>
                <p className="text-[13px] font-bold text-[#1E2939]">NIN/CAC • Uploaded</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Bank Account (Payout)</p>
                <p className="text-[13px] font-bold text-[#1E2939]">••••••3812 • Verified</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={onEditCommission}
            className="cursor-pointer flex-1 h-[42px] rounded-[10px] border border-gray-200 bg-white text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            Edit Commission
          </button>
          <button className="cursor-pointer flex-1 h-[42px] rounded-[10px] bg-[#F59E0B] text-white text-[14px] font-medium hover:bg-[#D97706] transition-colors">
            Suspend Vendor
          </button>
        </div>
      </div>
    </div>
  );
}
