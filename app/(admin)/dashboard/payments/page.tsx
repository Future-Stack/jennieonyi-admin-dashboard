"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import { useState } from "react";
import { CalendarDays, Clock, Download, Eye, RefreshCw, ShoppingCart, TrendingUp } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { DataTable, Pagination, SearchBox, StatCard, StatusPill, TabBar, errorText, PAGE_SIZE } from "@/components/admin/common/kit";
import { Notice } from "@/components/admin/common/Modal";
import { CommissionChart } from "@/components/admin/payment/CommissionChart";
import { PayoutDetailsModal, ProcessPayoutModal, ReleasePaymentModal } from "@/components/admin/payment/EscrowActionModals";
import { BookingDetailsModal } from "@/components/admin/bookings/BookingDetailsModal";
import { OrderDetailsModal } from "@/components/admin/orders/OrderDetailsModal";
import { formatDate, formatNaira, titleCase } from "@/lib/admin/format";
import { listPath, useCommissionChart, useEscrowOverview, useTransactions, type Transaction } from "@/lib/admin/resources";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";

const TABS = [{ key: "BOOKING", label: "Service Escrow" }, { key: "ORDER", label: "Product Escrow" }, { key: "PAYOUT", label: "Payouts" }];
const COLUMNS = [
  { key: "txn", label: "TXN ID" }, { key: "type", label: "Type" }, { key: "from", label: "From" }, { key: "to", label: "To" }, { key: "ref", label: "Booking / Order" },
  { key: "amount", label: "Amount" }, { key: "fee", label: "Fee" }, { key: "net", label: "Net" }, { key: "date", label: "Date" }, { key: "status", label: "Status" }, { key: "actions", label: "Actions", className: "text-center" },
];
const TYPE_LABEL: Record<string, string> = { HOLD: "Escrow Hold", RELEASE: "Payment Released", REFUND: "Refund", PAYOUT: "Payout Request", PENALTY: "Penalty", COMMISSION: "Commission", REVERSAL: "Reversal" };
const RETRYABLE = new Set(["HELD", "FAILED", "REVERSED"]);

