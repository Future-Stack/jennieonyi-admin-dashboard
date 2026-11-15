"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Accessible modal (focus trap, Escape, overlay click) in the admin panel's visual style. */
export function Modal({ open, onClose, title, description, children, footer, width = "max-w-[540px]" }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; width?: string }) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className={`flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden rounded-[18px] border-none bg-white p-0 shadow-2xl sm:max-w-none ${width}`}>
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-[20px] font-bold text-[#1E293B]">{title}</DialogTitle>
          {description ? <DialogDescription className="mt-1 text-[13px] text-gray-500">{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  );
}

export function PrimaryButton({ children, disabled, onClick, type = "button", tone = "purple" }: { children: ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit"; tone?: "purple" | "orange" | "green" | "red" }) {
  const palette = { purple: "bg-[#4D145D] hover:bg-[#3C0F49]", orange: "bg-[#D95C30] hover:bg-[#C24D25]", green: "bg-[#10B981] hover:bg-[#059669]", red: "bg-[#DC2626] hover:bg-[#B91C1C]" }[tone];
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${palette}`}>{children}</button>;
}

export function GhostButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] disabled:cursor-not-allowed disabled:opacity-50">{children}</button>;
}

export function Notice({ notice, onDismiss }: { notice: { kind: "success" | "error"; text: string } | null; onDismiss: () => void }) {
  if (!notice) return null;
  const ok = notice.kind === "success";
  return (
    <div role={ok ? "status" : "alert"} className={`mb-4 flex items-start justify-between gap-3 rounded-[10px] border px-4 py-3 text-[13px] ${ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
      <span>{notice.text}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="cursor-pointer font-semibold">×</button>
    </div>
  );
}

export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string; error?: string | null }) {
  return (
    <label className="block text-[13px] font-medium text-gray-700">
      {label}
      <div className="mt-1.5">{children}</div>
      {error ? <p role="alert" className="mt-1 text-[12px] text-red-600">{error}</p> : hint ? <p className="mt-1 text-[12px] font-normal text-gray-500">{hint}</p> : null}
    </label>
  );
}

export const inputClass = "h-[40px] w-full rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-[#1E1E1E] outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#4D145D]";
export const textareaClass = "min-h-[88px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[14px] text-[#1E1E1E] outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#4D145D]";

export function ConfirmModal({ open, title, message, confirmLabel, tone = "red", busy, onConfirm, onClose }: { open: boolean; title: string; message: ReactNode; confirmLabel: string; tone?: "purple" | "orange" | "green" | "red"; busy?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-[440px]" footer={<><GhostButton onClick={onClose} disabled={busy}>Cancel</GhostButton><PrimaryButton tone={tone} disabled={busy} onClick={onConfirm}>{busy ? "Working…" : confirmLabel}</PrimaryButton></>}>
      <div className="text-[14px] text-gray-700">{message}</div>
    </Modal>
  );
}

/** Confirmation with a reason box — replaces window.confirm / window.prompt. */
export function ReasonDialog({ open, title, message, reasonLabel = "Reason", required = false, confirmLabel, tone = "red", busy, onConfirm, onClose }: { open: boolean; title: string; message: ReactNode; reasonLabel?: string; required?: boolean; confirmLabel: string; tone?: "purple" | "orange" | "green" | "red"; busy?: boolean; onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const tooShort = required && reason.trim().length < 5;
  function close() { setReason(""); onClose(); }
  return (
    <Modal open={open} onClose={close} title={title} width="max-w-[460px]" footer={<><GhostButton onClick={close} disabled={busy}>Cancel</GhostButton><PrimaryButton tone={tone} disabled={busy || tooShort} onClick={() => { const text = reason.trim(); setReason(""); onConfirm(text); }}>{busy ? "Working…" : confirmLabel}</PrimaryButton></>}>
      <div className="space-y-4">
        <div className="text-[14px] text-gray-700">{message}</div>
        <Field label={required ? reasonLabel : `${reasonLabel} (optional)`} error={required && reason.length > 0 && tooShort ? "Enter at least 5 characters." : null}>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className={textareaClass} />
        </Field>
      </div>
    </Modal>
  );
}
