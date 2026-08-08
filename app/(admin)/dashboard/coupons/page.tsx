"use client";

import CatStateCards, { ICatStateCards } from "@/components/admin/categories/CatStateCards";
import Headers from "@/components/admin/common/Headers";
import { CouponFormData, CouponModal } from "@/components/admin/coupon/CouponModal";
import { Coupon, CouponsTable, initialCoupons } from "@/components/admin/coupon/CouponsTable";
import { cn } from "@/lib/utils";
import { Download, Plus } from "lucide-react";
import { useState } from "react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Dynamic status counts
  const activeCount = coupons.filter((c) => c.status === "Active").length;
  const expiredCount = coupons.filter((c) => c.status === "Expired").length;
  const disabledCount = coupons.filter((c) => c.status === "Disabled").length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const stateCardsData: ICatStateCards[] = [
    {
      title: "Active Coupons",
      data: activeCount.toString(),
      valueColor: "text-green-600",
    },
    {
      title: "Total Redemptions",
      data: totalRedemptions.toLocaleString(),
      valueColor: "text-purple-800",
    },
    {
      title: "Revenue Impact",
      data: "$5,200",
      valueColor: "text-orange-700",
    },
    {
      title: "Total Coupons",
      data: coupons.length.toString(),
    },
  ];

  const couponTabs = [
    { name: "All", value: coupons.length },
    { name: "Active", value: activeCount },
    { name: "Expired", value: expiredCount },
    { name: "Disabled", value: disabledCount },
  ];

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (coupon: Coupon) => {
    setModalMode("edit");
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  // Save (Create / Edit) Coupon
  const handleSave = (formData: CouponFormData) => {
    if (modalMode === "create") {
      const newCoupon: Coupon = {
        id: Date.now().toString(),
        code: formData.couponCode.trim().toUpperCase(),
        type: (formData.discountType as any) || "Percentage",
        discount: formData.discountValue,
        minOrder: formData.minOrder ? (formData.minOrder.startsWith("$") ? formData.minOrder : `$${formData.minOrder}`) : "$0",
        usedCount: 0,
        totalLimit: Number(formData.usageLimit) || 100,
        expiryDate: formData.expiryDate || "Dec 31, 2025",
        status: "Active",
        isActive: true,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
    } else if (modalMode === "edit" && editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: formData.couponCode.trim().toUpperCase(),
                type: (formData.discountType as any) || c.type,
                discount: formData.discountValue,
                minOrder: formData.minOrder ? (formData.minOrder.startsWith("$") ? formData.minOrder : `$${formData.minOrder}`) : c.minOrder,
                totalLimit: Number(formData.usageLimit) || c.totalLimit,
                expiryDate: formData.expiryDate || c.expiryDate,
              }
            : c
        )
      );
    }
    setIsModalOpen(false);
  };

  // Delete Coupon
  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  // Toggle Active / Disabled
  const handleToggleStatus = (id: string, newActiveState: boolean) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = newActiveState ? "Active" : "Disabled";
          return {
            ...c,
            isActive: newActiveState,
            status: c.status === "Expired" ? "Expired" : newStatus,
          };
        }
        return c;
      })
    );
  };

  // Filter coupons based on active tab
  const filteredCoupons = coupons.filter((coupon) => {
    if (activeTab === "All") return true;
    return coupon.status === activeTab;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Code", "Type", "Discount", "Min Order", "Used", "Total Limit", "Expiry", "Status"];
    const rows = coupons.map((c) => [c.id, c.code, c.type, c.discount, c.minOrder, c.usedCount, c.totalLimit, c.expiryDate, c.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coupons_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map initialValues for CouponModal when editing
  const editingInitialValues: Partial<CouponFormData> | undefined = editingCoupon
    ? {
        id: editingCoupon.id,
        couponCode: editingCoupon.code,
        discountType: editingCoupon.type,
        discountValue: editingCoupon.discount,
        minOrder: editingCoupon.minOrder.replace("$", ""),
        usageLimit: editingCoupon.totalLimit.toString(),
        expiryDate: editingCoupon.expiryDate,
      }
    : undefined;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white py-8 overflow-y-auto">
      <Headers
        title="Coupon Management"
        description="Create and manage promotional codes and discount offers"
        buttonOneIcon={<Download className="w-4 h-4" />}
        buttonOneText="Export Report"
        buttonOneAction={handleExportCSV}
        buttonTwoIcon={<Plus className="w-4 h-4" />}
        buttonTwoText="Create Coupon"
        buttonTwoAction={handleOpenCreate}
      />

      {/* State cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stateCardsData.map((card, index) => (
          <CatStateCards
            key={index}
            title={card.title}
            data={card.data}
            valueColor={card.valueColor}
          />
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center my-6">
        <div className="flex flex-wrap md:flex-nowrap items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-1 shadow-2xs h-fit md:h-11">
          {couponTabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={isActive ? { backgroundColor: "#4D145D", color: "#FFFFFF" } : {}}
                className={`px-4 h-8.5 rounded-lg text-[13px] font-semibold flex items-center justify-center transition-all gap-2 ${
                  isActive
                    ? "shadow-xs"
                    : "bg-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>{tab.name}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {tab.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coupons Table */}
      <CouponsTable
        data={filteredCoupons}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create / Edit Modal */}
      <CouponModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialValues={editingInitialValues}
        onSave={handleSave}
      />
    </div>
  );
}

