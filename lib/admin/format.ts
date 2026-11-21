import { formatNaira } from "@/lib/admin/dashboard";

export { formatNaira };

const lagos = { timeZone: "Africa/Lagos" } as const;
const dateParts = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", ...lagos });
const timeParts = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, ...lagos });

function valid(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Dec 23, 2024" in Lagos time; "—" when the value is missing or invalid. */
export function formatDate(value: string | null | undefined): string {
  const date = valid(value);
  return date ? dateParts.format(date) : "—";
}

/** "10:00 AM" in Lagos time. */
export function formatClock(value: string | null | undefined): string {
  const date = valid(value);
  return date ? timeParts.format(date) : "—";
}

export function formatDateTime(value: string | null | undefined): string {
  const date = valid(value);
  return date ? `${dateParts.format(date)}, ${timeParts.format(date)}` : "—";
}

/** "10:00" (24h API slot) → "10:00 AM". Unknown formats pass through unchanged. */
export function formatSlot(slot: string | null | undefined): string {
  if (!slot) return "—";
  const match = /^(\d{1,2}):(\d{2})/.exec(slot);
  if (!match) return slot;
  const hour = Number(match[1]);
  return `${hour % 12 === 0 ? 12 : hour % 12}:${match[2]} ${hour >= 12 ? "PM" : "AM"}`;
}

/** UNDER_REVIEW → "Under Review". */
export function titleCase(value: string | null | undefined): string {
  if (!value) return "—";
  return value.toLowerCase().split(/[_\s]+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export type Tone = "green" | "blue" | "amber" | "red" | "purple" | "gray" | "orange";

export const toneClasses: Record<Tone, string> = {
  green: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  blue: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
  amber: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
  red: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  purple: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]",
  gray: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]",
  orange: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]",
};

const statusTones: Record<string, Tone> = {
  PENDING: "amber", UNPAID: "amber", HELD: "amber", PROCESSING: "blue", LOCKED: "red",
  CONFIRMED: "blue", IN_PROGRESS: "green", SHIPPED: "blue", OUT_FOR_DELIVERY: "purple",
  COMPLETED: "green", DELIVERED: "green", RELEASED: "green", SUCCESS: "green", PAID: "green", ACTIVE: "green", RESOLVED: "green",
  CANCELLED: "red", REJECTED: "red", FAILED: "red", DISABLED: "red", HIGH: "red", URGENT: "red",
  REFUNDED: "purple", REVERSED: "purple", UNDER_REVIEW: "blue", MEDIUM: "amber", LOW: "blue",
  EXPIRED: "gray", CLOSED: "gray", INACTIVE: "gray", SCHEDULED: "blue",
};

export function statusTone(status: string): Tone {
  return statusTones[status.toUpperCase()] ?? "gray";
}

/** Maps an order's lifecycle to the Figma "Delivery" column states. */
export function deliveryState(orderStatus: string): { label: string; tone: Tone } {
  switch (orderStatus) {
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return { label: "Awaiting OTP", tone: "purple" };
    case "DELIVERED":
      return { label: "OTP Confirmed", tone: "green" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "red" };
    default:
      return { label: "Not Dispatched", tone: "gray" };
  }
}
