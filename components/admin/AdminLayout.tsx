// "use client";

// import { ReactNode } from "react";
// import { AdminSidebar } from "./AdminSidebar";
// import { AdminHeader } from "./AdminHeader";

// interface AdminLayoutProps {
//   children: ReactNode;
// }

// export function AdminLayout({ children }: AdminLayoutProps) {
//   return (
//     <div className="flex h-screen overflow-hidden bg-[#FFF] font-sans p-5 gap-5">
//       <AdminSidebar />
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden gap-6">
//         <AdminHeader />
//         <main className="flex-1 overflow-y-auto no-scrollbar">
//           <div className="w-full h-full">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }


"use client";

import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF] font-sans p-0 md:p-5 gap-0 md:gap-5">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden gap-6">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-0">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}