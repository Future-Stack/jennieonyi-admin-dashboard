"use client";
import React, { useState } from 'react';
import { Download, RefreshCw, CreditCard, ShoppingCart, TrendingUp, Clock, Search, Eye, Package } from 'lucide-react';

// ─── Static Data ──────────────────────────────────────────────────────────────

const CHART_DATA = [
  { month: 'Jul', service: 26000, product: 14000 },
  { month: 'Aug', service: 25000, product: 11000 },
  { month: 'Sep', service: 20000, product: 14000 },
  { month: 'Oct', service: 14000, product: 9500 },
  { month: 'Nov', service: 14000, product: 5000 },
  { month: 'Dec', service: 14000, product: 11000 },
];

const SERVICE_TRANSACTIONS = [
  { id: 'TXN-7841', type: 'Escrow Hold', from: 'Amara Johnson', to: 'Kezia Okafor', booking: 'BK-2401', amount: '$18.00', fee: '$18.00', net: '$162.00', date: 'Dec 22, 2024', status: 'Held', statusAction: 'Release' },
  { id: 'TXN-7840', type: 'Payment Released', from: 'Amara Johnson', to: 'Yewande Bello', booking: 'BK-2398', amount: '$350.00', fee: '$35.00', net: '$315.00', date: 'Dec 22, 2024', status: 'Released', statusAction: null },
  { id: 'TXN-7839', type: 'Escrow Hold', from: 'Nkechi Obi', to: 'Yewande Bello', booking: 'BK-2402', amount: '$220.00', fee: '$22.00', net: '$198.00', date: 'Dec 21, 2024', status: 'Held', statusAction: 'Release' },
  { id: 'TXN-7838', type: 'Payment Released', from: 'Escrow', to: 'Amina Diallo', booking: 'BK-2403', amount: '$85.00', fee: '$8.50', net: '$76.50', date: 'Dec 21, 2024', status: 'Released', statusAction: null },
  { id: 'TXN-7837', type: 'Refund', from: 'Escrow', to: 'Chiamaka Eze', booking: 'BK-2406', amount: '$140.00', fee: '$0.00', net: '$140.00', date: 'Dec 21, 2024', status: 'Refunded', statusAction: null },
  { id: 'TXN-7836', type: 'Payout Request', from: 'Kezia Okafor', to: 'Bank Account', booking: 'N/A', amount: '$2,450.00', fee: '$0.00', net: '$2,450.00', date: 'Dec 21, 2024', status: 'Pending', statusAction: 'Process' },
];

