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

export interface EditCategoryFormData {
  categoryName: string;
  platformFee: string | number;
  status: string;
}

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<EditCategoryFormData>;
  onSave?: (data: EditCategoryFormData) => void;
}

export function EditCategoryModal({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: EditCategoryModalProps) {
  // Form State initialized with fallback defaults matching the UI design
  const [formData, setFormData] = useState<EditCategoryFormData>({
    categoryName: initialValues?.categoryName ?? "Hair Extensions",
    platformFee: initialValues?.platformFee ?? "12",
    status: initialValues?.status ?? "",
  });

  // Keep internal form state in sync when initialValues prop updates
  useEffect(() => {
    if (initialValues) {
      setFormData({
        categoryName: initialValues.categoryName ?? "Hair Extensions",
        platformFee: initialValues.platformFee ?? "12",
        status: initialValues.status ?? "",
      });
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <DialogContent className="max-w-2xl! w-full p-4 sm:p-5 rounded-3xl bg-white shadow-2xl border-none">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            Edit Category
          </DialogTitle>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          {/* Category Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3F485E]">
              Category Name
            </label>
            <Input
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              placeholder="Enter category name"
              className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none"
            />
          </div>

          {/* Platform Fee (%) Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3F485E]">
              Platform Fee (%)
            </label>
            <Input
              type="text"
              name="platformFee"
              value={formData.platformFee}
              onChange={handleChange}
              placeholder="12"
              className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none"
            />
          </div>

          {/* Status Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3F485E]">
              Status
            </label>
            <Input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder=""
              className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-orange-500 shadow-none"
            />
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
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}