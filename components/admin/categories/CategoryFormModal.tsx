"use client";

import { useState } from "react";
import { Modal, Field, GhostButton, PrimaryButton, inputClass, textareaClass } from "@/components/admin/common/Modal";
import { useCreateCategory, useUpdateCategory, type Category, type CategoryInput } from "@/lib/admin/resources";
import { ApiError } from "@/lib/api/errors";

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
interface FormState { name: string; slug: string; description: string; commissionRate: string; platformFeeRate: string; status: "ACTIVE" | "INACTIVE"; sortOrder: string }
const fromCategory = (c: Category): FormState => ({ name: c.name, slug: c.slug, description: c.description ?? "", commissionRate: String(c.commissionRate), platformFeeRate: String(c.platformFeeRate), status: c.status, sortOrder: String(c.sortOrder) });
const blank: FormState = { name: "", slug: "", description: "", commissionRate: "", platformFeeRate: "5", status: "ACTIVE", sortOrder: "0" };
const rate = (v: string) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100;

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = "Enter a category name.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug)) e.slug = "Use lowercase letters, digits and single hyphens.";
  if (!rate(f.commissionRate)) e.commissionRate = "Enter a rate between 0 and 100.";
  if (!rate(f.platformFeeRate)) e.platformFeeRate = "Enter a rate between 0 and 100.";
  if (!/^\d+$/.test(f.sortOrder)) e.sortOrder = "Enter a whole number, 0 or higher.";
  return e;
}

export function CategoryFormModal({ category, onClose, onNotice }: { category: Category | null; onClose: () => void; onNotice: (kind: "success" | "error", text: string) => void }) {
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const [form, setForm] = useState<FormState>(category ? fromCategory(category) : blank);
  const [slugEdited, setSlugEdited] = useState(!!category);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const errors = validate(form);
  const busy = create.isPending || update.isPending;
  const show = (key: string) => (touched ? errors[key] ?? null : null);

  async function submit() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    const payload: CategoryInput = { name: form.name.trim(), slug: form.slug, commissionRate: Number(form.commissionRate), platformFeeRate: Number(form.platformFeeRate), status: form.status, sortOrder: Number(form.sortOrder), ...(form.description.trim() ? { description: form.description.trim() } : {}) };
    setServerError(null);
    try {
      if (category) await update.mutateAsync({ id: category.id, data: payload }); else await create.mutateAsync(payload);
      onNotice("success", category ? `${payload.name} was updated. New rates apply to future payments only.` : `${payload.name} was added to the catalog.`);
      onClose();
    } catch (cause) { setServerError(cause instanceof ApiError ? cause.message : "Could not save the category. Please try again."); }
  }

  return (
    <Modal open onClose={onClose} title={category ? "Edit Category" : "Add Category"} width="max-w-[520px]" footer={<><GhostButton onClick={onClose} disabled={busy}>Cancel</GhostButton><PrimaryButton tone="orange" disabled={busy} onClick={() => void submit()}>{busy ? "Saving…" : category ? "Save Changes" : "Add Category"}</PrimaryButton></>}>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void submit(); }} noValidate>
        {serverError ? <p role="alert" className="rounded-[10px] bg-red-50 p-3 text-[13px] text-red-700 sm:col-span-2">{serverError}</p> : null}
        <div className="sm:col-span-2"><Field label="Category name" error={show("name")}><input value={form.name} maxLength={100} onChange={(event) => setForm((f) => ({ ...f, name: event.target.value, ...(slugEdited ? {} : { slug: slugify(event.target.value) }) }))} className={inputClass} placeholder="Braiding Hair" /></Field></div>
        <div className="sm:col-span-2"><Field label="URL slug" error={show("slug")} hint="Used in product links; lowercase with hyphens."><input value={form.slug} maxLength={120} onChange={(event) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: event.target.value })); }} className={inputClass} placeholder="braiding-hair" /></Field></div>
        <Field label="Category commission (%)" error={show("commissionRate")} hint="Deducted from the vendor's product price."><input inputMode="decimal" value={form.commissionRate} onChange={(event) => setForm((f) => ({ ...f, commissionRate: event.target.value.replace(/[^0-9.]/g, "") }))} className={inputClass} placeholder="12" /></Field>
        <Field label="Platform fee (%)" error={show("platformFeeRate")} hint="Added to the customer's total at checkout."><input inputMode="decimal" value={form.platformFeeRate} onChange={(event) => setForm((f) => ({ ...f, platformFeeRate: event.target.value.replace(/[^0-9.]/g, "") }))} className={inputClass} /></Field>
        <Field label="Status"><select value={form.status} onChange={(event) => setForm((f) => ({ ...f, status: event.target.value as FormState["status"] }))} className={inputClass}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>
        <Field label="Display order" error={show("sortOrder")}><input inputMode="numeric" value={form.sortOrder} onChange={(event) => setForm((f) => ({ ...f, sortOrder: event.target.value.replace(/\D/g, "") }))} className={inputClass} /></Field>
        <div className="sm:col-span-2"><Field label="Description (optional)"><textarea value={form.description} maxLength={2000} onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))} className={textareaClass} /></Field></div>
        <button type="submit" className="sr-only">Save category</button>
      </form>
    </Modal>
  );
}
