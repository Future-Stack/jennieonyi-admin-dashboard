"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export interface CouponFormData {
  id?: string;
  couponCode: string;
  discountType: string;
  discountValue: string;
  minOrder: string;
  usageLimit: string;
  expiryDate: string;
}

interface CouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: Partial<CouponFormData>;
  onSave?: (data: CouponFormData) => void;
}

const defaultValues: CouponFormData = {
  couponCode: "",
  discountType: "Percentage",
  discountValue: "",
  minOrder: "",
  usageLimit: "",
  expiryDate: "",
};

export function CouponModal({
  open,
  onOpenChange,
  mode,
  initialValues,
  onSave,
}: CouponModalProps) {
  const [formData, setFormData] = useState<CouponFormData>(defaultValues);

  // Sync form data when the modal opens or initial values change
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        setFormData({ ...defaultValues, ...initialValues });
      } else {
        setFormData(defaultValues);
      }
    }
  }, [open, mode, initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl! w-full mx-1 md:mx-0 p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border-none">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            {mode === "edit" ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3F485E]">
                Coupon Code
              </label>
              <Input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                placeholder="BEAUTY30"
                required
                className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none placeholder:text-gray-400"
              />
            </div>

            {/* Discount Type Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3F485E]">
                Discount Type
              </label>
              <div className="relative">
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500 pr-10 cursor-pointer shadow-none"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Free Shipping">Free Shipping</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Discount Value Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3F485E]">
                Discount Value
              </label>
              <Input
                type="text"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder="30% or $20"
                required
                className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none placeholder:text-gray-400"
              />
            </div>

            {/* Min Order Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3F485E]">
                Min Order ($)
              </label>
              <Input
                type="text"
                name="minOrder"
                value={formData.minOrder}
                onChange={handleChange}
                placeholder="50"
                className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none placeholder:text-gray-400"
              />
            </div>

            {/* Usage Limit Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3F485E]">
                Usage Limit
              </label>
              <Input
                type="text"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                placeholder="100"
                className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none placeholder:text-gray-400"
              />
            </div>

            {/* Expiry Date Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3F485E]">
                Expiry Date
              </label>
              <Input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="Dec 31, 2025"
                className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-1/3 h-12 rounded-2xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 shadow-none"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-2/3 h-12 rounded-2xl bg-[#E05A32] hover:bg-[#d04e28] text-white font-semibold shadow-none"
            >
              {mode === "edit" ? "Save Changes" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}