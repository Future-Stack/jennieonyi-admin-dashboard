"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const revenueData = [
  { name: "Jan", dark: 16000, orange: 3200 },
  { name: "Feb", dark: 12800, orange: 6400 },
  { name: "Mar", dark: 19200, orange: 9600 },
  { name: "Apr", dark: 16000, orange: 12800 },
  { name: "May", dark: 12800, orange: 16000 },
  { name: "Jun", dark: 14400, orange: 14400 },
  { name: "Jul", dark: 16000, orange: 16000 },
  { name: "Aug", dark: 17600, orange: 19200 },
  { name: "Sep", dark: 20800, orange: 20800 },
  { name: "Oct", dark: 19200, orange: 17600 },
  { name: "Nov", dark: 24000, orange: 19200 },
  { name: "Dec", dark: 22400, orange: 20800 },
];

const bookingsData = [
  { day: "Mon", dark: 66, orange: 22 },
  { day: "Tue", dark: 121, orange: 33 },
  { day: "Wed", dark: 99, orange: 26 },
  { day: "Thu", dark: 143, orange: 44 },
  { day: "Fri", dark: 110, orange: 33 },
  { day: "Sat", dark: 176, orange: 55 },
  { day: "Sun", dark: 154, orange: 48 },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-5 gap-[24px] mb-[24px]">
      {/* Revenue Overview - 3/5 width */}
      <div className="col-span-3 bg-[#FFFFF7] rounded-[16px] shadow border border-[#F3F4F6] p-[20px] flex flex-col h-[303px]">
        <div className="flex justify-between items-start mb-[20px] shrink-0">
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 leading-tight">Revenue Overview</h3>
            <p className="text-[13px] text-[#8390A2] mt-[4px]">Service + Marketplace revenue · 2024</p>
          </div>
          <button className="flex items-center gap-[4px] px-[12px] py-[6px] border border-gray-200 rounded-[8px] text-[13px] font-medium text-gray-700 bg-white shadow-sm">
            24 <span className="text-[10px]">▼</span>
          </button>
        </div>
        
        {/* Recharts Area/Line Chart */}
        <div className="flex-1 w-full min-h-0 -ml-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="5 5" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8390A2', fontSize: 11 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8390A2', fontSize: 11 }}
                tickFormatter={(value) => `$${value / 1000}k`}
                ticks={[0, 8000, 16000, 24000, 32000]}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#8390A2', fontSize: '12px', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="orange" 
                stroke="#F97316" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorOrange)" 
                activeDot={{ r: 6, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="dark" 
                stroke="#4D145D" 
                strokeWidth={2}
                fill="none" 
                activeDot={{ r: 6, fill: "#4D145D", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings This Week - 2/5 width */}
      <div className="col-span-2 bg-[#FFFFF7] rounded-[16px] shadow border border-[#F3F4F6] p-[20px] flex flex-col h-[303px]">
        <div className="mb-[20px] shrink-0">
          <h3 className="text-[18px] font-bold text-gray-900 leading-tight">Bookings This Week</h3>
          <p className="text-[13px] text-[#8390A2] mt-[4px]">Daily bookings trend</p>
        </div>
        
        {/* Recharts Bar Chart */}
        <div className="flex-1 w-full min-h-0 -ml-[15px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookingsData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }} barGap={8}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="5 5" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8390A2', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8390A2', fontSize: 11 }}
                ticks={[0, 55, 110, 165, 220]}
                dx={-5}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#8390A2', fontSize: '12px', marginBottom: '4px' }}
              />
              <Bar dataKey="dark" name="Bookings" fill="#4D145D" radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="orange" name="Inquiries" fill="#D95C30" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
