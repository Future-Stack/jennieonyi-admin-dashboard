"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import { useState } from "react";
import { Download, Eye, RefreshCw, UserCheck, Users, Wallet, Clock } from "lucide-react";
import Headers from "@/components/admin/common/Headers";
import { DataTable, PersonCell, Pagination, SearchBox, StatCard, StatusPill, TabBar, errorText, PAGE_SIZE } from "@/components/admin/common/kit";
import { Notice } from "@/components/admin/common/Modal";
import { AgentProfileModal, agentStatusLabel, agentStatusTone } from "@/components/admin/agents/AgentProfileModal";
import { ProviderActionModal, type ActionKind, type ProviderTarget } from "@/components/admin/vendors/VendorModals";
import { formatDate, formatNaira } from "@/lib/admin/format";
import { directoryPath, agentSchema, useAgents, useReferrals, type Agent } from "@/lib/admin/vendors-agents";
import { useDebounced } from "@/lib/admin/use-debounced";
import { apiClient } from "@/lib/api-client";

const TIER_TONE = { Bronze: "orange", Silver: "gray", Gold: "amber", Platinum: "purple" } as const;
const AGENT_COLUMNS = [{ key: "agent", label: "Agent" }, { key: "email", label: "Email" }, { key: "referrals", label: "Referrals", className: "text-center" }, { key: "earned", label: "Earned", className: "text-center" }, { key: "pending", label: "Pending Payout", className: "text-center" }, { key: "tier", label: "Tier", className: "text-center" }, { key: "status", label: "Status", className: "text-center" }, { key: "actions", label: "Action", className: "text-center" }];
const REFERRAL_COLUMNS = [{ key: "agent", label: "Agent" }, { key: "stylist", label: "Referred Stylist" }, { key: "status", label: "Stylist Status", className: "text-center" }, { key: "verified", label: "Verified" }, { key: "commission", label: "Commission Earned", className: "text-center" }, { key: "date", label: "Referred" }];
const toTarget = (agent: Agent): ProviderTarget => ({ userId: agent.userId, displayName: agent.name, name: agent.agentCode, email: agent.email, avatar: agent.avatar });

