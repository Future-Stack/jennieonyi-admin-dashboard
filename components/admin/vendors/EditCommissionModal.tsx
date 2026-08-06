import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface VendorType {
  id: string;
  name: string;
  commission: string;
  [key: string]: any;
}

interface EditCommissionModalProps {
  vendor: VendorType;
  onClose: () => void;
  onSave: () => void;
}

export function EditCommissionModal({ vendor, onClose, onSave }: EditCommissionModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] w-[420px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col relative"
        style={{ padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-bold text-gray-900">Edit Commission Rate</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
          Adjust commission rate for <span className="font-bold text-gray-900">{vendor.name}</span>.<br/>
          Current rate: <span className="font-bold text-gray-900">{vendor.commission}</span>
        </p>

        <div className="mb-4">
          <label className="block text-[13px] font-bold text-gray-700 mb-2">Commission Rate (%)</label>
          <input 
            type="text" 
            defaultValue={vendor.commission.replace('%', '')}
            className="w-full h-[42px] border border-gray-200 rounded-[8px] px-3 text-[14px] font-medium text-gray-900 outline-none focus:border-[#4D145D]"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#FFFBEB] rounded-[8px] p-3 mb-6">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
          <p className="text-[12px] text-[#D97706]">This will apply to all future orders from this vendor.</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="cursor-pointer flex-1 h-[42px] rounded-[10px] border border-gray-200 bg-white text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="cursor-pointer flex-1 h-[42px] rounded-[10px] bg-[#D95C30] text-white text-[14px] font-medium hover:bg-[#C24D25] transition-colors"
          >
            Save Rate
          </button>
        </div>
      </div>
    </div>
  );
}
