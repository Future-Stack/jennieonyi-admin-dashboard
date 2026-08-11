"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Database, Pencil } from "lucide-react";
import { EditCategoryModal } from "./EditCategoryModal";

// Define TypeScript Interface for the Category Details
export interface CategoryData {
  title?: string;
  status?: "Active" | "Inactive";
  orderDate?: string;
  tracking?: string | number;
  totalSales?: string | number;
  revenue?: string;
  commissionEarned?: string;
  topProduct?: string;
  baseProductPrice?: string;
  customerPlatformFee?: string;
  categoryCommission?: string;
  netPayoutToVendor?: string;
}

interface CategoryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: CategoryData;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function CategoryDetailsModal({
  open,
  onOpenChange,
  data,
  onDelete,
  onEdit,
}: CategoryDetailsModalProps) {
  // Fallback default values matching the provided image
  const {
    title = "Hair Extensions",
    status = "Active",
    orderDate = "12%",
    tracking = "78",
    totalSales = "1240",
    revenue = "$28,450",
    commissionEarned = "$3,414",
    topProduct = "Kanekalon Braiding Hair 3X",
    baseProductPrice = "100%",
    customerPlatformFee = "+5%",
    categoryCommission = "-12%",
    netPayoutToVendor = "88%",
  } = data || {};

  const [isOpen, setIsOpen] = useState(false);

  // Example Category Data passed into props
  const currentCategory = {
    categoryName: "Hair Extensions",
    platformFee: "12",
    status: "",
  };

  const handleSave = (updatedValues:any) => {
    console.log("Updated Category Data:", updatedValues);
    // Submit to your Next.js API or Server Action here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl! w-full p-6 sm:p-8 rounded-2xl bg-white shadow-xl border-none">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Category Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Header Card / Banner */}
          <div className="bg-[#FAF7FD] rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-xs border border-purple-50">
              <Database className="w-6 h-6 text-purple-600 -rotate-45" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                {status}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F9FA] p-3.5 rounded-xl space-y-1">
              <p className="text-xs font-medium text-gray-500">Order Date</p>
              <p className="text-sm font-bold text-gray-900">{orderDate}</p>
            </div>
            <div className="bg-[#F8F9FA] p-3.5 rounded-xl space-y-1">
              <p className="text-xs font-medium text-gray-500">Tracking</p>
              <p className="text-sm font-bold text-gray-900">{tracking}</p>
            </div>
            <div className="bg-[#F8F9FA] p-3.5 rounded-xl space-y-1">
              <p className="text-xs font-medium text-gray-500">Total Sales</p>
              <p className="text-sm font-bold text-gray-900">{totalSales}</p>
            </div>
            <div className="bg-[#F8F9FA] p-3.5 rounded-xl space-y-1">
              <p className="text-xs font-medium text-gray-500">Revenue</p>
              <p className="text-sm font-bold text-gray-900">{revenue}</p>
            </div>
            <div className="bg-[#F8F9FA] p-3.5 rounded-xl space-y-1">
              <p className="text-xs font-medium text-gray-500">
                Commission Earned
              </p>
              <p className="text-sm font-bold text-gray-900">
                {commissionEarned}
              </p>
            </div>
            <div className="bg-[#F8F9FA] p-3.5 rounded-xl space-y-1">
              <p className="text-xs font-medium text-gray-500">Top Product</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {topProduct}
              </p>
            </div>
          </div>

          {/* Registration Details Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-gray-500 tracking-wide">
              Registration Details (Submitted by Vendor)
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-gray-500">
                <span>Base Product Price (Set by Vendor)</span>
                <span className="font-bold text-gray-900">
                  {baseProductPrice}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-500">
                <span>Customer Platform Fee (added at checkout)</span>
                <span className="font-bold text-blue-500">
                  {customerPlatformFee}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-500">
                <span>Category Commission (deducted from payout)</span>
                <span className="font-bold text-rose-500">
                  {categoryCommission}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-500 border-t border-gray-100 pt-3">
                <span>Net Payout to Vendor</span>
                <span className="font-bold text-emerald-600">
                  {netPayoutToVendor}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onDelete}
              className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold rounded-xl h-11"
            >
              Delete
            </Button>
            <Button
              onClick={()=>{setIsOpen(true)}}
              className="w-full bg-[#E05A32] hover:bg-[#d04e28] text-white font-semibold rounded-xl h-11 gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Category
            </Button>
          </div>
        </div>
      </DialogContent>
      <EditCategoryModal
        open={isOpen}
        onOpenChange={setIsOpen}
        initialValues={currentCategory}
        onSave={handleSave}
      />
    </Dialog>
  );
}