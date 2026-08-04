"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF] font-sans p-5 gap-5">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden gap-6">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
