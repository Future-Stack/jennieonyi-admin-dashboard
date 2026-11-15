"use client";

import { useState } from "react";
import { Modal, Field, GhostButton, PrimaryButton, inputClass, textareaClass } from "@/components/admin/common/Modal";
import { formatNaira } from "@/lib/admin/format";
import { useCreateCoupon, useUpdateCoupon, type Coupon, type CouponInput } from "@/lib/admin/resources";
import { ApiError } from "@/lib/api/errors";

const dateInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "");
const CODE = /^[A-Z0-9-]{3,32}$/;

interface FormState { code: string; description: string; discountType: "PERCENTAGE" | "FIXED"; discountValue: string; maxDiscount: string; minOrderAmount: string; usageLimit: string; perUserLimit: string; scope: string; expiresAt: string; isActive: boolean }
const blank: FormState = { code: "", description: "", discountType: "PERCENTAGE", discountValue: "", maxDiscount: "", minOrderAmount: "", usageLimit: "", perUserLimit: "1", scope: "ALL", expiresAt: "", isActive: true };
const fromCoupon = (c: Coupon): FormState => ({ code: c.code, description: c.description ?? "", discountType: c.discountType, discountValue: String(c.discountValue), maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "", minOrderAmount: String(c.minOrderAmount), usageLimit: c.usageLimit != null ? String(c.usageLimit) : "", perUserLimit: String(c.perUserLimit ?? 1), scope: c.scope, expiresAt: dateInput(c.expiresAt), isActive: c.isActive });

const todayLagos = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());

function validate(f: FormState, redeemed: number, originalExpiry: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!CODE.test(f.code)) errors.code = "Use 3–32 capital letters, digits or hyphens (e.g. WELCOME15).";
  const value = Number(f.discountValue);
  if (!(value > 0)) errors.discountValue = "Enter a discount greater than 0.";
  else if (f.discountType === "PERCENTAGE" && value > 100) errors.discountValue = "A percentage can't exceed 100.";
  if (f.minOrderAmount !== "" && Number(f.minOrderAmount) < 0) errors.minOrderAmount = "Minimum order can't be negative.";
  if (f.maxDiscount !== "" && !(Number(f.maxDiscount) > 0)) errors.maxDiscount = "Enter an amount greater than 0 or leave blank.";
  if (f.usageLimit !== "") {
    const limit = Number(f.usageLimit);
    if (!Number.isInteger(limit) || limit < 1) errors.usageLimit = "Enter a whole number of at least 1, or leave blank for unlimited.";
    else if (limit < redeemed) errors.usageLimit = `${redeemed} redemptions already used — the limit can't be lower.`;
  }
  if (!Number.isInteger(Number(f.perUserLimit)) || Number(f.perUserLimit) < 1) errors.perUserLimit = "Enter a whole number of at least 1.";
  if (f.expiresAt && f.expiresAt !== originalExpiry && f.expiresAt < todayLagos()) errors.expiresAt = "Choose today or a future date.";
  return errors;
}

