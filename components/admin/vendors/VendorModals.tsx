"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink, FileText, Mail, MapPin, Phone } from "lucide-react";
import { Avatar, StatusPill } from "@/components/admin/common/kit";
import { Field, GhostButton, Modal, PrimaryButton, inputClass, textareaClass } from "@/components/admin/common/Modal";
import { formatDate, formatNaira, titleCase } from "@/lib/admin/format";
import { useCommission, useIssuePenalty, useProviderAction, useVendorKyc, useVendorPenalties, useVendorQuality, useWaivePenalty, vendorDisplayName, type Vendor } from "@/lib/admin/vendors-agents";
import { ApiError } from "@/lib/api/errors";

type Notify = (kind: "success" | "error", text: string) => void;
const fail = (cause: unknown, fallback: string) => (cause instanceof ApiError ? cause.message : fallback);
export const vendorStatusLabel = (status: string) => (status === "ACTIVE" ? "Approved" : status === "PENDING_APPROVAL" ? "Pending" : status === "SUSPEND" ? "Suspended" : titleCase(status));
const RISK: Record<string, { label: string; cls: string }> = { HEALTHY: { label: "Healthy", cls: "bg-[#ECFDF5] text-[#059669]" }, WARNING: { label: "Watch", cls: "bg-[#FFFBEB] text-[#B45309]" }, HIGH_RISK: { label: "High risk", cls: "bg-[#FEF2F2] text-[#DC2626]" } };

/* ---------- approve / reject / suspend / reinstate ---------- */

export type ActionKind = "approve" | "reject" | "suspend" | "reinstate";
export interface ProviderTarget { userId: string; displayName: string; name: string; email: string; avatar: string | null }
export const toProviderTarget = (vendor: Vendor): ProviderTarget => ({ userId: vendor.userId, displayName: vendorDisplayName(vendor), name: vendor.name, email: vendor.email, avatar: vendor.avatar });
const COPY: Record<ActionKind, { title: string; tone: "green" | "red" | "orange" | "purple"; needsReason: boolean; blurb: (n: string, noun: string) => string; done: (n: string) => string }> = {
  approve: { title: "Approve", tone: "green", needsReason: false, blurb: (n, noun) => `${n} will be able to work on PlaitAm as ${noun === "vendor" ? "a vendor" : "an agent"}. They are notified by email.`, done: (n) => `${n} was approved.` },
  reject: { title: "Reject", tone: "red", needsReason: true, blurb: (n) => `${n}'s registration will be rejected. The reason is sent so they can correct it and re-apply.`, done: (n) => `${n}'s registration was rejected.` },
  suspend: { title: "Suspend", tone: "orange", needsReason: true, blurb: (n, noun) => `${n} loses access${noun === "vendor" ? ": products are hidden and no new orders arrive" : " and stops earning commission"} until reinstated. Existing escrow is unaffected.`, done: (n) => `${n} was suspended.` },
  reinstate: { title: "Reinstate", tone: "green", needsReason: false, blurb: (n) => `${n} regains access immediately.`, done: (n) => `${n} was reinstated.` },
};

