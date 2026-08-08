"use client";

import CatStateCards, { ICatStateCards } from "@/components/admin/categories/CatStateCards";
import Headers from "@/components/admin/common/Headers";
import { CouponFormData, CouponModal } from "@/components/admin/coupon/CouponModal";
import { Download, Plus } from "lucide-react";
import { useState } from "react";

const stateCardsData: ICatStateCards[] = [
  {
    title: "Active Coupons",
    data: "8",
    valueColor: "text-green-600"
  },
  {
    title: "Total Redemptions",
    data: "2387",
    valueColor: "text-purple-800"
  },
  {
    title: "Revenue Impact",
    data: "$5,200",
    valueColor: "text-orange-700"
  },
  {
    title: "Total Referrals",
    data: "3"
  },
]

export default function CouponsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Example data for Edit Mode
  const activeCouponData: CouponFormData = {
    couponCode: "HOLIDAY25",
    discountType: "Percentage",
    discountValue: "25%",
    minOrder: "100",
    usageLimit: "500",
    expiryDate: "12/31/2024",
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSave = (data: CouponFormData) => {
    if (modalMode === "create") {
      console.log("Creating new coupon:", data);
      // API call to create coupon
    } else {
      console.log("Updating existing coupon:", data);
      // API call to update coupon
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-white py-8 overflow-y-auto">
      <Headers
        title="Coupon Management"
        description="Create and manage promotional codes and discount offers"
        buttonOneIcon={<Download className="w-4 h-4" />}
        buttonOneText="Export Report"
        buttonOneAction={() => { }}
        buttonTwoIcon={<Plus className="w-4 h-4" />}
        buttonTwoText="Create Coupon"
        buttonTwoAction={() => { }}
      />

      {/* state cards  */}
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

      <CouponModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialValues={modalMode === "edit" ? activeCouponData : undefined}
        onSave={handleSave}
      />
    </div>
  );
}
