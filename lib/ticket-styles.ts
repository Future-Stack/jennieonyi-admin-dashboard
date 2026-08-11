import { TicketPriority, TicketStatus } from "@/types/ticket";
import { Scissors, Store, User, Zap, LucideIcon } from "lucide-react";

export const priorityStyles: Record<TicketPriority, string> = {
  High: "bg-red-50 text-red-600 border-red-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  Low: "bg-blue-50 text-blue-600 border-blue-200",
};

export const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-amber-50 text-amber-700 border-amber-300",
  Closed: "bg-slate-100 text-slate-500 border-slate-300",
  "Under review": "bg-blue-50 text-blue-600 border-blue-300",
  Resolved: "bg-emerald-50 text-emerald-600 border-emerald-300",
};

export const categoryIcon: Record<string, LucideIcon> = {
  user: User,
  stylist: Scissors,
  vendor: Store,
  app: Zap,
};

export const categoryIconStyles: Record<string, string> = {
  user: "bg-blue-50 text-blue-500",
  stylist: "bg-purple-50 text-purple-500",
  vendor: "bg-orange-50 text-orange-500",
  app: "bg-red-50 text-red-500",
};
