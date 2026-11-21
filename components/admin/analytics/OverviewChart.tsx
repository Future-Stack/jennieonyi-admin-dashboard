"use client"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { formatCount, formatNaira } from "@/lib/admin/dashboard";

interface OverviewChartProps {
    data: Array<{ name: string; value: number }>;
    chartName: string;
    strokeColor?: string;
    fillColor?: string;
    valueType: "currency" | "count";
}

export default function OverviewChart({ 
    data, 
    chartName, 
    strokeColor = "#4D145D", 
    fillColor, 
    valueType,
}: OverviewChartProps) {
    const baseColor = strokeColor || fillColor || "#4D145D";
    const gradientId = `overviewGradient-${chartName.replace(/\s+/g, '')}`;

    return (
        <div className="col-span-3 rounded-[16px] shadow border border-[#F3F4F6] p-5 flex flex-col h-80">
            <div className="flex justify-between items-start mb-5 shrink-0">
                <div>
                    <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{chartName} Overview</h3>
                    <p className="text-[13px] text-[#8390A2] mt-1">Monthly {chartName.toLowerCase()} performance</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-sm text-gray-500" role="status">
                    No {chartName.toLowerCase()} data is available for this period.
                </div>
            ) : <div className="flex-1 w-full min-h-0 -ml-2.5">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={baseColor} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={baseColor} stopOpacity={0.0} />
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
                            tickFormatter={(value: number) => valueType === "currency"
                              ? value === 0 ? "₦0" : `₦${Math.round(value / 1000)}k`
                              : formatCount(value)}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#8390A2', fontSize: '12px', marginBottom: '4px' }}
                            formatter={(value) => [
                              valueType === "currency" ? formatNaira(Number(value)) : formatCount(Number(value)),
                              chartName,
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={baseColor}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                            activeDot={{ r: 6, fill: baseColor, stroke: "#fff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>}
        </div>
    );
}