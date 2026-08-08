"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Headers from "@/components/admin/common/Headers";
import CatStateCards, { ICatStateCards } from "@/components/admin/categories/CatStateCards";
import {
  ViewUserProfileDetailsModal,
  UserProfileData,
} from "@/components/admin/agent/ViewUserProfileDetailsModal";
import {
  Clock,
  DollarSign,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Shield,
  ShoppingCart,
  Store,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  Check,
} from "lucide-react";
import DeleteConfirmationModal from "@/components/admin/common/DeleteConfirmationModal";

export interface AgentItem {
  id: number;
  code: string;
  name: string;
  email: string;
  avatar: string;
  referrals: number;
  earned: string;
  pendingPayout: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  status: "Active" | "Pending" | "Suspended" | "Verified";
  phone?: string;
  address?: string;
  bankAccount?: string;
  termsAgreed?: string;
  joined?: string;
  bookings?: string;
  totalSpent?: string;
}

const INITIAL_AGENTS: AgentItem[] = [
  {
    id: 1,
    code: "AG001",
    name: "Emmanuel Asante",
    email: "e.asante@email.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    referrals: 47,
    earned: "$2,350",
    pendingPayout: "$470",
    tier: "Platinum",
    status: "Active",
    phone: "+1 555-0142",
    address: "—",
    bankAccount: "Not required (customer)",
    termsAgreed: "Yes — Dec 2024",
    joined: "Dec 2024",
    bookings: "47",
    totalSpent: "$2,350",
  },
  {
    id: 2,
    code: "AG002",
    name: "Kofi Mensah",
    email: "k.mensah@email.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
    referrals: 38,
    earned: "$1,900",
    pendingPayout: "$380",
    tier: "Gold",
    status: "Active",
    phone: "+1 555-0188",
    address: "Accra, Ghana",
    bankAccount: "Access Bank - 9011****34",
    termsAgreed: "Yes — Nov 2024",
    joined: "Nov 2024",
    bookings: "38",
    totalSpent: "$1,900",
  },
  {
    id: 3,
    code: "AG003",
    name: "Abena Osei",
    email: "a.osei@email.com",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop",
    referrals: 29,
    earned: "$1,450",
    pendingPayout: "$290",
    tier: "Gold",
    status: "Active",
    phone: "+1 555-0192",
    address: "Kumasi, Ghana",
    bankAccount: "Ecobank - 7721****09",
    termsAgreed: "Yes — Oct 2024",
    joined: "Oct 2024",
    bookings: "29",
    totalSpent: "$1,450",
  },
  {
    id: 4,
    code: "AG004",
    name: "Kwame Boateng",
    email: "k.boateng@email.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
    referrals: 21,
    earned: "$1,050",
    pendingPayout: "$210",
    tier: "Silver",
    status: "Active",
    phone: "+1 555-0155",
    address: "Tema, Ghana",
    bankAccount: "CalBank - 5511****88",
    termsAgreed: "Yes — Jan 2025",
    joined: "Jan 2025",
    bookings: "21",
    totalSpent: "$1,050",
  },
  {
    id: 5,
    code: "AG005",
    name: "Ama Darko",
    email: "a.darko@email.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
    referrals: 14,
    earned: "$700",
    pendingPayout: "$140",
    tier: "Silver",
    status: "Pending",
    phone: "+1 555-0133",
    address: "—",
    bankAccount: "Pending Verification",
    termsAgreed: "Yes — Jan 2025",
    joined: "Jan 2025",
    bookings: "14",
    totalSpent: "$700",
  },
  {
    id: 6,
    code: "AG006",
    name: "Nana Oppong",
    email: "n.oppong@email.com",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=256&auto=format&fit=crop",
    referrals: 6,
    earned: "$300",
    pendingPayout: "$60",
    tier: "Bronze",
    status: "Active",
    phone: "+1 555-0111",
    address: "Cape Coast, Ghana",
    bankAccount: "Fidelity Bank - 1109****22",
    termsAgreed: "Yes — Feb 2025",
    joined: "Feb 2025",
    bookings: "6",
    totalSpent: "$300",
  },
];

