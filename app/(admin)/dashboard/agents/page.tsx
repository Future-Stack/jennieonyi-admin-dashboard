"use client"

import { CategoryDetailsModal } from "@/components/admin/categories/CategoryDetailsModal";
import CatStateCards, { ICatStateCards } from "@/components/admin/categories/CatStateCards";
import Headers from "@/components/admin/common/Headers";
import { Clock, DollarSign, Download, Eye, Filter, Percent, Plus, RefreshCw, Search, Shield, ShoppingCart, Star, Store, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const stateCardsData: ICatStateCards[] = [
  {
    title: "Total Agents",
    data: "224",
    icon: <Store className="w-[18px] h-[18px] text-[#9810FA]" />,
    iconBgColor: "bg-[#FAF5FF]",
  },
  {
    title: "Total Referrals",
    data: "5,343",
    icon: <ShoppingCart className="w-[18px] h-[18px] text-[#155DFC]" />,
    iconBgColor: "bg-[#EFF6FF]",
  },
  {
    title: "Total Commissions",
    data: "$13,778",
    icon: <DollarSign className="w-[18px] h-[18px] text-[#3BB515]" />,
    iconBgColor: "bg-[#F0FDFA]",
  },
  {
    title: "Pending Payouts",
    data: "$1,452",
    icon: <Clock className="w-[18px] h-[18px] text-[#E17100]" />,
    iconBgColor: "bg-[#D95C300F]",
  },
]

const STYLISTS_DATA = [
  {
    id: 1,
    name: 'Kezia Okafor',
    email: 'kezia.o@email.com',
    avatar: 'https://i.pravatar.cc/150?u=kezia',
    specialty: 'Braiding & Locs',
    rating: 4.9,
    jobs: 287,
    revenue: '$12,450',
    tier: 'Gold',
    status: 'Verified',
  },
  {
    id: 2,
    name: 'Amina Diallo',
    email: 'amina.d@email.com',
    avatar: 'https://i.pravatar.cc/150?u=amina',
    specialty: 'Natural Hair Care',
    rating: 4.8,
    jobs: 277,
    revenue: '$9,450',
    tier: 'Silver',
    status: 'Verified',
  },
  {
    id: 3,
    name: 'Blessing Adeyemi',
    email: 'b.adeyemi@email.com',
    avatar: 'https://i.pravatar.cc/150?u=blessing',
    specialty: 'Extensions & Weaves',
    rating: 4.2,
    jobs: 260,
    revenue: '$11,480',
    tier: 'Bronze',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Yewande Bello',
    email: 'y.bello@email.com',
    avatar: 'https://i.pravatar.cc/150?u=yewande',
    specialty: 'Knotless Braids',
    rating: 4.6,
    jobs: 282,
    revenue: '$10,485',
    tier: 'Platinum',
    status: 'Verified',
  },
  {
    id: 5,
    name: 'Chidinma Eze',
    email: 'c.eze@email.com',
    avatar: 'https://i.pravatar.cc/150?u=chidinma',
    specialty: 'Locs & Twists',
    rating: 4.8,
    jobs: 247,
    revenue: '$13,500',
    tier: 'Silver',
    status: 'Verified',
  },
  {
    id: 6,
    name: 'Ngozi Abiodun',
    email: 'n.abiodun@email.com',
    avatar: 'https://i.pravatar.cc/150?u=ngozi',
    specialty: 'Protective Styles',
    rating: 4.3,
    jobs: 291,
    revenue: '$14,000',
    tier: 'Bronze',
    status: 'Suspended',
  },
  {
    id: 7,
    name: 'Temi Fashola',
    email: 't.fashola@email.com',
    avatar: 'https://i.pravatar.cc/150?u=temi',
    specialty: 'Color & Natural',
    rating: 4.9,
    jobs: 241,
    revenue: '$10,500',
    tier: 'Gold',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Funke Odeyemi',
    email: 'f.odeyemi@email.com',
    avatar: 'https://i.pravatar.cc/150?u=funke',
    specialty: 'Braiding',
    rating: 4.4,
    jobs: 235,
    revenue: '$13,800',
    tier: 'Bronze',
    status: 'Pending',
  },
];

export default function AgentsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState('Street Agents');
  
    const toggleSelectAll = () => {
      if (selectedIds.length === STYLISTS_DATA.length) {
        setSelectedIds([]);
      } else {
        setSelectedIds(STYLISTS_DATA.map(u => u.id));
      }
    };
  
    const toggleSelect = (id: number) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white py-8 overflow-y-auto">
      <Headers
        title="Street Agent"
        description="Manage all platform agents"
        buttonOneIcon={<Download className="w-4 h-4" />}
        buttonOneText="Export CSV"
        buttonOneAction={() => { alert("Export"); }}
        buttonTwoIcon={<RefreshCw className="w-4 h-4" />}
        buttonTwoText="Refresh"
        buttonTwoAction={() => { alert("Refresh"); }}
      />

      {/* cards  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stateCardsData.map((card, index) => (
          <CatStateCards
            key={index}
            title={card.title}
            data={card.data}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            valueColor={card.valueColor}
          />
        ))}
      </div>

      {/* Top Controls */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div className="flex items-center">
          <div className="flex items-center bg-white border border-[#F3F4F6] rounded-[10px] p-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] h-[46px]">
            {['Street Agents', 'Agent Referrals'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 h-[32px] rounded-[8px] text-[13px] font-medium flex items-center justify-center transition-colors ${
                  activeTab === tab 
                    ? 'bg-[#4D145D] text-white shadow-sm' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[6px] h-[40px] bg-white border border-gray-200 rounded-lg px-[12px] w-[260px]">
            <Search className="w-[16px] h-[16px] text-gray-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search stylists..." 
              className="bg-transparent border-none outline-none text-[13px] font-normal text-[#1E1E1E] placeholder:text-gray-400 w-full"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-5 h-[40px] border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>  

      {/* table  */}
      <div className="overflow-x-auto mb-3 mt-6">
        <div className="border border-[#EEF2FF] rounded-xl ">
          <table className="w-full text-left border-collapse min-w-[1000px] bg-white">
            <thead>
              <tr className="bg-[#4D145D] text-white text-sm font-bold uppercase tracking-wider">
                <th className="px-4 py-4 text-left font-bold">Stylist</th>
                <th className="px-4 py-4 text-center font-bold">Specialty</th>
                <th className="px-4 py-4 text-center font-bold">Rating</th>
                <th className="px-4 py-4 text-center font-bold">Jobs</th>
                <th className="px-4 py-4 text-center font-bold">Revenue</th>
                <th className="px-4 py-4 text-center font-bold">Tier</th>
                <th className="px-4 py-4 text-center font-bold">Status</th>
                <th className="px-4 py-4 text-center font-bold w-44.75">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFFFF7]">
              {STYLISTS_DATA.map((stylist) => (
                <tr key={stylist.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                    <div className="flex items-center gap-3">
                      <Image src={stylist.avatar} alt={stylist.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div>
                        <div className="text-[13px] font-bold text-gray-900">{stylist.name}</div>
                        <div className="text-[12px] text-gray-400 mt-0.5">{stylist.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-[13px] text-gray-600 border-r border-b border-[#EEF2FF]">
                    {stylist.specialty}
                  </td>
                  <td className="py-3 px-4 text-center text-[13px] font-bold text-gray-900 border-r border-b border-[#EEF2FF]">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-current" />
                      {stylist.rating}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-[13px] font-bold text-gray-900 border-r border-b border-[#EEF2FF]">
                    {stylist.jobs}
                  </td>
                  <td className="py-3 px-4 text-center text-[13px] font-bold text-gray-900 border-r border-b border-[#EEF2FF]">
                    {stylist.revenue}
                  </td>
                  <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                    <div className="flex items-center justify-center">
                      <span className={`px-3 py-0.5 rounded-full text-[12px] font-medium border ${stylist.tier === 'Gold' ? 'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10' :
                          stylist.tier === 'Silver' ? 'border-[#9CA3AF] text-[#6B7280] bg-[#F3F4F6]' :
                            stylist.tier === 'Bronze' ? 'border-[#D97706] text-[#B45309] bg-[#FFFBEB]' :
                              'border-[#3B82F6] text-[#2563EB] bg-[#EFF6FF]'
                        }`}>
                        {stylist.tier}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                    <div className="flex items-center justify-center">
                      <span className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${stylist.status === 'Verified' ? 'bg-[#3BB515] text-white' :
                          stylist.status === 'Active' ? 'bg-[#3BB515] text-white' :
                            stylist.status === 'Pending' ? 'bg-[#D95C30] text-white' :
                              'bg-[#FF332C] text-white'
                        }`}>
                        {stylist.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={()=>{setIsOpen(true)}} className="text-blue-500 hover:text-blue-700 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-yellow-500 hover:text-yellow-600 transition-colors">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between shrink-0 bg-white">
        <span className="text-[13px] text-gray-400 font-medium">Showing 8 results</span>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-2xl bg-[#4D145D] text-white text-[13px] font-bold">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">
            3
          </button>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">
            10
          </button>
        </div>
      </div>
      <CategoryDetailsModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onDelete={() => console.log("Delete clicked")}
        onEdit={() => console.log("Edit clicked")}
      />
    </div>
  );
}
