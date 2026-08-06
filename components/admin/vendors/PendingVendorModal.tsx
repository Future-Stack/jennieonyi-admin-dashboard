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

interface PendingVendorModalProps {
  vendor: VendorType;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function PendingVendorModal({ vendor, onClose, onApprove, onReject }: PendingVendorModalProps) {
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
          <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-medium bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
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
            <p className="text-[18px] font-bold text-gray-900 leading-none">{vendor.rating === '—' ? 'N/A' : vendor.rating}</p>
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

        {/* Registration Details */}
        <div className="bg-[#F9FAFB] rounded-[16px] p-4 mb-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <FileText className="w-3.5 h-3.5" /> Registration Details (Submitted by Vendor)
          </p>
          
          <p className="text-[12px] text-[#99A1AF] font-bold mb-3">Step 1 — Personal Details</p>
          <div className="flex flex-col gap-2 mb-5">
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Full Name</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.name.split(' ')[0]} Manager</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Email</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.email}</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Phone Number</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.phone}</p>
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
          <div className="flex flex-col gap-2 mb-4">
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Business / Store Name</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.name}</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Product Category</p>
                <p className="text-[13px] font-bold text-[#1E2939]">{vendor.category}</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
            <div className="bg-[#FFFBEB] border border-[#FEF3C6] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Business Document</p>
                <p className="text-[13px] font-bold text-[#BB4D00]">NIN/CAC • Uploaded</p>
              </div>
              <AlertCircle className="w-[18px] h-[18px] text-[#FE9A00]" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-[10px] flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[11px] text-[#99A1AF] font-medium mb-0.5">Bank Account (Payout)</p>
                <p className="text-[13px] font-bold text-[#1E2939]">••••••3812 • Verified</p>
              </div>
              <Check className="w-[18px] h-[18px] text-[#00BC7D]" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[#FFFBEB] border border-[#FEF3C6] rounded-[10px] px-3 py-2">
            <AlertCircle className="w-4 h-4 text-[#FE9A00] shrink-0" />
            <p className="text-[12px] text-[#BB4D00] font-medium">Business document needs manual review before approval.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto pt-2">
          <button 
            onClick={onApprove}
            className="cursor-pointer flex-1 h-[48px] rounded-[12px] bg-[#10B981] text-white text-[15px] font-bold hover:bg-[#059669] transition-colors"
          >
            Approve Vendor
          </button>
          <button 
            onClick={onReject}
            className="cursor-pointer flex-1 h-[48px] rounded-[12px] bg-[#EF4444] text-white text-[15px] font-bold hover:bg-[#DC2626] transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
