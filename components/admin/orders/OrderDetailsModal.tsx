"use client";

import { useState } from "react";
import { CheckCircle2, Circle, KeyRound, ShieldAlert } from "lucide-react";
import { Modal, Field, GhostButton, PrimaryButton, inputClass, textareaClass } from "@/components/admin/common/Modal";
import { Avatar, StatusPill } from "@/components/admin/common/kit";
import { deliveryState, formatDate, formatDateTime, formatNaira, titleCase } from "@/lib/admin/format";
import { useConfirmDelivery, useOrderDetail, type Order } from "@/lib/admin/resources";
import { ApiError } from "@/lib/api/errors";

export const DISPATCHED = ["SHIPPED", "OUT_FOR_DELIVERY"];

/** Escrow can be released by the admin only for a paid, dispatched order whose funds are held (not locked by a dispute). */
export function canConfirmDelivery(order: Pick<Order, "orderStatus" | "escrow">): boolean {
  return DISPATCHED.includes(order.orderStatus) && order.escrow.state === "HELD";
}

function lifecycle(order: Order) {
  const dispatched = DISPATCHED.includes(order.orderStatus) || order.orderStatus === "DELIVERED";
  return [
    { label: "Order Placed", done: true },
    { label: "Payment Escrowed", done: order.paymentStatus === "PAID" || order.escrow.state !== "UNPAID" },
    { label: "Vendor Confirmed", done: order.orderStatus !== "PENDING" && order.orderStatus !== "CANCELLED" },
    { label: "Dispatched", done: dispatched },
    { label: "OTP Sent to Customer", done: dispatched },
    { label: "OTP Confirmed", done: order.orderStatus === "DELIVERED" },
    { label: "Escrow Released", done: order.escrow.state === "RELEASED" },
  ];
}