export function CouponFormModal({ open, coupon, onClose, onNotice }: { open: boolean; coupon: Coupon | null; onClose: () => void; onNotice: (kind: "success" | "error", text: string) => void }) {
  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const [form, setForm] = useState<FormState>(coupon ? fromCoupon(coupon) : blank);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const redeemed = coupon?.usedCount ?? 0;
  const errors = validate(form, redeemed, dateInput(coupon?.expiresAt));
  const busy = create.isPending || update.isPending;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const show = (key: string) => (touched ? errors[key] ?? null : null);

  async function submit() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    const payload: CouponInput = {
      code: form.code, discountType: form.discountType, discountValue: Number(form.discountValue), scope: form.scope, isActive: form.isActive, perUserLimit: Number(form.perUserLimit),
      minOrderAmount: form.minOrderAmount === "" ? 0 : Number(form.minOrderAmount),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(form.discountType === "PERCENTAGE" && form.maxDiscount !== "" ? { maxDiscount: Number(form.maxDiscount) } : {}),
      ...(form.usageLimit !== "" ? { usageLimit: Number(form.usageLimit) } : {}),
      ...(form.expiresAt ? { expiresAt: new Date(`${form.expiresAt}T23:59:59+01:00`).toISOString() } : {}),
    };
    setServerError(null);
    try {
      if (coupon) await update.mutateAsync({ id: coupon.id, data: payload }); else await create.mutateAsync(payload);
      onNotice("success", coupon ? `Coupon ${payload.code} was updated.` : `Coupon ${payload.code} was created.`);
      onClose();
    } catch (cause) { setServerError(cause instanceof ApiError ? cause.message : "Could not save the coupon. Please try again."); }
  }

  return (
    <Modal open={open} onClose={onClose} title={coupon ? "Edit Coupon" : "Create Coupon"} width="max-w-[560px]" footer={<><GhostButton onClick={onClose} disabled={busy}>Cancel</GhostButton><PrimaryButton tone="orange" disabled={busy} onClick={() => void submit()}>{busy ? "Saving…" : coupon ? "Save Changes" : "Create Coupon"}</PrimaryButton></>}>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void submit(); }} noValidate>
        {serverError ? <p role="alert" className="rounded-[10px] bg-red-50 p-3 text-[13px] text-red-700 sm:col-span-2">{serverError}</p> : null}
        {coupon && redeemed > 0 ? <p className="rounded-[10px] bg-amber-50 p-3 text-[12px] text-amber-900 sm:col-span-2">This coupon has {redeemed} redemption{redeemed === 1 ? "" : "s"}. Its discount terms are locked; you can extend the expiry, raise limits or disable it.</p> : null}
        <div className="sm:col-span-2"><Field label="Coupon code" error={show("code")}><input value={form.code} onChange={(event) => set("code", event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))} maxLength={32} disabled={!!coupon && redeemed > 0} className={inputClass} placeholder="WELCOME15" /></Field></div>
        <Field label="Discount type"><select value={form.discountType} onChange={(event) => set("discountType", event.target.value as FormState["discountType"])} className={inputClass}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed amount (₦)</option></select></Field>
        <Field label={form.discountType === "PERCENTAGE" ? "Discount (%)" : "Discount (₦)"} error={show("discountValue")}><input inputMode="decimal" value={form.discountValue} onChange={(event) => set("discountValue", event.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} placeholder={form.discountType === "PERCENTAGE" ? "15" : "2000"} /></Field>
        <Field label="Minimum order (₦)" error={show("minOrderAmount")} hint="Leave blank for no minimum."><input inputMode="decimal" value={form.minOrderAmount} onChange={(event) => set("minOrderAmount", event.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} placeholder="5000" /></Field>
        <Field label="Total usage limit" error={show("usageLimit")} hint="Blank = unlimited."><input inputMode="numeric" value={form.usageLimit} onChange={(event) => set("usageLimit", event.target.value.replace(/\D/g, ""))} className={inputClass} placeholder="500" /></Field>
        <Field label="Per-customer limit" error={show("perUserLimit")}><input inputMode="numeric" value={form.perUserLimit} onChange={(event) => set("perUserLimit", event.target.value.replace(/\D/g, ""))} className={inputClass} /></Field>
        <Field label="Applies to"><select value={form.scope} onChange={(event) => set("scope", event.target.value)} className={inputClass}><option value="ALL">Bookings and orders</option><option value="BOOKING">Service bookings only</option><option value="ORDER">Product orders only</option></select></Field>
        <Field label="Expiry date" error={show("expiresAt")} hint="Blank = no expiry."><input type="date" value={form.expiresAt} onChange={(event) => set("expiresAt", event.target.value)} className={inputClass} /></Field>
        {form.discountType === "PERCENTAGE" ? <Field label="Maximum discount (₦)" error={show("maxDiscount")} hint="Caps the percentage discount."><input inputMode="decimal" value={form.maxDiscount} onChange={(event) => set("maxDiscount", event.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} placeholder="3000" /></Field> : null}
        <div className="sm:col-span-2"><Field label="Description (optional)"><textarea value={form.description} onChange={(event) => set("description", event.target.value)} maxLength={300} className={textareaClass} placeholder="Shown to customers who hold this coupon" /></Field></div>
        <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 sm:col-span-2"><input type="checkbox" checked={form.isActive} onChange={(event) => set("isActive", event.target.checked)} />Coupon is active{form.discountType === "FIXED" && Number(form.discountValue) > 0 ? <span className="ml-2 font-normal text-gray-500">({formatNaira(Number(form.discountValue))} off)</span> : null}</label>
        <button type="submit" className="sr-only">Save coupon</button>
      </form>
    </Modal>
  );
}
