"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface ReleasePaymentData {
  transactionId?: string;
  recipient?: string;
  amount?: string;
  platformFee?: string;
  netPayout?: string;
}

interface ReleasePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: ReleasePaymentData;
  onConfirmRelease?: () => void;
}

export function ReleasePaymentModal({
  open,
  onOpenChange,
  data,
  onConfirmRelease,
}: ReleasePaymentModalProps) {
  // Default values matching the provided image
  const {
    transactionId = "TXN-7841",
    recipient = "Kezia Okafor",
    amount = "$180.00",
    platformFee = "$18.00",
    netPayout = "$162.00",
  } = data || {};

  const handleConfirm = () => {
    if (onConfirmRelease) {
      onConfirmRelease();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] w-full p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border-none">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 text-left">
            Release Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Summary Box */}
          <div className="bg-[#FAF7FD] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Transaction</span>
              <span className="font-bold text-gray-900">{transactionId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Recipient</span>
              <span className="font-bold text-gray-900">{recipient}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Amount</span>
              <span className="font-bold text-gray-900">{amount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Platform Fee</span>
              <span className="font-bold text-gray-900">{platformFee}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-purple-100/60 pt-3">
              <span className="text-gray-500 font-medium">Net Payout</span>
              <span className="font-bold text-gray-900">{netPayout}</span>
            </div>
          </div>

          {/* Warning / Notice Banner */}
          <div className="bg-[#FFF9E6] border border-[#FEEFC3] rounded-2xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-amber-900 leading-relaxed">
              This will immediately transfer funds to the registered bank account.
            </p>
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
              type="button"
              onClick={handleConfirm}
              className="w-2/3 h-12 rounded-2xl bg-[#34A853] hover:bg-[#2d9248] text-white font-semibold shadow-none"
            >
              Confirm Release
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}