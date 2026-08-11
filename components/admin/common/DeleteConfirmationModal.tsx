"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  handleDelete: () => void | Promise<void>;
}

export default function DeleteConfirmationModal({
  open,
  setOpen,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  handleDelete,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);

      await handleDelete();

      setOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl p-6">
        <DialogHeader className="items-center text-center">
          {/* Warning Icon */}
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>

          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>

          <DialogDescription className="pt-1 text-center text-sm leading-6 text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => setOpen(false)}
            className="w-full rounded-full border-gray-200 px-6 sm:w-auto"
          >
            Cancel
          </Button>

          {/* Delete */}
          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            className="w-full rounded-full bg-red-500 px-6 text-white hover:bg-red-600 sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />

            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}