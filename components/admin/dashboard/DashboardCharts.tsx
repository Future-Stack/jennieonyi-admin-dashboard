"use client";

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
        
        {/* Chart Placeholder (SVG Line Chart) */}
        <div className="flex-1 w-full flex flex-col min-h-0">
          <div className="flex-1 relative w-full mb-[12px]">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] text-[#8390A2] py-[5px] w-[30px]">
              <span>$32k</span>
              <span>$24k</span>
              <span>$16k</span>
              <span>$8k</span>
              <span>$0k</span>
            </div>
            
            {/* Graph area */}
            <div className="ml-[35px] h-full relative">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-[10px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full border-b border-gray-200 border-dashed" />
                ))}
              </div>
              
              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 0 50 Q 15 40 30 60 T 60 40 T 100 70" fill="none" stroke="#4D145D" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d="M 0 90 Q 20 80 40 85 T 80 50 T 100 65" fill="none" stroke="#F97316" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {/* Subtle gradient fill for orange line */}
                <path d="M 0 90 Q 20 80 40 85 T 80 50 T 100 65 L 100 100 L 0 100 Z" fill="url(#orange-grad)" opacity="0.1" />
                <defs>
                  <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="w-full flex justify-between text-[11px] text-[#8390A2] pl-[35px]">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>
      </div>

      {/* Bookings This Week - 2/5 width */}
      <div className="col-span-2 bg-[#FFFFF7] rounded-[16px] shadow border border-[#F3F4F6] p-[20px] flex flex-col h-[303px]">
        <div className="mb-[20px] shrink-0">
          <h3 className="text-[18px] font-bold text-gray-900 leading-tight">Bookings This Week</h3>
          <p className="text-[13px] text-[#8390A2] mt-[4px]">Daily bookings trend</p>
        </div>
        
        {/* Custom Bar Chart to match Figma precisely */}
        <div className="flex-1 w-full relative min-h-0">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] text-[#8390A2] w-[25px] py-[10px]">
            <span>220</span>
            <span>165</span>
            <span>110</span>
            <span>55</span>
            <span>0</span>
          </div>
          
          {/* Graph area */}
          <div className="ml-[30px] h-full relative flex items-end justify-between px-[5px]">
            {/* Horizontal dashed lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-[15px] pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-b border-gray-200 border-dashed" />
              ))}
            </div>
            
            {/* Bars */}
            {[
              { day: "Mon", dark: 30, orange: 10 },
              { day: "Tue", dark: 55, orange: 15 },
              { day: "Wed", dark: 45, orange: 12 },
              { day: "Thu", dark: 65, orange: 20 },
              { day: "Fri", dark: 50, orange: 15 },
              { day: "Sat", dark: 80, orange: 25 },
              { day: "Sun", dark: 70, orange: 22 },
            ].map((data, i) => (
              <div key={i} className="flex flex-col items-center gap-[10px] h-full relative z-10 w-[64px]">
                <div className="flex-1 flex items-end justify-center w-full gap-[8px]">
                  <div className="w-[28px] bg-[#4D145D] rounded-t-[4px] transition-all hover:opacity-90" style={{ height: `${data.dark}%` }} />
                  <div className="w-[28px] bg-[#D95C30] rounded-t-[4px] transition-all hover:opacity-90" style={{ height: `${data.orange}%` }} />
                </div>
                <span className="text-[11px] text-[#8390A2] font-medium">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
