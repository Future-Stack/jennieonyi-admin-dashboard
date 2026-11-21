"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import { ReasonDialog } from "@/components/admin/common/Modal";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Download,
  Eye,
  Filter,
  Plus,
  Search,
  Shield,
  Star,
} from "lucide-react";
import { StylistModal } from "@/components/admin/stylist/StylistModal";
import type { ModalMode, StylistData } from "@/components/admin/stylist/StylistModal";
import { ApiError } from "@/lib/api/errors";
import { apiClient } from "@/lib/api-client";
import { formatNaira } from "@/lib/admin/dashboard";
import {
  buildPeopleListPath,
  useAccountAction,
  useCreateStylist,
  useFlagAdminUser,
  useStylistDetail,
  useStylists,
  useUpdateAdminUser,
  useUpdateStylistTier,
  type Stylist,
} from "@/lib/admin/people";

const PAGE_SIZE = 10;
const TABS = ["All", "Verified", "Pending", "Suspended"] as const;
const TIERS = ["Bronze", "Silver", "Gold", "Platinum"] as const;
type StylistTab = (typeof TABS)[number];

function formatStatus(stylist: Stylist): string {
  if (stylist.status === "SUSPEND") return "Suspended";
  if (stylist.status === "PENDING_APPROVAL") return "Pending";
  if (stylist.status === "REJECTED") return "Rejected";
  if (stylist.status === "INACTIVE") return "Inactive";
  return "Active";
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "The request could not be completed. Please try again.";
}

function toModalData(stylist: NonNullable<ReturnType<typeof useStylistDetail>["data"]>): StylistData {
  return {
    fullName: stylist.name,
    email: stylist.email,
    phone: stylist.phone,
    uploadId: stylist.idDocumentUrl ?? "",
    location: stylist.location ?? "",
    bankAccount: stylist.bank.maskedAccount
      ? `${stylist.bank.maskedAccount} · ${stylist.bank.isVerified ? "Verified" : "Unverified"}`
      : "",
    bankName: stylist.bank.bankName ?? "",
    specialty: stylist.specialties.join(", "),
    referralCode: stylist.referredBy?.agentCode ?? "",
    avatarUrl: stylist.avatar ?? undefined,
    rating: stylist.rating,
    completedJobs: stylist.completedJobs,
    revenue: formatNaira(stylist.revenue),
    tier: stylist.tier,
    status: formatStatus(stylist),
    plaitPoints: stylist.plaitPoints,
    isKycApproved: stylist.isKycApproved,
    isFlagged: stylist.isFlagged,
    reviews: stylist.reviews.map((review) => ({
      id: String(review.id),
      rating: Number(review.rating),
      comment: review.comment === null ? null : String(review.comment),
      createdAt: String(review.createdAt),
      customer: {
        userId: String(review.customer.userId),
        name: String(review.customer.name),
      },
    })),
  };
}

