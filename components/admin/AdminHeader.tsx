// "use client";

// import { Search, Bell } from "lucide-react";
// import Image from "next/image";
// import { usePathname } from "next/navigation";

// export function AdminHeader() {
//   const pathname = usePathname();

//   const generateTitle = () => {
//     if (pathname === "/dashboard") return "Dashboard";
//     const segment = pathname.split("/").pop();
//     if (!segment) return "Dashboard";
//     return segment
//       .split("-")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };

//   return (
//     <header className="h-[90px] bg-admin-primary flex-shrink-0 flex items-center justify-between px-[28px] text-white rounded-[20px] z-10 sticky top-0">
//       {/* Left: PlaitAm Admin → Dashboard */}
//       <div className="flex items-center gap-[10px]">
//         <span className="text-[26px] font-medium text-white/80 leading-none whitespace-nowrap">
//           PlaitAm Admin
//         </span>

//         {/* Figma arrow icon: 42×42, color #D95C30 */}
//         <svg
//           width="42"
//           height="42"
//           viewBox="0 0 42 42"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//           className="flex-shrink-0"
//         >
//           <path
//             d="M15.75 31.5L26.25 21L15.75 10.5"
//             stroke="#D95C30"
//             strokeWidth="2.5"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>

//         <span className="text-[26px] font-bold text-white leading-none whitespace-nowrap">
//           {generateTitle()}
//         </span>
//       </div>

//       {/* Right: Search + Bell + Profile */}
//       <div className="flex items-center gap-[12px]">
//         {/* Search bar — Figma: 329×52, padding:14px, bg: rgba(113,67,125,0.6), radius:10px */}
//         <div className="flex items-center w-[329px] h-[52px] px-[14px] rounded-[10px] bg-[rgba(113,67,125,0.6)] gap-[8px]">
//           <Search className="w-[16px] h-[16px] text-white/60 flex-shrink-0" />
//           <input
//             type="text"
//             placeholder="Search"
//             className="w-full bg-transparent text-white text-[14px] placeholder-white/50 focus:outline-none"
//           />
//         </div>

//         {/* Bell */}
//         <button className="relative w-[52px] h-[52px] flex items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.2)] transition-colors flex-shrink-0">
//           <Bell className="w-[20px] h-[20px] text-white" />
//           <span className="absolute top-[11px] right-[12px] w-[8px] h-[8px] rounded-full bg-[#F97316] border-2 border-admin-primary" />
//         </button>

//         {/* Profile — Figma: Frame 36, display:flex, align-items:center, gap:26px, padding:22px */}
//         <div className="flex items-center gap-[10px] h-[52px] px-[14px] rounded-[10px] bg-[rgba(255,255,255,0.12)] cursor-pointer hover:bg-[rgba(255,255,255,0.2)] transition-colors flex-shrink-0">
//           <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0 bg-white/20 relative">
//             <Image
//               src="/admin/profile.png"
//               alt="Admin"
//               fill
//               className="object-cover"
//               onError={(e) => {
//                 const target = e.target as HTMLImageElement;
//                 if (target.src !== "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b19cd9") {
//                   target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b19cd9";
//                   target.srcset = "";
//                 }
//               }}
//             />
//           </div>
//           <div className="flex flex-col leading-tight">
//             <span className="text-[13px] font-semibold text-white whitespace-nowrap">Admin</span>
//             <span className="text-[11px] text-white/60 whitespace-nowrap">admin@plaitam.com</span>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }


"use client";

import { Search, Bell, Menu } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  const generateTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    const segment = pathname.split("/").pop();
    if (!segment) return "Dashboard";
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="h-[70px] md:h-[90px] bg-admin-primary flex-shrink-0 flex items-center justify-between px-[16px] md:px-[28px] text-white md:rounded-[20px] z-10 sticky top-0">
      {/* Left: Hamburger (mobile) + PlaitAm Admin → Dashboard */}
      <div className="flex items-center gap-[10px] min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex-shrink-0 p-1 text-white"
        >
          <Menu className="w-[24px] h-[24px]" />
        </button>

        <span className="hidden md:inline text-[26px] font-medium text-white/80 leading-none whitespace-nowrap">
          PlaitAm Admin
        </span>

        {/* Figma arrow icon: 42×42, color #D95C30 */}
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden md:block flex-shrink-0"
        >
          <path
            d="M15.75 31.5L26.25 21L15.75 10.5"
            stroke="#D95C30"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="text-[18px] md:text-[26px] font-bold text-white leading-none whitespace-nowrap truncate">
          {generateTitle()}
        </span>
      </div>

      {/* Right: Search + Bell + Profile */}
      <div className="flex items-center gap-[8px] md:gap-[12px]">
        {/* Search bar — hidden on mobile, unchanged on desktop */}
        <div className="hidden md:flex items-center w-[329px] h-[52px] px-[14px] rounded-[10px] bg-[rgba(113,67,125,0.6)] gap-[8px]">
          <Search className="w-[16px] h-[16px] text-white/60 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent text-white text-[14px] placeholder-white/50 focus:outline-none"
          />
        </div>

        {/* Search icon — mobile only */}
        <button className="md:hidden flex items-center justify-center w-[40px] h-[40px] rounded-[10px] bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.2)] transition-colors flex-shrink-0">
          <Search className="w-[18px] h-[18px] text-white" />
        </button>

        {/* Bell */}
        <button className="relative w-[40px] h-[40px] md:w-[52px] md:h-[52px] flex items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.2)] transition-colors flex-shrink-0">
          <Bell className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-white" />
          <span className="absolute top-[9px] right-[10px] md:top-[11px] md:right-[12px] w-[8px] h-[8px] rounded-full bg-[#F97316] border-2 border-admin-primary" />
        </button>

        {/* Profile — Figma: Frame 36, display:flex, align-items:center, gap:26px, padding:22px */}
        <div className="flex items-center gap-[10px] h-[40px] md:h-[52px] px-[8px] md:px-[14px] rounded-[10px] bg-[rgba(255,255,255,0.12)] cursor-pointer hover:bg-[rgba(255,255,255,0.2)] transition-colors flex-shrink-0">
          <div className="w-[28px] h-[28px] md:w-[34px] md:h-[34px] rounded-full overflow-hidden flex-shrink-0 bg-white/20 relative">
            <Image
              src="/admin/profile.png"
              alt="Admin"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b19cd9") {
                  target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b19cd9";
                  target.srcset = "";
                }
              }}
            />
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-white whitespace-nowrap">Admin</span>
            <span className="text-[11px] text-white/60 whitespace-nowrap">admin@plaitam.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}