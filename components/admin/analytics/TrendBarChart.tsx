"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function TrendBarChart({ data, chartName }: { data: any[]; chartName: string; }) {
    return(
        <div className="col-span-2 rounded-[16px] shadow border border-[#F3F4F6] p-[20px] flex flex-col h-[303px]">
                <div className="mb-[20px] shrink-0">
                  <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{chartName}</h3>
                  <p className="text-[13px] text-[#8390A2] mt-[4px]">Daily {chartName} trend</p>
                </div>
                
                {/* Recharts Bar Chart */}
                <div className="flex-1 w-full min-h-0 -ml-[15px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 15, right: 0, left: 0, bottom: 0 }} barGap={8}>
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
    )
}