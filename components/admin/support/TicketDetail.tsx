"use client";

import { useState } from "react";
import { CheckCircle2, DollarSign, Mail, Send, X } from "lucide-react";
import { Avatar, StatusPill } from "@/components/admin/common/kit";
import { Field, textareaClass } from "@/components/admin/common/Modal";
import { formatDate, formatDateTime, titleCase } from "@/lib/admin/format";
import { useTicketDetail, useTicketMessages, useTicketPriority, useTicketReply, useTicketStatus, type Ticket } from "@/lib/admin/resources";
import { ApiError } from "@/lib/api/errors";
import { audienceMeta, statusLabel } from "./TicketList";

const QUICK_REPLIES = [
  "We've received your request and are investigating. We'll update you shortly.",
  "Your issue has been escalated to our technical team.",
  "The refund has been processed. It should reflect in 3–5 business days.",
  "Please update your app to the latest version and try again.",
];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TicketDetail({ ticketId, onRefund, onNotice }: { ticketId: string; onRefund: (ticket: Ticket) => void; onNotice: (kind: "success" | "error", text: string) => void }) {
  const detail = useTicketDetail(ticketId);
  const messages = useTicketMessages(ticketId);
  const reply = useTicketReply();
  const status = useTicketStatus();
  const priority = useTicketPriority();
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);
  const ticket = detail.data;

  if (detail.isLoading) return <div className="space-y-4" aria-label="Loading ticket"><div className="h-48 animate-pulse rounded-2xl bg-gray-100" /><div className="h-48 animate-pulse rounded-2xl bg-gray-100" /></div>;
  if (detail.error || !ticket) return <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-[14px] text-red-700">{detail.error?.message ?? "This ticket could not be loaded."}</p>;

  const audience = audienceMeta(ticket.audience);
  const closed = ticket.status === "CLOSED";
  const canResolve = ["PENDING", "UNDER_REVIEW"].includes(ticket.status);
  const canClose = ["RESOLVED", "REJECTED"].includes(ticket.status);
  const canRefund = !!(ticket.bookingId || ticket.orderId) && !closed;
  const busy = reply.isPending || status.isPending;
  const messageRows = messages.data?.rows ?? [];

  async function run<T>(job: () => Promise<T>, success: string) {
    try { await job(); onNotice("success", success); }
    catch (cause) { onNotice("error", cause instanceof ApiError ? cause.message : "That action could not be completed. Please try again."); }
  }
  async function send() {
    const message = text.trim();
    if (!message) return;
    await run(() => reply.mutateAsync({ id: ticketId, message, isInternal: internal }), internal ? "Internal note saved." : "Reply sent to the user.");
    setText(""); setInternal(false);
  }
  async function setTicketStatus(next: "UNDER_REVIEW" | "RESOLVED" | "CLOSED", resolution?: string) {
    await run(() => status.mutateAsync({ id: ticketId, status: next, resolution }), `${ticket!.ticketNumber} marked as ${titleCase(next)}.`);
  }

  return (
    <div className="space-y-4">
      <section aria-label="Ticket summary" className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2"><span className="text-[12px] font-bold text-[#4D145D]">{ticket.ticketNumber}</span><StatusPill status={ticket.status} label={statusLabel(ticket.status)} /><StatusPill status={ticket.priority} /><span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] text-gray-600">{audience.label}</span></div>
        <h2 className="mt-3 text-[18px] font-bold text-gray-900">{ticket.subject}</h2>
        <p className="mt-1 text-[12px] text-gray-500">Filed {formatDate(ticket.createdAt)} · {ticket.replyCount} {ticket.replyCount === 1 ? "reply" : "replies"} · {titleCase(ticket.issueCategory)}</p>
        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 text-[13px] text-[#1E3A8A]">{ticket.description}</p>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-3"><div className="flex items-center gap-3"><Avatar name={ticket.userName ?? "User"} src={ticket.userAvatar} size={36} /><div><p className="text-[13px] font-semibold text-gray-900">{ticket.userName ?? "Unknown user"}</p><p className="text-[12px] text-gray-500">{audience.label}</p></div></div><Mail className="h-4 w-4 text-gray-400" aria-hidden /></div>
        {!closed ? <label className="mt-4 flex items-center gap-3 text-[13px] font-medium text-gray-700">Priority<select value={ticket.priority} disabled={priority.isPending} onChange={(event) => void run(() => priority.mutateAsync({ id: ticketId, priority: event.target.value }), `Priority set to ${titleCase(event.target.value)}.`)} className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-[13px]">{PRIORITIES.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}</select></label> : null}
      </section>

      <section aria-label="Conversation" className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-gray-500">Conversation</h3>
        {messages.isLoading ? <div className="h-16 animate-pulse rounded bg-gray-100" aria-label="Loading messages" />
          : messages.error ? <p role="alert" className="text-[13px] text-red-700">{messages.error.message}</p>
          : (
            <ul className="space-y-3">
              <li className="flex gap-3"><Avatar name={ticket.userName ?? "User"} src={ticket.userAvatar} size={28} /><div className="max-w-[85%] rounded-xl bg-[#EFF6FF] p-3 text-[13px] text-gray-800"><p className="mb-1 text-[12px] font-semibold text-[#2563EB]">{ticket.userName ?? "User"} · {formatDate(ticket.createdAt)}</p>{ticket.description}</div></li>
              {messageRows.map((message) => {
                const fromAdmin = message.senderRole === "ADMIN";
                return (
                  <li key={message.id} className={`flex gap-3 ${fromAdmin ? "flex-row-reverse" : ""}`}>
                    <Avatar name={message.senderName ?? titleCase(message.senderRole)} size={28} />
                    <div className={`max-w-[85%] rounded-xl p-3 text-[13px] text-gray-800 ${message.isInternal ? "border border-dashed border-amber-300 bg-amber-50" : fromAdmin ? "bg-gray-50" : "bg-[#EFF6FF]"}`}>
                      <p className="mb-1 text-[12px] font-semibold text-gray-600">{message.senderName ?? titleCase(message.senderRole)} · {formatDateTime(message.createdAt)}{message.isInternal ? <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">Internal note</span> : null}</p>
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </li>
                );
              })}
              {messageRows.length === 0 ? <li className="text-[13px] text-gray-500">No replies yet.</li> : null}
            </ul>
          )}
      </section>

      <section aria-label="Reply" className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {closed ? <p className="text-[13px] text-gray-500">This ticket is closed. Closed tickets can&apos;t receive new replies.</p> : (
          <>
            <Field label="Reply to user"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={5000} className={textareaClass} placeholder="Type your response..." /></Field>
            <label className="mt-2 flex items-center gap-2 text-[12px] text-gray-600"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />Internal note (not sent to the user)</label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={busy || !text.trim()} onClick={() => void send()} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#4D145D] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#3C0F49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" aria-hidden />Send Reply</button>
              {ticket.status === "PENDING" ? <button type="button" disabled={busy} onClick={() => void setTicketStatus("UNDER_REVIEW")} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2.5 text-[13px] font-semibold text-[#2563EB] hover:bg-blue-100 disabled:opacity-50">Start Review</button> : null}
              {canResolve ? <button type="button" disabled={busy || text.trim().length < 5} title={text.trim().length < 5 ? "Type the resolution in the reply box first" : undefined} onClick={() => void setTicketStatus("RESOLVED", text.trim()).then(() => setText(""))} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#10B981] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#059669] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 className="h-4 w-4" aria-hidden />Resolve</button> : null}
              {canRefund ? <button type="button" disabled={busy} onClick={() => onRefund(ticket)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#D95C30] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#C24D25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D95C30] focus-visible:ring-offset-2 disabled:opacity-50"><DollarSign className="h-4 w-4" aria-hidden />Issue Refund</button> : null}
              {canClose ? <button type="button" disabled={busy} onClick={() => void setTicketStatus("CLOSED", ticket.status === "REJECTED" ? "Closed after rejection" : "Closed after resolution")} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"><X className="h-4 w-4" aria-hidden />Close</button> : null}
            </div>
            <p className="mb-2 mt-5 text-[12px] text-gray-500">Quick replies:</p>
            <div className="flex flex-wrap gap-2">{QUICK_REPLIES.map((quick) => <button key={quick} type="button" onClick={() => setText(quick)} className="max-w-[300px] cursor-pointer truncate rounded-lg border border-gray-200 px-3 py-2 text-left text-[12px] text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]" title={quick}>{quick}</button>)}</div>
            {canResolve ? <p className="mt-3 text-[12px] text-gray-500">Resolve uses the reply text as the recorded resolution.</p> : null}
          </>
        )}
      </section>
    </div>
  );
}