export function OrderDetailsModal({ orderId, onClose, onNotice }: { orderId: string | null; onClose: () => void; onNotice: (kind: "success" | "error", text: string) => void }) {
  const detail = useOrderDetail(orderId);
  const confirm = useConfirmDelivery();
  const [stage, setStage] = useState<"view" | "confirm">("view");
  const [otp, setOtp] = useState("");
  const [override, setOverride] = useState(false);
  const [reason, setReason] = useState("");
  const order = detail.data;

  function close() { setStage("view"); setOtp(""); setOverride(false); setReason(""); onClose(); }

  const otpValid = /^[0-9]{4}$/.test(otp);
  const formValid = reason.trim().length >= 5 && (override || otpValid);

  async function submit() {
    if (!order) return;
    try {
      await confirm.mutateAsync({ id: order.id, reason: reason.trim(), ...(override ? {} : { otp }) });
      onNotice("success", `Delivery confirmed for ${order.orderNumber}. Escrow has been released to ${order.vendorName ?? "the vendor"}.`);
      close();
    } catch (cause) {
      onNotice("error", cause instanceof ApiError ? cause.message : "Could not confirm delivery. Please try again.");
    }
  }

  const footer = !order ? undefined : stage === "confirm" ? (
    <>
      <GhostButton onClick={() => setStage("view")} disabled={confirm.isPending}>Back</GhostButton>
      <PrimaryButton tone="green" disabled={!formValid || confirm.isPending} onClick={() => void submit()}>{confirm.isPending ? "Releasing…" : "Confirm & Release Escrow"}</PrimaryButton>
    </>
  ) : canConfirmDelivery(order) ? <PrimaryButton onClick={() => setStage("confirm")}><KeyRound className="h-4 w-4" aria-hidden />Confirm Delivery OTP</PrimaryButton> : undefined;
  const delivery = order ? deliveryState(order.orderStatus) : null;

  return (
    <Modal open={!!orderId} onClose={close} title={stage === "confirm" ? "Confirm Delivery OTP" : "Order Details"} footer={footer}>
      {detail.isLoading ? <div className="space-y-3" aria-label="Loading order"><div className="h-8 animate-pulse rounded bg-gray-100" /><div className="h-24 animate-pulse rounded bg-gray-100" /><div className="h-40 animate-pulse rounded bg-gray-100" /></div>
        : detail.error || !order ? <p role="alert" className="text-[14px] text-red-700">{detail.error?.message ?? "This order could not be loaded."}</p>
        : stage === "confirm" ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-1 rounded-[16px] border border-[#EDE9FE] bg-[#F5F3FF] px-6 py-5 text-center">
              <KeyRound className="h-9 w-9 text-[#A855F7]" aria-hidden />
              <h3 className="text-[16px] font-bold text-[#1E293B]">Order {order.orderNumber}</h3>
              <p className="text-[14px] text-gray-500">{order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}</p>
              <p className="text-[24px] font-bold text-[#4D145D]">{formatNaira(order.totalAmount)}</p>
            </div>
            <dl className="space-y-2 text-[14px]">
              <div className="flex justify-between"><dt className="text-gray-500">Customer</dt><dd className="font-medium">{order.customer.name}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Vendor</dt><dd className="font-medium">{order.vendorName ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Vendor net payout</dt><dd className="font-semibold text-[#059669]">{formatNaira(order.escrow.netAmount)}</dd></div>
            </dl>
            <Field label="4-digit delivery OTP" hint="The code the customer received from the rider." error={otp.length > 0 && !override && !otpValid ? "Enter the 4-digit code." : null}>
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={otp} disabled={override} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className={`${inputClass} tracking-[0.5em] text-center text-[18px]`} placeholder="••••" />
            </Field>
            <label className="flex cursor-pointer items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900">
              <input type="checkbox" checked={override} onChange={(event) => { setOverride(event.target.checked); if (event.target.checked) setOtp(""); }} className="mt-0.5" />
              <span><span className="flex items-center gap-1 font-semibold"><ShieldAlert className="h-4 w-4" aria-hidden />Release without OTP (admin override)</span>Use only when the customer confirmed delivery by another channel. This is recorded in the audit log.</span>
            </label>
            <Field label="Reason" error={reason.length > 0 && reason.trim().length < 5 ? "Enter at least 5 characters." : null}>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className={textareaClass} placeholder="e.g. Customer read the OTP to support on a call" />
            </Field>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[20px] font-bold text-gray-900">{order.orderNumber}</h3>
              <div className="flex items-center gap-2"><StatusPill status={order.orderStatus} /><StatusPill status={order.escrow.state} label={`Escrow ${titleCase(order.escrow.state)}`} />{delivery ? <StatusPill status={order.orderStatus} label={delivery.label} tone={delivery.tone} /> : null}</div>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {[["Amount", formatNaira(order.totalAmount)], ["Delivery fee", formatNaira(order.deliveryFee)], ["Order date", formatDate(order.createdAt)], ["Payment", titleCase(order.paymentStatus)]].map(([label, value]) => (
                <div key={label} className="rounded-[14px] bg-[#F9FAFB] p-3"><dt className="mb-1 text-[12px] font-medium text-gray-500">{label}</dt><dd className="text-[14px] font-bold text-gray-900">{value}</dd></div>
              ))}
            </dl>
            <section aria-label="Items"><h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Items</h4>
              <ul className="divide-y divide-gray-100 rounded-[12px] border border-gray-100">{order.items.map((item) => <li key={item.productId} className="flex justify-between gap-3 px-3 py-2 text-[14px]"><span>{item.name} <span className="text-gray-500">×{item.quantity}</span></span><span className="font-medium">{formatNaira(item.unitPrice * item.quantity)}</span></li>)}</ul>
            </section>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[16px] bg-[#EFF6FF] p-4"><p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#3B82F6]">Customer</p><div className="flex items-center gap-3"><Avatar name={order.customer.name} src={order.customer.avatar} /><p className="text-[14px] font-bold">{order.customer.name}</p></div></div>
              <div className="rounded-[16px] bg-[#F5F3FF] p-4"><p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">Vendor</p><div className="flex items-center gap-3"><Avatar name={order.vendorName ?? "Vendor"} /><p className="text-[14px] font-bold">{order.vendorName ?? "Unassigned"}</p></div></div>
            </div>
            <section aria-label="Order lifecycle"><h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Order Lifecycle</h4>
              <ol className="relative flex flex-col gap-4"><span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-[2px] bg-gray-100" />
                {lifecycle(order).map((step) => <li key={step.label} className="z-10 flex items-center gap-3">{step.done ? <CheckCircle2 className="h-6 w-6 rounded-full bg-white text-[#10B981]" aria-hidden /> : <Circle className="h-6 w-6 rounded-full bg-white text-gray-300" aria-hidden />}<span className={`text-[14px] font-bold ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span></li>)}
              </ol>
            </section>
            {order.timeline && order.timeline.length > 0 ? <section aria-label="Audit trail"><h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Audit Trail</h4><ul className="space-y-2 text-[13px] text-gray-700">{order.timeline.map((event, i) => <li key={`${event.at}-${i}`} className="flex justify-between gap-3"><span>{titleCase(event.action)}{event.reason ? <span className="text-gray-500"> — {event.reason}</span> : null}</span><time className="shrink-0 text-gray-500">{formatDateTime(event.at)}</time></li>)}</ul></section> : null}
            {canConfirmDelivery(order) ? (
              <div className="rounded-[14px] border border-[#DDD6FF] bg-[#F5F3FF] p-4"><div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#A855F7]" aria-hidden /><h4 className="text-[13px] font-bold text-[#7E22CE]">OTP Delivery Confirmation</h4></div><p className="mt-1 text-[12px] font-medium text-[#9333EA]">Once the customer has received the OTP, confirm it here to release escrow to the vendor.</p></div>
            ) : order.escrow.state === "LOCKED" ? <p className="rounded-[10px] bg-red-50 p-3 text-[13px] text-red-700">Escrow is locked by an open dispute. Resolve the dispute in Support before releasing funds.</p> : null}
          </div>
        )}
    </Modal>
  );
}
