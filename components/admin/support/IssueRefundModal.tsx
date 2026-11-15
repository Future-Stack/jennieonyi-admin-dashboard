"use client";

import { useState } from "react";
import { Modal, Field, GhostButton, PrimaryButton, inputClass, textareaClass } from "@/components/admin/common/Modal";
import { formatNaira } from "@/lib/admin/format";
import { useBookingDetail, useIssueRefund, useOrderDetail, type Ticket } from "@/lib/admin/resources";
import { ApiError } from "@/lib/api/errors";

const FAULT = [{ value: "NONE", label: "No fault" }, { value: "VENDOR", label: "Vendor" }, { value: "CUSTOMER", label: "Customer" }, { value: "PLATFORM", label: "Platform" }] as const;

/** Refund against the booking/order a ticket references. The server caps the amount at the remaining refundable principal. */
export function IssueRefundModal({ ticket, onClose, onNotice }: { ticket: Ticket | null; onClose: () => void; onNotice: (kind: "success" | "error", text: string) => void }) {
  const booking = useBookingDetail(ticket?.bookingId ?? null);
  const order = useOrderDetail(ticket?.bookingId ? null : ticket?.orderId ?? null);
  const refund = useIssueRefund();
  const [type, setType] = useState<"FULL" | "PARTIAL">("FULL");
  const [amountText, setAmountText] = useState("");
  const [fault, setFault] = useState<(typeof FAULT)[number]["value"]>("NONE");
  const [shipping, setShipping] = useState("");
  const [note, setNote] = useState("");
  const escrow = (booking.data ?? order.data)?.escrow;
  const reference = booking.data?.bookingNumber ?? order.data?.orderNumber;
  const refundable = escrow ? Math.max(escrow.heldAmount + escrow.releasedAmount - escrow.refundedAmount, 0) : 0;
  const amount = type === "FULL" ? refundable : Number(amountText);
  const amountError = type === "PARTIAL" && amountText !== "" && (!(amount > 0) || amount > refundable) ? `Enter an amount between ₦0.01 and ${formatNaira(refundable)}.` : null;
  const valid = !!escrow && amount > 0 && amount <= refundable && note.trim().length >= 5 && !amountError;

  function close() { setType("FULL"); setAmountText(""); setFault("NONE"); setShipping(""); setNote(""); onClose(); }
  async function submit() {
    if (!ticket) return;
    try {
      await refund.mutateAsync({ id: ticket.id, amount, note: note.trim(), faultParty: fault, ...(Number(shipping) > 0 ? { returnShippingCost: Number(shipping) } : {}) });
      onNotice("success", `${formatNaira(amount)} refunded to the customer's wallet for ${reference ?? ticket.ticketNumber}.`);
      close();
    } catch (cause) { onNotice("error", cause instanceof ApiError ? cause.message : "Could not process the refund. Please try again."); }
  }

  return (
    <Modal open={!!ticket} onClose={close} title="Issue Refund" width="max-w-[460px]" footer={<><GhostButton onClick={close} disabled={refund.isPending}>Cancel</GhostButton><PrimaryButton tone="orange" disabled={!valid || refund.isPending} onClick={() => void submit()}>{refund.isPending ? "Processing…" : "Process Refund"}</PrimaryButton></>}>
      {ticket ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#FAD4D4] bg-[#FAF2F2] p-4"><h4 className="text-sm font-bold text-[#D32F2F]">Refund for Ticket {ticket.ticketNumber}</h4><p className="text-xs font-medium text-gray-600">{ticket.userName ?? "Customer"} • {ticket.subject}</p></div>
          {booking.isLoading || order.isLoading ? <div className="h-20 animate-pulse rounded bg-gray-100" aria-label="Loading escrow" />
            : !escrow ? <p role="alert" className="text-[14px] text-red-700">{(booking.error ?? order.error)?.message ?? "This ticket doesn't reference a booking or order that can be refunded."}</p>
            : (
              <>
                <p className="rounded-[10px] bg-[#F9FAFB] p-3 text-[13px] text-gray-700">{reference}: <strong>{formatNaira(refundable)}</strong> refundable of {formatNaira(escrow.heldAmount + escrow.releasedAmount)} paid ({formatNaira(escrow.refundedAmount)} already refunded).</p>
                <Field label="Type">
                  <select value={type} onChange={(event) => setType(event.target.value as "FULL" | "PARTIAL")} className={inputClass}><option value="FULL">Full refund</option><option value="PARTIAL">Partial refund</option></select>
                </Field>
                {type === "PARTIAL" ? <Field label="Amount (₦)" error={amountError}><input inputMode="decimal" value={amountText} onChange={(event) => setAmountText(event.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} placeholder="0.00" /></Field> : null}
                <Field label="Who is at fault?"><select value={fault} onChange={(event) => setFault(event.target.value as typeof fault)} className={inputClass}>{FAULT.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}</select></Field>
                {ticket.orderId && !ticket.bookingId ? <Field label="Return shipping cost (₦, optional)"><input inputMode="decimal" value={shipping} onChange={(event) => setShipping(event.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} placeholder="0.00" /></Field> : null}
                <Field label="Note" error={note.length > 0 && note.trim().length < 5 ? "Enter at least 5 characters." : null}><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} className={textareaClass} placeholder="Reason for the refund (recorded in the audit log)" /></Field>
              </>
            )}
        </div>
      ) : null}
    </Modal>
  );
}
