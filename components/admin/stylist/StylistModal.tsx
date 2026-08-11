"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

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
  // Stats & Profile (Typically not editable here)
  avatarUrl?: string;
  products?: string;
  orders?: string;
  revenue?: string;
  tierProgress?: number;
}

interface StylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: ModalMode;
  initialData?: Partial<StylistData>;
  onSave?: (data: StylistData, mode: "edit" | "create") => void;
  onSuspend?: () => void;
  onUpgrade?: () => void;
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
};

export function StylistModal({
  open,
  onOpenChange,
  initialMode = "view",
  initialData,
  onSave,
  onSuspend,
  onUpgrade,
}: StylistModalProps) {
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [formData, setFormData] = useState<StylistData>(emptyData);

  // Sync mode and data when modal opens or props change
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      if (initialMode === "create") {
        setFormData(emptyData);
      } else if (initialData) {
        setFormData({ ...emptyData, ...initialData });
      }
    }
  }, [open, initialMode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData, mode as "create" | "edit");
    }
    if (mode === "create") {
      onOpenChange(false);
    } else {
      setMode("view");
    }
  };

  // Helper to render read-only view field vs active input field
  const renderField = (label: string, name: keyof StylistData, type = "text") => {
    const isView = mode === "view";
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-800">{label}</label>
        {isView ? (
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
            <span className="text-xs text-gray-400 font-medium">
              {formData[name] || "—"}
            </span>
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        ) : (
          <Input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder={`Enter ${label.toLowerCase()}`}
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
                    Gold
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-600 border border-emerald-200">
                    Verified
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center space-y-0.5">
                  <p className="text-lg font-bold text-gray-900">{formData.products || "4.9"}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Products</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center space-y-0.5">
                  <p className="text-lg font-bold text-gray-900">{formData.orders || "287"}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Orders</p>
                </div>
                <div className="bg-[#F8F9FA] p-3 rounded-xl flex flex-col items-center justify-center space-y-0.5">
                  <p className="text-lg font-bold text-gray-900">{formData.revenue || "$12,450"}</p>
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
            {renderField("Primary Specialty", "specialty")}
            {renderField("Referral Code", "referralCode")}
          </div>

          {/* Tier Progress (Hidden in Create Mode) */}
          {mode !== "create" && (
            <div className="bg-[#F4F4F6] p-3 sm:p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-600">
                  Tier Progress &middot; <span className="font-semibold text-gray-900">Gold &rarr; Platinum</span>
                </span>
                <span className="font-bold text-gray-500">{formData.tierProgress || 287}/500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#E05A32] h-full rounded-full"
                  style={{ width: `${((formData.tierProgress || 287) / 500) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {mode === "view" ? (
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <Button
                type="button"
                onClick={onUpgrade}
                className="w-full bg-[#E05A32] hover:bg-[#d04e28] text-white font-semibold rounded-xl h-11 text-xs shadow-none"
              >
                Upgrade Tier
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => setMode("edit")}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl h-11 text-xs gap-1.5 shadow-none"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button> */}
              <Button
                type="button"
                onClick={onSuspend}
                className="w-full col-span-2 bg-[#FF3B30] hover:bg-[#e03126] text-white font-semibold rounded-xl h-11 text-xs shadow-none"
              >
                Suspend
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
                className="w-2/3 h-12 rounded-xl bg-[#E05A32] hover:bg-[#d04e28] text-white font-semibold shadow-none"
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}