export default function AgentsPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [agents, setAgents] = useState<AgentItem[]>(INITIAL_AGENTS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"Street Agents" | "Agent Referrals">("Street Agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tierFilter, setTierFilter] = useState<string>("All");

  // Modal State
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State Card Computations
  const stateCardsData: ICatStateCards[] = useMemo(() => {
    const totalAgentsCount = agents.length;
    const totalReferrals = agents.reduce((acc, curr) => acc + curr.referrals, 0);
    const totalEarnedSum = agents.reduce((acc, curr) => {
      const val = parseFloat(curr.earned.replace(/[^0-9.]/g, "")) || 0;
      return acc + val;
    }, 0);
    const pendingPayoutSum = agents.reduce((acc, curr) => {
      const val = parseFloat(curr.pendingPayout.replace(/[^0-9.]/g, "")) || 0;
      return acc + val;
    }, 0);

    return [
      {
        title: "Total Agents",
        data: totalAgentsCount.toString(),
        icon: <Store className="w-[18px] h-[18px] text-[#9810FA]" />,
        iconBgColor: "bg-[#FAF5FF]",
      },
      {
        title: "Total Referrals",
        data: totalReferrals.toLocaleString(),
        icon: <ShoppingCart className="w-[18px] h-[18px] text-[#155DFC]" />,
        iconBgColor: "bg-[#EFF6FF]",
      },
      {
        title: "Total Commissions",
        data: `$${totalEarnedSum.toLocaleString()}`,
        icon: <DollarSign className="w-[18px] h-[18px] text-[#3BB515]" />,
        iconBgColor: "bg-[#F0FDFA]",
      },
      {
        title: "Pending Payouts",
        data: `$${pendingPayoutSum.toLocaleString()}`,
        icon: <Clock className="w-[18px] h-[18px] text-[#E17100]" />,
        iconBgColor: "bg-[#D95C300F]",
      },
    ];
  }, [agents]);

  // Filtering
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || agent.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesTier =
        tierFilter === "All" || agent.tier.toLowerCase() === tierFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [agents, searchQuery, statusFilter, tierFilter]);

  // Checkboxes
  const isAllSelected =
    filteredAgents.length > 0 && filteredAgents.every((a) => selectedIds.includes(a.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAgents.map((a) => a.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Actions
  const handleViewAgent = (agent: AgentItem) => {
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };

  const handleSaveModalData = (updatedModalData: UserProfileData) => {
    if (!updatedModalData.id) return;
    setAgents((prev) =>
      prev.map((item) => {
        if (item.id === updatedModalData.id) {
          return {
            ...item,
            name: updatedModalData.name || item.name,
            email: updatedModalData.email || item.email,
            status: (updatedModalData.status as any) || item.status,
            tier: (updatedModalData.tier as any) || item.tier,
            referrals: updatedModalData.referrals ?? item.referrals,
            earned: updatedModalData.earned || item.earned,
            pendingPayout: updatedModalData.pendingPayout || item.pendingPayout,
            phone: updatedModalData.phone || item.phone,
            address: updatedModalData.address || item.address,
            bankAccount: updatedModalData.bankAccount || item.bankAccount,
            termsAgreed: updatedModalData.termsAgreed || item.termsAgreed,
            joined: updatedModalData.joined || item.joined,
            bookings: updatedModalData.bookings || item.bookings,
            totalSpent: updatedModalData.totalSpent || item.totalSpent,
          };
        }
        return item;
      })
    );
    showToast(`Updated profile for ${updatedModalData.name || "Agent"}`);
  };

  const handleToggleShield = (agent: AgentItem) => {
    const nextStatus = agent.status === "Pending" ? "Active" : "Pending";
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a))
    );
    showToast(`${agent.name} status changed to ${nextStatus}`);
  };

  const handleDeleteAgent = (id: number | null) => {
    if(id){
      setAgents((prev) => prev.filter((a) => a.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected agents?`)) {
      setAgents((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      showToast(`Deleted selected agents`);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Code", "Name", "Email", "Referrals", "Earned", "Pending Payout", "Tier", "Status"];
    const rows = filteredAgents.map((a) => [
      a.code,
      a.name,
      a.email,
      a.referrals,
      a.earned,
      a.pendingPayout,
      a.tier,
      a.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `street_agents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully");
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTierFilter("All");
    setSelectedIds([]);
    showToast("Agent list refreshed");
  };

  // Convert selected AgentItem to UserProfileData for modal
  const selectedUserProfileData: UserProfileData | null = useMemo(() => {
    if (!selectedAgent) return null;
    return {
      id: selectedAgent.id,
      code: selectedAgent.code,
      name: selectedAgent.name,
      email: selectedAgent.email,
      avatarUrl: selectedAgent.avatar,
      status: selectedAgent.status,
      tier: selectedAgent.tier,
      referrals: selectedAgent.referrals,
      earned: selectedAgent.earned,
      pendingPayout: selectedAgent.pendingPayout,
      fullName: selectedAgent.name,
      registrationEmail: selectedAgent.email,
      phone: selectedAgent.phone || "+1 555-0142",
      address: selectedAgent.address || "—",
      bankAccount: selectedAgent.bankAccount || "Not required",
      termsAgreed: selectedAgent.termsAgreed || "Yes — Dec 2024",
      joined: selectedAgent.joined || "Dec 2024",
      bookings: selectedAgent.bookings || String(selectedAgent.referrals),
      totalSpent: selectedAgent.totalSpent || selectedAgent.earned,
      userStatus: selectedAgent.status,
    };
  }, [selectedAgent]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white py-8 px-4 sm:px-6 overflow-y-auto">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#4D145D] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <Headers
        title="Street Agent"
        description="Manage all platform agents and referrals"
        buttonOneIcon={<Download className="w-4 h-4" />}
        buttonOneText="Export CSV"
        buttonOneAction={handleExportCSV}
        buttonTwoIcon={<RefreshCw className="w-4 h-4" />}
        buttonTwoText="Refresh"
        buttonTwoAction={handleRefresh}
      />

      {/* State Cards */}
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

      {/* Top Controls: Tabs & Search/Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0 mb-6">
        <div className="flex items-center">
          <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-[4px] shadow-2xs h-[44px]">
            {(["Street Agents", "Agent Referrals"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 h-[34px] rounded-lg text-[13px] font-semibold flex items-center justify-center transition-all ${activeTab === tab
                    ? "bg-[#4D145D] text-white shadow-xs"
                    : "bg-transparent text-gray-500 hover:text-gray-900"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="flex items-center gap-2 h-[40px] bg-white border border-gray-200 rounded-xl px-3 w-full sm:w-[260px] focus-within:border-[#4D145D] focus-within:ring-1 focus-within:ring-[#4D145D] transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent name, email, code..."
              className="bg-transparent border-none outline-none text-[13px] font-normal text-gray-800 placeholder:text-gray-400 w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 h-[40px] bg-white border border-gray-200 rounded-xl px-3 text-xs font-semibold text-gray-700">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-xs font-semibold text-gray-700"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1.5 h-[40px] bg-white border border-gray-200 rounded-xl px-3 text-xs font-semibold text-gray-700">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-xs font-semibold text-gray-700"
            >
              <option value="All">Tier: All</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between animate-in fade-in">
          <span className="text-xs font-bold text-[#4D145D]">
            {selectedIds.length} agent(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table - Matching the User's Image Perfectly */}
      <div className="overflow-x-auto mb-4 border border-[#EEF2FF] rounded-xl shadow-2xs">
        <table className="w-full text-left border-collapse min-w-[1000px] bg-white">
          <thead>
            <tr className="bg-[#4D145D] text-white text-xs font-bold uppercase tracking-wider">
              <th className="py-4 px-4 text-center w-12 border-r border-[#631B77]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#4D145D] focus:ring-[#4D145D] cursor-pointer accent-[#4D145D]"
                />
              </th>
              <th className="py-4 px-4 font-bold border-r border-[#631B77]">AGENT</th>
              <th className="py-4 px-4 font-bold border-r border-[#631B77]">EMAIL</th>
              <th className="py-4 px-4 text-center font-bold border-r border-[#631B77]">REFERRALS</th>
              <th className="py-4 px-4 text-center font-bold border-r border-[#631B77]">EARNED</th>
              <th className="py-4 px-4 text-center font-bold border-r border-[#631B77]">PENDING PAYOUT</th>
              <th className="py-4 px-4 text-center font-bold border-r border-[#631B77]">TIER</th>
              <th className="py-4 px-4 text-center font-bold border-r border-[#631B77]">STATUS</th>
              <th className="py-4 px-4 text-center font-bold">ACTION</th>
            </tr>
          </thead>

          <tbody className="bg-[#FFFFF7]">
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500 text-xs">
                  No agents found matching your search or filters.
                </td>
              </tr>
            ) : (
              filteredAgents.map((agent) => {
                const isSelected = selectedIds.includes(agent.id);

                return (
                  <tr
                    key={agent.id}
                    className={`hover:bg-purple-50/40 transition-colors border-b border-[#EEF2FF] ${isSelected ? "bg-purple-50/60" : ""
                      }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center border-r border-[#EEF2FF]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(agent.id)}
                        className="w-4 h-4 rounded border-amber-500 text-[#4D145D] focus:ring-[#4D145D] cursor-pointer accent-[#4D145D]"
                      />
                    </td>

                    {/* Agent Name + Avatar + Code */}
                    <td className="py-3.5 px-4 border-r border-[#EEF2FF]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                          <Image
                            src={agent.avatar}
                            alt={agent.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-gray-900 leading-tight">
                            {agent.name}
                          </div>
                          <div className="text-[11px] font-medium text-gray-400 mt-0.5">
                            {agent.code}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-[13px] text-gray-600 font-medium border-r border-[#EEF2FF]">
                      {agent.email}
                    </td>

                    {/* Referrals (Bold Purple) */}
                    <td className="py-3.5 px-4 text-center text-[14px] font-bold text-[#4D145D] border-r border-[#EEF2FF]">
                      {agent.referrals}
                    </td>

                    {/* Earned (Bold Green) */}
                    <td className="py-3.5 px-4 text-center text-[13px] font-bold text-[#22C55E] border-r border-[#EEF2FF]">
                      {agent.earned}
                    </td>

                    {/* Pending Payout (Bold Orange/Brown) */}
                    <td className="py-3.5 px-4 text-center text-[13px] font-bold text-[#D95C30] border-r border-[#EEF2FF]">
                      {agent.pendingPayout}
                    </td>

                    {/* Tier Pill */}
                    <td className="py-3.5 px-4 border-r border-[#EEF2FF]">
                      <div className="flex items-center justify-center">
                        <span
                          className={`px-3 py-0.5 rounded-full text-[12px] font-semibold border ${agent.tier === "Platinum"
                              ? "border-gray-300 text-gray-700 bg-gray-100/80"
                              : agent.tier === "Gold"
                                ? "border-[#F59E0B] text-[#D97706] bg-[#FFFBEB]"
                                : agent.tier === "Silver"
                                  ? "border-[#9CA3AF] text-[#6B7280] bg-[#F3F4F6]"
                                  : "border-[#EA580C] text-[#C2410C] bg-[#FFF7ED]"
                            }`}
                        >
                          {agent.tier}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 border-r border-[#EEF2FF]">
                      <div className="flex items-center justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold text-white shadow-2xs ${agent.status === "Active" || agent.status === "Verified"
                              ? "bg-[#3BB515]"
                              : agent.status === "Pending"
                                ? "bg-[#D95C30]"
                                : "bg-[#FF332C]"
                            }`}
                        >
                          {agent.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewAgent(agent)}
                          title="View / Edit Details"
                          className="text-[#0070F3] hover:text-blue-700 transition-transform hover:scale-110"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleShield(agent)}
                          title="Toggle Status (Active/Pending)"
                          className="text-[#F59E0B] hover:text-amber-600 transition-transform hover:scale-110"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteModalOpen(true);
                            setSelectedAgentId(agent.id);
                          }}
                          title="Delete Agent"
                          className="text-[#FF332C] hover:text-rose-700 transition-transform hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-white py-2">
        <span className="text-[13px] text-gray-500 font-medium">
          Showing {filteredAgents.length} of {agents.length} results
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#4D145D] text-white text-[13px] font-bold">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">
            3
          </button>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">
            10
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View & Edit User Profile Details Modal */}
      <ViewUserProfileDetailsModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        data={selectedUserProfileData}
        onSave={handleSaveModalData}
        onFlag={(updatedData) => {
          if (updatedData) handleSaveModalData(updatedData);
          showToast("Agent flagged for review!");
        }}
        onSuspend={(updatedData) => {
          if (updatedData) handleSaveModalData(updatedData);
          showToast(`Agent status updated to ${updatedData?.status || "Suspended"}`);
        }}
      />

      {/* delete modal  */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        handleDelete={() => handleDeleteAgent(selectedAgentId)}
      />
    </div>
  );
}
