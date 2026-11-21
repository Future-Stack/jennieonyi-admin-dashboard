"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Modal, Field, GhostButton, PrimaryButton, textareaClass } from "@/components/admin/common/Modal";
import { StatusPill } from "@/components/admin/common/kit";
import { formatDateTime, formatNaira, titleCase } from "@/lib/admin/format";
import { useBookingDetail, useOrderDetail, usePayoutDetail, usePayouts, useProcessPayout, useReleaseEscrow, type Transaction } from "@/lib/admin/resources";
import { ApiError } from "@/lib/api/errors";

type Notify = (kind: "success" | "error", text: string) => void;

/** Release escrow for the booking/order behind a ledger HOLD row. Amounts are computed server-side; the modal only previews them. */
export function ReleasePaymentModal({ entry, onClose, onNotice }: { entry: Transaction | null; onClose: () => void; onNotice: Notify }) {
  const source = entry?.source === "ORDER" ? "ORDER" : "BOOKING";
  const booking = useBookingDetail(entry && source === "BOOKING" ? entry.sourceId : null);
  const order = useOrderDetail(entry && source === "ORDER" ? entry.sourceId : null);
  const release = useReleaseEscrow();
  const [reason, setReason] = useState("");
  const record = source === "BOOKING" ? booking.data : order.data;
  const loading = source === "BOOKING" ? booking.isLoading : order.isLoading;
  const loadError = (source === "BOOKING" ? booking.error : order.error)?.message;
  const escrow = record?.escrow;
  const number = source === "BOOKING" ? booking.data?.bookingNumber : order.data?.orderNumber;
  const recipient = (source === "BOOKING" ? booking.data?.stylist.name : order.data?.vendorName) ?? "the provider";
  const blocker = !escrow ? null : escrow.state === "HELD" ? null : escrow.state === "LOCKED" ? "Escrow is locked by an open dispute. Resolve the dispute in Support first." : escrow.state === "RELEASED" ? "This escrow has already been released." : escrow.state === "REFUNDED" ? "This payment was refunded, so there is nothing to release." : "This payment has not been captured yet.";
  const notDispatched = source === "ORDER" && order.data && !["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.data.orderStatus) ? "The vendor must dispatch this order before escrow can be released."
    : source === "BOOKING" && booking.data && !["CONFIRMED", "IN_PROGRESS"].includes(booking.data.status) ? `The stylist must accept this booking before escrow can be released (it is currently ${titleCase(booking.data.status)}).` : null;
  const disabled = !!blocker || !!notDispatched || reason.trim().length < 5 || release.isPending || !escrow;

  function close() { setReason(""); onClose(); }
  async function submit() {
    if (!entry) return;
    try {
      await release.mutateAsync({ source, sourceId: entry.sourceId, reason: reason.trim() });
      onNotice("success", `Escrow for ${number ?? entry.reference} was released to ${recipient}.`);
      close();
    } catch (cause) { onNotice("error", cause instanceof ApiError ? cause.message : "Could not release this payment. Please try again."); }
  }

  return (
    <Modal open={!!entry} onClose={close} title="Release Payment" width="max-w-[460px]" footer={<><GhostButton onClick={close} disabled={release.isPending}>Cancel</GhostButton><PrimaryButton tone="green" disabled={disabled} onClick={() => void submit()}>{release.isPending ? "Releasing…" : "Confirm Release"}</PrimaryButton></>}>
      {loading ? <div className="space-y-3" aria-label="Loading escrow"><div className="h-6 animate-pulse rounded bg-gray-100" /><div className="h-24 animate-pulse rounded bg-gray-100" /></div>
        : loadError || !escrow ? <p role="alert" className="text-[14px] text-red-700">{loadError ?? "The escrow details could not be loaded."}</p>
        : (
          <div className="space-y-4">
            <dl className="space-y-3 rounded-[12px] bg-[#F9FAFB] p-4 text-[14px]">
              <div className="flex justify-between"><dt className="text-gray-500">{source === "BOOKING" ? "Booking" : "Order"}</dt><dd className="font-semibold">{number}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Recipient</dt><dd className="font-semibold">{recipient}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Escrow</dt><dd><StatusPill status={escrow.state} /></dd></div>
              <div className="flex justify-between border-t border-gray-200 pt-3"><dt className="text-gray-500">Amount held</dt><dd className="font-semibold">{formatNaira(escrow.heldAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Platform fee</dt><dd className="font-semibold text-[#D95C30]">−{formatNaira(escrow.platformFee)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Net payout</dt><dd className="text-[16px] font-bold text-[#059669]">{formatNaira(escrow.netAmount)}</dd></div>
            </dl>
            <p className="text-[12px] text-gray-500">Fees and tax are calculated by the server when the release is confirmed.</p>
            {blocker || notDispatched ? <p role="alert" className="flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{blocker ?? notDispatched}</p> : null}
            <Field label="Reason" error={reason.length > 0 && reason.trim().length < 5 ? "Enter at least 5 characters." : null}>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className={textareaClass} placeholder="e.g. Service completed; customer confirmed by phone" />
            </Field>
          </div>
        )}
    </Modal>
  );
}

/** Retry a held/failed/reversed payout after fresh eligibility checks on the server. */
export function ProcessPayoutModal({ entry, onClose, onNotice }: { entry: Transaction | null; onClose: () => void; onNotice: Notify }) {
  const process = useProcessPayout();
  const [reason, setReason] = useState("");
  function close() { setReason(""); onClose(); }
  async function submit() {
    if (!entry) return;
    try {
      await process.mutateAsync({ id: entry.sourceId, reason: reason.trim() });
      onNotice("success", `Payout ${entry.reference} is now processing. The final result arrives from the payment gateway.`);
      close();
    } catch (cause) { onNotice("error", cause instanceof ApiError ? cause.message : "Could not process this payout. Please try again."); }
  }
  return (
    <Modal open={!!entry} onClose={close} title="Process Payout" width="max-w-[460px]" footer={<><GhostButton onClick={close} disabled={process.isPending}>Cancel</GhostButton><PrimaryButton tone="orange" disabled={reason.trim().length < 5 || process.isPending} onClick={() => void submit()}>{process.isPending ? "Processing…" : "Process Payout"}</PrimaryButton></>}>
      {entry ? (
        <div className="space-y-4">
          <dl className="space-y-3 rounded-[12px] bg-[#F9FAFB] p-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-gray-500">Reference</dt><dd className="font-semibold">{entry.reference}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Recipient</dt><dd className="font-semibold">{entry.from ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Destination</dt><dd className="font-semibold">{entry.to ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><StatusPill status={entry.status} /></dd></div>
            <div className="flex justify-between border-t border-gray-200 pt-3"><dt className="text-gray-500">Net amount</dt><dd className="text-[16px] font-bold text-[#4D145D]">{formatNaira(entry.netAmount)}</dd></div>
          </dl>
          <p className="text-[12px] text-gray-500">Only held, failed or reversed payouts can be retried. Balance and bank checks run again before the transfer starts.</p>
          <Field label="Reason" error={reason.length > 0 && reason.trim().length < 5 ? "Enter at least 5 characters." : null}>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className={textareaClass} placeholder="e.g. Bank account re-verified with the provider" />
          </Field>
        </div>
      ) : null}
    </Modal>
  );
}

export function PayoutDetailsModal({ entry, payoutId, onClose }: { entry: Transaction | null; payoutId?: string | null; onClose: () => void }) {
  const lookup = usePayouts({ page: 1, limit: 1, search: entry?.reference ?? "__none__" });
  const detail = usePayoutDetail(payoutId ?? null);
  const payout = payoutId ? detail.data : entry ? lookup.data?.rows.find((row) => row.id === entry.sourceId) : undefined;
  const loading = payoutId ? detail.isLoading : lookup.isLoading;
  const error = payoutId ? detail.error : lookup.error;
  return (
    <Modal open={!!entry || !!payoutId} onClose={onClose} title="Payout Details" width="max-w-[460px]" footer={<GhostButton onClick={onClose}>Close</GhostButton>}>
      {loading ? <div className="h-32 animate-pulse rounded bg-gray-100" aria-label="Loading payout" />
        : !payout ? <p role="alert" className="text-[14px] text-red-700">{error?.message ?? "This payout could not be found."}</p>
        : (
          <dl className="space-y-3 text-[14px]">
            {[["Reference", payout.reference], ["Owner", titleCase(payout.ownerType)], ["Bank", payout.bankName ?? "—"], ["Account", payout.maskedAccount ?? "—"], ["Amount", formatNaira(payout.amount)], ["Fee", formatNaira(payout.fee)], ["Net", formatNaira(payout.netAmount)], ["Requested", formatDateTime(payout.createdAt)], ["Processed", formatDateTime(payout.processedAt)]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-gray-500">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>)}
            <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><StatusPill status={payout.status} /></dd></div>
            {payout.holdReason ? <p className="rounded-[10px] bg-amber-50 p-3 text-[13px] text-amber-900">Held: {payout.holdReason}</p> : null}
            {payout.failureReason ? <p className="rounded-[10px] bg-red-50 p-3 text-[13px] text-red-800">Failed: {payout.failureReason}</p> : null}
          </dl>
        )}
    </Modal>
  );
}
