"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, Eye, RefreshCw, Store, CheckCircle2, Clock, Users, AlertCircle } from 'lucide-react';
import { ApprovedVendorModal } from '@/components/admin/vendors/ApprovedVendorModal';
import { SuspendedVendorModal } from '@/components/admin/vendors/SuspendedVendorModal';
import { EditCommissionModal } from '@/components/admin/vendors/EditCommissionModal';
import { PendingVendorModal } from '@/components/admin/vendors/PendingVendorModal';
import { ConfirmSuspendModal } from '@/components/admin/vendors/ConfirmSuspendModal';
import { ConfirmApproveModal } from '@/components/admin/vendors/ConfirmApproveModal';
import { ConfirmRejectModal } from '@/components/admin/vendors/ConfirmRejectModal';
import { ConfirmReinstateModal } from '@/components/admin/vendors/ConfirmReinstateModal';

const VENDORS_DATA = [
  {
    id: 'V001',
    name: 'Afro Queen Cosmetics',
    email: 'chisom.okafor@afroqueen.com',
    phone: '+1 555-3001',
    category: 'Hair Extensions',
    categoryColor: 'text-purple-500',
    products: 24,
    orders: 187,
    revenue: '$8,450',
    rating: '4.7',
    commission: '12%',
    status: 'Approved',
    action: 'Suspend',
    joined: 'Oct 15, 2024',
    payout: '$1,014'
  },
  {
    id: 'V002',
    name: 'NaturalCurls Hub',
    email: 'adaeze.mensah@naturalcurls.com',
    phone: '+1 555-3002',
    category: 'Natural Hair Care',
    categoryColor: 'text-pink-500',
    products: 18,
    orders: 134,
    revenue: '$6,200',
    rating: '4.9',
    commission: '12%',
    status: 'Approved',
    action: 'Suspend',
    joined: 'Oct 16, 2024',
    payout: '$850'
  },
  {
    id: 'V003',
    name: 'KinkyCurly Boutique',
    email: 'oluwafemi.bello@kinkycurly.com',
    phone: '+1 555-3003',
    category: 'Styling Products',
    categoryColor: 'text-rose-500',
    products: 12,
    orders: 0,
    revenue: '$0',
    rating: '—',
    commission: '12%',
    status: 'Pending',
    action: 'Review',
    joined: 'Oct 17, 2024',
    payout: '$0'
  },
  {
    id: 'V004',
    name: 'BraidQueen Supply',
    email: 'efua.asante@braidqueen.com',
    phone: '+1 555-3004',
    category: 'Braiding Hair',
    categoryColor: 'text-violet-500',
    products: 31,
    orders: 0,
    revenue: '$11,840',
    rating: '4.8',
    commission: '10%',
    status: 'Approved',
    action: 'Suspend',
    joined: 'Oct 18, 2024',
    payout: '$2,100' // From screenshot
  },
  {
    id: 'V005',
    name: 'LocLove Essentials',
    email: 'nnamdi.ogu@loclove.com',
    phone: '+1 555-3005',
    category: 'Locs Care',
    categoryColor: 'text-rose-500',
    products: 8,
    orders: 247,
    revenue: '$0',
    rating: '—',
    commission: '12%',
    status: 'Pending',
    action: 'Review',
    joined: 'Oct 19, 2024',
    payout: '$0'
  },
  {
    id: 'V006',
    name: 'HairGlow Pro',
    email: 'yetunde.fashola@hairglow.com',
    phone: '+1 555-3006',
    category: 'Hair Care',
    categoryColor: 'text-purple-500',
    products: 15,
    orders: 89,
    revenue: '$3,200',
    rating: '3.2',
    commission: '12%',
    status: 'Suspended',
    action: 'Reinstate',
    joined: 'Oct 20, 2024',
    payout: '$450'
  }
];

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState('All Vendors');
  const [viewVendor, setViewVendor] = useState<typeof VENDORS_DATA[0] | null>(null);
  const [viewPendingVendor, setViewPendingVendor] = useState<typeof VENDORS_DATA[0] | null>(null);
  const [vendorToSuspend, setVendorToSuspend] = useState<typeof VENDORS_DATA[0] | null>(null);
  const [vendorToApprove, setVendorToApprove] = useState<typeof VENDORS_DATA[0] | null>(null);
  const [vendorToReject, setVendorToReject] = useState<typeof VENDORS_DATA[0] | null>(null);
  const [vendorToReinstate, setVendorToReinstate] = useState<typeof VENDORS_DATA[0] | null>(null);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white overflow-y-auto">
      
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">Vendor Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage marketplace vendors, approvals, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="cursor-pointer flex items-center gap-2 bg-[#F3F4F6] border border-gray-200 px-4 py-[10px] rounded-[6px] text-gray-600 text-[14px] font-medium hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="cursor-pointer flex items-center gap-[6px] bg-[#D95C30] border border-[#D95C30] px-4 py-[10px] rounded-[6px] text-white text-[14px] font-medium hover:bg-[#C24D25] transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-gray-500 font-bold tracking-wider uppercase">Total Vendors</p>
            <p className="text-[26px] font-bold text-[#4D145D] leading-none">6</p>
          </div>
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F0FF] flex items-center justify-center">
            <Store className="w-[18px] h-[18px] text-[#A855F7]" />
          </div>
        </div>
        
        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-gray-500 font-bold tracking-wider uppercase">Active Vendors</p>
            <p className="text-[26px] font-bold text-[#3BB515] leading-none">3</p>
          </div>
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F0FDF4] flex items-center justify-center">
            <CheckCircle2 className="w-[18px] h-[18px] text-[#3BB515]" />
          </div>
        </div>

        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-gray-500 font-bold tracking-wider uppercase">Pending Approval</p>
            <p className="text-[26px] font-bold text-[#D95C30] leading-none">2</p>
          </div>
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#FFF7ED] flex items-center justify-center">
            <Clock className="w-[18px] h-[18px] text-[#D95C30]" />
          </div>
        </div>

        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-gray-500 font-bold tracking-wider uppercase">Vendor Revenue</p>
            <p className="text-[26px] font-bold text-[#0EA5E9] leading-none">$24,490</p>
          </div>
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#F0F9FF] flex items-center justify-center">
            <Users className="w-[18px] h-[18px] text-[#0EA5E9]" />
          </div>
        </div>
      </div>

      {/* Alerts & Filtering */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Yellow Alert */}
        <div className="flex items-center justify-between bg-[#FFFBEB] border border-[#FEE685] rounded-[16px] p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-bold text-[#92400E]">4 Vendor Registrations Pending Approval</p>
              <p className="text-[13px] text-[#B45309] mt-0.5">KinkyCurly Boutique • LocLove Essentials awaiting review.</p>
            </div>
          </div>
          <button className="cursor-pointer bg-[#D95C30] text-white px-5 h-[36px] rounded-[8px] text-[13px] font-medium hover:bg-[#C24D25] transition-colors">
            Review Now
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white border border-[#F3F4F6] rounded-[10px] p-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] h-[46px]">
            {['All Vendors', 'Approved', 'Pending', 'Suspended'].map((tab) => {
              const counts = { 'All Vendors': 6, 'Approved': 3, 'Pending': 2, 'Suspended': 1 };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer flex items-center gap-2 px-4 h-[32px] rounded-[8px] text-[13px] font-medium transition-colors ${
                    isActive ? 'bg-[#4D145D] text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[11px] ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    {counts[tab as keyof typeof counts]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-[6px] h-[40px] bg-white border border-gray-200 rounded-lg px-[12px] w-[260px]">
              <Search className="w-[16px] h-[16px] text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search vendors..." 
                className="bg-transparent border-none outline-none text-[13px] font-normal text-[#1E1E1E] placeholder:text-gray-400 w-full"
              />
            </div>
            <button className="cursor-pointer flex items-center justify-center gap-2 px-4 h-[40px] border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Red Alert */}
        {['All Vendors', 'Approved'].includes(activeTab) && (
          <div className="flex items-start gap-3 bg-[#FEF2F2] border border-[#FFC9C9] rounded-[16px] p-4">
            <AlertCircle className="w-5 h-5 text-[#C10007] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-bold text-[#C10007]">High Refund Rate Alert — Seller Penalty Required</p>
              <p className="text-[13px] text-[#C10007] mt-0.5">HairGlow Pro (14.6% refund rate) — Vendor-fault returns detected. Return shipping liability applies.</p>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="border border-[#E4E6E7] rounded-[8px] overflow-hidden">
          <table className="w-full text-left border-collapse bg-[#FFFFF7]">
            <thead>
              <tr className="bg-[#4D145D] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Vendor</th>
                <th className="px-4 py-4 text-center">Category</th>
                <th className="px-4 py-4 text-center">Products</th>
                <th className="px-4 py-4 text-center">Orders</th>
                <th className="px-4 py-4 text-center">Revenue</th>
                <th className="px-4 py-4 text-center">Rating</th>
                <th className="px-4 py-4 text-center">Commission</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {VENDORS_DATA.filter((vendor) => activeTab === 'All Vendors' || vendor.status === activeTab).map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors border-b border-[#E4E6E7] last:border-b-0">
                  <td className="px-6 py-3 border-r border-[#E4E6E7]">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4D145D 0%, #7B2796 100%)' }}
                      >
                        <Store className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-900">{vendor.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{vendor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-[#E4E6E7]">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium text-[#8200DB] bg-[#FAF5FF] border border-[#E9D5FF]">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[13px] font-bold text-gray-900 border-r border-[#E4E6E7]">
                    {vendor.products}
                  </td>
                  <td className="px-4 py-3 text-center text-[13px] font-bold text-gray-900 border-r border-[#E4E6E7]">
                    {vendor.orders}
                  </td>
                  <td className="px-4 py-3 text-center text-[13px] font-bold text-gray-900 border-r border-[#E4E6E7]">
                    {vendor.revenue}
                  </td>
                  <td className="px-4 py-3 text-center text-[13px] font-medium text-gray-700 border-r border-[#E4E6E7]">
                    {vendor.rating !== '—' ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[#F59E0B]">★</span> {vendor.rating}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-[13px] font-medium text-gray-900 border-r border-[#E4E6E7]">
                    {vendor.commission}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-[#E4E6E7]">
                    <span className={`inline-flex px-2 py-[2px] rounded-full text-[12px] font-medium ${
                      vendor.status === 'Approved' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' :
                      vendor.status === 'Pending' ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]' :
                      'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        className="cursor-pointer transition-colors text-gray-400 hover:text-blue-500"
                        onClick={() => vendor.status === 'Pending' ? setViewPendingVendor(vendor) : setViewVendor(vendor)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {vendor.action === 'Review' ? (
                        <>
                          <button 
                            className="cursor-pointer bg-[#3BB515] text-white text-[11px] font-medium px-2 py-[2px] rounded-[50px] hover:bg-[#2F9E0F] transition-colors"
                            onClick={() => setVendorToApprove(vendor)}
                          >
                            Approve
                          </button>
                          <button 
                            className="cursor-pointer bg-[#FF332C] text-white text-[11px] font-medium px-2 py-[2px] rounded-[50px] hover:bg-[#DC2626] transition-colors"
                            onClick={() => setVendorToReject(vendor)}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          className={`cursor-pointer text-white text-[11px] font-medium px-2 py-[2px] rounded-[50px] transition-colors ${
                            vendor.action === 'Suspend' ? 'bg-[#FFC107] hover:bg-[#E0A800]' :
                            'bg-[#3BB515] hover:bg-[#2F9E0F]'
                          }`}
                          onClick={() => 
                            vendor.action === 'Suspend' ? setVendorToSuspend(vendor) : 
                            vendor.action === 'Reinstate' ? setVendorToReinstate(vendor) : null
                          }
                        >
                          {vendor.action}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 shrink-0">
        <span className="text-[13px] text-gray-400 font-medium">Showing 6 results</span>
        <div className="flex items-center gap-1">
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-[#4D145D] text-white text-[13px] font-bold">1</button>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">2</button>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">3</button>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">...</span>
          <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-[13px] font-medium transition-colors">10</button>
        </div>
      </div>

      {/* Vendor Profile Modal */}
      {viewVendor && !showCommissionModal && viewVendor.status !== 'Suspended' && (
        <ApprovedVendorModal 
          vendor={viewVendor} 
          onClose={() => setViewVendor(null)} 
          onEditCommission={() => setShowCommissionModal(true)} 
        />
      )}

      {/* Suspended Vendor Modal */}
      {viewVendor && !showCommissionModal && viewVendor.status === 'Suspended' && (
        <SuspendedVendorModal 
          vendor={viewVendor} 
          onClose={() => setViewVendor(null)} 
          onEditCommission={() => setShowCommissionModal(true)} 
        />
      )}

      {/* Edit Commission Modal */}
      {showCommissionModal && viewVendor && (
        <EditCommissionModal 
          vendor={viewVendor} 
          onClose={() => setShowCommissionModal(false)} 
          onSave={() => setShowCommissionModal(false)} 
        />
      )}

      {/* Confirm Suspend Modal */}
      {vendorToSuspend && (
        <ConfirmSuspendModal
          vendor={vendorToSuspend}
          onClose={() => setVendorToSuspend(null)}
          onConfirm={() => {
            // Add your confirm logic here
            setVendorToSuspend(null);
          }}
        />
      )}

      {/* Confirm Approve Modal */}
      {vendorToApprove && (
        <ConfirmApproveModal
          vendor={vendorToApprove}
          onClose={() => setVendorToApprove(null)}
          onConfirm={() => {
            // Add your confirm logic here
            setVendorToApprove(null);
          }}
        />
      )}

      {/* Confirm Reject Modal */}
      {vendorToReject && (
        <ConfirmRejectModal
          vendor={vendorToReject}
          onClose={() => setVendorToReject(null)}
          onConfirm={() => {
            // Add your confirm logic here
            setVendorToReject(null);
          }}
        />
      )}

      {/* Confirm Reinstate Modal */}
      {vendorToReinstate && (
        <ConfirmReinstateModal
          vendor={vendorToReinstate}
          onClose={() => setVendorToReinstate(null)}
          onConfirm={() => {
            // Add your confirm logic here
            setVendorToReinstate(null);
          }}
        />
      )}

      {/* Review Pending Vendor Modal */}
      {viewPendingVendor && (
        <PendingVendorModal 
          vendor={viewPendingVendor} 
          onClose={() => setViewPendingVendor(null)} 
          onApprove={() => setViewPendingVendor(null)} 
          onReject={() => setViewPendingVendor(null)} 
        />
      )}

    </div>
  );
}
