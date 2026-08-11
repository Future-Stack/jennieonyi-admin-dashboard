"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Check,
  AlertCircle,
  Pencil,
  Save,
  X,
  Shield,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export interface UserProfileData {
  id?: number;
  code?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  status?: "Active" | "Pending" | "Suspended" | "Verified" | "Inactive";
  tier?: "Platinum" | "Gold" | "Silver" | "Bronze";
  referrals?: number;
  earned?: string;
  pendingPayout?: string;
  fullName?: string;
  registrationEmail?: string;
  phone?: string;
  address?: string;
  bankAccount?: string;
  termsAgreed?: string;
  joined?: string;
  bookings?: string;
  totalSpent?: string;
  userStatus?: string;
}

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: UserProfileData | null;
  onSave?: (updated: UserProfileData) => void;
  onFlag?: (data?: UserProfileData) => void;
  onSuspend?: (data?: UserProfileData) => void;
}

export function ViewUserProfileDetailsModal({
  open,
  onOpenChange,
  data,
  onSave,
  onFlag,
  onSuspend,
}: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileData>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync formData when data prop changes or modal opens
  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id,
        code: data.code || "AG001",
        name: data.name || "Emmanuel Asante",
        email: data.email || "e.asante@email.com",
        avatarUrl:
          data.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        status: data.status || "Active",
        tier: data.tier || "Platinum",
        referrals: data.referrals ?? 47,
        earned: data.earned || "$2,350",
        pendingPayout: data.pendingPayout || "$470",
        fullName: data.fullName || data.name || "Emmanuel Asante",
        registrationEmail: data.registrationEmail || data.email || "e.asante@email.com",
        phone: data.phone || "+1 555-0142",
        address: data.address || "—",
        bankAccount: data.bankAccount || "Ghana Commercial Bank - 4022****12",
        termsAgreed: data.termsAgreed || "Yes — Dec 2024",
        joined: data.joined || "Dec 2024",
        bookings: data.bookings || String(data.referrals || 47),
        totalSpent: data.totalSpent || data.earned || "$2,350",
        userStatus: data.userStatus || data.status || "Active",
      });
    } else {
      setFormData({});
    }
    setIsEditing(false);
    setSaveSuccess(false);
  }, [data, open]);

  const handleChange = (field: keyof UserProfileData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" ? { fullName: value } : {}),
      ...(field === "email" ? { registrationEmail: value } : {}),
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setIsEditing(false);
  };

  const handleFlagAction = () => {
    const updated = { ...formData, status: "Pending" as const, userStatus: "Pending" };
    setFormData(updated);
    if (onSave) onSave(updated);
    if (onFlag) onFlag(updated);
  };

  const handleSuspendAction = () => {
    const newStatus = formData.status === "Suspended" ? ("Active" as const) : ("Suspended" as const);
    const updated = { ...formData, status: newStatus, userStatus: newStatus };
    setFormData(updated);
    if (onSave) onSave(updated);
    if (onSuspend) onSuspend(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! w-full p-4 sm:p-5 rounded-2xl bg-white shadow-2xl border-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-gray-900 text-left">
              User Profile & Registration Details
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-0.5 text-left">
              Agent ID: <span className="font-semibold text-[#4D145D]">{formData.code || "AG001"}</span>
            </p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Saved successfully!
            </div>
          )}
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* User Profile Banner */}
          <div className="bg-[#F2EDF5] rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/50 bg-gray-200">
                <Image
                  src={formData.avatarUrl || "https://i.pravatar.cc/150?u=default"}
                  alt={formData.name || "User Avatar"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="text-base font-bold text-gray-900 border border-purple-300 rounded-lg px-2 py-1 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                      placeholder="Agent Name"
                    />
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="text-xs text-gray-600 border border-purple-300 rounded-lg px-2 py-1 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                      placeholder="Agent Email"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {formData.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">{formData.email}</p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {isEditing ? (
                    <select
                      value={formData.status || "Active"}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="text-xs font-semibold rounded-lg px-2 py-1 border border-purple-300 bg-white text-gray-800"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Verified">Verified</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${
                        formData.status === "Active" || formData.status === "Verified"
                          ? "bg-emerald-500"
                          : formData.status === "Pending"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    >
                      {formData.status}
                    </span>
                  )}

                  {isEditing ? (
                    <select
                      value={formData.tier || "Platinum"}
                      onChange={(e) => handleChange("tier", e.target.value)}
                      className="text-xs font-semibold rounded-lg px-2 py-1 border border-purple-300 bg-white text-gray-800"
                    >
                      <option value="Platinum">Platinum</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Bronze">Bronze</option>
                    </select>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-purple-300 text-[#4D145D] bg-purple-50">
                      {formData.tier} Tier
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-purple-200 text-[#4D145D] hover:bg-purple-50 font-semibold gap-1.5 rounded-xl text-xs shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Mode
              </Button>
            )}
          </div>

          {/* Registration Details Container */}
          <div className="bg-[#F4F4F6] p-4 sm:p-5 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between text-gray-800 font-bold text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span>Registration Details (Submitted by User)</span>
              </div>
              {isEditing && (
                <span className="text-xs font-normal text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                  Editing Mode Active
                </span>
              )}
            </div>

            {/* Form Field: Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full text-xs text-gray-800 font-medium bg-white px-3.5 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                />
              ) : (
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
                  <span className="text-xs text-gray-600 font-medium">{formData.fullName}</span>
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              )}
            </div>

            {/* Form Field: Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.registrationEmail || ""}
                  onChange={(e) => handleChange("registrationEmail", e.target.value)}
                  className="w-full text-xs text-gray-800 font-medium bg-white px-3.5 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                />
              ) : (
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
                  <span className="text-xs text-gray-600 font-medium">{formData.registrationEmail}</span>
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              )}
            </div>

            {/* Form Field: Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800">Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full text-xs text-gray-800 font-medium bg-white px-3.5 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                />
              ) : (
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
                  <span className="text-xs text-gray-600 font-medium">{formData.phone}</span>
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              )}
            </div>

            {/* Form Field: Address */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter address"
                  className="w-full text-xs text-gray-800 font-medium bg-white px-3.5 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                />
              ) : formData.address === "—" || !formData.address ? (
                <div className="flex items-center justify-between bg-[#FCE3E4] px-3.5 py-2.5 rounded-xl border border-rose-300">
                  <span className="text-xs text-rose-500 font-medium">— (Not Provided)</span>
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
                  <span className="text-xs text-gray-600 font-medium">{formData.address}</span>
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              )}
            </div>

            {/* Form Field: Bank Account */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800">Bank Account</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.bankAccount || ""}
                  onChange={(e) => handleChange("bankAccount", e.target.value)}
                  className="w-full text-xs text-gray-800 font-medium bg-white px-3.5 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                />
              ) : (
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
                  <span className="text-xs text-gray-600 font-medium">{formData.bankAccount}</span>
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              )}
            </div>

            {/* Form Field: Terms Agreed */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800">Terms Agreed</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.termsAgreed || ""}
                  onChange={(e) => handleChange("termsAgreed", e.target.value)}
                  className="w-full text-xs text-gray-800 font-medium bg-white px-3.5 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-[#4D145D]"
                />
              ) : (
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-transparent shadow-2xs">
                  <span className="text-xs text-gray-600 font-medium">{formData.termsAgreed}</span>
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Metrics & Performance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#EBEBEB]/70 p-3 rounded-xl space-y-0.5">
              <p className="text-[11px] font-medium text-gray-500">Referrals</p>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.referrals ?? 0}
                  onChange={(e) => handleChange("referrals", parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-purple-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <p className="text-xs font-bold text-[#4D145D]">{formData.referrals}</p>
              )}
            </div>

            <div className="bg-[#EBEBEB]/70 p-3 rounded-xl space-y-0.5">
              <p className="text-[11px] font-medium text-gray-500">Total Earned</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.earned || ""}
                  onChange={(e) => handleChange("earned", e.target.value)}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-purple-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <p className="text-xs font-bold text-emerald-600">{formData.earned}</p>
              )}
            </div>

            <div className="bg-[#EBEBEB]/70 p-3 rounded-xl space-y-0.5">
              <p className="text-[11px] font-medium text-gray-500">Pending Payout</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pendingPayout || ""}
                  onChange={(e) => handleChange("pendingPayout", e.target.value)}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-purple-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <p className="text-xs font-bold text-amber-600">{formData.pendingPayout}</p>
              )}
            </div>

            <div className="bg-[#EBEBEB]/70 p-3 rounded-xl space-y-0.5">
              <p className="text-[11px] font-medium text-gray-500">Joined</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.joined || ""}
                  onChange={(e) => handleChange("joined", e.target.value)}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-purple-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <p className="text-xs font-bold text-gray-800">{formData.joined}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1">
            {isEditing ? (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#4D145D] hover:bg-[#3d104a] text-white font-semibold rounded-xl h-11 text-xs gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl h-11 text-xs gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl h-11 text-xs gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Info
                </Button>
                <Button
                  onClick={handleFlagAction}
                  className="w-full bg-[#FFC107] hover:bg-[#e0a800] text-white font-semibold rounded-xl h-11 text-xs shadow-none gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Flag for Review
                </Button>
                <Button
                  onClick={handleSuspendAction}
                  className={`w-full text-white font-semibold rounded-xl h-11 text-xs shadow-none gap-1.5 ${
                    formData.status === "Suspended"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-[#FF3B30] hover:bg-[#e03126]"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {formData.status === "Suspended" ? "Reactivate Agent" : "Suspend"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}