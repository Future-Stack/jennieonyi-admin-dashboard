"use client";

import { useState } from "react";
import { Download, Pencil, Plus, Tag, ToggleLeft, ToggleRight, Trash2, Clock } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { DataTable, Pagination, SearchBox, StatCard, StatusPill, TabBar, errorText, PAGE_SIZE } from "@/components/admin/common/kit";
import { ConfirmModal, Notice } from "@/components/admin/common/Modal";
import { CouponFormModal } from "@/components/admin/coupon/CouponFormModal";
import { formatDate, formatNaira, titleCase } from "@/lib/admin/format";
import { listPath, useCoupons, useDeleteCoupon, useUpdateCoupon, type Coupon } from "@/lib/admin/resources";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/api/errors";

const TABS = [{ key: "", label: "All" }, { key: "ACTIVE", label: "Active" }, { key: "SCHEDULED", label: "Scheduled" }, { key: "EXPIRED", label: "Expired" }, { key: "DISABLED", label: "Disabled" }];
const COLUMNS = [{ key: "code", label: "Code" }, { key: "type", label: "Type" }, { key: "discount", label: "Discount" }, { key: "min", label: "Min Order" }, { key: "usage", label: "Usage" }, { key: "expiry", label: "Expiry" }, { key: "status", label: "Status" }, { key: "actions", label: "Actions", className: "text-center" }];

