// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Video,
//   Users,
//   Scissors,
//   Store,
//   CalendarDays,
//   ShoppingCart,
//   CreditCard,
//   Package,
//   UserRoundSearch,
//   ChartNoAxesColumnIncreasing,
//   Tag,
//   TriangleAlert,
//   LogOut,
// } from "lucide-react";
// import clsx from "clsx";

// const navItems = [
//   { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//   { name: "Video Verification", href: "/dashboard/video-verification", icon: Video, badge: "23" },
//   { name: "User Management", href: "/dashboard/users", icon: Users },
//   { name: "Stylist Management", href: "/dashboard/stylists", icon: Scissors },
//   { name: "Vendor Management", href: "/dashboard/vendors", icon: Store, badge: "2" },
//   { name: "Bookings Overview", href: "/dashboard/bookings", icon: CalendarDays },
//   { name: "Product Orders", href: "/dashboard/orders", icon: ShoppingCart },
//   { name: "Escrow & Payments", href: "/dashboard/payments", icon: CreditCard },
//   { name: "Product Category", href: "/dashboard/categories", icon: Package },
//   { name: "Street Agent", href: "/dashboard/agents", icon: UserRoundSearch },
//   { name: "Analytics & Reports", href: "/dashboard/analytics", icon: ChartNoAxesColumnIncreasing },
//   { name: "Coupon Management", href: "/dashboard/coupons", icon: Tag },
//   { name: "Support", href: "/dashboard/support", icon: TriangleAlert, badge: "4" },
// ];

// export function AdminSidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="flex flex-col w-[252px] flex-shrink-0 bg-[#F7F7F7] h-full rounded-[20px] items-start py-[30px] px-[15px] overflow-hidden hidden md:flex shadow-sm">
//       {/* Logo */}
//       <div className="w-full mb-[24px] shrink-0 flex justify-center">
//         <img src="/admin/logo.png" alt="PlaitAm" className="w-[159px] h-[56px] object-contain" />
//       </div>

//       {/* Navigation — scrolls internally if it overflows, doesn't force profile down */}
//       <nav className="flex flex-col w-full gap-[6px] overflow-y-auto">
//         {navItems.map((item) => {
//           const isActive =
//             item.href === "/dashboard"
//               ? pathname === item.href
//               : pathname === item.href || pathname.startsWith(`${item.href}/`);

//           return (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={clsx(
//                 "flex items-center justify-between w-full p-[10px] rounded-[12px] text-[16px] transition-all duration-200 group",
//                 isActive
//                   ? "bg-admin-primary text-white"
//                   : "text-[#1E1E1E] hover:bg-gray-100"
//               )}
//             >
//               <div className="flex items-center gap-[12px] flex-1 min-w-0">
//                 <item.icon
//                   className={clsx(
//                     "w-[20px] h-[20px] flex-shrink-0",
//                     isActive ? "text-white" : "text-[#1E1E1E]"
//                   )}
//                   strokeWidth={1.8}
//                 />
//                 <span className={clsx("whitespace-nowrap flex-1", isActive ? "font-semibold" : "font-normal")}>
//                   {item.name}
//                 </span>
//               </div>

//               {/* Badge (number) */}
//               {item.badge && (
//                 <span className="bg-[#F97316] text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-[5px] flex-shrink-0 ml-[8px]">
//                   {item.badge}
//                 </span>
//               )}

