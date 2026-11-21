"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import { useState } from "react";
import { Download, Eye, RefreshCw, Store } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { DataTable, Pagination, PersonCell, SearchBox, StatusPill, TabBar, errorText, PAGE_SIZE } from "@/components/admin/common/kit";
import { Notice } from "@/components/admin/common/Modal";
import { OrderDetailsModal, canConfirmDelivery, DISPATCHED } from "@/components/admin/orders/OrderDetailsModal";
import { deliveryState, formatDate, formatNaira } from "@/lib/admin/format";
import { listPath, useOrders } from "@/lib/admin/resources";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";

const TABS = [
  { key: "", label: "All Orders" }, { key: "PENDING", label: "Pending" }, { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED,OUT_FOR_DELIVERY", label: "Dispatched" }, { key: "DELIVERED", label: "Delivered" }, { key: "CANCELLED", label: "Cancelled" },
];
const COLUMNS = [
  { key: "id", label: "Order ID" }, { key: "customer", label: "Customer" }, { key: "vendor", label: "Vendor" }, { key: "amount", label: "Amount" }, { key: "date", label: "Order Date" },
  { key: "status", label: "Status" }, { key: "delivery", label: "Delivery" }, { key: "escrow", label: "Escrow" }, { key: "action", label: "Action", className: "text-center" },
];
const sum = (counts: Record<string, number>, keys: string[]) => keys.reduce((total, key) => total + (counts[key] ?? 0), 0);

export default function OrdersPage() {
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{ id: string } | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const params = { page, limit: PAGE_SIZE, orderStatus: tab || undefined, search: debounced.trim() || undefined, sortBy: "createdAt", sortOrder: "desc" };
  const query = useOrders(params);
  // Delivered orders whose escrow is already released = "Completed" in the Figma summary.
  const completed = useOrders({ page: 1, limit: 1, orderStatus: "DELIVERED", escrowState: "RELEASED" });
  const meta = query.data?.meta;
  const rows = query.data?.rows ?? [];
  const overall = useOrders({ page: 1, limit: 1 });
  const counts = overall.data?.meta.counts ?? {};
  const completedCount = completed.data?.meta.total ?? 0;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const summary = [
    { label: "Pending", value: counts.PENDING ?? 0, color: "#D97706" }, { label: "Processing", value: counts.PROCESSING ?? 0, color: "#2563EB" },
    { label: "Dispatched", value: sum(counts, DISPATCHED), color: "#4D145D" }, { label: "Delivered", value: Math.max((counts.DELIVERED ?? 0) - completedCount, 0), color: "#059669" },
    { label: "Completed", value: completedCount, color: "#7C3AED" }, { label: "Cancelled", value: counts.CANCELLED ?? 0, color: "#DC2626" },
  ];
  const tabCount = (key: string) => key === "" ? total : sum(counts, key.split(","));

  async function exportCsv() {
    try { await apiClient.admin.download(listPath("orders", { ...params, page: undefined, limit: 100 }, "csv"), "product-orders.csv"); }
    catch (cause) { setNotice({ kind: "error", text: errorText(cause) ?? "The export failed." }); }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <NotificationTarget onTarget={(id) => { setSelected({ id }); }} />
      <Headers title="Product Orders" description="Track marketplace orders, delivery OTPs and escrow release" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export CSV" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<RefreshCw className="h-4 w-4" />} buttonTwoText="Refresh" buttonTwoAction={() => void query.refetch()} buttonTwoDisabled={query.isFetching} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      <section aria-label="Order totals" className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {summary.map((item) => (
          <div key={item.label} className="rounded-[12px] bg-[#F0F1F3] px-4 py-5 text-center shadow-sm">
            {query.isLoading ? <div className="mx-auto h-7 w-12 animate-pulse rounded bg-gray-200" /> : <p className="text-[26px] font-bold leading-none" style={{ color: item.color }}>{item.value.toLocaleString("en-NG")}</p>}
            <p className="mt-2 text-[12px] text-gray-500">{item.label}</p>
          </div>
        ))}
      </section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TabBar label="Order status" active={tab} onChange={(key) => { setTab(key); setPage(1); }} tabs={TABS.map((t) => ({ ...t, count: tabCount(t.key) }))} />
        <SearchBox label="Search orders" placeholder="Search orders..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
      </div>
      <DataTable columns={COLUMNS} loading={query.isLoading} error={errorText(query.error)} empty={rows.length === 0} onRetry={() => void query.refetch()}>
        {rows.map((order) => {
          const delivery = deliveryState(order.orderStatus);
          return (
            <tr key={order.id} className="hover:bg-[#F8F6FA]">
              <td className="px-4 py-3 text-[12px] font-medium text-[#D95C30]">{order.orderNumber}</td>
              <td className="px-4 py-3"><PersonCell name={order.customer.name} avatar={order.customer.avatar} /></td>
              <td className="px-4 py-3"><span className="flex items-center gap-2 text-[12px] text-gray-700"><Store className="h-3.5 w-3.5 text-[#A855F7]" aria-hidden />{order.vendorName ?? "—"}</span></td>
              <td className="px-4 py-3 text-[13px] font-bold text-[#4D145D]">{formatNaira(order.totalAmount)}</td>
              <td className="px-4 py-3 text-[12px] text-gray-500">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3"><StatusPill status={order.orderStatus} label={order.orderStatus === "SHIPPED" || order.orderStatus === "OUT_FOR_DELIVERY" ? "Dispatched" : undefined} /></td>
              <td className="px-4 py-3"><StatusPill status={order.orderStatus} label={delivery.label} tone={delivery.tone} /></td>
              <td className="px-4 py-3"><StatusPill status={order.escrow.state} /></td>
              <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
                <button type="button" aria-label={`View order ${order.orderNumber}`} onClick={() => setSelected({ id: order.id })} className="cursor-pointer rounded-md p-1.5 text-[#3B82F6] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Eye className="h-4 w-4" /></button>
                {canConfirmDelivery(order) ? <button type="button" onClick={() => setSelected({ id: order.id })} className="cursor-pointer rounded-[8px] bg-[#2B0A33] px-3 py-1.5 text-[11px] font-semibold leading-tight text-white hover:bg-[#4D145D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-2">Confirm<br />OTP</button> : null}
              </div></td>
            </tr>
          );
        })}
      </DataTable>
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} total={meta?.total ?? 0} shown={rows.length} onPage={setPage} noun="orders" />
      <OrderDetailsModal orderId={selected?.id ?? null} onClose={() => setSelected(null)} onNotice={(kind, text) => setNotice({ kind, text })} />
    </div>
  );
}
