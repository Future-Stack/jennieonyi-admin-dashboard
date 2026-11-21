"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Download, Eye, RefreshCw, Store, Wallet } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { DataTable, Pagination, SearchBox, StatCard, StatusPill, TabBar, errorText, PAGE_SIZE } from "@/components/admin/common/kit";
import { Notice } from "@/components/admin/common/Modal";
import { CommissionModal, PenaltyModal, ProviderActionModal, VendorProfileModal, toProviderTarget, vendorStatusLabel, type ActionKind } from "@/components/admin/vendors/VendorModals";
import { formatNaira } from "@/lib/admin/format";
import { useDashboardAnalytics } from "@/lib/admin/dashboard";
import { directoryPath, vendorDisplayName, vendorSchema, useVendors, type Vendor } from "@/lib/admin/vendors-agents";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";

const TABS = [{ key: "ALL", label: "All Vendors", count: "ALL" }, { key: "APPROVED", label: "Approved", count: "APPROVED" }, { key: "PENDING", label: "Pending", count: "PENDING" }, { key: "SUSPENDED", label: "Suspended", count: "SUSPENDED" }];
const COLUMNS = [{ key: "vendor", label: "Vendor" }, { key: "category", label: "Category", className: "text-center" }, { key: "products", label: "Products", className: "text-center" }, { key: "orders", label: "Orders", className: "text-center" }, { key: "revenue", label: "Revenue", className: "text-center" }, { key: "rating", label: "Rating", className: "text-center" }, { key: "commission", label: "Commission", className: "text-center" }, { key: "status", label: "Status", className: "text-center" }, { key: "actions", label: "Actions", className: "text-center" }];