export default function AgentsPage() {
  const [tab, setTab] = useState<"agents" | "referrals">("agents");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tier, setTier] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [profile, setProfile] = useState<Agent | null>(null);
  const [action, setAction] = useState<{ provider: ProviderTarget; action: ActionKind } | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const debounced = useDebounced(search);
  const agentFilters = { page, limit: PAGE_SIZE, search: debounced.trim(), ...(status ? { status } : {}), ...(tier ? { tier } : {}) };
  const agents = useAgents(agentFilters);
  const referrals = useReferrals({ page, limit: PAGE_SIZE, search: debounced.trim(), ...(status ? { status } : {}) });
  const overview = useAgents({ page: 1, limit: 1, search: "" });
  const stats = overview.data?.meta.stats ?? {};
  const active = tab === "agents" ? agents : referrals;
  const meta = active.data?.meta;
  const agentRows = agents.data?.data ?? [];
  const referralRows = referrals.data?.data ?? [];
  const notify = (kind: "success" | "error", text: string) => setNotice({ kind, text });
  const openAction = (agent: Agent, kind: ActionKind) => { setProfile(null); setAction({ provider: toTarget(agent), action: kind }); };

  async function exportCsv() {
    try { await apiClient.admin.download(directoryPath(tab === "agents" ? "street-agents" : "street-agents/referrals", { page: 1, limit: 100, search: debounced.trim(), ...(status ? { status } : {}), ...(tab === "agents" && tier ? { tier } : {}) }, "csv"), tab === "agents" ? "street-agents.csv" : "agent-referrals.csv"); }
    catch (cause) { notify("error", errorText(cause) ?? "The export failed."); }
  }
  function refresh() { void active.refetch(); void overview.refetch(); }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-white p-1 md:p-8">
      <NotificationTarget onTarget={async (id, signal) => { const result = await apiClient.admin.request(`street-agents/${encodeURIComponent(id)}`, { method: "GET", signal }, (data) => agentSchema.parse(data)); if (!signal.aborted) setProfile(result.data); }} />
      <Headers title="Street Agent" description="Manage platform agents and the stylists they refer" buttonOneIcon={<Download className="h-4 w-4" />} buttonOneText="Export CSV" buttonOneAction={() => void exportCsv()} buttonTwoIcon={<RefreshCw className="h-4 w-4" />} buttonTwoText="Refresh" buttonTwoAction={refresh} buttonTwoDisabled={active.isFetching} />
      <Notice notice={notice} onDismiss={() => setNotice(null)} />
      <section aria-label="Agent totals" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Agents" value={(stats.total ?? 0).toLocaleString("en-NG")} loading={overview.isLoading} tone="#7C3AED" icon={<UserCheck className="h-[18px] w-[18px] text-[#A855F7]" aria-hidden />} />
        <StatCard label="Total Referrals" value={(stats.referrals ?? 0).toLocaleString("en-NG")} loading={overview.isLoading} tone="#2563EB" icon={<Users className="h-[18px] w-[18px] text-[#3B82F6]" aria-hidden />} />
        <StatCard label="Total Commissions" value={formatNaira(stats.totalEarned ?? 0)} loading={overview.isLoading} tone="#3BB515" icon={<Wallet className="h-[18px] w-[18px] text-[#3BB515]" aria-hidden />} />
        <StatCard label="Pending Payouts" value={formatNaira(stats.pendingPayout ?? 0)} loading={overview.isLoading} tone="#D95C30" icon={<Clock className="h-[18px] w-[18px] text-[#D95C30]" aria-hidden />} />
      </section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TabBar label="Agent views" active={tab} onChange={(key) => { setTab(key as "agents" | "referrals"); setPage(1); }} tabs={[{ key: "agents", label: "Street Agents" }, { key: "referrals", label: "Agent Referrals" }]} />
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox label={tab === "agents" ? "Search agents" : "Search referrals"} placeholder={tab === "agents" ? "Search agents..." : "Search referrals..."} value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
          <button type="button" aria-expanded={showFilter} onClick={() => setShowFilter((open) => !open)} className="h-[40px] cursor-pointer rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]">Filter{status || tier ? " (on)" : ""}</button>
        </div>
      </div>
      {showFilter ? (
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-[10px] border border-gray-200 bg-gray-50 p-4">
          <label className="text-[13px] font-medium text-gray-700">Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="mt-1.5 block h-[40px] w-44 rounded-lg border border-gray-200 bg-white px-3 text-[14px]"><option value="">Any</option><option value="ACTIVE">Active</option><option value="PENDING_APPROVAL">Pending</option><option value="SUSPEND">Suspended</option><option value="REJECTED">Rejected</option></select></label>
          {tab === "agents" ? <label className="text-[13px] font-medium text-gray-700">Tier<select value={tier} onChange={(event) => { setTier(event.target.value); setPage(1); }} className="mt-1.5 block h-[40px] w-44 rounded-lg border border-gray-200 bg-white px-3 text-[14px]"><option value="">Any</option>{["Bronze", "Silver", "Gold", "Platinum"].map((t) => <option key={t} value={t}>{t}</option>)}</select></label> : null}
          <button type="button" onClick={() => { setStatus(""); setTier(""); setPage(1); }} className="h-[40px] cursor-pointer px-2 text-[13px] font-medium text-[#4D145D] hover:underline">Clear filters</button>
        </div>
      ) : null}
      {tab === "agents" ? (
        <DataTable columns={AGENT_COLUMNS} loading={agents.isLoading} error={errorText(agents.error)} empty={agentRows.length === 0} onRetry={() => void agents.refetch()}>
          {agentRows.map((agent) => (
            <tr key={agent.userId} className="hover:bg-[#F8F6FA]">
              <td className="px-4 py-3"><div className="flex items-center gap-2.5"><PersonCell name={agent.name} avatar={agent.avatar} /><span className="text-[11px] text-gray-400">{agent.agentCode}</span></div></td>
              <td className="px-4 py-3 text-[12px] text-gray-700">{agent.email}</td>
              <td className="px-4 py-3 text-center text-[13px] font-bold text-[#4D145D]">{agent.referralsCount}</td>
              <td className="px-4 py-3 text-center text-[13px] font-bold text-[#059669]">{formatNaira(agent.totalEarned)}</td>
              <td className="px-4 py-3 text-center text-[13px] font-bold text-[#D95C30]">{formatNaira(agent.pendingPayout)}</td>
              <td className="px-4 py-3 text-center"><StatusPill status={agent.tier} tone={TIER_TONE[agent.tier]} /></td>
              <td className="px-4 py-3 text-center"><StatusPill status={agent.status} label={agentStatusLabel(agent.status)} tone={agentStatusTone(agent.status)} /></td>
              <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
                <button type="button" aria-label={`View ${agent.name}`} onClick={() => setProfile(agent)} className="cursor-pointer rounded-md p-1.5 text-[#3B82F6] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Eye className="h-4 w-4" /></button>
                {agent.status === "PENDING_APPROVAL" ? <>
                  <button type="button" onClick={() => openAction(agent, "approve")} className="cursor-pointer rounded-full bg-[#3BB515] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#2F9E0F]">Approve</button>
                  <button type="button" onClick={() => openAction(agent, "reject")} className="cursor-pointer rounded-full bg-[#FF332C] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#DC2626]">Reject</button>
                </> : agent.status === "SUSPEND" ? <button type="button" onClick={() => openAction(agent, "reinstate")} className="cursor-pointer rounded-full bg-[#3BB515] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#2F9E0F]">Reinstate</button>
                  : agent.status === "ACTIVE" ? <button type="button" onClick={() => openAction(agent, "suspend")} className="cursor-pointer rounded-full bg-[#FFC107] px-2.5 py-0.5 text-[11px] font-medium text-white hover:bg-[#E0A800]">Suspend</button> : null}
              </div></td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <DataTable columns={REFERRAL_COLUMNS} loading={referrals.isLoading} error={errorText(referrals.error)} empty={referralRows.length === 0} onRetry={() => void referrals.refetch()}>
          {referralRows.map((row) => (
            <tr key={row.id} className="hover:bg-[#F8F6FA]">
              <td className="px-4 py-3"><PersonCell name={row.agentName} /></td>
              <td className="px-4 py-3"><PersonCell name={row.stylistName} /></td>
              <td className="px-4 py-3 text-center"><StatusPill status={row.status} label={agentStatusLabel(row.status)} tone={agentStatusTone(row.status)} /></td>
              <td className="px-4 py-3 text-[12px] text-gray-600">{row.verifiedAt ? formatDate(row.verifiedAt) : "Not yet verified"}</td>
              <td className="px-4 py-3 text-center text-[13px] font-bold text-[#059669]">{formatNaira(row.commissionEarned)}</td>
              <td className="px-4 py-3 text-[12px] text-gray-600">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </DataTable>
      )}
      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} total={meta?.total ?? 0} shown={tab === "agents" ? agentRows.length : referralRows.length} onPage={setPage} noun={tab === "agents" ? "agents" : "referrals"} />
      <AgentProfileModal agent={profile} onClose={() => setProfile(null)} onAction={openAction} onNotice={notify} />
      <ProviderActionModal noun="agent" target={action} onClose={() => setAction(null)} onNotice={notify} />
    </div>
  );
}
