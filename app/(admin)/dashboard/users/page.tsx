"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Filter, ChevronDown, Download, Eye, Trash2, Shield, MapPin, Check } from 'lucide-react';

const USERS_DATA = [
  {
    id: 1,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'New York, NY',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'Atlanta, GA',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'Houston, TX',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'Chicago, IL',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'Washington, DC',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Pending',
  },
  {
    id: 6,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'Los Angeles, CA',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Suspended',
  },
  {
    id: 7,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'Dallas, TX',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Amara Johnson',
    customerId: 'C001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    email: 'amara.j@email.com',
    phone: '+1 555-0142',
    location: 'Miami, FL',
    joined: 'Jan 12, 2024',
    bookings: 14,
    revenue: '$842.50',
    status: 'Active',
  },
];

export default function UsersPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewUser, setViewUser] = useState<typeof USERS_DATA[0] | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === USERS_DATA.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(USERS_DATA.map(u => u.id));
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
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white p-8 overflow-y-auto">
      
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">User Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage all platform users, stylists, and agents</p>
        </div>
        <button className="flex items-center gap-2 bg-[#F3F4F6] border border-gray-200 px-4 py-2 rounded-lg text-gray-600 text-[14px] font-medium hover:bg-gray-200 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Top Controls */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-white border border-[#F3F4F6] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[310px] h-[46px]">
            <button className="bg-[#4D145D] text-white w-[294px] h-[32px] rounded-[8px] text-[13px] font-medium flex items-center justify-center gap-[6px]">
              Customers <span className="bg-white/20 px-1.5 py-0.5 rounded-[4px] text-[11px]">24851</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[6px] h-[40px] bg-white border border-gray-200 rounded-lg px-[12px] w-[260px]">
            <Search className="w-[16px] h-[16px] text-gray-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="bg-transparent border-none outline-none text-[13px] font-normal text-[#1E1E1E] placeholder:text-gray-400 w-full"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-5 h-[40px] border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-lg px-5 py-2 pl-4 pr-10 text-[13px] font-medium text-gray-600 focus:outline-none h-[40px] cursor-pointer">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto hide-scrollbar pb-6">
        <div className="border border-[#EEF2FF] rounded-[12px] overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[1000px] bg-white">
            <thead>
              <tr className="bg-[#4D145D] text-white text-[11px] font-bold uppercase tracking-wider">
                {/* <th className="py-4 px-4 w-[61px] text-center">
                  <div 
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 mx-auto rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedIds.length === USERS_DATA.length 
                        ? 'bg-[#F27A54] border-[#F27A54]' 
                        : 'border-[#F27A54] bg-white'
                    }`}
                  >
                    {selectedIds.length === USERS_DATA.length && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </th> */}
                <th className="px-4 py-4 text-left font-bold">Customer</th>
                <th className="px-4 py-4 text-left font-bold">Contact</th>
                <th className="px-4 py-4 text-left font-bold">Location</th>
                <th className="px-4 py-4 text-center font-bold">Joined</th>
                <th className="px-4 py-4 text-center font-bold">Bookings</th>
                <th className="px-4 py-4 text-center font-bold">Spent</th>
                <th className="px-4 py-4 text-center font-bold">Status</th>
                <th className="px-4 py-4 text-center font-bold w-[179px]">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFFFF7]">
            {USERS_DATA.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                {/* <td className="py-3 px-4 text-center border-r border-b border-[#EEF2FF]">
                  <div 
                    onClick={() => toggleSelect(user.id)}
                    className={`w-4 h-4 mx-auto rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedIds.includes(user.id)
                        ? 'bg-[#F27A54] border-[#F27A54]'
                        : 'border-[#F27A54] bg-white'
                    }`}
                  >
                    {selectedIds.includes(user.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </td> */}
                <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                  <div className="flex items-center gap-3">
                    <Image src={user.avatar} alt={user.name} width={36} height={36} className="w-[36px] h-[36px] rounded-full object-cover shrink-0" />
                    <div>
                      <div className="text-[13px] font-bold text-gray-900">{user.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{user.customerId}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                  <div className="text-[13px] text-gray-900 font-medium">{user.email}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{user.phone}</div>
                </td>
                <td className="py-3 px-4 text-center text-[13px] text-gray-600 border-r border-b border-[#EEF2FF]">
                  <div className="flex items-center justify-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.location}
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-[13px] text-gray-600 border-r border-b border-[#EEF2FF]">
                  {user.joined}
                </td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-gray-900 border-r border-b border-[#EEF2FF]">
                  {user.bookings}
                </td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-gray-900 border-r border-b border-[#EEF2FF]">
                  {user.revenue}
                </td>
                <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                  <div className="flex items-center justify-center">
                    <span className={`px-2 py-[2px] rounded-full text-[12px] font-medium ${
                      user.status === 'Active' ? 'bg-[#3BB515] text-white' :
                      user.status === 'Pending' ? 'bg-[#D95C30] text-white' :
                      'bg-[#FF332C] text-white'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 border-r border-b border-[#EEF2FF]">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setViewUser(user)} className="text-blue-500 hover:text-blue-700 transition-colors">
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
      <div className="flex items-center justify-between pt-6 shrink-0 bg-white">
        <span className="text-[13px] text-gray-400 font-medium">Showing 8 results</span>
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

      {/* User Profile Modal */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setViewUser(null)}
        >
          <div
            className="bg-white rounded-[18px] w-[540px] max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col"
            style={{ padding: '0 24px 24px 24px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between py-[18px] shrink-0">
              <h2 className="text-[18px] font-bold text-[#1E1E1E]">User Profile</h2>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-700 transition-colors text-[22px] leading-none">&times;</button>
            </div>

            {/* Avatar & Name Card */}
            <div className="flex items-center gap-3 bg-[#F3F0FF] rounded-[12px] px-4 py-4 mb-4 shrink-0">
              <Image
                src={viewUser.avatar}
                alt={viewUser.name}
                width={48}
                height={48}
                className="w-[48px] h-[48px] rounded-full object-cover shrink-0"
              />
              <div className="flex flex-col gap-1">
                <p className="text-[16px] font-bold text-[#1E1E1E]">{viewUser.name}</p>
                <p className="text-[13px] text-gray-500">{viewUser.email}</p>
                <span className={`self-start px-3 py-[2px] rounded-full text-[12px] font-medium ${
                  viewUser.status === 'Active' ? 'bg-[#3BB515] text-white' :
                  viewUser.status === 'Pending' ? 'bg-[#D95C30] text-white' :
                  'bg-[#FF332C] text-white'
                }`}>{viewUser.status}</span>
              </div>
            </div>

            {/* Registration Details */}
            <div className="bg-[#F0F1F3] rounded-[14px] p-4 flex flex-col gap-3 mb-4">
              <p className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
                <span>📋</span> Registration Details (Submitted by User)
              </p>
              {[
                { label: 'Full Name', value: viewUser.name },
                { label: 'Email Address', value: viewUser.email },
                { label: 'Phone Number', value: viewUser.phone },
                { label: 'Address', value: viewUser.location },
                { label: 'Bank Account', value: 'Not required (customer)' },
                { label: 'Terms Agreed', value: `Yes — ${viewUser.joined.split(',')[1]?.trim() ?? viewUser.joined}` },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-[14px] font-normal text-[#000] mb-1">{field.label}</p>
                  <div className="bg-white rounded-[10px] border border-[#F3F4F6] px-[10px] py-[10px] flex items-center justify-between">
                    <span className="text-[14px] font-normal text-gray-700">{field.value}</span>
                    <Check className="w-4 h-4 text-[#00BC7D] shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#EAEAEA] rounded-[12px] flex flex-col" style={{ padding: '12px 12px 12px 14px' }}>
                <p className="text-[11px] text-gray-400 mb-1">Joined</p>
                <p className="text-[15px] font-bold text-gray-900">{viewUser.joined}</p>
              </div>
              <div className="bg-[#EAEAEA] rounded-[12px] flex flex-col" style={{ padding: '12px 12px 12px 14px' }}>
                <p className="text-[11px] text-gray-400 mb-1">Bookings</p>
                <p className="text-[15px] font-bold text-gray-900">{viewUser.bookings}</p>
              </div>
              <div className="bg-[#EAEAEA] rounded-[12px] flex flex-col" style={{ padding: '12px 12px 12px 14px' }}>
                <p className="text-[11px] text-gray-400 mb-1">Total Spent</p>
                <p className="text-[15px] font-bold text-gray-900">{viewUser.revenue}</p>
              </div>
              <div className="bg-[#EAEAEA] rounded-[12px] flex flex-col" style={{ padding: '12px 12px 12px 14px' }}>
                <p className="text-[11px] text-gray-400 mb-1">Status</p>
                <p className="text-[15px] font-bold text-gray-900 lowercase">{viewUser.status}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 h-[42px] rounded-[12px] bg-[#F59E0B] text-white text-[14px] font-medium hover:bg-[#D97706] transition-colors">
                Flag for Review
              </button>
              <button className="flex-1 h-[42px] rounded-[12px] bg-[#FF332C] text-white text-[14px] font-medium hover:bg-[#DC2626] transition-colors">
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
    </div>
  );
}
