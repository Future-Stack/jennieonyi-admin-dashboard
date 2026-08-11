"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export interface IssueRefundFormData {
  amount: string;
  type: string;
  note: string;
}

interface IssueRefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId?: string;
  userName?: string;
  issueType?: string;
  initialValues?: Partial<IssueRefundFormData>;
  onProcessRefund?: (data: IssueRefundFormData) => void;
}

export function IssueRefundModal({
  open,
  onOpenChange,
  ticketId = "SUP-001",
  userName = "Amara Johnson",
  issueType = "Booking Issue",
  initialValues,
  onProcessRefund,
}: IssueRefundModalProps) {
  const [formData, setFormData] = useState<IssueRefundFormData>({
    amount: initialValues?.amount ?? "",
    type: initialValues?.type ?? "Full Refund",
    note: initialValues?.note ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onProcessRefund) {
      onProcessRefund(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] w-full p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border-none">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            Issue Refund
          </DialogTitle>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Info Banner */}
          <div className="bg-[#FAF2F2] border border-[#FAD4D4] rounded-2xl p-4 space-y-1">
            <h4 className="text-sm font-bold text-[#D32F2F]">
              Refund for Ticket {ticketId}
            </h4>
            <p className="text-xs text-gray-600 font-medium">
              {userName} &bull; {issueType}
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#3F485E]">
              Amount ($)
            </label>
            <Input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="h-12 rounded-2xl border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 focus-visible:ring-1 focus-visible:ring-red-500 shadow-none"
            />
          </div>

          {/* Type Select Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#3F485E]">
              Type
            </label>
            <div className="relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 pr-10 cursor-pointer shadow-none"
              >
                <option value="Full Refund">Full Refund</option>
                <option value="Partial Refund">Partial Refund</option>
                <option value="Store Credit">Store Credit</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Note Textarea */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#3F485E]">
              Note
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Reason..."
              rows={3}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none shadow-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
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
              className="w-2/3 h-12 rounded-2xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-semibold shadow-none"
            >
              Process Refund
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}