export default function CouponsPage() {
  const [status, setStatus] = useState("");
  const [scope, setScope] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ coupon: Coupon | null } | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const params = { page, limit: PAGE_SIZE, status: status || undefined, scope: scope || undefined, search: debounced.trim() || undefined, sortBy: "createdAt", sortOrder: "desc" };
  const query = useCoupons(params);
  const update = useUpdateCoupon();
  const remove = useDeleteCoupon();
  const rows = query.data?.rows ?? [];
  const meta = query.data?.meta;
  const stats = meta?.stats;
  const notify = (kind: "success" | "error", text: string) => setNotice({ kind, text });

  async function toggle(coupon: Coupon) {
    try { await update.mutateAsync({ id: coupon.id, data: { isActive: !coupon.isActive } }); notify("success", `Coupon ${coupon.code} was ${coupon.isActive ? "disabled" : "enabled"}.`); }
    catch (cause) { notify("error", cause instanceof ApiError ? cause.message : "Could not update the coupon."); }
  }
  async function confirmDelete() {
    if (!deleting) return;
    try {
      const result = await remove.mutateAsync({ id: deleting.id });
      const deleted = typeof result.data === "object" && result.data !== null && "deleted" in result.data ? Boolean((result.data as { deleted: unknown }).deleted) : true;
      notify("success", deleted ? `Coupon ${deleting.code} was deleted.` : `Coupon ${deleting.code} has redemptions, so it was disabled instead of deleted.`);
      setDeleting(null);
    } catch (cause) { notify("error", cause instanceof ApiError ? cause.message : "Could not delete the coupon."); setDeleting(null); }
  }
  async function exportCsv() {
    try { await apiClient.admin.download(listPath("coupons", { ...params, page: undefined, limit: 100 }, "csv"), "coupons.csv"); }
    catch (cause) { notify("error", errorText(cause) ?? "The export failed."); }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <Headers title="Coupon Management" description="Create and manage promotional codes and discount offers" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export Report" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<Plus className="h-4 w-4" />} buttonTwoText="Create Coupon" buttonTwoAction={() => setForm({ coupon: null })} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      <section aria-label="Coupon totals" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Coupons" value={stats?.active ?? 0} loading={query.isLoading} tone="#3BB515" />
        <StatCard label="Total Redemptions" value={(stats?.redemptions ?? 0).toLocaleString("en-NG")} loading={query.isLoading} tone="#4D145D" />
        <StatCard label="Revenue Impact" value={`−${formatNaira(stats?.revenueImpact ?? 0)}`} loading={query.isLoading} tone="#D95C30" hint="Discounts granted" icon={<Clock className="h-[18px] w-[18px] text-[#D95C30]" aria-hidden />} />
        <StatCard label="Total Coupons" value={meta?.total ?? 0} loading={query.isLoading} tone="#1E1E1E" />
      </section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TabBar label="Coupon status" active={status} onChange={(key) => { setStatus(key); setPage(1); }} tabs={TABS} />
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox label="Search coupons" placeholder="Search coupons..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
          <select aria-label="Filter coupons by scope" value={scope} onChange={(event) => { setScope(event.target.value); setPage(1); }} className="h-[40px] rounded-lg border border-gray-200 bg-white px-3 text-[13px] focus-visible:ring-2 focus-visible:ring-[#4D145D]"><option value="">All scopes</option><option value="ALL">Bookings & orders</option><option value="BOOKING">Bookings</option><option value="ORDER">Orders</option></select>
        </div>
      </div>
      <DataTable columns={COLUMNS} loading={query.isLoading} error={errorText(query.error)} empty={rows.length === 0} onRetry={() => void query.refetch()}>
        {rows.map((coupon) => {
          const pct = coupon.usageLimit ? Math.min(Math.round((coupon.usedCount / coupon.usageLimit) * 100), 100) : null;
          return (
            <tr key={coupon.id} className="hover:bg-[#F8F6FA]">
              <td className="px-4 py-3"><span className="flex items-center gap-2 text-[13px] font-bold text-[#4D145D]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3E8FF]"><Tag className="h-3.5 w-3.5 text-[#A855F7]" aria-hidden /></span>{coupon.code}</span></td>
              <td className="px-4 py-3 text-center text-[13px] text-gray-700">{coupon.discountType === "PERCENTAGE" ? "Percentage" : "Fixed"}</td>
              <td className="px-4 py-3 text-center text-[13px] font-bold text-[#D95C30]">{coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : formatNaira(coupon.discountValue)}</td>
              <td className="px-4 py-3 text-center text-[13px] text-gray-700">{formatNaira(coupon.minOrderAmount)}</td>
              <td className="px-4 py-3"><div className="mx-auto w-[130px]"><div className="flex justify-between text-[11px] text-gray-500"><span>{coupon.usedCount}/{coupon.usageLimit ?? "∞"}</span><span>{pct === null ? "" : `${pct}%`}</span></div><div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label={`${coupon.code} usage`} aria-valuenow={pct ?? 0} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${pct === 100 ? "bg-[#DC2626]" : "bg-[#4D145D]"}`} style={{ width: `${pct ?? 0}%` }} /></div></div></td>
              <td className="px-4 py-3 text-center text-[12px] text-gray-600">{coupon.expiresAt ? formatDate(coupon.expiresAt) : "No expiry"}</td>
              <td className="px-4 py-3 text-center"><StatusPill status={coupon.status} label={titleCase(coupon.status)} /></td>
              <td className="px-4 py-3"><div className="flex items-center justify-center gap-1">
                <button type="button" aria-label={`Edit ${coupon.code}`} onClick={() => setForm({ coupon })} className="cursor-pointer rounded-md p-1.5 text-[#A855F7] hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Pencil className="h-4 w-4" /></button>
                <button type="button" aria-label={`${coupon.isActive ? "Disable" : "Enable"} ${coupon.code}`} aria-pressed={coupon.isActive} disabled={update.isPending} onClick={() => void toggle(coupon)} className="cursor-pointer rounded-md p-1.5 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] disabled:opacity-50">{coupon.isActive ? <ToggleRight className="h-5 w-5 text-[#10B981]" /> : <ToggleLeft className="h-5 w-5 text-[#F59E0B]" />}</button>
                <button type="button" aria-label={`Delete ${coupon.code}`} onClick={() => setDeleting(coupon)} className="cursor-pointer rounded-md p-1.5 text-[#DC2626] hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>
          );
        })}
      </DataTable>
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} total={meta?.total ?? 0} shown={rows.length} onPage={setPage} noun="coupons" />
      {form ? <CouponFormModal key={form.coupon?.id ?? "new"} open coupon={form.coupon} onClose={() => setForm(null)} onNotice={notify} /> : null}
      <ConfirmModal open={!!deleting} title="Delete coupon" confirmLabel="Delete coupon" busy={remove.isPending} onClose={() => setDeleting(null)} onConfirm={() => void confirmDelete()} message={deleting ? <>Delete <strong>{deleting.code}</strong>? {deleting.usedCount > 0 ? "It has been redeemed, so it will be disabled instead and its history kept." : "This can't be undone."}</> : null} />
    </div>
  );
}
