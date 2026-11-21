"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import { useState } from "react";
import { Download, Eye, Filter, RefreshCw } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { DataTable, Pagination, PersonCell, SearchBox, StatusPill, TabBar, errorText, PAGE_SIZE } from "@/components/admin/common/kit";
import { Notice } from "@/components/admin/common/Modal";
import { BookingDetailsModal } from "@/components/admin/bookings/BookingDetailsModal";
import { formatDate, formatNaira, formatSlot, titleCase } from "@/lib/admin/format";
import { listPath, useBookings } from "@/lib/admin/resources";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";

const TABS = [
  { key: "", label: "All" }, { key: "PENDING", label: "Pending" }, { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PROGRESS", label: "Active" }, { key: "COMPLETED", label: "Completed" }, { key: "CANCELLED", label: "Cancelled" },
];
const SUMMARY = [
  { key: "total", label: "Total", color: "#4D145D" }, { key: "PENDING", label: "Pending", color: "#D97706" }, { key: "CONFIRMED", label: "Confirmed", color: "#2563EB" },
  { key: "IN_PROGRESS", label: "Active", color: "#7C3AED" }, { key: "COMPLETED", label: "Completed", color: "#059669" }, { key: "CANCELLED", label: "Cancelled", color: "#DC2626" },
];
const COLUMNS = [
  { key: "id", label: "Booking ID" }, { key: "customer", label: "Customer" }, { key: "stylist", label: "Stylist" }, { key: "service", label: "Service" },
  { key: "when", label: "Date & Time" }, { key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "escrow", label: "Escrow" }, { key: "actions", label: "Actions", className: "text-center" },
];

export default function BookingsPage() {
  const [status, setStatus] = useState("");
  const [escrow, setEscrow] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const params = { page, limit: PAGE_SIZE, status: status || undefined, escrowState: escrow || undefined, search: debounced.trim() || undefined, sortBy: "createdAt", sortOrder: "desc" };
  const query = useBookings(params);
  const meta = query.data?.meta;
  const rows = query.data?.rows ?? [];
  const counts = meta?.counts ?? {};
  const total = meta?.stats?.total ?? Object.values(counts).reduce((sum, n) => sum + n, 0);

  async function exportCsv() {
    try { await apiClient.admin.download(listPath("bookings", { ...params, page: undefined, limit: 100 }, "csv"), "bookings-overview.csv"); }
    catch (cause) { setNotice({ kind: "error", text: errorText(cause) ?? "The export failed." }); }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <NotificationTarget onTarget={(id) => { setSelected(id); }} />
      <Headers title="Bookings Overview" description="Monitor all hair service bookings and their status" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export Report" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<RefreshCw className="h-4 w-4" />} buttonTwoText="Refresh" buttonTwoAction={() => void query.refetch()} buttonTwoDisabled={query.isFetching} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      <section aria-label="Booking totals" className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {SUMMARY.map((item) => (
          <div key={item.key} className="rounded-[12px] bg-[#F0F1F3] px-4 py-5 text-center shadow-sm">
            {query.isLoading ? <div className="mx-auto h-7 w-12 animate-pulse rounded bg-gray-200" /> : <p className="text-[26px] font-bold leading-none" style={{ color: item.color }}>{(item.key === "total" ? total : counts[item.key] ?? 0).toLocaleString("en-NG")}</p>}
            <p className="mt-2 text-[12px] text-gray-500">{item.label}</p>
          </div>
        ))}
      </section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TabBar label="Booking status" active={status} onChange={(key) => { setStatus(key); setPage(1); }} tabs={TABS.map((tab) => ({ ...tab, count: tab.key ? counts[tab.key] ?? 0 : total }))} />
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox label="Search bookings" placeholder="Search bookings..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
          <button type="button" aria-expanded={showFilter} onClick={() => setShowFilter((open) => !open)} className="flex h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Filter className="h-4 w-4" />Filter{escrow ? " (1)" : ""}</button>
        </div>
      </div>
      {showFilter ? (
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-[10px] border border-gray-200 bg-gray-50 p-4">
          <label className="text-[13px] font-medium text-gray-700">Escrow state
            <select value={escrow} onChange={(event) => { setEscrow(event.target.value); setPage(1); }} className="mt-1.5 block h-[40px] w-48 rounded-lg border border-gray-200 bg-white px-3 text-[14px] focus-visible:ring-2 focus-visible:ring-[#4D145D]">
              <option value="">Any</option>{["UNPAID", "HELD", "LOCKED", "RELEASED", "REFUNDED"].map((state) => <option key={state} value={state}>{titleCase(state)}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setEscrow(""); setPage(1); }} className="h-[40px] cursor-pointer px-2 text-[13px] font-medium text-[#4D145D] hover:underline">Clear filters</button>
        </div>
      ) : null}
      <DataTable columns={COLUMNS} loading={query.isLoading} error={errorText(query.error)} empty={rows.length === 0} onRetry={() => void query.refetch()}>
        {rows.map((booking) => (
          <tr key={booking.id} className="hover:bg-[#F8F6FA]">
            <td className="px-4 py-3 text-[12px] text-gray-500">{booking.bookingNumber}</td>
            <td className="px-4 py-3"><PersonCell name={booking.customer.name} avatar={booking.customer.avatar} /></td>
            <td className="px-4 py-3"><PersonCell name={booking.stylist.name} avatar={booking.stylist.avatar} /></td>
            <td className="px-4 py-3 text-center text-[13px] font-medium text-[#1E1E1E]">{booking.services.map((s) => s.name).join(", ") || "—"}</td>
            <td className="px-4 py-3 text-center"><p className="text-[12px] font-medium text-gray-800">{formatDate(booking.bookingDate)}</p><p className="text-[11px] text-gray-400">{formatSlot(booking.timeSlot)}</p></td>
            <td className="px-4 py-3 text-center text-[13px] font-bold text-[#1E1E1E]">{formatNaira(booking.totalAmount)}</td>
            <td className="px-4 py-3 text-center"><StatusPill status={booking.status} label={booking.status === "IN_PROGRESS" ? "Active" : undefined} /></td>
            <td className="px-4 py-3 text-center"><StatusPill status={booking.escrow.state} /></td>
            <td className="px-4 py-3 text-center"><button type="button" aria-label={`View booking ${booking.bookingNumber}`} onClick={() => setSelected(booking.id)} className="cursor-pointer rounded-md p-1.5 text-[#3B82F6] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Eye className="h-4 w-4" /></button></td>
          </tr>
        ))}
      </DataTable>
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} total={meta?.total ?? 0} shown={rows.length} onPage={setPage} noun="bookings" />
      <BookingDetailsModal bookingId={selected} onClose={() => setSelected(null)} onNotice={(kind, text) => setNotice({ kind, text })} />
    </div>
  );
}