/** Approve / reject / suspend / reinstate a provider account with the reason the API requires. */
export function ProviderActionModal({ target, noun, onClose, onNotice }: { target: { provider: ProviderTarget; action: ActionKind } | null; noun: "vendor" | "agent"; onClose: () => void; onNotice: Notify }) {
  const mutation = useProviderAction();
  const [reason, setReason] = useState("");
  const copy = target ? COPY[target.action] : null;
  const valid = !copy?.needsReason || reason.trim().length >= 5;
  function close() { setReason(""); onClose(); }
  async function submit() {
    if (!target || !copy) return;
    try {
      await mutation.mutateAsync({ id: target.provider.userId, action: target.action, ...(reason.trim() ? (target.action === "approve" || target.action === "reinstate" ? { notes: reason.trim() } : { reason: reason.trim() }) : {}) });
      onNotice("success", copy.done(target.provider.displayName));
      close();
    } catch (cause) { onNotice("error", fail(cause, `Could not ${target.action} this ${noun}. Please try again.`)); }
  }
  return (
    <Modal open={!!target} onClose={close} title={copy ? `${copy.title} ${titleCase(noun)}` : ""} width="max-w-[480px]" footer={<><GhostButton onClick={close} disabled={mutation.isPending}>Cancel</GhostButton><PrimaryButton tone={copy?.tone ?? "purple"} disabled={!valid || mutation.isPending} onClick={() => void submit()}>{mutation.isPending ? "Saving…" : copy ? `${copy.title} ${titleCase(noun)}` : ""}</PrimaryButton></>}>
      {target && copy ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[14px] bg-[#F9FAFB] p-3"><Avatar name={target.provider.displayName} src={target.provider.avatar} size={40} /><div><p className="text-[14px] font-bold text-gray-900">{target.provider.displayName}</p><p className="text-[12px] text-gray-500">{target.provider.name} · {target.provider.email}</p></div></div>
          <p className="text-[14px] text-gray-700">{copy.blurb(target.provider.displayName, noun)}</p>
          <Field label={copy.needsReason ? "Reason" : "Note (optional)"} error={copy.needsReason && reason.length > 0 && reason.trim().length < 5 ? "Enter at least 5 characters." : null}>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className={textareaClass} placeholder={target.action === "reject" ? "e.g. ID document is unreadable — please upload a clear photo" : target.action === "suspend" ? "e.g. Repeated policy violations reported by customers" : "Add context for the audit log"} />
          </Field>
        </div>
      ) : null}
    </Modal>
  );
}

/* ---------- commission ---------- */

export function CommissionModal({ vendor, onClose, onNotice }: { vendor: Vendor | null; onClose: () => void; onNotice: Notify }) {
  const mutation = useCommission();
  const [value, setValue] = useState(vendor?.commissionRate != null ? String(vendor.commissionRate) : "");
  const rate = value === "" ? null : Number(value);
  const error = rate !== null && (!Number.isFinite(rate) || rate < 0 || rate > 100) ? "Enter a rate between 0 and 100, or leave blank for the category default." : null;
  async function submit() {
    if (!vendor || error) return;
    try { await mutation.mutateAsync({ id: vendor.userId, commissionRate: rate }); onNotice("success", rate === null ? `${vendor.storeName} now uses each category's default commission.` : `${vendor.storeName}'s commission is now ${rate}% for future payments.`); onClose(); }
    catch (cause) { onNotice("error", fail(cause, "Could not update the commission rate.")); }
  }
  return (
    <Modal open={!!vendor} onClose={onClose} title="Edit Commission" width="max-w-[440px]" footer={<><GhostButton onClick={onClose} disabled={mutation.isPending}>Cancel</GhostButton><PrimaryButton disabled={!!error || mutation.isPending} onClick={() => void submit()}>{mutation.isPending ? "Saving…" : "Save Commission"}</PrimaryButton></>}>
      <div className="space-y-4">
        <p className="text-[13px] text-gray-600">Overrides the category commission for <strong>{vendor?.storeName}</strong>. It applies to future payments only; settled orders keep the rate they were paid at.</p>
        <Field label="Commission rate (%)" error={error} hint="Leave blank to use each product category's default."><input inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} placeholder="Category default" autoFocus /></Field>
      </div>
    </Modal>
  );
}

/* ---------- penalty notice ---------- */

