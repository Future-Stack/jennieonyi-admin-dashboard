"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Filter, ChevronDown, Download, Eye, Trash2, Shield, Check, Plus, Star, Pencil } from 'lucide-react';
import { ModalMode, StylistData, StylistModal } from '@/components/admin/stylist/StylistModal';

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

// Helper to convert row data to StylistData modal format
const formatStylistToData = (stylist: typeof STYLISTS_DATA[0]): StylistData => ({
  fullName: stylist.name,
  email: stylist.email,
  phone: "+1 555-1001",
  uploadId: "Driver's License · Verified",
  location: "Houston, TX",
  bankAccount: "••••••4821 · Verified",
  specialty: stylist.specialty,
  referralCode: "PLAIT-EMK-2794",
  avatarUrl: stylist.avatar,
  products: String(stylist.rating),
  orders: String(stylist.jobs),
  revenue: stylist.revenue,
  tierProgress: stylist.jobs,
});

// Default fallback dataset
const dummyStylistData: StylistData = formatStylistToData(STYLISTS_DATA[0]);

export default function StylistsPage() {
  const [stylists, setStylists] = useState(STYLISTS_DATA);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('All');

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("view");
  const [selectedStylist, setSelectedStylist] = useState<StylistData | null>(null);
  const [selectedStylistId, setSelectedStylistId] = useState<number | null>(null);

  const handleOpenCreate = () => {
    setSelectedStylist(null);
    setSelectedStylistId(null);
    setModalMode("create");
    setIsOpen(true);
  };

  const handleOpenView = (stylist: typeof STYLISTS_DATA[0]) => {
    const data = formatStylistToData(stylist);
    setSelectedStylist(data);
    setSelectedStylistId(stylist.id);
    setModalMode("view");
    setIsOpen(true);
  };

  const handleOpenEdit = (stylist: typeof STYLISTS_DATA[0]) => {
    const data = formatStylistToData(stylist);
    setSelectedStylist(data);
    setSelectedStylistId(stylist.id);
    setModalMode("edit");
    setIsOpen(true);
  };

  const handleSave = (data: StylistData, saveMode: "create" | "edit") => {
    if (saveMode === "create") {
      const newStylist = {
        id: Date.now(),
        name: data.fullName || "New Stylist",
        email: data.email || "stylist@email.com",
        avatar: data.avatarUrl || "https://i.pravatar.cc/150?u=" + Date.now(),
        specialty: data.specialty || "General",
        rating: 5.0,
        jobs: 0,
        revenue: "$0",
        tier: "Bronze",
        status: "Pending",
      };
      setStylists((prev) => [newStylist, ...prev]);
    } else {
      setStylists((prev) =>
        prev.map((s) =>
          s.id === selectedStylistId
            ? {
                ...s,
                name: data.fullName,
                email: data.email,
                specialty: data.specialty,
                revenue: data.revenue || s.revenue,
              }
            : s
        )
      );
      setSelectedStylist(data);
    }
  };

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
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white p-1 md:p-8 overflow-y-auto">
      
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap shrink-0 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">Stylist Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage all platform users, stylists, and agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#F3F4F6] border border-gray-200 px-4 py-[10px] rounded-[6px] text-gray-600 text-[14px] font-medium hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-[6px] bg-[#D95C30] border border-[#D95C30] px-4 py-[10px] rounded-[6px] text-white text-[14px] font-medium hover:bg-[#C24D25] transition-colors">
            <Plus className="w-4 h-4" />
            Add Stylist
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Stylists</div>
          <div className="text-[24px] font-bold text-[#4D145D]">1,247</div>
        </div>
        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Active Stylists</div>
          <div className="text-[24px] font-bold text-[#3BB515]">1,089</div>
        </div>
        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Vendors</div>
          <div className="text-[24px] font-bold text-[#F59E0B]">134</div>
        </div>
        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Street Agents</div>
          <div className="text-[24px] font-bold text-[#FF332C]">24</div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex items-center justify-between flex-wrap shrink-0 mb-6">
        <div className="flex items-center ">
          <div className="flex items-center flex-wrap bg-white border border-[#F3F4F6] rounded-[10px] p-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] h-[46px]">
            {['All', 'Verified', 'Pending', 'Suspended'].map((tab) => (
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
        <div className="flex items-center flex-wrap gap-3">
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

      {/* Table Container */}
      <div className="overflow-x-auto">
        <div className="border border-[#EEF2FF] rounded-[12px]">
          <table className="w-full text-left border-collapse min-w-[1000px] bg-white">
            <thead>
              <tr className="bg-[#4D145D] text-white text-[11px] font-bold uppercase tracking-wider">
                {/* <th className="py-4 px-4 w-[61px] text-center">
                  <div 
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 mx-auto rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedIds.length === STYLISTS_DATA.length 
                        ? 'bg-[#F27A54] border-[#F27A54]' 
                        : 'border-[#F27A54] bg-white'
                    }`}
                  >
                    {selectedIds.length === STYLISTS_DATA.length && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </th> */}
                <th className="px-4 py-4 text-left font-bold">Stylist</th>
                <th className="px-4 py-4 text-center font-bold">Specialty</th>
                <th className="px-4 py-4 text-center font-bold">Rating</th>
                <th className="px-4 py-4 text-center font-bold">Jobs</th>
                <th className="px-4 py-4 text-center font-bold">Revenue</th>
                <th className="px-4 py-4 text-center font-bold">Tier</th>
                <th className="px-4 py-4 text-center font-bold">Status</th>
                <th className="px-4 py-4 text-center font-bold w-[179px]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFFFF7]">
            {stylists.map((stylist) => (
              <tr key={stylist.id} className="hover:bg-gray-50 transition-colors group">
                {/* <td className="py-3 px-4 text-center border-r border-b border-[#EEF2FF]">
                  <div 
                    onClick={() => toggleSelect(stylist.id)}
                    className={`w-4 h-4 mx-auto rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedIds.includes(stylist.id)
                        ? 'bg-[#F27A54] border-[#F27A54]'
                        : 'border-[#F27A54] bg-white'
                    }`}
                  >
                    {selectedIds.includes(stylist.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </td> */}
                <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                  <div className="flex items-center gap-3">
                    <Image src={stylist.avatar} alt={stylist.name} width={36} height={36} className="w-[36px] h-[36px] rounded-full object-cover shrink-0" />
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
                    <span className={`px-3 py-[2px] rounded-full text-[12px] font-medium border ${
                      stylist.tier === 'Gold' ? 'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10' :
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
                    <span className={`px-2 py-[2px] rounded-full text-[12px] font-medium ${
                      stylist.status === 'Verified' ? 'bg-[#3BB515] text-white' :
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
                    <button onClick={() => handleOpenView(stylist)} className="text-blue-500 hover:text-blue-700 transition-colors" title="View Stylist">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenEdit(stylist)} className="text-amber-500 hover:text-amber-700 transition-colors" title="Edit Stylist">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-500 hover:text-yellow-600 transition-colors" title="Shield">
                      <Shield className="w-4 h-4" />
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
      <div className="flex items-center justify-between mt-6 shrink-0 bg-white">
        <span className="text-[13px] text-gray-400 font-medium">Showing {stylists.length} results</span>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#4D145D] text-white text-[13px] font-bold">
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

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />

      <StylistModal
        open={isOpen}
        onOpenChange={setIsOpen}
        initialMode={modalMode}
        initialData={modalMode !== "create" ? (selectedStylist || dummyStylistData) : undefined}
        onSave={handleSave}
        onUpgrade={() => console.log("Upgrade clicked")}
        onSuspend={() => console.log("Suspend clicked")}
      />
    </div>
  );
}
