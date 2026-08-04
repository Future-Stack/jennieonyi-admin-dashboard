"use client";

import { Clock } from "lucide-react";

const approvals = [
  { id: 1, type: "Video Verification", details: "Blessing Adeyemi · Extensions & Weaves · 2h ago", action: "Review" },
  { id: 2, type: "Vendor Registration", details: "KinkyCurly Boutique · Styling Products · Oluwafemi Bello", action: "Review" },
  { id: 3, type: "Vendor Registration", details: "LocLove Essentials · Locs Care · Nnamdi Ogu", action: "Review" },
  { id: 4, type: "Payout Request", details: "Kezia Okafor · $2,450 · 3 jobs completed · Gold Tier", action: "Process" },
  { id: 5, type: "Product Dispute", details: "BraidQueen Supply · Wrong colour — ORD-5002 · $44", action: "Review" },
];

export function PendingApprovals() {
  return (
    <div className="bg-[#FFFFF7] rounded-[16px] shadow border border-[#F3F4F6] p-[20px] flex flex-col">
      <h3 className="text-[18px] font-bold text-gray-900 mb-[20px] shrink-0">Pending Approvals</h3>
      
      <div className="flex flex-col gap-[12px] flex-1">
        {approvals.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-[12px] bg-[#F0F1F3] rounded-[14px] hover:bg-gray-200 transition-colors">
            <div className="flex items-center gap-[16px]">
              <div className="w-[36px] h-[36px] rounded-full bg-[#FFF7ED] flex items-center justify-center flex-shrink-0">
                <Clock className="w-[18px] h-[18px] text-[#F97316]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-900 leading-tight">{item.type}</p>
                <p className="text-[12px] text-gray-500 mt-[2px]">{item.details}</p>
              </div>
            </div>
            <button className="px-[20px] py-[8px] bg-[#4D145D] text-white text-[13px] font-medium rounded-[8px] hover:bg-[#3d0f4a] transition-colors">
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