const PRODUCT_TRANSACTIONS = [
  { id: 'VTX-4001', type: 'Product Escrow', from: 'Amara Johnson', to: 'Afro Queen Cosmetics', order: 'ORD-5001', amount: '$37.50', fee: '$4.50', net: '$33.00', date: 'Dec 23, 2024', status: 'Held', otpStatus: 'Awaiting', statusAction: 'Release' },
  { id: 'VTX-4002', type: 'Escrow Released', from: 'Escrow', to: 'BraidQueen Supply', order: 'ORD-5002', amount: '$44.00', fee: '$4.40', net: '$39.60', date: 'Dec 22, 2024', status: 'Released', otpStatus: 'Confirmed', statusAction: null },
  { id: 'VTX-4003', type: 'Product Escrow', from: 'Fatima Al-Hassan', to: 'NaturalCurls Hub', order: 'ORD-5003', amount: '$24.99', fee: '$3.00', net: '$21.99', date: 'Dec 21, 2024', status: 'Held', otpStatus: 'Not sent', statusAction: 'Release' },
  { id: 'VTX-4004', type: 'Escrow Released', from: 'Escrow', to: 'Afro Queen Cosmetics', order: 'ORD-5004', amount: '$75.96', fee: '$9.12', net: '$66.84', date: 'Dec 21, 2024', status: 'Released', otpStatus: 'Confirmed', statusAction: null },
  { id: 'VTX-4005', type: 'Product Escrow', from: 'Escrow', to: 'BraidQueen Supply', order: 'ORD-5005', amount: '$59.94', fee: '$7.19', net: '$52.75', date: 'Dec 21, 2024', status: 'Refunded', otpStatus: 'Not sent', statusAction: 'Release' },
  { id: 'VTX-4006', type: 'Refund', from: 'Escrow', to: 'Chiamaka Eze', order: 'ORD-5006', amount: '$29.99', fee: '$0.00', net: '$29.99', date: 'Dec 20, 2024', status: 'Pending', otpStatus: 'Cancelled', statusAction: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Held: 'bg-[#FFF3CD] text-[#B45309] border border-[#F59E0B]',
    Released: 'bg-[#DCFCE7] text-[#16A34A] border border-[#22C55E]',
    Refunded: 'bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444]',
    Pending: 'bg-[#FEF9C3] text-[#CA8A04] border border-[#EAB308]',
  };
  return (
    <span className={`px-2 py-[2px] rounded-full text-[12px] font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function OtpBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Awaiting: 'text-[#F59E0B]',
    Confirmed: 'text-[#16A34A]',
    'Not sent': 'text-gray-400',
    Cancelled: 'text-[#EF4444]',
  };
  return <span className={`text-[12px] font-medium ${colors[status] ?? 'text-gray-500'}`}>{status}</span>;
}

function ActionButton({ label }: { label: string }) {
  const colors: Record<string, string> = {
    Release: 'bg-[#4D145D] text-white hover:bg-[#3a0f47]',
    Process: 'bg-[#D95C30] text-white hover:bg-[#C24D25]',
  };
  return (
    <button className={`px-3 py-[3px] rounded-full text-[12px] font-bold transition-colors ${colors[label] ?? 'bg-gray-200 text-gray-700'}`}>
      {label}
    </button>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart() {
  const maxVal = 32000;
  const chartHeight = 200;
  const gridLevels = [0, 8000, 16000, 24000, 32000];

  return (
    <div className="relative w-full" style={{ height: `${chartHeight + 24}px` }}>
      {/* Horizontal grid lines — positioned from bottom */}
      {gridLevels.map((level) => {
        const bottomPct = (level / maxVal) * 100;
        return (
          <div
            key={level}
            className="absolute left-0 right-0 border-t border-[#E4E6E7]"
            style={{ bottom: `${(bottomPct / 100) * chartHeight + 24}px` }}
          />
        );
      })}

      {/* Bars row */}
      <div className="absolute bottom-[24px] left-0 right-0 flex items-end" style={{ height: `${chartHeight}px` }}>
        {CHART_DATA.map((d, i) => (
          <div key={i} className="flex items-end gap-[6px] justify-center flex-1" style={{ height: `${chartHeight}px` }}>
            <div
              className="bg-[#4D145D] rounded-t-[4px]"
              style={{ height: `${(d.service / maxVal) * chartHeight}px`, width: '76px' }}
            />
            <div
              className="bg-[#D95C30] rounded-t-[4px]"
              style={{ height: `${(d.product / maxVal) * chartHeight}px`, width: '76px' }}
            />
          </div>
        ))}
      </div>

      {/* Month labels row — at very bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex">
        {CHART_DATA.map((d, i) => (
          <span key={i} className="text-[11px] text-gray-400 text-center flex-1">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'service' | 'product'>('service');

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white p-8 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">Escrow & Payments Monitor</h1>
          <p className="text-[14px] text-gray-500 mt-1">Track all escrow transactions across service bookings and product orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#F3F4F6] border border-gray-200 px-4 py-[10px] rounded-[6px] text-gray-600 text-[14px] font-medium hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-[6px] bg-[#D95C30] border border-[#D95C30] px-4 py-[10px] rounded-[6px] text-white text-[14px] font-medium hover:bg-[#C24D25] transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { title: 'Service Escrow Held', value: '$7,820', sub: '28 bookings', subColor: 'text-[#4D145D]', icon: CreditCard, iconColor: 'text-[#7C3AED]', iconBg: 'bg-[#F3F0FF]' },
          { title: 'Product Escrow Held', value: '$5,020', sub: '12 orders', subColor: 'text-[#0EA5E9]', icon: ShoppingCart, iconColor: 'text-[#0EA5E9]', iconBg: 'bg-[#F0F9FF]' },
          { title: 'Released This Month', value: '$38,200', sub: '+17.3% vs last', subColor: 'text-[#10B981]', icon: TrendingUp, iconColor: 'text-[#10B981]', iconBg: 'bg-[#F0FDF4]' },
          { title: 'Pending Payouts', value: '$8,750', sub: '12 requests', subColor: 'text-[#F59E0B]', icon: Clock, iconColor: 'text-[#F59E0B]', iconBg: 'bg-[#FFF7ED]' },
        ].map((card, i) => (
          <div key={i} className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-gray-500 font-medium">{card.title}</p>
              <p className="text-[26px] font-bold text-gray-900 leading-none">{card.value}</p>
              <p className={`text-[12px] font-semibold ${card.subColor}`}>{card.sub}</p>
            </div>
            <div className={`w-[36px] h-[36px] rounded-[8px] ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
              <card.icon className={`w-[18px] h-[18px] ${card.iconColor}`} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-[#FFFFF7] border border-[#E4E6E7] rounded-[8px] p-[20px] mb-6">
        <div className="mb-4">
          <h2 className="text-[16px] font-bold text-gray-900">Platform Commission (Dec 2024)</h2>
          <p className="text-[12px] text-gray-400">Service bookings vs vendor product sales</p>
        </div>

        {/* Y-axis labels + chart */}
        <div className="flex gap-3">
          <div className="flex flex-col-reverse justify-between text-[11px] text-gray-400 text-right" style={{ height: '224px' }}>
            <span>$0k</span>
            <span>$8k</span>
            <span>$16k</span>
            <span>$24k</span>
            <span>$32k</span>
          </div>
          <div className="flex-1">
            <BarChart />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#4D145D]" />
            <span className="text-[12px] text-gray-500">Service Escrow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#D95C30]" />
            <span className="text-[12px] text-gray-500">Product Escrow</span>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center bg-white border border-[#F3F4F6] rounded-[10px] p-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] h-[46px]">
          <button
            onClick={() => setActiveTab('service')}
            className={`flex items-center gap-2 px-4 h-[32px] rounded-[8px] text-[13px] font-medium transition-colors ${activeTab === 'service' ? 'bg-[#4D145D] text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Service Escrow
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-4 h-[32px] rounded-[8px] text-[13px] font-medium transition-colors ${activeTab === 'product' ? 'bg-[#4D145D] text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Package className="w-3.5 h-3.5" />
            Product Escrow
          </button>
        </div>
        <div className="flex items-center gap-[6px] h-[40px] bg-white border border-gray-200 rounded-lg px-[12px] w-[260px]">
          <Search className="w-[16px] h-[16px] text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="bg-transparent border-none outline-none text-[13px] font-normal text-[#1E1E1E] placeholder:text-gray-400 w-full"
          />
        </div>
      </div>

      {/* OTP Banner (product only) */}
      {activeTab === 'product' && (
        <div className="flex items-center gap-3 bg-[#F3F0FF] border border-[#DDD6FE] rounded-[10px] px-4 py-3 mb-4">
          <span className="text-[18px]">🔐</span>
          <p className="text-[13px] text-[#4D145D]">
            <span className="font-bold">OTP-Gated Escrow:</span> Product payments are held until the customer confirms delivery via OTP. Admin can manually confirm delivery if needed.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="border border-[#E4E6E7] rounded-[8px] overflow-hidden">
          {activeTab === 'service' ? (
            <table className="w-full text-left border-collapse bg-[#FFFFF7]">
              <thead>
                <tr className="bg-[#4D145D] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-4">TXN ID</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">From</th>
                  <th className="px-4 py-4">To</th>
                  <th className="px-4 py-4 text-center">Booking</th>
                  <th className="px-4 py-4 text-center">Amount</th>
                  <th className="px-4 py-4 text-center">Fee</th>
                  <th className="px-4 py-4 text-center">Net</th>
                  <th className="px-4 py-4 text-center">Date</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center w-[120px]"></th>
                </tr>
              </thead>
              <tbody className="bg-[#FFFFF7]">
                {SERVICE_TRANSACTIONS.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-r border-b border-[#E4E6E7]">
                      <span className="text-[13px] font-bold text-[#D95C30]">{txn.id}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 border-r border-b border-[#E4E6E7]">{txn.type}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 border-r border-b border-[#E4E6E7]">{txn.from}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 border-r border-b border-[#E4E6E7]">{txn.to}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-gray-600 border-r border-b border-[#E4E6E7]">{txn.booking}</td>
                    <td className="px-4 py-3 text-center text-[13px] font-bold text-gray-900 border-r border-b border-[#E4E6E7]">{txn.amount}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-[#D95C30] font-medium border-r border-b border-[#E4E6E7]">{txn.fee}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-[#10B981] font-bold border-r border-b border-[#E4E6E7]">{txn.net}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-gray-500 border-r border-b border-[#E4E6E7]">{txn.date}</td>
                    <td className="px-4 py-3 text-center border-r border-b border-[#E4E6E7]">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-4 py-3 border-b border-[#E4E6E7]">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {txn.statusAction && <ActionButton label={txn.statusAction} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse bg-[#FFFFF7]">
              <thead>
                <tr className="bg-[#4D145D] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-4">TXN ID</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">From</th>
                  <th className="px-4 py-4">To</th>
                  <th className="px-4 py-4 text-center">Order</th>
                  <th className="px-4 py-4 text-center">Amount</th>
                  <th className="px-4 py-4 text-center">Fee</th>
                  <th className="px-4 py-4 text-center">Net</th>
                  <th className="px-4 py-4 text-center">Date</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">OTP Status</th>
                  <th className="px-4 py-4 text-center w-[120px]"></th>
                </tr>
              </thead>
              <tbody className="bg-[#FFFFF7]">
                {PRODUCT_TRANSACTIONS.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-r border-b border-[#E4E6E7]">
                      <span className="text-[13px] font-bold text-[#D95C30]">{txn.id}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 border-r border-b border-[#E4E6E7]">{txn.type}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 border-r border-b border-[#E4E6E7]">{txn.from}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-700 border-r border-b border-[#E4E6E7]">{txn.to}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-gray-600 border-r border-b border-[#E4E6E7]">{txn.order}</td>
                    <td className="px-4 py-3 text-center text-[13px] font-bold text-gray-900 border-r border-b border-[#E4E6E7]">{txn.amount}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-[#D95C30] font-medium border-r border-b border-[#E4E6E7]">{txn.fee}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-[#10B981] font-bold border-r border-b border-[#E4E6E7]">{txn.net}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-gray-500 border-r border-b border-[#E4E6E7]">{txn.date}</td>
                    <td className="px-4 py-3 text-center border-r border-b border-[#E4E6E7]">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-4 py-3 text-center border-r border-b border-[#E4E6E7]">
                      <OtpBadge status={txn.otpStatus} />
                    </td>
                    <td className="px-4 py-3 border-b border-[#E4E6E7]">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {txn.statusAction && <ActionButton label={txn.statusAction} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
