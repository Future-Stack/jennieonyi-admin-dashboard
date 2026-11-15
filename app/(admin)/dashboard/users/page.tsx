"use client";

import { ReasonDialog } from "@/components/admin/common/Modal";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Download,
  Eye,
  MapPin,
  Search,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { apiClient } from "@/lib/api-client";
import { formatNaira } from "@/lib/admin/dashboard";
import {
  buildPeopleListPath,
  useAccountAction,
  useCustomerDetail,
  useCustomers,
  useFlagAdminUser,
  useUpdateAdminUser,
  type Customer,
} from "@/lib/admin/people";

const PAGE_SIZE = 10;

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatStatus(status: Customer["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PENDING_APPROVAL":
      return "Pending";
    case "SUSPEND":
      return "Suspended";
    case "REJECTED":
      return "Rejected";
    case "INACTIVE":
      return "Inactive";
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "The request could not be completed. Please try again.";
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", phone: "", location: "" });
  const [flagReason, setFlagReason] = useState("");
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search,
      ...(status ? { status } : {}),
      ...(flaggedOnly ? { isFlagged: true } : {}),
    }),
    [page, search, status, flaggedOnly],
  );
  const customersQuery = useCustomers(filters);
  const detailQuery = useCustomerDetail(viewUserId);
  const updateUser = useUpdateAdminUser();
  const flagUser = useFlagAdminUser();
  const accountAction = useAccountAction();
  const customer = detailQuery.data;
  const openCustomer = (user: Customer, flagImmediately = false) => {
    setViewUserId(user.userId);
    setActionError(null);
    setIsEditing(false);
    setDraft({
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location ?? "",
    });
    setIsFlagDialogOpen(flagImmediately);
  };

  const customers = customersQuery.data?.data ?? [];
  const meta = customersQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const isMutating =
    updateUser.isPending || flagUser.isPending || accountAction.isPending;

  const exportCustomers = async () => {
    setExportError(null);
    try {
      await apiClient.admin.download(
        buildPeopleListPath("customers", filters, "csv"),
        `customers-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch (error) {
      setExportError(getErrorMessage(error));
    }
  };

  const saveCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer) return;
    setActionError(null);
    try {
      await updateUser.mutateAsync({
        userId: customer.userId,
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        location: draft.location.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const submitFlag = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer || flagReason.trim().length < 5) return;
    setActionError(null);
    try {
      await flagUser.mutateAsync({
        userId: customer.userId,
        isFlagged: !customer.isFlagged,
        reason: flagReason.trim(),
      });
      setIsFlagDialogOpen(false);
      setFlagReason("");
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const [statusDialog, setStatusDialog] = useState<"suspend" | "reinstate" | null>(null);

  const requestStatusChange = () => {
    if (!customer) return;
    setStatusDialog(customer.status === "SUSPEND" ? "reinstate" : "suspend");
  };

  const changeAccountStatus = async (reason: string) => {
    if (!customer || !statusDialog) return;
    setActionError(null);
    try {
      await accountAction.mutateAsync({
        userId: customer.userId,
        action: statusDialog,
        ...(reason ? { reason } : {}),
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setStatusDialog(null);
    }
  };

  const showError = actionError ??
    (updateUser.error ? getErrorMessage(updateUser.error) : null) ??
    (flagUser.error ? getErrorMessage(flagUser.error) : null) ??
    (accountAction.error ? getErrorMessage(accountAction.error) : null);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col overflow-y-auto bg-white p-1 md:p-8">
      <div className="mb-8 flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">User Management</h1>
          <p className="mt-1 text-[14px] text-gray-500">Manage platform customers and their accounts</p>
        </div>
        <button
          type="button"
          onClick={() => void exportCustomers()}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#F3F4F6] px-4 py-2 text-[14px] font-medium text-gray-600 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {exportError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {exportError}
        </div>
      )}

      <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex h-[46px] items-center rounded-[10px] border border-[#F3F4F6] bg-white p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <span aria-label="Customer total" className="flex h-[32px] items-center justify-center gap-2 rounded-[8px] bg-[#4D145D] px-4 text-[13px] font-medium text-white">
            Customers
            <span className="rounded-[4px] bg-white/20 px-1.5 py-0.5 text-[11px]">
              {meta?.stats?.total ?? meta?.total ?? "—"}
            </span>
          </span>
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
              placeholder="Search customers..."
              aria-label="Search customers"
              className="w-full border-none bg-transparent text-[13px] text-[#1E1E1E] outline-none placeholder:text-gray-400"
            />
          </label>
          <button
            type="button"
            aria-pressed={flaggedOnly}
            onClick={() => {
              setFlaggedOnly((value) => !value);
              setPage(1);
            }}
            className={`flex h-[40px] items-center justify-center gap-2 rounded-lg border px-5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] ${
              flaggedOnly
                ? "border-[#4D145D] bg-[#F3F0FF] text-[#4D145D]"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Shield className="h-4 w-4" />
            {flaggedOnly ? "Flagged only" : "Filter"}
          </button>
          <div className="relative">
            <select
              id="customer-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter customers by status"
              className="h-[40px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-10 text-[13px] font-medium text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="SUSPEND">Suspended</option>
              <option value="REJECTED">Rejected</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {customersQuery.isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <p>{getErrorMessage(customersQuery.error)}</p>
          <button
            type="button"
            onClick={() => void customersQuery.refetch()}
            className="mt-2 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="rounded-[12px] border border-[#EEF2FF]">
          <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
            <thead>
              <tr className="bg-[#4D145D] text-[11px] font-bold uppercase tracking-wider text-white">
                <th className="px-4 py-4 text-left">Customer</th>
                <th className="px-4 py-4 text-left">Contact</th>
                <th className="px-4 py-4 text-center">Location</th>
                <th className="px-4 py-4 text-center">Joined</th>
                <th className="px-4 py-4 text-center">Bookings</th>
                <th className="px-4 py-4 text-center">Spent</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="w-[120px] px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFFFF7]">
              {customersQuery.isLoading &&
                Array.from({ length: 6 }, (_, index) => (
                  <tr key={`skeleton-${index}`} aria-hidden="true">
                    {Array.from({ length: 8 }, (_, cell) => (
                      <td key={cell} className="border-b border-r border-[#EEF2FF] px-4 py-5">
                        <div className="h-4 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!customersQuery.isLoading && customers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <UserRound className="mx-auto mb-3 h-8 w-8 text-gray-400" aria-hidden="true" />
                    <p className="font-semibold text-gray-800">No customers found</p>
                    <p className="mt-1 text-sm text-gray-500">Try changing the search or filters.</p>
                  </td>
                </tr>
              )}
              {customers.map((user) => (
                <tr key={user.userId} className="group transition-colors hover:bg-gray-50">
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F0FF] text-xs font-bold text-[#4D145D]" aria-hidden="true">
                          {user.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-[13px] font-bold text-gray-900">{user.name}</div>
                        <div className="mt-0.5 text-[11px] text-gray-400">{user.userId.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3">
                    <div className="text-[13px] font-medium text-gray-900">{user.email}</div>
                    <div className="mt-0.5 text-[12px] text-gray-400">{user.phone}</div>
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] text-gray-600">
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {user.location || "—"}
                    </span>
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] text-gray-600">{formatDate(user.createdAt)}</td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] font-bold text-gray-900">{user.bookingsCount}</td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center text-[13px] font-bold text-gray-900">{formatNaira(user.totalSpent)}</td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-[2px] text-[12px] font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-[#3BB515] text-white"
                        : user.status === "PENDING_APPROVAL"
                          ? "bg-[#D95C30] text-white"
                          : "bg-[#FF332C] text-white"
                    }`}>
                      {formatStatus(user.status)}
                    </span>
                    {user.isFlagged && <span className="ml-1 text-[11px] font-semibold text-amber-700">Flagged</span>}
                  </td>
                  <td className="border-b border-r border-[#EEF2FF] px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => openCustomer(user)}
                        aria-label={`View ${user.name}`}
                        className="text-blue-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openCustomer(user, true)}
                        aria-label={`${user.isFlagged ? "Unflag" : "Flag"} ${user.name}`}
                        className="text-yellow-500 transition-colors hover:text-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
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
          {meta ? `Showing ${customers.length} of ${meta.total} results` : "Loading customers"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1 || customersQuery.isFetching}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">{totalPages ? `${page} / ${totalPages}` : "—"}</span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={!totalPages || page >= totalPages || customersQuery.isFetching}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
          >
            Next
          </button>
        </div>
      </div>

      {customer && viewUserId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewUserId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-profile-title"
            className="hide-scrollbar flex max-h-[90vh] w-full max-w-[540px] flex-col overflow-y-auto rounded-[18px] bg-white px-6 pb-6"
          >
            <div className="flex shrink-0 items-center justify-between py-[18px]">
              <h2 id="customer-profile-title" className="text-[18px] font-bold text-[#1E1E1E]">User Profile</h2>
              <button
                type="button"
                onClick={() => setViewUserId(null)}
                aria-label="Close customer profile"
                className="text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailQuery.isLoading && (
              <div className="space-y-3 py-6" aria-label="Loading customer profile">
                <div className="h-16 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
              </div>
            )}
            {detailQuery.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                <p>{getErrorMessage(detailQuery.error)}</p>
                <button type="button" onClick={() => void detailQuery.refetch()} className="mt-2 font-semibold underline">Try again</button>
              </div>
            )}
            {customer && (
              <form onSubmit={saveCustomer} className="space-y-4">
                <div className="mb-4 flex shrink-0 items-center gap-3 rounded-[12px] bg-[#F3F0FF] px-4 py-4">
                  {customer.avatar ? (
                    <Image src={customer.avatar} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-[#4D145D]" aria-hidden="true">
                      {customer.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <p className="text-[16px] font-bold text-[#1E1E1E]">{customer.name}</p>
                    <p className="text-[13px] text-gray-500">{customer.email}</p>
                    <span className="self-start rounded-full bg-[#3BB515] px-3 py-[2px] text-[12px] font-medium text-white">{formatStatus(customer.status)}</span>
                  </div>
                </div>

                {showError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{showError}</p>}

                <div className="flex flex-col gap-3 rounded-[14px] bg-[#F0F1F3] p-4">
                  <p className="flex items-center gap-2 text-[13px] font-bold text-gray-700"><span aria-hidden="true">📋</span> Registration Details (Submitted by User)</p>
                  {([
                    ["Full Name", "name"],
                    ["Email Address", "email"],
                    ["Phone Number", "phone"],
                    ["Address", "location"],
                  ] as const).map(([label, key]) => (
                    <label key={key} className="block">
                      <span className="mb-1 block text-[14px] font-normal text-black">{label}</span>
                      <input
                        type={key === "email" ? "email" : "text"}
                        value={draft[key]}
                        readOnly={!isEditing}
                        required={key !== "location"}
                        onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))}
                        className={`w-full rounded-[10px] border border-[#F3F4F6] px-[10px] py-[10px] text-[14px] text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] ${
                          isEditing ? "bg-white" : "bg-white"
                        }`}
                      />
                    </label>
                  ))}
                  <div>
                    <span className="mb-1 block text-[14px] font-normal text-black">Bank Account</span>
                    <div className="flex items-center justify-between rounded-[10px] border border-[#F3F4F6] bg-white px-[10px] py-[10px] text-[14px] text-gray-700">
                      Not required (customer)
                      <Check className="h-4 w-4 shrink-0 text-[#00BC7D]" />
                    </div>
                  </div>
                  <div>
                    <span className="mb-1 block text-[14px] font-normal text-black">Terms Agreed</span>
                    <div className="flex items-center justify-between rounded-[10px] border border-[#F3F4F6] bg-white px-[10px] py-[10px] text-[14px] text-gray-700">
                      {customer.termsAgreedAt ? formatDate(customer.termsAgreedAt) : "Not recorded"}
                      {customer.termsAgreedAt && <Check className="h-4 w-4 shrink-0 text-[#00BC7D]" />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Joined", formatDate(customer.createdAt)],
                    ["Bookings", String(customer.bookingsCount)],
                    ["Total Spent", formatNaira(customer.totalSpent)],
                    ["Status", formatStatus(customer.status)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col rounded-[12px] bg-[#EAEAEA] p-3">
                      <p className="mb-1 text-[11px] text-gray-400">{label}</p>
                      <p className="text-[15px] font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={() => setIsEditing(false)} className="h-[42px] flex-1 rounded-[12px] border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="submit" disabled={isMutating} className="h-[42px] flex-1 rounded-[12px] bg-[#4D145D] text-[14px] font-medium text-white hover:bg-[#3D104A] disabled:opacity-60">
                        {updateUser.isPending ? "Saving…" : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => setIsEditing(true)} className="h-[42px] flex-1 rounded-[12px] border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50">Edit Profile</button>
                      <button type="button" onClick={() => setIsFlagDialogOpen(true)} className="h-[42px] flex-1 rounded-[12px] bg-[#F59E0B] text-[14px] font-medium text-white hover:bg-[#D97706]">
                        {customer.isFlagged ? "Remove Flag" : "Flag for Review"}
                      </button>
                      <button type="button" onClick={requestStatusChange} disabled={isMutating} className="h-[42px] flex-1 rounded-[12px] bg-[#FF332C] text-[14px] font-medium text-white hover:bg-[#DC2626] disabled:opacity-60">
                        {customer.status === "SUSPEND" ? "Reinstate" : "Suspend"}
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isFlagDialogOpen && customer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-3">
          <form onSubmit={submitFlag} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{customer.isFlagged ? "Remove customer flag" : "Flag customer for review"}</h3>
              <button type="button" onClick={() => setIsFlagDialogOpen(false)} aria-label="Close flag dialog" className="text-gray-500"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-gray-500">A reason is required for either flag action (at least 5 characters).</p>
            <textarea
              value={flagReason}
              onChange={(event) => setFlagReason(event.target.value)}
              minLength={5}
              maxLength={1000}
              required
              autoFocus
              className="min-h-24 w-full rounded-lg border border-gray-300 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D]"
              aria-label="Reason for flag change"
            />
            {showError && <p className="text-sm text-red-700" role="alert">{showError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFlagDialogOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700">Cancel</button>
              <button type="submit" disabled={flagReason.trim().length < 5 || flagUser.isPending} className="rounded-lg bg-[#4D145D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {flagUser.isPending ? "Saving…" : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
      <ReasonDialog
        open={statusDialog !== null}
        title={statusDialog === "reinstate" ? "Reinstate customer" : "Suspend customer"}
        message={customer ? (statusDialog === "reinstate" ? <>Reinstate <strong>{customer.name}</strong>? They can sign in and book again immediately.</> : <>Suspend <strong>{customer.name}</strong>? They are signed out and can&apos;t book or order until reinstated.</>) : null}
        confirmLabel={statusDialog === "reinstate" ? "Reinstate" : "Suspend"}
        tone={statusDialog === "reinstate" ? "green" : "red"}
        busy={accountAction.isPending}
        onConfirm={(reason) => void changeAccountStatus(reason)}
        onClose={() => setStatusDialog(null)}
      />
    </div>
  );
}