export default function StylistsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StylistTab>("All");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("view");
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search,
      ...(activeTab !== "All"
        ? { tab: activeTab.toUpperCase() }
        : {}),
      ...(flaggedOnly ? { isFlagged: true } : {}),
    }),
    [page, search, activeTab, flaggedOnly],
  );
  const stylistsQuery = useStylists(filters);
  const detailQuery = useStylistDetail(selectedStylistId);
  const createStylist = useCreateStylist();
  const updateStylist = useUpdateAdminUser();
  const updateTier = useUpdateStylistTier();
  const accountAction = useAccountAction();
  const flagUser = useFlagAdminUser();
  const stylists = stylistsQuery.data?.data ?? [];
  const meta = stylistsQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const selectedStylist = detailQuery.data;
  const modalData = selectedStylist ? toModalData(selectedStylist) : undefined;
  const isMutating =
    createStylist.isPending ||
    updateStylist.isPending ||
    updateTier.isPending ||
    accountAction.isPending ||
    flagUser.isPending;
  const errorMessage =
    actionError ??
    (createStylist.error ? getErrorMessage(createStylist.error) : null) ??
    (updateStylist.error ? getErrorMessage(updateStylist.error) : null) ??
    (updateTier.error ? getErrorMessage(updateTier.error) : null) ??
    (accountAction.error ? getErrorMessage(accountAction.error) : null) ??
    (flagUser.error ? getErrorMessage(flagUser.error) : null);

  const openCreate = () => {
    setSelectedStylistId(null);
    setActionError(null);
    setNotice(null);
    setModalMode("create");
    setIsOpen(true);
  };

  const openStylist = (stylist: Stylist, mode: ModalMode) => {
    setSelectedStylistId(stylist.userId);
    setActionError(null);
    setModalMode(mode);
    setIsOpen(true);
  };

  const exportStylists = async () => {
    setActionError(null);
    try {
      await apiClient.admin.download(
        buildPeopleListPath("stylists", filters, "csv"),
        `stylists-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const saveStylist = async (data: StylistData, mode: "create" | "edit") => {
    setActionError(null);
    try {
      const specialties = data.specialty
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (mode === "create") {
        const bankAccountNumber = data.bankAccount.trim();
        if (bankAccountNumber && !/^\d{10}$/.test(bankAccountNumber)) {
          throw new Error("Bank account number must contain exactly 10 digits.");
        }
        const invitation = await createStylist.mutateAsync({
          name: data.fullName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          locationArea: data.location.trim(),
          specialties,
          ...(bankAccountNumber ? { bankAccountNumber } : {}),
          ...(data.bankName?.trim() ? { bankName: data.bankName.trim() } : {}),
        });
        setNotice(
          invitation.setPasswordOtpSent
            ? "Stylist invitation created and the set-password OTP was sent."
            : "Stylist invitation created; OTP delivery was not confirmed.",
        );
        setIsOpen(false);
        return;
      }

      if (!selectedStylistId) return;
      await updateStylist.mutateAsync({
        userId: selectedStylistId,
        name: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        location: data.location.trim(),
        specialties,
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
      throw error;
    }
  };

  const upgradeTier = async () => {
    if (!selectedStylist) return;
    const currentIndex = TIERS.indexOf(selectedStylist.tier);
    const nextTier = TIERS[currentIndex + 1];
    if (!nextTier) return;
    setActionError(null);
    try {
      await updateTier.mutateAsync({
        userId: selectedStylist.userId,
        tier: nextTier,
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const [dialog, setDialog] = useState<"suspend" | "reinstate" | "flag" | null>(null);

  const changeAccountStatus = () => {
    if (!selectedStylist) return;
    setDialog(selectedStylist.status === "SUSPEND" ? "reinstate" : "suspend");
  };

  const toggleFlag = () => {
    if (selectedStylist) setDialog("flag");
  };

  const confirmDialog = async (reason: string) => {
    if (!selectedStylist || !dialog) return;
    setActionError(null);
    try {
      if (dialog === "flag") {
        await flagUser.mutateAsync({ userId: selectedStylist.userId, isFlagged: !selectedStylist.isFlagged, reason });
      } else {
        await accountAction.mutateAsync({ userId: selectedStylist.userId, action: dialog, ...(reason ? { reason } : {}) });
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setDialog(null);
    }
  };

  // `counts` (uppercase keys) feeds the tabs; `stats` (lowercase keys) feeds the summary cards.
  const counts = meta?.counts;
  const stats = meta?.stats;

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col overflow-y-auto bg-white p-1 md:p-8">
      <NotificationTarget onTarget={(id) => { setSelectedStylistId(id); setModalMode("view"); setIsOpen(true); }} />
      <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">Stylist Management</h1>
          <p className="mt-1 text-[14px] text-gray-500">Manage stylist profiles, approvals, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void exportStylists()} className="flex items-center gap-2 rounded-[6px] border border-gray-200 bg-[#F3F4F6] px-4 py-[10px] text-[14px] font-medium text-gray-600 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button type="button" onClick={openCreate} className="flex items-center gap-[6px] rounded-[6px] border border-[#D95C30] bg-[#D95C30] px-4 py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[#C24D25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]">
            <Plus className="h-4 w-4" />
            Add Stylist
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
          {notice}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Stylists", stats?.total ?? meta?.total, "text-[#4D145D]"],
          ["Verified", stats?.verified, "text-[#3BB515]"],
          ["Pending", stats?.pending, "text-[#D95C30]"],
          ["Suspended", stats?.suspended, "text-[#FF332C]"],
        ].map(([label, count, color]) => (
          <div key={label} className="rounded-[12px] border border-[#F0F1F3] bg-[#F0F1F3] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
            <div className={`text-[24px] font-bold ${color}`}>{typeof count === "number" ? count.toLocaleString("en-NG") : "—"}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex h-[46px] flex-wrap items-center rounded-[10px] border border-[#F3F4F6] bg-white p-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              aria-pressed={activeTab === tab}
              className={`flex h-[32px] items-center justify-center rounded-[8px] px-4 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] ${
                activeTab === tab
                  ? "bg-[#4D145D] text-white shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
              {counts?.[tab.toUpperCase()] !== undefined && (
                <span className="ml-1.5 text-[11px] opacity-80">{counts[tab.toUpperCase()]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-[40px] w-[260px] items-center gap-[6px] rounded-lg border border-gray-200 bg-white px-[12px] focus-within:ring-2 focus-within:ring-[#4D145D]">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search stylists..."
              aria-label="Search stylists"
              className="w-full border-none bg-transparent text-[13px] text-[#1E1E1E] outline-none placeholder:text-gray-400"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setFlaggedOnly((value) => !value);
              setPage(1);
            }}
            aria-pressed={flaggedOnly}
            className={`flex h-[40px] items-center justify-center gap-2 rounded-lg border px-5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] ${
              flaggedOnly ? "border-[#4D145D] bg-[#F3F0FF] text-[#4D145D]" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            {flaggedOnly ? "Flagged only" : "Filter"}
          </button>
        </div>
      </div>

      {stylistsQuery.isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>{getErrorMessage(stylistsQuery.error)}</p>
          <button type="button" onClick={() => void stylistsQuery.refetch()} className="mt-2 font-semibold underline">Try again</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="rounded-[12px] border border-[#EEF2FF]">
          <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
            <thead>
              <tr className="bg-[#4D145D] text-[11px] font-bold uppercase tracking-wider text-white">
                <th className="px-4 py-4 text-left">Stylist</th>
                <th className="px-4 py-4 text-center">Specialty</th>
                <th className="px-4 py-4 text-center">Rating</th>
                <th className="px-4 py-4 text-center">Jobs</th>
                <th className="px-4 py-4 text-center">Revenue</th>
                <th className="px-4 py-4 text-center">Tier</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="w-[150px] px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFFFF7]">
              {stylistsQuery.isLoading &&
                Array.from({ length: 6 }, (_, index) => (
                  <tr key={`skeleton-${index}`} aria-hidden="true">
                    {Array.from({ length: 8 }, (_, cell) => (
                      <td key={cell} className="border-b border-r border-[#EEF2FF] px-4 py-5"><div className="h-4 animate-pulse rounded bg-gray-200" /></td>
                    ))}
                  </tr>
                ))}
              {!stylistsQuery.isLoading && stylists.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <p className="font-semibold text-gray-800">No stylists found</p>
                    <p className="mt-1 text-sm text-gray-500">Try changing the search or filters.</p>
                  </td>
                </tr>
              )}
              {stylists.map((stylist) => (
                <tr key={stylist.userId} className="group transition-colors hover:bg-gray-50">
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3">
                    <div className="flex items-center gap-3">
                      {stylist.avatar ? (
                        <Image src={stylist.avatar} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F0FF] text-xs font-bold text-[#4D145D]" aria-hidden="true">{stylist.name.slice(0, 1).toUpperCase()}</div>
                      )}
                      <div>
                        <div className="text-[13px] font-bold text-gray-900">{stylist.name}</div>
                        <div className="mt-0.5 text-[12px] text-gray-400">{stylist.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] text-gray-600">{stylist.specialties.join(", ") || "—"}</td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] font-bold text-gray-900">
                    <span className="inline-flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-[#F59E0B]" />{stylist.rating.toFixed(1)}</span>
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] font-bold text-gray-900">{stylist.completedJobs}</td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] font-bold text-gray-900">{formatNaira(stylist.revenue)}</td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center">
                    <span className={`rounded-full border px-3 py-[2px] text-[12px] font-medium ${
                      stylist.tier === "Gold" ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]" :
                      stylist.tier === "Silver" ? "border-[#9CA3AF] bg-[#F3F4F6] text-[#6B7280]" :
                      stylist.tier === "Bronze" ? "border-[#D97706] bg-[#FFFBEB] text-[#B45309]" :
                      "border-[#3B82F6] bg-[#EFF6FF] text-[#2563EB]"
                    }`}>{stylist.tier}</span>
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-[2px] text-[12px] font-medium ${
                      stylist.status === "ACTIVE" ? "bg-[#3BB515] text-white" :
                      stylist.status === "PENDING_APPROVAL" ? "bg-[#D95C30] text-white" :
                      "bg-[#FF332C] text-white"
                    }`}>{formatStatus(stylist)}</span>
                    {stylist.isFlagged && <span className="ml-1 text-[11px] font-semibold text-amber-700">Flagged</span>}
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button type="button" onClick={() => openStylist(stylist, "view")} aria-label={`View ${stylist.name}`} className="text-blue-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Eye className="h-4 w-4" /></button>
                      <button type="button" onClick={() => openStylist(stylist, "edit")} aria-label={`Edit ${stylist.name}`} className="text-amber-500 transition-colors hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><span aria-hidden="true">✎</span></button>
                      <button type="button" onClick={() => openStylist(stylist, "view")} aria-label={`${stylist.isFlagged ? "Unflag" : "Flag"} ${stylist.name}`} className="text-yellow-500 transition-colors hover:text-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"><Shield className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex shrink-0 items-center justify-between bg-white">
        <span className="text-[13px] font-medium text-gray-400">
          {meta ? `Showing ${stylists.length} of ${meta.total} results` : "Loading stylists"}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || stylistsQuery.isFetching} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]">Previous</button>
          <span className="text-sm text-gray-500">{totalPages ? `${page} / ${totalPages}` : "—"}</span>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={!totalPages || page >= totalPages || stylistsQuery.isFetching} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]">Next</button>
        </div>
      </div>

      {isOpen && (
        <StylistModal
          key={`${selectedStylistId ?? "new"}-${modalMode}-${modalData ? "loaded" : "loading"}-${selectedStylist?.tier ?? ""}-${selectedStylist?.status ?? ""}-${selectedStylist?.isFlagged ?? ""}`}
          open={isOpen}
          onOpenChange={setIsOpen}
          initialMode={modalMode}
          initialData={modalMode === "create" ? undefined : modalData}
          isLoading={modalMode !== "create" && detailQuery.isLoading}
          loadError={modalMode !== "create" && detailQuery.isError ? getErrorMessage(detailQuery.error) : null}
          onRetry={() => void detailQuery.refetch()}
          actionError={errorMessage}
          isSaving={isMutating}
          onSave={saveStylist}
          onUpgrade={() => void upgradeTier()}
          onSuspend={() => void changeAccountStatus()}
          onFlag={() => void toggleFlag()}
        />
      )}
      <ReasonDialog
        open={dialog !== null}
        title={dialog === "flag" ? (selectedStylist?.isFlagged ? "Remove flag" : "Flag for review") : dialog === "reinstate" ? "Reinstate stylist" : "Suspend stylist"}
        message={selectedStylist ? (dialog === "flag" ? <>{selectedStylist.isFlagged ? "Remove the review flag from" : "Flag"} <strong>{selectedStylist.name}</strong>? The reason is kept in the audit log.</> : dialog === "reinstate" ? <>Reinstate <strong>{selectedStylist.name}</strong>? Their profile goes live again.</> : <>Suspend <strong>{selectedStylist.name}</strong>? They stop receiving bookings until reinstated.</>) : null}
        required={dialog === "flag"}
        confirmLabel={dialog === "flag" ? "Confirm" : dialog === "reinstate" ? "Reinstate" : "Suspend"}
        tone={dialog === "reinstate" ? "green" : dialog === "flag" ? "orange" : "red"}
        busy={accountAction.isPending || flagUser.isPending}
        onConfirm={(reason) => void confirmDialog(reason)}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