export default function PaymentsPage() {
  const [tab, setTab] = useState("BOOKING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [releasing, setReleasing] = useState<Transaction | null>(null);
  const [processing, setProcessing] = useState<Transaction | null>(null);
  const [notificationPayoutId, setNotificationPayoutId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Transaction | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const overview = useEscrowOverview();
  const chart = useCommissionChart();
  const params = { page, limit: PAGE_SIZE, source: tab, search: debounced.trim() || undefined, sortBy: "createdAt", sortOrder: "desc" };
  const query = useTransactions(params);
  const rows = query.data?.rows ?? [];
  const meta = query.data?.meta;
  const data = overview.data;
  const notify = (kind: "success" | "error", text: string) => setNotice({ kind, text });

  async function exportCsv() {
    try { await apiClient.admin.download(listPath("transactions", { ...params, page: undefined, limit: 100 }, "csv"), "escrow-transactions.csv"); }
    catch (cause) { notify("error", errorText(cause) ?? "The export failed."); }
  }
  function refresh() { void query.refetch(); void overview.refetch(); void chart.refetch(); }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <NotificationTarget onTarget={(id) => { setNotificationPayoutId(id); setTab("PAYOUT"); }} />
      <Headers title="Escrow & Payments Monitor" description="Track all escrow transactions across service bookings and product orders" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export Report" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<RefreshCw className="h-4 w-4" />} buttonTwoText="Refresh" buttonTwoAction={refresh} buttonTwoDisabled={query.isFetching} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      {overview.error ? <p role="alert" className="mb-4 rounded-[10px] bg-red-50 p-3 text-[13px] text-red-700">{errorText(overview.error)}</p> : null}
      <section aria-label="Escrow totals" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Service Escrow Held" loading={overview.isLoading} value={formatNaira(data?.serviceHeld.amount ?? 0)} hint={`${data?.serviceHeld.count ?? 0} bookings`} tone="#1E1E1E" icon={<CalendarDays className="h-[18px] w-[18px] text-[#A855F7]" aria-hidden />} />
        <StatCard label="Product Escrow Held" loading={overview.isLoading} value={formatNaira(data?.productHeld.amount ?? 0)} hint={`${data?.productHeld.count ?? 0} orders`} tone="#1E1E1E" icon={<ShoppingCart className="h-[18px] w-[18px] text-[#3B82F6]" aria-hidden />} />
        <StatCard label="Released This Month" loading={overview.isLoading} value={formatNaira(data?.releasedThisMonth.amount ?? 0)} hint={`${data?.releasedThisMonth.count ?? 0} releases`} tone="#1E1E1E" icon={<TrendingUp className="h-[18px] w-[18px] text-[#10B981]" aria-hidden />} />
        <StatCard label="Pending Payouts" loading={overview.isLoading} value={formatNaira(data?.pendingPayouts.amount ?? 0)} hint={`${data?.pendingPayouts.count ?? 0} requests`} tone="#1E1E1E" icon={<Clock className="h-[18px] w-[18px] text-[#F59E0B]" aria-hidden />} />
      </section>
      <CommissionChart months={chart.data?.months} total={chart.data?.total} loading={chart.isLoading} error={errorText(chart.error)} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TabBar label="Transaction source" active={tab} onChange={(key) => { setTab(key); setPage(1); }} tabs={TABS} />
        <SearchBox label="Search transactions" placeholder="Search transactions..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
      </div>
      <DataTable columns={COLUMNS} loading={query.isLoading} error={errorText(query.error)} empty={rows.length === 0} onRetry={() => void query.refetch()}>
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-[#F8F6FA]">
            <td className="max-w-[150px] truncate px-4 py-3 text-[12px] font-medium text-[#D95C30]" title={row.reference}>{row.reference}</td>
            <td className="px-4 py-3 text-[12px] text-gray-700">{TYPE_LABEL[row.type] ?? titleCase(row.type)}</td>
            <td className="px-4 py-3 text-[13px] text-gray-800">{row.from ?? "—"}</td>
            <td className="px-4 py-3 text-[13px] text-gray-800">{row.to ?? "—"}</td>
            <td className="max-w-[140px] truncate px-4 py-3 text-[12px] font-medium text-gray-800" title={row.sourceNumber ?? ""}>{row.sourceNumber ?? "N/A"}</td>
            <td className="px-4 py-3 text-[13px] font-medium">{formatNaira(row.amount)}</td>
            <td className="px-4 py-3 text-[13px] font-medium">{formatNaira(row.fee)}</td>
            <td className="px-4 py-3 text-[13px] font-bold">{formatNaira(row.netAmount)}</td>
            <td className="px-4 py-3 text-[12px] text-gray-600">{formatDate(row.createdAt)}</td>
            <td className="px-4 py-3"><StatusPill status={row.status === "COMPLETED" ? "RELEASED" : row.status} label={titleCase(row.status === "PAID" ? "HELD" : row.status)} /></td>
            <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
              <button type="button" aria-label={`View ${row.reference}`} onClick={() => setViewing(row)} className="cursor-pointer rounded-md p-1.5 text-[#A855F7] hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Eye className="h-4 w-4" /></button>
              {row.type === "HOLD" && (row.source === "BOOKING" || row.source === "ORDER") ? <button type="button" onClick={() => setReleasing(row)} className="cursor-pointer rounded-full bg-[#10B981] px-3 py-1 text-[12px] font-semibold text-white hover:bg-[#059669] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-2">Release</button> : null}
              {row.type === "PAYOUT" && RETRYABLE.has(row.status) ? <button type="button" onClick={() => setProcessing(row)} className="cursor-pointer rounded-full bg-[#D95C30] px-3 py-1 text-[12px] font-semibold text-white hover:bg-[#C24D25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-2">Process</button> : null}
            </div></td>
          </tr>
        ))}
      </DataTable>
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} total={meta?.total ?? 0} shown={rows.length} onPage={setPage} noun="transactions" />
      <ReleasePaymentModal entry={releasing} onClose={() => setReleasing(null)} onNotice={notify} />
      <ProcessPayoutModal entry={processing} onClose={() => setProcessing(null)} onNotice={notify} />
      <BookingDetailsModal bookingId={viewing?.source === "BOOKING" ? viewing.sourceId : null} onClose={() => setViewing(null)} onNotice={notify} />
      <OrderDetailsModal orderId={viewing?.source === "ORDER" ? viewing.sourceId : null} onClose={() => setViewing(null)} onNotice={notify} />
      <PayoutDetailsModal payoutId={notificationPayoutId} entry={viewing?.source === "PAYOUT" ? viewing : null} onClose={() => { setViewing(null); setNotificationPayoutId(null); }} />
    </div>
  );
}
