"use client";

import { useState } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { Modal, Field, GhostButton, PrimaryButton, textareaClass } from "@/components/admin/common/Modal";
import { Avatar, StatusPill } from "@/components/admin/common/kit";
import { formatDate, formatDateTime, formatNaira, formatSlot, titleCase } from "@/lib/admin/format";
import { useBookingDetail, useCancelBooking, type Booking } from "@/lib/admin/resources";
import { ApiError } from "@/lib/api/errors";

const CANCELLABLE = new Set(["PENDING", "CONFIRMED"]);

function steps(booking: Booking) {
  const escrow = booking.escrow.state;
  const cancelled = booking.status === "CANCELLED";
  const confirmed = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(booking.status);
  return [
    { label: "Booking Created", done: true },
    { label: "Payment Escrowed", done: booking.isPaid || escrow !== "UNPAID" },
    { label: "Stylist Confirmed", done: confirmed },
    { label: "Service Completed", done: booking.status === "COMPLETED" },
    { label: cancelled ? "Booking Cancelled" : "Payment Released", done: cancelled || escrow === "RELEASED", failed: cancelled },
  ];
}

export function BookingDetailsModal({ bookingId, onClose, onNotice }: { bookingId: string | null; onClose: () => void; onNotice: (kind: "success" | "error", text: string) => void }) {
  const detail = useBookingDetail(bookingId);
  const cancel = useCancelBooking();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const booking = detail.data;

  function close() { setReason(""); setConfirming(false); onClose(); }

  async function submitCancel() {
    if (!booking) return;
    try {
      await cancel.mutateAsync({ id: booking.id, reason: reason.trim() });
      onNotice("success", `${booking.bookingNumber} was cancelled${booking.isPaid ? " and the escrowed payment refunded to the customer wallet" : ""}.`);
      close();
    } catch (cause) {
      onNotice("error", cause instanceof ApiError ? cause.message : "Could not cancel this booking. Please try again.");
    }
  }

  const canCancel = booking ? CANCELLABLE.has(booking.status) : false;
  return (
    <Modal open={!!bookingId} onClose={close} title="Booking Details" footer={booking && canCancel ? (confirming ? (
      <>
        <GhostButton onClick={() => setConfirming(false)} disabled={cancel.isPending}>Keep Booking</GhostButton>
        <PrimaryButton tone="red" disabled={reason.trim().length < 5 || cancel.isPending} onClick={() => void submitCancel()}>{cancel.isPending ? "Cancelling…" : "Confirm Cancellation"}</PrimaryButton>
      </>
    ) : <PrimaryButton tone="red" onClick={() => setConfirming(true)}>Cancel Booking</PrimaryButton>) : undefined}>
      {detail.isLoading ? <div className="space-y-3" aria-label="Loading booking"><div className="h-8 animate-pulse rounded bg-gray-100" /><div className="h-24 animate-pulse rounded bg-gray-100" /><div className="h-40 animate-pulse rounded bg-gray-100" /></div>
        : detail.error || !booking ? <p role="alert" className="text-[14px] text-red-700">{detail.error?.message ?? "This booking could not be loaded."}</p>
        : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[20px] font-bold text-gray-900">{booking.bookingNumber}</h3>
              <div className="flex items-center gap-2"><StatusPill status={booking.status} /><StatusPill status={booking.escrow.state} label={`Escrow ${titleCase(booking.escrow.state)}`} /></div>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {[["Service", booking.services.map((s) => s.name).join(", ") || "—"], ["Amount", formatNaira(booking.totalAmount)], ["Date", formatDate(booking.bookingDate)], ["Time", formatSlot(booking.timeSlot)], ["Type", titleCase(booking.serviceType)], ["Escrow net payout", formatNaira(booking.escrow.netAmount)]].map(([label, value]) => (
                <div key={label} className="rounded-[14px] bg-[#F9FAFB] p-3"><dt className="mb-1 text-[12px] font-medium text-gray-500">{label}</dt><dd className="text-[14px] font-bold text-gray-900">{value}</dd></div>
              ))}
            </dl>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[16px] bg-[#EFF6FF] p-4"><p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#3B82F6]">Customer</p><div className="flex items-center gap-3"><Avatar name={booking.customer.name} src={booking.customer.avatar} /><p className="text-[14px] font-bold text-gray-900">{booking.customer.name}</p></div></div>
              <div className="rounded-[16px] bg-[#FFF7ED] p-4"><p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#F59E0B]">Stylist</p><div className="flex items-center gap-3"><Avatar name={booking.stylist.name} src={booking.stylist.avatar} /><p className="text-[14px] font-bold text-gray-900">{booking.stylist.name}</p></div></div>
            </div>
            <section aria-label="Booking timeline">
              <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Booking Timeline</h4>
              <ol className="relative flex flex-col gap-4">
                <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-[2px] bg-gray-100" />
                {steps(booking).map((step) => (
                  <li key={step.label} className="z-10 flex items-center gap-3">
                    {step.failed ? <XCircle className="h-6 w-6 rounded-full bg-white text-[#EF4444]" aria-hidden /> : step.done ? <CheckCircle2 className="h-6 w-6 rounded-full bg-white text-[#10B981]" aria-hidden /> : <Circle className="h-6 w-6 rounded-full bg-white text-gray-300" aria-hidden />}
                    <span className={`text-[14px] font-bold ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
                  </li>
                ))}
              </ol>
            </section>
            {booking.timeline && booking.timeline.length > 0 ? (
              <section aria-label="Audit trail">
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Audit Trail</h4>
                <ul className="space-y-2 text-[13px] text-gray-700">{booking.timeline.map((event, i) => <li key={`${event.at}-${i}`} className="flex justify-between gap-3"><span>{titleCase(event.action)}{event.reason ? <span className="text-gray-500"> — {event.reason}</span> : null}</span><time className="shrink-0 text-gray-500">{formatDateTime(event.at)}</time></li>)}</ul>
              </section>
            ) : null}
            {confirming ? (
              <Field label="Cancellation reason" hint="Recorded in the audit log. Paid bookings are refunded to the customer's PlaitAm wallet." error={reason.length > 0 && reason.trim().length < 5 ? "Enter at least 5 characters." : null}>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} className={textareaClass} maxLength={1000} placeholder="e.g. Stylist unavailable on the booked date" />
              </Field>
            ) : !canCancel ? <p className="text-[13px] text-gray-500">{booking.status === "CANCELLED" ? "This booking has already been cancelled." : "Completed or in-progress bookings can't be cancelled from the admin panel."}</p> : null}
          </div>
        )}
    </Modal>
  );
}
