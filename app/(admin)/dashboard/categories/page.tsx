"use client";

import { useState } from "react";
import { DollarSign, Download, Eye, Pencil, Percent, Plus, ShoppingCart, Store, Trash2 } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { DataTable, Pagination, SearchBox, StatCard, StatusPill, errorText, PAGE_SIZE } from "@/components/admin/common/kit";
import { ConfirmModal, Notice } from "@/components/admin/common/Modal";
import { CategoryDetailsModal } from "@/components/admin/categories/CategoryDetailsModal";
import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";
import { formatNaira } from "@/lib/admin/format";
import { listPath, useCategories, useDeleteCategory, type Category } from "@/lib/admin/resources";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/api/errors";

const COLUMNS = [{ key: "name", label: "Category" }, { key: "products", label: "Products" }, { key: "commission", label: "Commission" }, { key: "fee", label: "Platform Fee" }, { key: "units", label: "Units Sold" }, { key: "revenue", label: "Revenue" }, { key: "earned", label: "Commission Earned" }, { key: "status", label: "Status" }, { key: "actions", label: "Actions", className: "text-center" }];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Category | null>(null);
  const [form, setForm] = useState<{ category: Category | null } | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const params = { page, limit: PAGE_SIZE, search: debounced.trim() || undefined, sortBy: "sortOrder", sortOrder: "asc" };
  const query = useCategories(params);
  const all = useCategories({ page: 1, limit: 100, sortBy: "sortOrder", sortOrder: "asc" });
  const remove = useDeleteCategory();
  const rows = query.data?.rows ?? [];
  const meta = query.data?.meta;
  const stats = all.data?.meta.stats;
  const catalog = all.data?.rows ?? [];
  // Product totals are only exact when the whole catalog fits in one page of the summary query.
  const catalogComplete = (stats?.total ?? 0) <= catalog.length;
  const totalProducts = catalogComplete ? catalog.reduce((sum, c) => sum + c.productCount, 0) : null;
  const rates = catalog.map((c) => c.commissionRate);
  const fees = [...new Set(catalog.map((c) => c.platformFeeRate))];
  const notify = (kind: "success" | "error", text: string) => setNotice({ kind, text });

  async function confirmDelete() {
    if (!deleting) return;
    try { await remove.mutateAsync({ id: deleting.id }); notify("success", `${deleting.name} was deleted.`); }
    catch (cause) { notify("error", cause instanceof ApiError ? cause.message : "Could not delete the category."); }
    setDeleting(null); setViewing(null);
  }
  async function exportCsv() {
    try { await apiClient.admin.download(listPath("categories", { ...params, page: undefined, limit: 100 }, "csv"), "product-categories.csv"); }
    catch (cause) { notify("error", errorText(cause) ?? "The export failed."); }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <Headers title="Product Category" description="Manage product categories, platform fees, and sales performance" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<Plus className="h-4 w-4" />} buttonTwoText="Add Category" buttonTwoAction={() => setForm({ category: null })} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      <section aria-label="Category totals" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Categories" value={stats?.total ?? 0} loading={all.isLoading} tone="#1E1E1E" icon={<Store className="h-[18px] w-[18px] text-[#A855F7]" aria-hidden />} />
        <StatCard label="Total Products" value={totalProducts === null ? "—" : totalProducts.toLocaleString("en-NG")} loading={all.isLoading} tone="#1E1E1E" icon={<ShoppingCart className="h-[18px] w-[18px] text-[#3B82F6]" aria-hidden />} />
        <StatCard label="Marketplace Revenue" value={formatNaira(stats?.revenue ?? 0)} loading={all.isLoading} tone="#1E1E1E" icon={<DollarSign className="h-[18px] w-[18px] text-[#10B981]" aria-hidden />} />
        <StatCard label="Platform Commissions" value={formatNaira(stats?.commissionEarned ?? 0)} loading={all.isLoading} tone="#1E1E1E" icon={<Percent className="h-[18px] w-[18px] text-[#D95C30]" aria-hidden />} />
      </section>
      {catalogComplete && catalog.length > 0 ? (
        <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-[#EDE9FE] bg-[#FAF5FF] p-4">
          <Percent className="mt-0.5 h-4 w-4 shrink-0 text-[#A855F7]" aria-hidden />
          <div><p className="text-[14px] font-bold text-[#6B21A8]">Platform Commission Model</p><p className="text-[12px] text-[#7E22CE]">Customer pays the product price + {fees.length === 1 ? `${fees[0]}%` : "a per-category"} platform fee at checkout. Vendor receives the product price minus the category commission. Commissions range {Math.min(...rates)}–{Math.max(...rates)}% depending on category. Admin can adjust per-category rates below.</p></div>
        </div>
      ) : null}
      <div className="mb-4 flex justify-end"><SearchBox label="Search categories" placeholder="Search categories..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} /></div>
      <DataTable columns={COLUMNS} loading={query.isLoading} error={errorText(query.error)} empty={rows.length === 0} onRetry={() => void query.refetch()}>
        {rows.map((category) => (
          <tr key={category.id} className="hover:bg-[#F8F6FA]">
            <td className="px-4 py-3"><p className="text-[13px] font-semibold text-[#1E1E1E]">{category.name}</p><p className="text-[11px] text-gray-400">{category.slug}</p></td>
            <td className="px-4 py-3 text-center text-[13px]">{category.productCount}</td>
            <td className="px-4 py-3 text-center text-[13px] font-medium">{category.commissionRate}%</td>
            <td className="px-4 py-3 text-center text-[13px]">{category.platformFeeRate}%</td>
            <td className="px-4 py-3 text-center text-[13px]">{category.unitsSold.toLocaleString("en-NG")}</td>
            <td className="px-4 py-3 text-center text-[13px] font-medium">{formatNaira(category.revenue)}</td>
            <td className="px-4 py-3 text-center text-[13px] font-medium text-[#059669]">{formatNaira(category.commissionEarned)}</td>
            <td className="px-4 py-3 text-center"><StatusPill status={category.status} /></td>
            <td className="px-4 py-3"><div className="flex items-center justify-center gap-1">
              <button type="button" aria-label={`View ${category.name}`} onClick={() => setViewing(category)} className="cursor-pointer rounded-md p-1.5 text-[#3B82F6] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Eye className="h-4 w-4" /></button>
              <button type="button" aria-label={`Edit ${category.name}`} onClick={() => setForm({ category })} className="cursor-pointer rounded-md p-1.5 text-[#F59E0B] hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Pencil className="h-4 w-4" /></button>
              <button type="button" aria-label={`Delete ${category.name}`} onClick={() => setDeleting(category)} className="cursor-pointer rounded-md p-1.5 text-[#DC2626] hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Trash2 className="h-4 w-4" /></button>
            </div></td>
          </tr>
        ))}
      </DataTable>
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} total={meta?.total ?? 0} shown={rows.length} onPage={setPage} noun="categories" />
      <CategoryDetailsModal category={viewing} onClose={() => setViewing(null)} onEdit={(category) => { setViewing(null); setForm({ category }); }} onDelete={(category) => setDeleting(category)} />
      {form ? <CategoryFormModal key={form.category?.id ?? "new"} category={form.category} onClose={() => setForm(null)} onNotice={notify} /> : null}
      <ConfirmModal open={!!deleting} title="Delete category" confirmLabel="Delete category" busy={remove.isPending} onClose={() => setDeleting(null)} onConfirm={() => void confirmDelete()} message={deleting ? <>Delete <strong>{deleting.name}</strong>? {deleting.productCount > 0 ? `${deleting.productCount} product${deleting.productCount === 1 ? " uses" : "s use"} this category, so deletion will be rejected — set it to Inactive instead.` : "This can't be undone."}</> : null} />
    </div>
  );
}
