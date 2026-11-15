"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Check } from "lucide-react";

export type ModalMode = "view" | "edit" | "create";

export interface StylistData {
  fullName: string;
  email: string;
  phone: string;
  uploadId: string;
  location: string;
  bankAccount: string;
  specialty: string;
  referralCode: string;
  bankName?: string;
  tier?: "Bronze" | "Silver" | "Gold" | "Platinum";
  status?: string;
  isFlagged?: boolean;
  isKycApproved?: boolean;
  rating?: number;
  completedJobs?: number;
  plaitPoints?: number;
  avatarUrl?: string;
  revenue?: string;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    customer: { userId: string; name: string };
  }>;
}

interface StylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: ModalMode;
  initialData?: Partial<StylistData>;
  onSave?: (data: StylistData, mode: "edit" | "create") => void | Promise<void>;
  onSuspend?: () => void;
  onUpgrade?: () => void;
  onFlag?: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  actionError?: string | null;
}

const emptyData: StylistData = {
  fullName: "",
  email: "",
  phone: "",
  uploadId: "",
  location: "",
  bankAccount: "",
  specialty: "",
  referralCode: "",
  bankName: "",
};

export function StylistModal({
  open,
  onOpenChange,
  initialMode = "view",
  initialData,
  onSave,
  onSuspend,
  onUpgrade,
  onFlag,
  isLoading = false,
  isSaving = false,
  loadError = null,
  onRetry,
  actionError = null,
}: StylistModalProps) {
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [formData, setFormData] = useState<StylistData>(() =>
    initialMode === "create" ? emptyData : { ...emptyData, ...initialData },
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave || mode === "view") return;
    setSubmitError(null);
    try {
      await onSave(formData, mode);
      if (mode === "create") onOpenChange(false);
      else setMode("view");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "The stylist could not be saved.",
      );
    }
  };

  // Helper to render read-only view field vs active input field
  const renderField = (
    label: string,
    name:
      | "fullName"
      | "email"
      | "phone"
      | "uploadId"
      | "location"
      | "bankAccount"
      | "bankName"
      | "specialty"
      | "referralCode",
    type = "text",
  ) => {
    const isView = mode === "view";
    const readOnlyInEdit =
      mode === "edit" &&
      (name === "uploadId" ||
        name === "bankAccount" ||
        name === "bankName" ||
        name === "referralCode");
    const isEditable = !isView && !readOnlyInEdit;
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-800">{label}</label>
        {!isEditable ? (
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
            {name === "uploadId" && formData.uploadId ? (
              <a href={formData.uploadId} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 underline">
                View uploaded ID
              </a>
            ) : (
              <span className="text-xs text-gray-600 font-medium">
                {formData[name] || "—"}
              </span>
            )}
            {formData[name] && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
          </div>
        ) : (
          <Input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder={`Enter ${label.toLowerCase()}`}
            required={name === "fullName" || name === "email" || name === "phone" || name === "location" || name === "specialty"}
            className="h-10 rounded-xl border-gray-200 bg-white px-3.5 text-xs font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none"
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl! w-full p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border-none max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 pb-4 mb-2">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            {mode === "create"
              ? "Register New Stylist"
              : mode === "edit"
              ? "Edit Stylist Profile"
              : "Stylist Profile & Registration"}
          </DialogTitle>
        </DialogHeader>

        {/* Form & Content */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isLoading ? (
            <div className="space-y-3 py-6" aria-label="Loading stylist profile">
              <div className="h-16 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              {loadError}
              <button type="button" onClick={onRetry} className="mt-2 block font-semibold underline">
                Try again
              </button>
            </div>
          ) : (
          <>
          {/* Top Profile Section (Hidden in Create Mode) */}
          {mode !== "create" && (
            <>
              {/* Banner & Avatar */}
              <div className="relative pt-2">
                <div className="h-24 w-full bg-[#6A1B70] rounded-xl" />
                <div className="absolute -bottom-5 left-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-sm bg-white">
                    <Image
                      src={formData.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"}
                      alt={formData.fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Name & Badges */}
              <div className="pt-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {formData.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {formData.specialty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-[#E49A32] border border-[#FBE6C9]">
                    {formData.tier ?? "—"}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    formData.isKycApproved
                      ? "text-emerald-600 border-emerald-200"
                      : "text-amber-700 border-amber-200"
                  }`}>
                    {formData.isKycApproved
                      ? "Verified"
                      : formData.status === "Active"
                        ? "KYC pending"
                        : formData.status ?? "Pending"}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center space-y-0.5">
                  <p className="text-lg font-bold text-gray-900">{formData.rating?.toFixed(1) ?? "—"}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rating</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center space-y-0.5">
                  <p className="text-lg font-bold text-gray-900">{formData.completedJobs ?? "—"}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Completed Jobs</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center space-y-0.5">
                  <p className="text-lg font-bold text-gray-900">{formData.revenue ?? "—"}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Revenue</p>
                </div>
              </div>
            </>
          )}

          {/* Registration Details Container */}
          <div className="bg-[#F4F4F6] p-4 sm:p-5 rounded-2xl space-y-3.5">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
              <FileText className="w-4 h-4 text-gray-600" />
              <span>Registration Details (Submitted by Stylist)</span>
            </div>

            {/* Dynamic Fields */}
            {renderField("Full Name", "fullName")}
            {renderField("Email Address", "email", "email")}
            {renderField("Phone Number", "phone", "tel")}
            {renderField("Upload ID", "uploadId")}
            {renderField("Location / Area", "location")}
            {renderField("Bank Account (Payout)", "bankAccount")}
            {renderField("Bank Name", "bankName")}
            {renderField("Primary Specialty", "specialty")}
            {renderField("Referral Code", "referralCode")}
          </div>

          {mode !== "create" && (
            <div className="space-y-3 rounded-xl bg-[#F4F4F6] p-4">
              <p className="text-sm font-bold text-gray-800">Recent Reviews</p>
              {formData.reviews?.length ? (
                formData.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg bg-white p-3">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-gray-900">{review.customer.name}</span>
                      <span className="text-amber-600">★ {review.rating}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{review.comment || "No written comment"}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(review.createdAt))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No reviews yet.</p>
              )}
            </div>
          )}

          {/* Tier Progress (Hidden in Create Mode) */}
          {mode !== "create" && (
            <div className="bg-[#F4F4F6] p-3 sm:p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-600">
                  Tier &middot; <span className="font-semibold text-gray-900">{formData.tier ?? "—"}</span>
                </span>
                <span className="font-bold text-gray-500">{formData.plaitPoints ?? "—"} Plait Points</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {mode === "view" ? (
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <Button
                type="button"
                onClick={onUpgrade}
                disabled={formData.tier === "Platinum"}
                className="w-full bg-[#E05A32] hover:bg-[#d04e28] text-white font-semibold rounded-xl h-11 text-xs shadow-none"
              >
                {formData.tier === "Platinum" ? "Top Tier" : "Upgrade Tier"}
              </Button>
              <Button
                type="button"
                onClick={onFlag}
                className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-xl h-11 text-xs shadow-none"
              >
                {formData.isFlagged ? "Unflag" : "Flag"}
              </Button>
              <Button
                type="button"
                onClick={onSuspend}
                className="w-full col-span-2 bg-[#FF3B30] hover:bg-[#e03126] text-white font-semibold rounded-xl h-11 text-xs shadow-none"
              >
                {formData.status === "Suspended" ? "Reinstate" : "Suspend"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (mode === "create") {
                    onOpenChange(false);
                  } else {
                    if (initialData) setFormData({ ...emptyData, ...initialData });
                    setMode("view");
                  }
                }}
                className="w-1/3 h-12 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-2/3 h-12 rounded-xl bg-[#E05A32] hover:bg-[#d04e28] text-white font-semibold shadow-none"
              >
                {isSaving ? "Saving…" : mode === "create" ? "Send Invitation" : "Save Changes"}
              </Button>
            </div>
          )}
          {(submitError || actionError) && (
            <p className="text-sm text-red-700" role="alert">{submitError ?? actionError}</p>
          )}
          </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}