//               {/* Dot indicator */}
//               {(item as any).dot && !item.badge && (
//                 <span className="w-[8px] h-[8px] rounded-full bg-[#F97316] flex-shrink-0 ml-[8px]" />
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Profile — always pinned to the very bottom via mt-auto */}
//       <div className="w-full mt-auto pt-[20px] shrink-0">
//         <div className="flex items-center justify-between w-full p-[12px] bg-[#EAE8E8] rounded-[16px] cursor-pointer group">
//           <div className="flex items-center gap-[10px]">
//             <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-white flex-shrink-0">
//               <img
//                 src="/admin/profile.png"
//                 alt="Admin"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   (e.target as HTMLImageElement).src =
//                     "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=f1f5f9";
//                 }}
//               />
//             </div>
//             <div className="flex flex-col leading-tight min-w-0">
//               <p className="text-[14px] font-bold text-gray-900 truncate">Admin</p>
//               <p className="text-[12px] text-gray-500 truncate">admin@plaitam.com</p>
//             </div>
//           </div>
//           <LogOut className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-800 transition-colors flex-shrink-0" />
//         </div>
//       </div>
//     </aside>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Users,
  Scissors,
  Store,
  CalendarDays,
  ShoppingCart,
  CreditCard,
  Package,
  UserRoundSearch,
  ChartNoAxesColumnIncreasing,
  Tag,
  TriangleAlert,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Video Verification", href: "/dashboard/video-verification", icon: Video, badge: "23" },
  { name: "User Management", href: "/dashboard/users", icon: Users },
  { name: "Stylist Management", href: "/dashboard/stylists", icon: Scissors },
  { name: "Vendor Management", href: "/dashboard/vendors", icon: Store, badge: "2" },
  { name: "Bookings Overview", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Product Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Escrow & Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Product Category", href: "/dashboard/categories", icon: Package },
  { name: "Street Agent", href: "/dashboard/agents", icon: UserRoundSearch },
  { name: "Analytics & Reports", href: "/dashboard/analytics", icon: ChartNoAxesColumnIncreasing },
  { name: "Coupon Management", href: "/dashboard/coupons", icon: Tag },
  { name: "Support", href: "/dashboard/support", icon: TriangleAlert, badge: "4" },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "flex flex-col w-[252px] flex-shrink-0 bg-[#F7F7F7] h-full rounded-[20px] items-start py-[30px] px-[15px] overflow-hidden shadow-sm",
          // Mobile: fixed off-canvas drawer, toggled via translate-x
          "fixed top-0 left-0 z-50 h-screen rounded-none transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: original static layout, untouched
          "md:static md:z-auto md:h-full md:rounded-[20px] md:translate-x-0 md:flex"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden self-end mb-2 p-1 text-gray-500 hover:text-gray-800"
        >
          <X className="w-[22px] h-[22px]" />
        </button>

        {/* Logo */}
        <div className="w-full mb-[24px] shrink-0 flex justify-center">
          <img src="/admin/logo.png" alt="PlaitAm" className="w-[159px] h-[56px] object-contain" />
        </div>

        {/* Navigation — scrolls internally if it overflows, doesn't force profile down */}
        <nav className="flex flex-col w-full gap-[6px] overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center justify-between w-full p-[10px] rounded-[12px] text-[16px] transition-all duration-200 group",
                  isActive
                    ? "bg-admin-primary text-white"
                    : "text-[#1E1E1E] hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-[12px] flex-1 min-w-0">
                  <item.icon
                    className={clsx(
                      "w-[20px] h-[20px] flex-shrink-0",
                      isActive ? "text-white" : "text-[#1E1E1E]"
                    )}
                    strokeWidth={1.8}
                  />
                  <span className={clsx("whitespace-nowrap flex-1", isActive ? "font-semibold" : "font-normal")}>
                    {item.name}
                  </span>
                </div>

                {/* Badge (number) */}
                {item.badge && (
                  <span className="bg-[#F97316] text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-[5px] flex-shrink-0 ml-[8px]">
                    {item.badge}
                  </span>
                )}

                {/* Dot indicator */}
                {(item as any).dot && !item.badge && (
                  <span className="w-[8px] h-[8px] rounded-full bg-[#F97316] flex-shrink-0 ml-[8px]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile — always pinned to the very bottom via mt-auto */}
        <div className="w-full mt-auto pt-[20px] shrink-0">
          <div className="flex items-center justify-between w-full p-[12px] bg-[#EAE8E8] rounded-[16px] cursor-pointer group">
            <div className="flex items-center gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-white flex-shrink-0">
                <img
                  src="/admin/profile.png"
                  alt="Admin"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=f1f5f9";
                  }}
                />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <p className="text-[14px] font-bold text-gray-900 truncate">Admin</p>
                <p className="text-[12px] text-gray-500 truncate">admin@plaitam.com</p>
              </div>
            </div>
            <LogOut className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-800 transition-colors flex-shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}