export function PenaltyModal({ vendor, onClose, onNotice }: { vendor: Vendor | null; onClose: () => void; onNotice: Notify }) {
  const mutation = useIssuePenalty();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [orderId, setOrderId] = useState("");
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const errors = { amount: !(Number(amount) > 0) ? "Enter an amount greater than 0." : null, reason: reason.trim().length < 5 ? "Enter at least 5 characters." : null, orderId: orderId && !uuid.test(orderId.trim()) ? "Paste the order's ID, or leave blank." : null };
  const valid = !errors.amount && !errors.reason && !errors.orderId;
  function close() { setAmount(""); setReason(""); setOrderId(""); onClose(); }
  async function submit() {
    if (!vendor || !valid) return;
    try { await mutation.mutateAsync({ id: vendor.userId, amount: Number(amount), reason: reason.trim(), ...(orderId.trim() ? { orderId: orderId.trim() } : {}) }); onNotice("success", `A ${formatNaira(Number(amount))} penalty notice was issued to ${vendor.storeName}. It is deducted from their next payout.`); close(); }
    catch (cause) { onNotice("error", fail(cause, "Could not issue the penalty notice.")); }
  }
  return (
    <Modal open={!!vendor} onClose={close} title="Issue Penalty Notice" width="max-w-[480px]" footer={<><GhostButton onClick={close} disabled={mutation.isPending}>Cancel</GhostButton><PrimaryButton tone="red" disabled={!valid || mutation.isPending} onClick={() => void submit()}>{mutation.isPending ? "Issuing…" : "Issue Penalty"}</PrimaryButton></>}>
      <div className="space-y-4">
        <p className="rounded-[10px] bg-red-50 p-3 text-[13px] text-red-800">The vendor is notified and the amount is deducted from their next payout.</p>
        <Field label="Amount (₦)" error={amount ? errors.amount : null}><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} placeholder="5000" autoFocus /></Field>
        <Field label="Reason" error={reason ? errors.reason : null}><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className={textareaClass} placeholder="e.g. Wrong item shipped on three orders this month" /></Field>
        <Field label="Related order ID (optional)" error={errors.orderId}><input value={orderId} onChange={(event) => setOrderId(event.target.value)} className={inputClass} placeholder="Order UUID" /></Field>
      </div>
    </Modal>
  );
}

/* ---------- profile ---------- */

