"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { SearchBox, StatCard, errorText } from "@/components/admin/common/kit";
import { Notice } from "@/components/admin/common/Modal";
import { IssueRefundModal } from "@/components/admin/support/IssueRefundModal";
import { TicketDetail } from "@/components/admin/support/TicketDetail";
import { TicketList } from "@/components/admin/support/TicketList";
import { listPath, useTickets, type Ticket } from "@/lib/admin/resources";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";

const STATUSES = [{ value: "", label: "All" }, { value: "PENDING", label: "Open" }, { value: "UNDER_REVIEW", label: "Under review" }, { value: "RESOLVED", label: "Resolved" }, { value: "REJECTED", label: "Rejected" }, { value: "CLOSED", label: "Closed" }];
const AUDIENCES = [{ key: "CUSTOMER", label: "Customer Support" }, { key: "VENDOR", label: "Vendor Support" }, { key: "STYLIST", label: "Stylist Support" }];
const LIMIT = 15;

export default function SupportPage() {
  const [status, setStatus] = useState("");
  const [audience, setAudience] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<Ticket | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const params = { page, limit: LIMIT, status: status || undefined, audience: audience || undefined, search: debounced.trim() || undefined, sortBy: "updatedAt", sortOrder: "desc" };
  const query = useTickets(params);
  const overall = useTickets({ page: 1, limit: 1 });
  const customer = useTickets({ page: 1, limit: 1, audience: "CUSTOMER" });
  const vendor = useTickets({ page: 1, limit: 1, audience: "VENDOR" });
  const stylist = useTickets({ page: 1, limit: 1, audience: "STYLIST" });
  const audienceTotals: Record<string, number | undefined> = { CUSTOMER: customer.data?.meta.total, VENDOR: vendor.data?.meta.total, STYLIST: stylist.data?.meta.total };
  const rows = query.data?.rows ?? [];
  const meta = query.data?.meta;
  const stats = overall.data?.meta.stats;
  const activeId = selectedId ?? rows[0]?.id ?? null;
  const notify = (kind: "success" | "error", text: string) => setNotice({ kind, text });
  const pad = (value: number | undefined) => (value === undefined ? "—" : String(value).padStart(2, "0"));

  async function exportCsv() {
    try { await apiClient.admin.download(listPath("tickets", { ...params, page: undefined, limit: 100 }, "csv"), "support-tickets.csv"); }
    catch (cause) { notify("error", errorText(cause) ?? "The export failed."); }
  }
  function refresh() { void query.refetch(); void overall.refetch(); }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <NotificationTarget onTarget={(id) => { setSelectedId(id); }} />
      <Headers title="Support Center" description="Handle all support requests — customers, stylists, vendors, and technical issues" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export Report" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<RefreshCw className="h-4 w-4" />} buttonTwoText="Refresh" buttonTwoAction={refresh} buttonTwoDisabled={query.isFetching} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      <section aria-label="Ticket totals" className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Open Tickets" value={pad(stats?.pending)} loading={overall.isLoading} tone="#1E1E1E" />
        <StatCard label="Under Review" value={pad(stats?.underReview)} loading={overall.isLoading} tone="#1E1E1E" />
        <StatCard label="Resolved" value={pad(stats ? stats.resolved + stats.closed : undefined)} hint={stats && stats.closed > 0 ? `${stats.closed} closed` : undefined} loading={overall.isLoading} tone="#1E1E1E" />
        {AUDIENCES.map((item) => (
          <button key={item.key} type="button" aria-pressed={audience === item.key} onClick={() => { setAudience(audience === item.key ? "" : item.key); setPage(1); }} className={`cursor-pointer rounded-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] ${audience === item.key ? "ring-2 ring-[#4D145D]" : ""}`}>
            <StatCard label={item.label} value={pad(audienceTotals[item.key])} loading={overall.isLoading} tone="#1E1E1E" />
          </button>
        ))}
      </section>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(300px,380px)_1fr]">
        <section aria-label="Tickets" className="self-start rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4">
            <SearchBox label="Search tickets" placeholder="Search tickets..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
            <select aria-label="Filter tickets by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-[40px] rounded-lg border border-gray-200 bg-white px-3 text-[13px] focus-visible:ring-2 focus-visible:ring-[#4D145D]">{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </div>
          <TicketList tickets={rows} selectedId={activeId} onSelect={setSelectedId} loading={query.isLoading} error={errorText(query.error)} onRetry={() => void query.refetch()} />
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-[12px] text-gray-500">
            <span aria-live="polite">{meta ? `${rows.length} of ${meta.total} tickets` : "—"}</span>
            <span className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="cursor-pointer rounded-md border border-gray-200 px-2.5 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" disabled={!meta || page >= meta.totalPages} onClick={() => setPage(page + 1)} className="cursor-pointer rounded-md border border-gray-200 px-2.5 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button></span>
          </div>
        </section>
        <div className="min-w-0">{activeId ? <TicketDetail key={activeId} ticketId={activeId} onRefund={setRefunding} onNotice={notify} /> : !query.isLoading ? <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center"><p className="text-[15px] font-medium text-gray-800">Select a ticket</p><p className="mt-1 text-[13px] text-gray-500">Pick a ticket from the list to read the conversation and reply.</p></div> : null}</div>
      </div>
      <IssueRefundModal ticket={refunding} onClose={() => setRefunding(null)} onNotice={notify} />
    </div>
  );
}
