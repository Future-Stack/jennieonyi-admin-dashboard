"use client";

import { NotificationTarget } from "@/components/admin/notifications/NotificationTarget";

import React, { useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import { findNotificationTarget } from "@/lib/admin/notification-target";
import { buildVerificationListPath, pendingServiceReviewSchema } from "@/lib/admin/people";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Play,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import {
  buildVerificationQueue,
  peopleQueryKeys,
  useApproveStylistKyc,
  usePendingStylistKyc,
  usePendingStylistServiceReviews,
  useRejectStylistKyc,
  useReviewStylistService,
  useStylistDetail,
  type VerificationQueueGroup,
} from "@/lib/admin/people";
import { formatNaira } from "@/lib/admin/dashboard";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 50;

type ReviewTarget =
  | { kind: "account"; userId: string }
  | { kind: "service"; serviceId: string };
function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "The request could not be completed. Please try again.";
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

export default function VideoVerificationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "account" | "service">("all");
  const [notificationGroup, setNotificationGroup] = useState<VerificationQueueGroup | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ReviewTarget | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const listFilters = useMemo(
    () => ({ page, limit: PAGE_SIZE, search }),
    [page, search],
  );
  const kycQuery = usePendingStylistKyc(listFilters);
  const serviceQuery = usePendingStylistServiceReviews(listFilters);
  const approveKyc = useApproveStylistKyc();
  const rejectKyc = useRejectStylistKyc();
  const reviewService = useReviewStylistService();
  const queue = useMemo(
    () =>
      buildVerificationQueue(
        kycQuery.data?.data ?? [],
        serviceQuery.data?.data ?? [],
      ),
    [kycQuery.data, serviceQuery.data],
  );
  const visibleQueue = queue.filter((group) =>
    filter === "account"
      ? group.accountPending
      : filter === "service"
        ? group.services.length > 0
        : true,
  );
  const selectedGroup = notificationGroup ?? (selectedUserId
    ? visibleQueue.find((group) => group.user.userId === selectedUserId) ?? null
    : visibleQueue[0] ?? null);
  const selectedDetail = useStylistDetail(selectedGroup?.user.userId ?? null);
  const selectedService =
    selectedGroup?.services.find((service) => service.id === selectedServiceId) ??
    selectedGroup?.services[0] ??
    null;
  const isMutating =
    approveKyc.isPending || rejectKyc.isPending || reviewService.isPending;
  const errorMessage =
    actionError ??
    (approveKyc.error ? getErrorMessage(approveKyc.error) : null) ??
    (rejectKyc.error ? getErrorMessage(rejectKyc.error) : null) ??
    (reviewService.error ? getErrorMessage(reviewService.error) : null);

  const selectGroup = (group: VerificationQueueGroup) => {
    setNotificationGroup(null);
    setSelectedUserId(group.user.userId);
    setSelectedServiceId(group.services[0]?.id ?? null);
    setActionError(null);
  };

  const approveAccount = async () => {
    if (!selectedGroup?.accountPending) return;
    setActionError(null);
    try {
      await approveKyc.mutateAsync({ userId: selectedGroup.user.userId });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.pendingStylistKyc });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const approveService = async (serviceId: string) => {
    setActionError(null);
    try {
      await reviewService.mutateAsync({ serviceId, status: "LIVE" });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.pendingServiceReviews });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const openReject = (target: ReviewTarget) => {
    setRejectTarget(target);
    setRejectReason("");
    setActionError(null);
  };

  const submitReject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rejectTarget || rejectReason.trim().length < 5) return;
    setActionError(null);
    try {
      if (rejectTarget.kind === "account") {
        await rejectKyc.mutateAsync({
          userId: rejectTarget.userId,
          reason: rejectReason.trim(),
        });
      } else {
        await reviewService.mutateAsync({
          serviceId: rejectTarget.serviceId,
          status: "REJECTED",
          adminNote: rejectReason.trim(),
        });
      }
      setRejectTarget(null);
      setRejectReason("");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const isLoading = kycQuery.isLoading || serviceQuery.isLoading;
  const isError = kycQuery.isError || serviceQuery.isError;
  const totalPages = Math.max(
    kycQuery.data?.meta.totalPages ?? 0,
    serviceQuery.data?.meta.totalPages ?? 0,
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col overflow-y-auto p-1 md:p-4">
      <NotificationTarget onTarget={async (id, signal) => {
        const target = await findNotificationTarget(id, async (targetPage) => {
          const result = await apiClient.admin.request(buildVerificationListPath("stylist-services/pending", { page: targetPage, limit: PAGE_SIZE, search: "" }), { method: "GET", signal }, (data) => z.array(pendingServiceReviewSchema).parse(data));
          return { rows: result.data, totalPages: z.object({ totalPages: z.number() }).parse(result.meta).totalPages };
        }, (row) => row.service.id, signal);
        setNotificationGroup({ user: target.user, services: [target.service], accountPending: false });
        setSelectedUserId(target.user.userId); setSelectedServiceId(target.service.id);
      }} />
      <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1E1E1E]">Video Verification Queue</h1>
          <p className="mt-1 text-[14px] text-gray-500">
            {visibleQueue.length} stylist{visibleQueue.length === 1 ? "" : "s"} awaiting review
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-[41px] w-[260px] items-center gap-[6px] rounded-[6px] border border-[#CFD4DB] bg-[#EAE8E8] px-[16px] focus-within:ring-2 focus-within:ring-[#4D145D]">
            <Search className="h-4 w-4 shrink-0 text-[#97A2B1]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search stylists..."
              aria-label="Search verification queue"
              className="w-full border-none bg-transparent text-[14px] text-[#1E1E1E] outline-none placeholder:text-[#97A2B1]"
            />
          </label>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            aria-label="Filter verification queue"
            className="h-[41px] rounded-[6px] border border-[#CFD4DB] bg-white px-3 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
          >
            <option value="all">All reviews</option>
            <option value="account">Account KYC</option>
            <option value="service">Service videos</option>
          </select>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>
            {kycQuery.isError && `Account review list: ${getErrorMessage(kycQuery.error)} `}
            {serviceQuery.isError && `Service video list: ${getErrorMessage(serviceQuery.error)}`}
          </p>
          <button
            type="button"
            onClick={() => {
              void kycQuery.refetch();
              void serviceQuery.refetch();
            }}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <section className="flex max-h-[60vh] w-full shrink-0 flex-col overflow-hidden rounded-[12px] border border-[#CFD4DB] bg-white shadow-sm lg:max-h-none lg:h-full lg:w-[580px]">
          <div className="flex h-[59px] shrink-0 items-center justify-between rounded-t-[11px] border-b border-[#CFD4DB] bg-[#4D145D] px-4">
            <span className="text-[15px] font-medium text-white">
              {visibleQueue.length} Pending Submissions
            </span>
            <div className="rounded-full bg-[#FFE4E6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#E11D48]">
              Review Required
            </div>
          </div>
          <div className="hide-scrollbar flex-1 overflow-y-auto">
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <div key={`queue-skeleton-${index}`} className="flex h-[92px] items-center gap-3 border-b border-[#F0F1F3] px-4" aria-hidden="true">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2"><div className="h-4 animate-pulse rounded bg-gray-200" /><div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" /></div>
                </div>
              ))}
            {!isLoading && visibleQueue.length === 0 && (
              <div className="px-5 py-14 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-[#3BB515]" aria-hidden="true" />
                <p className="font-semibold text-gray-800">No reviews waiting</p>
                <p className="mt-1 text-sm text-gray-500">New account and service submissions will appear here.</p>
              </div>
            )}
            {visibleQueue.map((group) => {
              const isSelected = selectedGroup?.user.userId === group.user.userId;
              const latestService = group.services[0];
              return (
                <button
                  type="button"
                  key={group.user.userId}
                  onClick={() => selectGroup(group)}
                  aria-pressed={isSelected}
                  className={`flex min-h-[92px] w-full items-center justify-between border-b-[0.5px] border-[#F0F1F3] px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4D145D] ${
                    isSelected ? "bg-[#F4F6F8]" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {group.user.avatar ? (
                      <Image src={group.user.avatar} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3F0FF] font-bold text-[#4D145D]" aria-hidden="true">{group.user.name.slice(0, 1).toUpperCase()}</span>
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-bold text-[#1E1E1E]">{group.user.name}</span>
                        {group.accountPending && <span className="rounded bg-[#E0E7FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">KYC</span>}
                      </span>
                      <span className="mt-1 line-clamp-1 text-[12px] leading-[16px] text-[#8390A2]">{latestService?.serviceName ?? "Account verification"}</span>
                      <span className="mt-1 text-[12px] leading-[16px] text-[#9B51E0]">
                        {group.services.length} service{group.services.length === 1 ? "" : "s"} submitted
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 pl-2 text-right text-[11px] leading-5 text-[#8390A2]">
                    {latestService ? formatTime(latestService.createdAt) : "KYC review"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-[#F0F1F3] px-4 py-3">
            <span className="text-xs text-gray-500">
              {totalPages ? `Page ${page} of ${totalPages}` : "No additional pages"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1 || isLoading}
                className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={!totalPages || page >= totalPages || isLoading}
                className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="hide-scrollbar min-w-0 flex-1 space-y-6 overflow-y-auto pb-6" aria-label="Selected verification details">
          {!selectedGroup && !isLoading && (
            <div className="flex min-h-64 items-center justify-center rounded-[12px] border border-[#CFD4DB] bg-white p-8 text-center text-sm text-gray-500">
              Select a pending submission to review its details.
            </div>
          )}
          {selectedGroup && (
            <>
              <div className="shrink-0 overflow-hidden rounded-[12px] border border-[#CFD4DB] bg-white shadow-sm">
                <div className="relative flex h-[320px] items-center justify-center overflow-hidden bg-black">
                  {selectedService?.verificationVideoUrl ? (
                    <video key={selectedService.verificationVideoUrl} className="h-full w-full object-contain" controls playsInline src={selectedService.verificationVideoUrl}>
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="px-6 text-center text-sm text-white/70">
                      <Play className="mx-auto mb-2 h-8 w-8" aria-hidden="true" />
                      No verification video attached to this submission.
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {selectedGroup.user.avatar ? (
                        <Image src={selectedGroup.user.avatar} alt="" width={60} height={60} className="h-[60px] w-[60px] shrink-0 rounded-full object-cover ring-4 ring-gray-50" />
                      ) : (
                        <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#F3F0FF] text-xl font-bold text-[#4D145D]" aria-hidden="true">{selectedGroup.user.name.slice(0, 1).toUpperCase()}</div>
                      )}
                      <div>
                        <h2 className="flex items-center gap-2 text-[22px] font-bold text-gray-900">{selectedGroup.user.name}</h2>
                        <p className="text-[14px] font-medium text-gray-500">{selectedService?.serviceName ?? "Stylist account review"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1.5 text-[13px] text-gray-500"><MapPin className="h-4 w-4" />{selectedDetail.data?.location ?? selectedGroup.user.location ?? "—"}</span>
                          <span className="flex items-center gap-1.5 text-[13px] text-gray-500"><Mail className="h-4 w-4" />{selectedGroup.user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-full border border-[#FFE0B2] bg-[#FFF4E5] px-4 py-1.5 text-[13px] font-bold text-[#FF9800]">
                      {selectedGroup.accountPending ? "Account & service review" : "Service review"}
                    </div>
                  </div>

                  {selectedDetail.isLoading && <div className="mt-6 h-20 animate-pulse rounded-xl bg-gray-100" aria-label="Loading stylist verification details" />}
                  {selectedDetail.isError && (
                    <p className="mt-4 text-sm text-red-700" role="alert">
                      {getErrorMessage(selectedDetail.error)}
                      <button type="button" onClick={() => void selectedDetail.refetch()} className="ml-2 font-semibold underline">Try again</button>
                    </p>
                  )}
                  <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-gray-500">ID Document</label>
                      <div className="rounded-xl border border-[#F0F1F3] bg-[#F8F9FA] px-4 py-3 text-[14px] font-medium text-gray-700">
                        {selectedDetail.data?.idDocumentUrl ? (
                          <a href={selectedDetail.data.idDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">View uploaded ID</a>
                        ) : "No document submitted"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-gray-500">KYC Status</label>
                      <div className="flex items-center gap-2 rounded-xl border border-[#F0F1F3] bg-[#F8F9FA] px-4 py-3 text-[14px] font-medium text-gray-700">
                        {selectedDetail.data?.isKycApproved ? "Approved" : selectedGroup.accountPending ? "Pending review" : "Not approved"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-gray-500">Bank Account</label>
                      <div className="rounded-xl border border-[#F0F1F3] bg-[#F8F9FA] px-4 py-3 font-mono text-[14px] font-medium text-gray-700">
                        {selectedDetail.data?.bank.maskedAccount
                          ? `${selectedDetail.data.bank.bankName ?? "Bank"} · ${selectedDetail.data.bank.maskedAccount} · ${selectedDetail.data.bank.isVerified ? "Verified" : "Unverified"}`
                          : "No bank details submitted"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-gray-500">Referral</label>
                      <div className="rounded-xl border border-[#F0F1F3] bg-[#F8F9FA] px-4 py-3 font-mono text-[14px] font-medium text-gray-700">
                        {selectedDetail.data?.referredBy?.agentCode ?? "No referral"}
                      </div>
                    </div>
                  </div>

                  {selectedGroup.accountPending && (
                    <div className="mt-8 flex flex-wrap gap-4">
                      <button type="button" disabled={isMutating} onClick={() => void approveAccount()} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#3BB515] text-[14px] font-bold text-white transition-colors hover:bg-[#2F9111] disabled:opacity-50">
                        <CheckCircle2 className="h-[18px] w-[18px]" /> Approve Stylist
                      </button>
                      <button type="button" disabled={isMutating} onClick={() => openReject({ kind: "account", userId: selectedGroup.user.userId })} className="flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#FF332C] text-[14px] font-bold text-white transition-colors hover:bg-[#E52D27] disabled:opacity-50">
                        <XCircle className="h-[18px] w-[18px]" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[12px] border border-[#F3F4F6] bg-[#FFFFF7] p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[18px] font-bold text-gray-900">Services Submitted</h3>
                    <p className="mt-0.5 text-[14px] text-gray-500">{selectedGroup.services.length} service{selectedGroup.services.length === 1 ? "" : "s"} awaiting review</p>
                  </div>
                  <span className="rounded-full bg-[#4D145D] px-3 py-1 text-[12px] font-bold text-white">{selectedGroup.services.length} Services</span>
                </div>
                {selectedGroup.services.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                    This account has no pending service videos.
                  </div>
                ) : (
                  selectedGroup.services.map((service) => (
                    <div key={service.id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#F0F1F3] bg-[#F8F9FA] p-5 lg:flex-row">
                      <button
                        type="button"
                        onClick={() => setSelectedServiceId(service.id)}
                        aria-pressed={selectedService?.id === service.id}
                        className="min-w-0 flex-1 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
                      >
                        <span className="mb-2 flex flex-wrap items-center gap-3">
                          <span className="text-[16px] font-bold text-gray-900">{service.serviceName}</span>
                          <span className="rounded border border-purple-200 bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-[#4D145D]">{service.userType}</span>
                        </span>
                        <span className="mb-3 block text-[14px] leading-relaxed text-gray-600">{service.description || "No service description provided."}</span>
                        <span className="flex flex-wrap items-center gap-3 text-[14px] font-bold text-gray-900">
                          <span>{formatNaira(service.price)}</span>
                          <span className="text-[#D1D5DB]">&bull;</span>
                          <span className="flex items-center gap-1.5 text-gray-500"><Clock className="h-3.5 w-3.5" />{service.serviceDuration}</span>
                          <span className="text-xs font-normal text-gray-400">Home add-on {formatNaira(service.homeServiceAddon)}</span>
                        </span>
                      </button>
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                        <button type="button" disabled={isMutating} onClick={() => void approveService(service.id)} className="flex items-center justify-center gap-2 rounded-lg bg-[#3BB515] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#2F9111] disabled:opacity-50">
                          <CheckCircle2 className="h-4 w-4" /> Approve Service
                        </button>
                        <button type="button" disabled={isMutating} onClick={() => openReject({ kind: "service", serviceId: service.id })} className="flex items-center justify-center gap-2 rounded-lg bg-[#FF332C] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#E52D27] disabled:opacity-50">
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3" onMouseDown={(event) => event.target === event.currentTarget && setRejectTarget(null)}>
          <form onSubmit={submitReject} className="flex w-full max-w-[384px] flex-col gap-5 rounded-[16px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-[18px] font-bold text-gray-900">Reject Submission</h3>
              <button type="button" onClick={() => setRejectTarget(null)} aria-label="Close reject dialog" className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-[14px] leading-relaxed text-gray-500">
              {rejectTarget.kind === "account"
                ? "Provide a reason for rejecting this stylist account. At least 5 characters are required."
                : "Provide an admin note for rejecting this service video. At least 5 characters are required."}
            </p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              minLength={5}
              maxLength={1000}
              required
              autoFocus
              className="h-[100px] w-full resize-none rounded-lg border border-[#CFD4DB] px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-[#4D145D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
              placeholder="Enter rejection reason..."
              aria-label="Rejection reason"
            />
            {errorMessage && <p className="text-sm text-red-700" role="alert">{errorMessage}</p>}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setRejectTarget(null)} className="h-[40px] rounded-[8px] border border-[#D1D5DB] bg-white px-5 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={rejectReason.trim().length < 5 || isMutating} className="h-[40px] flex-1 rounded-[8px] bg-[#FF332C] text-[14px] font-bold text-white transition-colors hover:bg-[#E52D27] disabled:opacity-50">
                {isMutating ? "Submitting…" : "Confirm Rejection"}
              </button>
            </div>
          </form>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  );
}