export function VendorProfileModal({ vendor, onClose, onAction, onCommission, onPenalty, onNotice }: { vendor: Vendor | null; onClose: () => void; onAction: (vendor: Vendor, action: ActionKind) => void; onCommission: (vendor: Vendor) => void; onPenalty: (vendor: Vendor) => void; onNotice: Notify }) {
  // TASK-059: an account without a store profile has no quality, penalty or KYC record to load.
  const incomplete = vendor ? !vendor.profileComplete : false;
  const id = vendor && !incomplete ? vendor.userId : null;
  const pending = vendor?.status === "PENDING_APPROVAL" && !incomplete;
  const quality = useVendorQuality(id);
  const penalties = useVendorPenalties(id, { page: 1, limit: 5, search: "" });
  const kyc = useVendorKyc(id, vendor?.email ?? null, pending);
  const waive = useWaivePenalty();
  const risk = vendor ? RISK[vendor.risk] : null;

  async function waiveOne(penaltyId: string) {
    if (!vendor) return;
    try { await waive.mutateAsync({ id: vendor.userId, penaltyId, reason: "Waived by Admin after review" }); onNotice("success", "Penalty waived."); }
    catch (cause) { onNotice("error", fail(cause, "Could not waive the penalty.")); }
  }

  const statusAction = !vendor ? null : vendor.status === "SUSPEND" ? <PrimaryButton tone="green" onClick={() => onAction(vendor, "reinstate")}>Reinstate Vendor</PrimaryButton> : vendor.status === "ACTIVE" ? <PrimaryButton tone="orange" onClick={() => onAction(vendor, "suspend")}>Suspend Vendor</PrimaryButton> : null;
  const footer = !vendor ? undefined : incomplete ? (statusAction ?? <GhostButton onClick={onClose}>Close</GhostButton>) : pending ? (
    <><GhostButton onClick={() => onAction(vendor, "reject")}>Reject</GhostButton><PrimaryButton tone="green" onClick={() => onAction(vendor, "approve")}>Approve Vendor</PrimaryButton></>
  ) : (
    <>
      <GhostButton onClick={() => onCommission(vendor)}>Edit Commission</GhostButton>
      <PrimaryButton tone="red" onClick={() => onPenalty(vendor)}>Issue Penalty Notice</PrimaryButton>
      {statusAction}
    </>
  );

  return (
    <Modal open={!!vendor} onClose={onClose} title={pending ? "Review Vendor Registration" : "Vendor Profile"} width="max-w-[600px]" footer={footer}>
      {vendor ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4"><Avatar name={vendorDisplayName(vendor)} src={vendor.avatar} size={52} /><div className="min-w-0 flex-1"><h3 className="truncate text-[20px] font-bold leading-tight text-gray-900">{vendorDisplayName(vendor)}</h3><p className="text-[13px] text-gray-500">{vendor.storeName === null ? "No store profile" : vendor.name}</p></div><div className="flex flex-col items-end gap-1.5"><StatusPill status={vendor.status === "ACTIVE" ? "APPROVED" : vendor.status} label={vendorStatusLabel(vendor.status)} tone={vendor.status === "ACTIVE" ? "green" : vendor.status === "SUSPEND" ? "red" : "amber"} />{vendor.isFlagged ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">Flagged</span> : null}</div></div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Products", vendor.productCount.toLocaleString("en-NG")], ["Orders", vendor.orderCount.toLocaleString("en-NG")], ["Revenue", vendor.revenue === null ? "—" : formatNaira(vendor.revenue)], ["Rating", vendor.rating === null ? "—" : vendor.rating > 0 ? vendor.rating.toFixed(1) : "No reviews"]].map(([label, value]) => <div key={label} className="rounded-[12px] bg-[#F9FAFB] p-3 text-center"><dd className="text-[16px] font-bold text-gray-900">{value}</dd><dt className="mt-0.5 text-[11px] text-gray-500">{label}</dt></div>)}
          </dl>
          <div className="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
            <p className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-gray-400" aria-hidden />{vendor.email}</p>
            <p className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4 text-gray-400" aria-hidden />{vendor.phone}</p>
            <p className="flex items-center gap-2 text-gray-700"><MapPin className="h-4 w-4 text-gray-400" aria-hidden />{vendor.location ?? "No location on file"}</p>
            <p className="text-gray-700"><span className="text-gray-500">Joined </span>{formatDate(vendor.createdAt)}</p>
            <p className="text-gray-700 sm:col-span-2"><span className="text-gray-500">Categories </span>{vendor.categories.length ? vendor.categories.join(", ") : "None selected"}</p>
            <p className="text-gray-700"><span className="text-gray-500">Commission </span><strong>{vendor.commissionRate === null ? "Category default" : `${vendor.commissionRate}%`}</strong></p>
          </div>
          {vendor.isFlagged && vendor.flagReason ? <p className="rounded-[10px] bg-red-50 p-3 text-[13px] text-red-800">Flagged for review: {vendor.flagReason}</p> : null}

          {incomplete ? (
            <section aria-label="Store profile missing" role="status" className="flex items-start gap-2 rounded-[14px] bg-amber-50 p-4 text-[13px] text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>This vendor account has no store profile, so store name, revenue, rating, quality metrics and penalties are unavailable. It cannot be approved, and commission or penalties cannot be set until a store profile exists.</p>
            </section>
          ) : pending ? (
            <section aria-label="Registration documents" className="rounded-[14px] border border-gray-100 p-4">
              <h4 className="mb-3 text-[13px] font-bold text-gray-900">Registration details</h4>
              {kyc.isLoading ? <div className="h-16 animate-pulse rounded bg-gray-100" aria-label="Loading documents" /> : kyc.error ? <p role="alert" className="text-[13px] text-red-700">{kyc.error.message}</p> : !kyc.data ? <p className="text-[13px] text-gray-500">No registration documents were found for this vendor.</p> : (
                <dl className="space-y-2 text-[13px]">
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Business document</dt><dd>{kyc.data.idDocumentUrl ? <a href={kyc.data.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-[#4D145D] underline"><FileText className="h-4 w-4" aria-hidden />View document<ExternalLink className="h-3 w-3" aria-hidden /></a> : <span className="text-gray-500">Not uploaded</span>}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Bank</dt><dd className="font-medium">{kyc.data.bank.bankName ?? "—"} {kyc.data.bank.maskedAccount ?? ""}</dd></div>
                </dl>
              )}
            </section>
          ) : (
            <section aria-label="Seller quality metrics" className="rounded-[14px] border border-gray-100 p-4">
              <div className="mb-3 flex items-center justify-between"><h4 className="text-[14px] font-bold text-gray-900">Seller Quality Metrics</h4>{risk ? <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${risk.cls}`}>{risk.label}</span> : null}</div>
              {quality.isLoading ? <div className="h-24 animate-pulse rounded bg-gray-100" aria-label="Loading metrics" /> : quality.error || !quality.data ? <p role="alert" className="text-[13px] text-red-700">{quality.error?.message ?? "Quality metrics are unavailable."}</p> : (
                <>
                  <p className="mb-3 text-[12px] text-gray-500">Last {quality.data.windowDays} days · {quality.data.deliveredCount} delivered orders</p>
                  <div className="mb-4"><div className="mb-1 flex justify-between text-[12px]"><span className="text-gray-600">Refund rate</span><span className="font-bold">{quality.data.refundRate}%</span></div><div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label="Refund rate" aria-valuenow={Math.min(quality.data.refundRate, 100)} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${quality.data.refundRate >= 10 ? "bg-[#DC2626]" : quality.data.refundRate >= 5 ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} style={{ width: `${Math.min(quality.data.refundRate, 100)}%` }} /></div></div>
                  <dl className="grid grid-cols-2 gap-3 text-[13px]">
                    {[["Total returns", String(quality.data.totalReturns)], ["Vendor-fault returns", String(quality.data.vendorFaultRefundedCount)], ["Vendor-fault amount", formatNaira(quality.data.vendorFaultAmount)], ["Penalty balance", formatNaira(quality.data.outstandingPenalties)], ["Return shipping liability", formatNaira(quality.data.returnShippingLiability)]].map(([label, value]) => <div key={label} className="rounded-[10px] bg-[#F9FAFB] p-2.5"><dt className="text-[11px] text-gray-500">{label}</dt><dd className="mt-0.5 font-bold text-gray-900">{value}</dd></div>)}
                  </dl>
                  {quality.data.risk === "HIGH_RISK" ? <p className="mt-3 flex items-start gap-2 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />High refund rate — vendor-fault returns detected. Return shipping liability applies and a penalty notice may be issued.</p> : null}
                </>
              )}
              <h5 className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wider text-gray-400">Recent penalties</h5>
              {penalties.isLoading ? <div className="h-10 animate-pulse rounded bg-gray-100" /> : penalties.error ? <p role="alert" className="text-[13px] text-red-700">{penalties.error.message}</p> : (penalties.data?.data.length ?? 0) === 0 ? <p className="text-[13px] text-gray-500">No penalties on record.</p> : (
                <ul className="divide-y divide-gray-100 text-[13px]">{penalties.data?.data.map((penalty) => <li key={penalty.id} className="flex items-center justify-between gap-3 py-2"><span className="min-w-0"><span className="block truncate font-medium text-gray-900">{penalty.reason}</span><span className="text-[12px] text-gray-500">{formatDate(penalty.createdAt)}</span></span><span className="flex shrink-0 items-center gap-2"><span className="font-semibold">{formatNaira(penalty.amount)}</span><StatusPill status={penalty.status} />{penalty.status === "OUTSTANDING" ? <button type="button" disabled={waive.isPending} onClick={() => void waiveOne(penalty.id)} className="cursor-pointer text-[12px] font-medium text-[#4D145D] underline disabled:opacity-50">Waive</button> : null}</span></li>)}</ul>
              )}
            </section>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
