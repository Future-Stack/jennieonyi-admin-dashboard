"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket, TicketStatus } from "@/types/ticket";
import { categoryIcon, categoryIconStyles, priorityStyles } from "@/lib/ticket-styles";
import { cn } from "@/lib/utils";

interface TicketListProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}

const FILTERS: (TicketStatus | "All")[] = [
  "All",
  "Open",
  "Under review",
  "Resolved",
  "Closed",
];

export function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: TicketListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">(
    "All"
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query) ||
        ticket.requesterName.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, statusFilter]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Search + filter */}
      <div className="flex items-center gap-2 border-b p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="rounded-full pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as TicketStatus | "All")
          }
        >
          <SelectTrigger className="w-24 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((filter) => (
              <SelectItem key={filter} value={filter}>
                {filter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ticket list */}
      <div className="flex-1 overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No tickets match your search.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const Icon = categoryIcon[ticket.category];
            const isSelected = ticket.id === selectedTicketId;

            return (
              <button
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-gray-100 px-4 py-4 text-left transition-colors hover:bg-muted/50",
                  isSelected && "bg-violet-50 hover:bg-violet-50"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    categoryIconStyles[ticket.category]
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-violet-700">
                      {ticket.id}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                        priorityStyles[ticket.priority]
                      )}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm font-semibold text-foreground">
                    {ticket.subject}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {ticket.requesterName}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        {
                          "bg-amber-50 text-amber-700 border-amber-300":
                            ticket.status === "Open",
                          "bg-slate-100 text-slate-500 border-slate-300":
                            ticket.status === "Closed",
                          "bg-blue-50 text-blue-600 border-blue-300":
                            ticket.status === "Under review",
                          "bg-emerald-50 text-emerald-600 border-emerald-300":
                            ticket.status === "Resolved",
                        }
                      )}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.messages.length - 1 > 0
                        ? ticket.messages.length - 1
                        : 0}{" "}
                      replies
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