export default function VendorsPage() {
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [page, setPage] = useState(1);
  const [profile, setProfile] = useState<Vendor | null>(null);
  const [action, setAction] = useState<{ provider: ReturnType<typeof toProviderTarget>; action: ActionKind } | null>(null);
  const [commission, setCommission] = useState<Vendor | null>(null);
  const [penalty, setPenalty] = useState<Vendor | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const filters = { page, limit: PAGE_SIZE, search: debounced.trim(), tab, ...(risk ? { risk } : {}) };
  const query = useVendors(filters);
  const overview = useVendors({ page: 1, limit: 1, search: "", tab: "ALL" });
  // Risk and revenue figures come from the server (risk filter / analytics KPI), never recomputed from a partial list.
  const riskAlert = useVendors({ page: 1, limit: 3, search: "", tab: "ALL", risk: "HIGH_RISK" });
  const revenue = useDashboardAnalytics({ period: "all", type: "vendor_sales" });
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;
  const counts = overview.data?.meta.counts ?? {};
  const stats = overview.data?.meta.stats ?? {};
  const highRisk = riskAlert.data?.data ?? [];
  const highRiskTotal = riskAlert.data?.meta.total ?? 0;
  const notify = (kind: "success" | "error", text: string) => setNotice({ kind, text });
  const openAction = (vendor: Vendor, kind: ActionKind) => { setProfile(null); setAction({ provider: toProviderTarget(vendor), action: kind }); };

  async function exportCsv() {
    try { await apiClient.admin.download(directoryPath("vendors", { ...filters, page: 1, limit: 100 }, "csv"), "vendors.csv"); }
    catch (cause) { notify("error", errorText(cause) ?? "The export failed."); }
  }
  function refresh() { void query.refetch(); void overview.refetch(); void riskAlert.refetch(); void revenue.refetch(); }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <NotificationTarget onTarget={async (id, signal) => { const result = await apiClient.admin.request(`vendors/${encodeURIComponent(id)}`, { method: "GET", signal }, (data) => vendorSchema.parse(data)); if (!signal.aborted) setProfile(result.data); }} />
      <Headers title="Vendor Management" description="Manage marketplace vendors, approvals, and performance" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export Report" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<RefreshCw className="h-4 w-4" />} buttonTwoText="Refresh" buttonTwoAction={refresh} buttonTwoDisabled={query.isFetching} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      <section aria-label="Vendor totals" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Vendors" value={stats.total ?? 0} loading={overview.isLoading} tone="#4D145D" icon={<Store className="h-[18px] w-[18px] text-[#A855F7]" aria-hidden />} />
        <StatCard label="Active Vendors" value={stats.approved ?? 0} loading={overview.isLoading} tone="#3BB515" icon={<CheckCircle2 className="h-[18px] w-[18px] text-[#3BB515]" aria-hidden />} />
        <StatCard label="Pending Approval" value={stats.pending ?? 0} loading={overview.isLoading} tone="#D95C30" icon={<Clock className="h-[18px] w-[18px] text-[#D95C30]" aria-hidden />} />
        <StatCard label="Vendor Revenue" value={revenue.data ? formatNaira(revenue.data.kpis.vendorSales.value) : "—"} loading={revenue.isLoading} tone="#0EA5E9" hint="All-time vendor sales" icon={<Wallet className="h-[18px] w-[18px] text-[#0EA5E9]" aria-hidden />} />
      </section>
      {highRiskTotal > 0 ? (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-[16px] border border-[#FFC9C9] bg-[#FEF2F2] p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C10007]" aria-hidden />
          <div><p className="text-[14px] font-bold text-[#C10007]">High Refund Rate Alert — Seller Penalty Required</p><p className="mt-0.5 text-[13px] text-[#C10007]">{highRisk.map((vendor) => `${vendorDisplayName(vendor)} (${vendor.refundRate}% refund rate)`).join(", ")}{highRiskTotal > highRisk.length ? ` and ${highRiskTotal - highRisk.length} more` : ""} — vendor-fault returns detected. Return shipping liability applies.</p></div>
          <button type="button" onClick={() => { setRisk("HIGH_RISK"); setPage(1); }} className="ml-auto shrink-0 cursor-pointer rounded-md border border-[#FFC9C9] bg-white px-3 py-1.5 text-[12px] font-medium text-[#C10007] hover:bg-red-50">Show vendors</button>
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TabBar label="Vendor status" active={tab} onChange={(key) => { setTab(key); setPage(1); }} tabs={TABS.map((t) => ({ key: t.key, label: t.label, count: counts[t.count] ?? 0 }))} />
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox label="Search vendors" placeholder="Search vendors..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
          <select aria-label="Filter vendors by risk" value={risk} onChange={(event) => { setRisk(event.target.value); setPage(1); }} className="h-[40px] rounded-lg border border-gray-200 bg-white px-3 text-[13px] focus-visible:ring-2 focus-visible:ring-[#4D145D]"><option value="">All risk levels</option><option value="HEALTHY">Healthy</option><option value="WARNING">Watch</option><option value="HIGH_RISK">High risk</option></select>
        </div>
      </div>
      <DataTable columns={COLUMNS} loading={query.isLoading} error={errorText(query.error)} empty={rows.length === 0} onRetry={() => void query.refetch()}>
        {rows.map((vendor) => (
          <tr key={vendor.userId} className="hover:bg-[#F8F6FA]">
            <td className="px-4 py-3"><div className="flex items-center gap-3"><span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#4D145D] to-[#7B2796]"><Store className="h-4 w-4 text-white" /></span><div className="min-w-0"><p className="flex items-center gap-2 truncate text-[13px] font-bold text-gray-900">{vendorDisplayName(vendor)}{vendor.profileComplete ? null : <span title="This vendor account has no store profile; store figures are unavailable." className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">Profile incomplete</span>}</p><p className="truncate text-[11px] text-gray-500">{vendor.storeName === null ? vendor.email : `${vendor.name} · ${vendor.email}`}</p></div></div></td>
            <td className="px-4 py-3 text-center text-[12px] text-gray-700" title={vendor.categories.join(", ")}>{vendor.categories[0] ?? "—"}{vendor.categories.length > 1 ? <span className="text-gray-400"> +{vendor.categories.length - 1}</span> : null}</td>
            <td className="px-4 py-3 text-center text-[13px] font-bold">{vendor.productCount}</td>
            <td className="px-4 py-3 text-center text-[13px] font-bold">{vendor.orderCount}</td>
            <td className="px-4 py-3 text-center text-[13px] font-bold">{vendor.revenue === null ? "—" : formatNaira(vendor.revenue)}</td>
            <td className="px-4 py-3 text-center text-[13px]">{vendor.rating !== null && vendor.rating > 0 ? `★ ${vendor.rating.toFixed(1)}` : "—"}</td>
            <td className="px-4 py-3 text-center text-[13px] font-medium">{vendor.commissionRate === null ? "Default" : `${vendor.commissionRate}%`}</td>
            <td className="px-4 py-3 text-center"><StatusPill status={vendor.status} label={vendorStatusLabel(vendor.status)} tone={vendor.status === "ACTIVE" ? "green" : vendor.status === "SUSPEND" ? "red" : vendor.status === "PENDING_APPROVAL" ? "amber" : "gray"} /></td>
            <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
              <button type="button" aria-label={`View ${vendorDisplayName(vendor)}`} onClick={() => setProfile(vendor)} className="cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Eye className="h-4 w-4" /></button>
              {vendor.status === "PENDING_APPROVAL" && vendor.profileComplete ? <>
                <button type="button" onClick={() => openAction(vendor, "approve")} className="cursor-pointer rounded-full bg-[#3BB515] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#2F9E0F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-1">Approve</button>
                <button type="button" onClick={() => openAction(vendor, "reject")} className="cursor-pointer rounded-full bg-[#FF332C] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-1">Reject</button>
              </> : vendor.status === "SUSPEND" ? <button type="button" onClick={() => openAction(vendor, "reinstate")} className="cursor-pointer rounded-full bg-[#3BB515] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#2F9E0F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-1">Reinstate</button>
                : vendor.status === "ACTIVE" ? <button type="button" onClick={() => openAction(vendor, "suspend")} className="cursor-pointer rounded-full bg-[#FFC107] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#E0A800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-1">Suspend</button> : null}
            </div></td>
          </tr>
        ))}
      </DataTable>
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} total={meta?.total ?? 0} shown={rows.length} onPage={setPage} noun="vendors" />
      <VendorProfileModal vendor={profile} onClose={() => setProfile(null)} onAction={openAction} onCommission={(vendor) => { setProfile(null); setCommission(vendor); }} onPenalty={(vendor) => { setProfile(null); setPenalty(vendor); }} onNotice={notify} />
      <ProviderActionModal noun="vendor" target={action} onClose={() => setAction(null)} onNotice={notify} />
      {commission ? <CommissionModal key={commission.userId} vendor={commission} onClose={() => setCommission(null)} onNotice={notify} /> : null}
      {penalty ? <PenaltyModal key={penalty.userId} vendor={penalty} onClose={() => setPenalty(null)} onNotice={notify} /> : null}
    </div>
  );
}
