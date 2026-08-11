"use client";

import React, { useState } from "react";
import { Tag, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

// TypeScript Interfaces
export type CouponStatus = "Active" | "Expired" | "Disabled";

export interface Coupon {
    id: string;
    code: string;
    type: "Percentage" | "Fixed Amount" | "Fixed";
    discount: string;
    minOrder: string;
    usedCount: number;
    totalLimit: number;
    expiryDate: string;
    status: CouponStatus;
    isActive: boolean;
}

// Initial Dummy Dataset matching the design image
export const initialCoupons: Coupon[] = [
    {
        id: "1",
        code: "BEAUTY30",
        type: "Percentage",
        discount: "30%",
        minOrder: "$50",
        usedCount: 67,
        totalLimit: 100,
        expiryDate: "Dec 31, 2024",
        status: "Active",
        isActive: true,
    },
    {
        id: "2",
        code: "WELCOME15",
        type: "Percentage",
        discount: "15%",
        minOrder: "$0",
        usedCount: 312,
        totalLimit: 500,
        expiryDate: "Jan 31, 2025",
        status: "Active",
        isActive: true,
    },
    {
        id: "3",
        code: "BRAIDS20",
        type: "Fixed Amount",
        discount: "$20",
        minOrder: "$100",
        usedCount: 50,
        totalLimit: 50,
        expiryDate: "Nov 30, 2024",
        status: "Expired",
        isActive: false,
    },
    {
        id: "4",
        code: "LOCS50",
        type: "Fixed Amount",
        discount: "$50",
        minOrder: "$200",
        usedCount: 8,
        totalLimit: 25,
        expiryDate: "Feb 28, 2025",
        status: "Active",
        isActive: true,
    },
    {
        id: "5",
        code: "AGENT10",
        type: "Percentage",
        discount: "10%",
        minOrder: "$0",
        usedCount: 67,
        totalLimit: 100,
        expiryDate: "Mar 31, 2025",
        status: "Active",
        isActive: true,
    },
    {
        id: "6",
        code: "FIRSTBK",
        type: "Percentage",
        discount: "25%",
        minOrder: "$60",
        usedCount: 198,
        totalLimit: 200,
        expiryDate: "Dec 15, 2024",
        status: "Disabled",
        isActive: false,
    },
];

interface CouponsTableProps {
    data?: Coupon[];
    onEdit?: (coupon: Coupon) => void;
    onDelete?: (id: string) => void;
    onToggleStatus?: (id: string, newActiveState: boolean) => void;
    className?: string;
}

export function CouponsTable({
    data = initialCoupons,
    onEdit,
    onDelete = (id: string) => { },
    onToggleStatus,
    className,
}: CouponsTableProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [couponId, setCouponId] = useState<string>('');
    return (
        <div
            className={cn(
                "w-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm",
                className
            )}
        >
            {/* Table Container with Horizontal Scroll */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    {/* Header */}
                    <thead>
                        <tr className="bg-[#491253] text-white text-xs font-bold uppercase tracking-wider divide-x divide-purple-900/40">
                            <th className="py-4 px-5">Code</th>
                            <th className="py-4 px-5">Type</th>
                            <th className="py-4 px-5">Discount</th>
                            <th className="py-4 px-5">Min Order</th>
                            <th className="py-4 px-5">Usage</th>
                            <th className="py-4 px-5">Expiry</th>
                            <th className="py-4 px-5">Status</th>
                            <th className="py-4 px-5 text-center">Actions</th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-gray-100 text-sm font-medium">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-500 font-medium">
                                    No coupons found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => {
                                const usagePercent = row.totalLimit > 0
                                    ? Math.min(100, Math.round((row.usedCount / row.totalLimit) * 100))
                                    : 0;
                                const isFull = row.usedCount >= row.totalLimit && row.totalLimit > 0;

                                return (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50/60 transition-colors divide-x divide-gray-100"
                                    >
                                        {/* Coupon Code */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                                    <Tag className="w-4 h-4 text-purple-600 -rotate-45" />
                                                </div>
                                                <span className="font-bold text-gray-900 tracking-wide">
                                                    {row.code}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="py-4 px-5 text-gray-600 font-normal">
                                            {row.type}
                                        </td>

                                        {/* Discount */}
                                        <td className="py-4 px-5 font-bold text-[#E05A32]">
                                            {row.discount}
                                        </td>

                                        {/* Min Order */}
                                        <td className="py-4 px-5 text-gray-700 font-medium">
                                            {row.minOrder.startsWith("$") ? row.minOrder : `$${row.minOrder}`}
                                        </td>

                                        {/* Usage with Progress Bar */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center justify-between gap-3 min-w-[170px]">
                                                <div className="flex-1 space-y-1">
                                                    <div className="text-xs text-gray-500 font-medium">
                                                        {row.usedCount}/{row.totalLimit}
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                isFull ? "bg-red-500" : "bg-[#491253]"
                                                            )}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 w-9 text-right">
                                                    {usagePercent}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Expiry Date */}
                                        <td className="py-4 px-5 text-gray-600 font-normal">
                                            {row.expiryDate}
                                        </td>

                                        {/* Status Tag */}
                                        <td className="py-4 px-5">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border",
                                                    row.status === "Active" &&
                                                    "bg-emerald-50 text-emerald-600 border-emerald-200",
                                                    row.status === "Expired" &&
                                                    "bg-gray-100 text-gray-500 border-gray-200",
                                                    row.status === "Disabled" &&
                                                    "bg-rose-50 text-rose-500 border-rose-200"
                                                )}
                                            >
                                                {row.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center justify-center gap-3 text-gray-400">
                                                {/* Edit Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit && onEdit(row)}
                                                    className="hover:text-purple-600 transition-colors p-1"
                                                    title="Edit Coupon"
                                                >
                                                    <Pencil className="w-4 h-4 text-purple-400 hover:text-purple-600" />
                                                </button>

                                                {/* Toggle Active Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleStatus && onToggleStatus(row.id, !row.isActive)}
                                                    className="transition-transform active:scale-95 p-1"
                                                    title={row.isActive ? "Disable Coupon" : "Enable Coupon"}
                                                >
                                                    {row.isActive ? (
                                                        <ToggleRight className="w-6 h-6 text-amber-500" />
                                                    ) : (
                                                        <ToggleLeft className="w-6 h-6 text-emerald-500" />
                                                    )}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => { setDeleteModalOpen(true); setCouponId(row.id) }}
                                                    className="hover:text-rose-600 transition-colors p-1"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 className="w-4 h-4 text-rose-400 hover:text-rose-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <DeleteConfirmationModal
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                handleDelete={() => onDelete(couponId)}
            />
        </div>
    );
}