"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Modal, GhostButton } from "@/components/admin/common/Modal";
import { StatusPill } from "@/components/admin/common/kit";
import { formatNaira } from "@/lib/admin/format";
import { useCategoryDetail, type Category } from "@/lib/admin/resources";

const EXAMPLE_PRICE = 100;

/** Fee example per ₦100 vendor price: customer pays +platform fee, vendor keeps price − commission. */
export function feeBreakdown(category: Pick<Category, "platformFeeRate" | "commissionRate">) {
  const fee = (EXAMPLE_PRICE * category.platformFeeRate) / 100;
  const commission = (EXAMPLE_PRICE * category.commissionRate) / 100;
  return { fee, commission, customerPays: EXAMPLE_PRICE + fee, vendorNet: EXAMPLE_PRICE - commission, platformEarns: fee + commission };
}

export function CategoryDetailsModal({ category, onClose, onEdit, onDelete }: { category: Category | null; onClose: () => void; onEdit: (category: Category) => void; onDelete: (category: Category) => void }) {
  const detail = useCategoryDetail(category?.id ?? null);
  const data = detail.data ?? category;
  const breakdown = data ? feeBreakdown(data) : null;
  const top = detail.data?.topProducts?.[0];
  return (
    <Modal open={!!category} onClose={onClose} title="Category Details" footer={data ? <><button type="button" onClick={() => onDelete(data)} className="mr-auto inline-flex cursor-pointer items-center gap-2 rounded-[8px] border border-red-200 bg-white px-4 py-2.5 text-[14px] font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 className="h-4 w-4" aria-hidden />Delete</button><GhostButton onClick={onClose}>Close</GhostButton><button type="button" onClick={() => onEdit(data)} className="inline-flex cursor-pointer items-center gap-2 rounded-[8px] bg-[#D95C30] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#C24D25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D95C30] focus-visible:ring-offset-2"><Pencil className="h-4 w-4" aria-hidden />Edit Category</button></> : undefined}>
      {data && breakdown ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between"><h3 className="text-[20px] font-bold text-gray-900">{data.name}</h3><StatusPill status={data.status} /></div>
          {data.description ? <p className="text-[13px] text-gray-600">{data.description}</p> : null}
          <dl className="grid grid-cols-2 gap-4">
            {[["Products", String(data.productCount)], ["Commission", `${data.commissionRate}%`], ["Platform fee", `${data.platformFeeRate}%`], ["Units sold", data.unitsSold.toLocaleString("en-NG")], ["Revenue", formatNaira(data.revenue)], ["Commission earned", formatNaira(data.commissionEarned)]].map(([label, value]) => <div key={label} className="rounded-[14px] bg-[#F9FAFB] p-3"><dt className="mb-1 text-[12px] font-medium text-gray-500">{label}</dt><dd className="text-[14px] font-bold text-gray-900">{value}</dd></div>)}
          </dl>
          <div className="rounded-[14px] bg-[#F9FAFB] p-3"><p className="mb-1 text-[12px] font-medium text-gray-500">Top product</p>{detail.isLoading ? <div className="h-5 w-40 animate-pulse rounded bg-gray-200" /> : <p className="text-[14px] font-bold text-gray-900">{top?.name ?? "No sales yet"}</p>}</div>
          <section aria-label="Fee breakdown">
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Fee breakdown (per {formatNaira(EXAMPLE_PRICE)} of vendor price)</h4>
            <dl className="space-y-2 rounded-[14px] border border-gray-100 p-4 text-[14px]">
              <div className="flex justify-between"><dt className="text-gray-600">Vendor price</dt><dd className="font-semibold">{formatNaira(EXAMPLE_PRICE)} <span className="text-gray-400">(100%)</span></dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">+ Customer platform fee ({data.platformFeeRate}%)</dt><dd className="font-semibold text-[#2563EB]">+{formatNaira(breakdown.fee)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Customer pays</dt><dd className="font-semibold">{formatNaira(breakdown.customerPays)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">− Category commission ({data.commissionRate}%)</dt><dd className="font-semibold text-[#DC2626]">−{formatNaira(breakdown.commission)}</dd></div>
              <div className="flex justify-between border-t border-gray-100 pt-2"><dt className="font-semibold text-gray-800">Net to vendor ({100 - data.commissionRate}%)</dt><dd className="font-bold text-[#059669]">{formatNaira(breakdown.vendorNet)}</dd></div>
            </dl>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
