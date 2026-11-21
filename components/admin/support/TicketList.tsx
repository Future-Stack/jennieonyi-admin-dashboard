"use client";

import { Briefcase, Scissors, ShoppingBag, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { StatusPill } from "@/components/admin/common/kit";
import { titleCase } from "@/lib/admin/format";
import type { Ticket } from "@/lib/admin/resources";

const AUDIENCE: Record<string, { label: string; icon: ReactNode; tint: string }> = {
  CUSTOMER: { label: "Customer Support", icon: <UserRound className="h-4 w-4" aria-hidden />, tint: "bg-[#EEF2FF] text-[#4F46E5]" },
  STYLIST: { label: "Stylist Support", icon: <Scissors className="h-4 w-4" aria-hidden />, tint: "bg-[#F5F3FF] text-[#7C3AED]" },
  VENDOR: { label: "Vendor Support", icon: <ShoppingBag className="h-4 w-4" aria-hidden />, tint: "bg-[#FFF1F2] text-[#E11D48]" },
  STREET_AGENT: { label: "Agent Support", icon: <Briefcase className="h-4 w-4" aria-hidden />, tint: "bg-[#ECFDF5] text-[#059669]" },
};
export const audienceMeta = (audience: string) => AUDIENCE[audience] ?? { label: titleCase(audience), icon: <UserRound className="h-4 w-4" aria-hidden />, tint: "bg-gray-100 text-gray-600" };
/** The API's PENDING state is shown as "Open" in the admin Figma. */
export const statusLabel = (status: string) => (status === "PENDING" ? "Open" : titleCase(status));

export function TicketList({ tickets, selectedId, onSelect, loading, error, onRetry }: { tickets: Ticket[]; selectedId: string | null; onSelect: (id: string) => void; loading: boolean; error: string | null; onRetry: () => void }) {
  if (loading) return <div className="space-y-3 p-4" aria-label="Loading tickets">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}</div>;
  if (error) return <div className="p-6 text-center"><p role="alert" className="text-[14px] font-medium text-red-700">{error}</p><button type="button" onClick={onRetry} className="mt-3 cursor-pointer rounded-md border border-red-200 px-3 py-1.5 text-[13px] text-red-700 hover:bg-red-50">Try again</button></div>;
  if (tickets.length === 0) return <div className="p-8 text-center"><p className="text-[14px] font-medium text-gray-800">No tickets match these filters</p><p className="mt-1 text-[13px] text-gray-500">New support requests appear here as users submit them.</p></div>;
  return (
    <ul className="divide-y divide-gray-100">
      {tickets.map((ticket) => {
        const audience = audienceMeta(ticket.audience);
        const active = ticket.id === selectedId;
        return (
          <li key={ticket.id}>
            <button type="button" aria-current={active ? "true" : undefined} onClick={() => onSelect(ticket.id)} className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4D145D] ${active ? "bg-[#F6EEFB]" : "hover:bg-gray-50"}`}>
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${audience.tint}`}>{audience.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2"><span className="text-[11px] font-bold text-[#4D145D]">{ticket.ticketNumber}</span><StatusPill status={ticket.priority} /></span>
                <span className="mt-0.5 block truncate text-[13px] font-semibold text-gray-900">{ticket.subject}</span>
                <span className="block truncate text-[12px] text-gray-500">{ticket.userName ?? audience.label}</span>
                <span className="mt-1.5 flex items-center justify-between"><StatusPill status={ticket.status} label={statusLabel(ticket.status)} /><span className="text-[11px] text-gray-400">{ticket.replyCount} {ticket.replyCount === 1 ? "reply" : "replies"}</span></span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
