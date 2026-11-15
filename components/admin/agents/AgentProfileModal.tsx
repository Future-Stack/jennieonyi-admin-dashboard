"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { Avatar, StatusPill } from "@/components/admin/common/kit";
import { GhostButton, Modal, PrimaryButton, inputClass } from "@/components/admin/common/Modal";
import { formatDate, formatNaira } from "@/lib/admin/format";
import { useAgentTier, useReferrals, type Agent } from "@/lib/admin/vendors-agents";
import { ApiError } from "@/lib/api/errors";
import type { ActionKind } from "@/components/admin/vendors/VendorModals";

const TIERS = ["Bronze", "Silver", "Gold", "Platinum"] as const;
export const agentStatusLabel = (status: string) => (status === "ACTIVE" ? "Active" : status === "PENDING_APPROVAL" ? "Pending" : status === "SUSPEND" ? "Suspended" : "Rejected");
export const agentStatusTone = (status: string) => (status === "ACTIVE" ? "green" : status === "SUSPEND" || status === "REJECTED" ? "red" : "amber") as "green" | "red" | "amber";

export function AgentProfileModal({ agent, onClose, onAction, onNotice }: { agent: Agent | null; onClose: () => void; onAction: (agent: Agent, action: ActionKind) => void; onNotice: (kind: "success" | "error", text: string) => void }) {
  const referrals = useReferrals(agent ? { page: 1, limit: 5, search: "", agentId: agent.agentId } : { page: 1, limit: 1, search: "" });
  const tier = useAgentTier();
  async function changeTier(next: (typeof TIERS)[number]) {
    if (!agent || next === agent.tier) return;
    try { await tier.mutateAsync({ id: agent.userId, tier: next }); onNotice("success", `${agent.name} is now ${next} tier.`); onClose(); }
    catch (cause) { onNotice("error", cause instanceof ApiError ? cause.message : "Could not change the tier."); }
  }
  const footer = !agent ? undefined : agent.status === "PENDING_APPROVAL" ? <><GhostButton onClick={() => onAction(agent, "reject")}>Reject</GhostButton><PrimaryButton tone="green" onClick={() => onAction(agent, "approve")}>Approve Agent</PrimaryButton></>
    : agent.status === "SUSPEND" ? <PrimaryButton tone="green" onClick={() => onAction(agent, "reinstate")}>Reinstate Agent</PrimaryButton>
    : agent.status === "ACTIVE" ? <PrimaryButton tone="orange" onClick={() => onAction(agent, "suspend")}>Suspend Agent</PrimaryButton> : <GhostButton onClick={onClose}>Close</GhostButton>;
  return (
    <Modal open={!!agent} onClose={onClose} title="Agent Profile" width="max-w-[580px]" footer={footer}>
      {agent ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4"><Avatar name={agent.name} src={agent.avatar} size={52} /><div className="min-w-0 flex-1"><h3 className="truncate text-[20px] font-bold text-gray-900">{agent.name}</h3><p className="text-[13px] text-gray-500">Agent code {agent.agentCode}</p></div><StatusPill status={agent.status} label={agentStatusLabel(agent.status)} tone={agentStatusTone(agent.status)} /></div>
          <dl className="grid grid-cols-3 gap-3">
            {[["Referrals", String(agent.referralsCount)], ["Total earned", formatNaira(agent.totalEarned)], ["Pending payout", formatNaira(agent.pendingPayout)]].map(([label, value]) => <div key={label} className="rounded-[12px] bg-[#F9FAFB] p-3 text-center"><dd className="text-[15px] font-bold text-gray-900">{value}</dd><dt className="mt-0.5 text-[11px] text-gray-500">{label}</dt></div>)}
          </dl>
          <div className="grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
            <p className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-gray-400" aria-hidden />{agent.email}</p>
            <p className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4 text-gray-400" aria-hidden />{agent.phone}</p>
            <p className="flex items-center gap-2 text-gray-700"><MapPin className="h-4 w-4 text-gray-400" aria-hidden />{agent.location ?? "No location on file"}</p>
            <p className="text-gray-700"><span className="text-gray-500">Joined </span>{formatDate(agent.createdAt)}</p>
          </div>
          <label className="flex items-center justify-between gap-3 rounded-[12px] border border-gray-100 p-3 text-[13px] font-medium text-gray-700">Tier
            <select value={agent.tier} disabled={tier.isPending} onChange={(event) => void changeTier(event.target.value as (typeof TIERS)[number])} className={`${inputClass} w-40`}>{TIERS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          </label>
          <section aria-label="Recent referrals"><h4 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-gray-400">Recent referrals</h4>
            {referrals.isLoading ? <div className="h-12 animate-pulse rounded bg-gray-100" /> : referrals.error ? <p role="alert" className="text-[13px] text-red-700">{referrals.error.message}</p> : (referrals.data?.data.length ?? 0) === 0 ? <p className="text-[13px] text-gray-500">No stylists have been referred yet.</p> : (
              <ul className="divide-y divide-gray-100 text-[13px]">{referrals.data?.data.map((row) => <li key={row.id} className="flex items-center justify-between gap-3 py-2"><span><span className="block font-medium text-gray-900">{row.stylistName}</span><span className="text-[12px] text-gray-500">Referred {formatDate(row.createdAt)}</span></span><span className="flex items-center gap-2"><span className="font-semibold text-[#059669]">{formatNaira(row.commissionEarned)}</span><StatusPill status={row.status} label={agentStatusLabel(row.status)} tone={agentStatusTone(row.status)} /></span></li>)}</ul>
            )}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
