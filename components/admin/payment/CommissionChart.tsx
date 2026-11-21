"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNaira } from "@/lib/admin/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const compact = new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 });

export function CommissionChart({ months, total, loading, error }: { months: { month: string; serviceCommission: number; productCommission: number }[] | undefined; total: number | undefined; loading: boolean; error: string | null }) {
  const data = (months ?? []).map((entry) => ({ name: MONTHS[Number(entry.month.slice(5, 7)) - 1] ?? entry.month, Service: entry.serviceCommission, Product: entry.productCommission }));
  const year = months?.[0]?.month.slice(0, 4);
  return (
    <section aria-label="Platform commission chart" className="mb-6 rounded-[16px] border border-[#F3F4F6] bg-[#FFFFF7] p-5 shadow">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="text-[18px] font-bold text-gray-900">Platform Commission{year ? ` (${year})` : ""}</h2><p className="mt-1 text-[13px] text-[#8390A2]">Service bookings vs vendor product sales</p></div>
        {total !== undefined ? <p className="text-[13px] text-gray-500">Total earned: <span className="font-bold text-[#4D145D]">{formatNaira(total)}</span></p> : null}
      </div>
      <div className="h-[260px] w-full">
        {loading ? <div className="h-full animate-pulse rounded-lg bg-gray-100" aria-label="Loading commission chart" />
          : error ? <p role="alert" className="py-16 text-center text-[14px] text-red-700">{error}</p>
          : total === 0 ? <p className="py-16 text-center text-[14px] text-gray-500">No commission has been earned in this period yet.</p>
          : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barGap={6}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="5 5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8390A2", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8390A2", fontSize: 11 }} tickFormatter={(value: number) => `₦${compact.format(value)}`} width={64} />
                <Tooltip cursor={{ fill: "rgba(77,20,93,0.05)" }} formatter={(value) => formatNaira(Number(value))} contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Service" fill="#4D145D" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Product" fill="#D95C30" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
      </div>
    </section>
  );
}
