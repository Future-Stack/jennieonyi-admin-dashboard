"use client";

import { Search, Menu } from "lucide-react";
import { NotificationBell } from "@/components/admin/notifications/NotificationBell";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/errors";
import { apiClient } from "@/lib/api-client";
import type { AdminSearchResults } from "@/lib/api/contracts";
import { useAuthStore } from "@/store/auth-store";

/** Breadcrumb titles as shown in the Admin Panel Figma (the route segment alone is not descriptive enough). */
const PAGE_TITLES: Record<string, string> = {
  "video-verification": "Video Verification",
  users: "User Management",
  stylists: "Stylist Management",
  vendors: "Vendor Management",
  bookings: "Bookings Overview",
  orders: "Product Orders",
  payments: "Escrow & Payments Monitor",
  categories: "Product Category",
  agents: "Street Agent",
  analytics: "Analytics & Reports",
  coupons: "Coupon Management",
  support: "Support Center",
};

const SEARCHABLE_PAGES = [
  { label: "Dashboard", href: "/dashboard" },
  ...Object.entries(PAGE_TITLES).map(([segment, label]) => ({
    label,
    href: `/dashboard/${segment}`,
  })),
];

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResults | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const generateTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    const segment = pathname.split("/").pop();
    if (!segment) return "Dashboard";
    return (
      PAGE_TITLES[segment] ??
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      apiClient.admin
        .search(normalizedQuery, controller.signal)
        .then((response) => setResults(response.data))
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setResults(null);
          setSearchError(
            error instanceof ApiError
              ? error.message
              : "Search is unavailable. Please try again.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const pageItems = SEARCHABLE_PAGES.filter((item) =>
    item.label.toLocaleLowerCase().includes(normalizedQuery),
  );
  const recordItems = results
    ? [
        ...results.users.map((item) => ({
          label: item.name,
          detail: item.role,
          href: `/dashboard/users?search=${encodeURIComponent(item.userId)}`,
        })),
        ...results.bookings.map((item) => ({
          label: item.bookingNumber,
          detail: "Booking",
          href: `/dashboard/bookings?search=${encodeURIComponent(item.id)}`,
        })),
        ...results.orders.map((item) => ({
          label: item.orderNumber,
          detail: "Order",
          href: `/dashboard/orders?search=${encodeURIComponent(item.id)}`,
        })),
        ...results.tickets.map((item) => ({
          label: item.ticketNumber,
          detail: "Support ticket",
          href: `/dashboard/support?search=${encodeURIComponent(item.id)}`,
        })),
        ...results.products.map((item) => ({
          label: item.name,
          detail: "Product",
          href: `/dashboard/categories?search=${encodeURIComponent(item.id)}`,
        })),
      ]
    : [];

  return (
    <header className="h-[70px] md:h-[90px] bg-admin-primary flex-shrink-0 flex items-center justify-between px-[16px] md:px-[28px] text-white md:rounded-[20px] z-10 sticky top-0">
      {/* Left: Hamburger (mobile) + PlaitAm Admin → Dashboard */}
      <div className="flex items-center gap-[10px] min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex-shrink-0 p-1 text-white"
        >
          <Menu className="w-[24px] h-[24px]" />
        </button>

        <span className="hidden md:inline text-[26px] font-medium text-white/80 leading-none whitespace-nowrap">
          PlaitAm Admin
        </span>

        {/* Figma arrow icon: 42×42, color #D95C30 */}
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden md:block flex-shrink-0"
        >
          <path
            d="M15.75 31.5L26.25 21L15.75 10.5"
            stroke="#D95C30"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="min-w-0 text-[18px] md:text-[22px] 2xl:text-[26px] font-bold text-white leading-none whitespace-nowrap truncate">
          {generateTitle()}
        </span>
      </div>

      {/* Right: Search + Bell + Profile */}
      <div className="flex items-center gap-[8px] md:gap-[12px]">
        {/* Search bar — hidden on mobile, unchanged on desktop */}
        <div
          className="relative hidden md:flex items-center md:w-[200px] lg:w-[240px] 2xl:w-[329px] h-[52px] px-[14px] rounded-[10px] bg-[rgba(113,67,125,0.6)] gap-[8px]"
          ref={searchRef}
        >
          <Search className="w-[16px] h-[16px] text-white/60 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            aria-label="Search Admin records"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={query.trim().length >= 2}
            aria-controls="admin-search-results"
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (nextQuery.trim().length < 2) {
                setResults(null);
                setSearchError(null);
                setSearching(false);
              } else {
                setSearching(true);
                setSearchError(null);
              }
            }}
            className="w-full bg-transparent text-white text-[14px] placeholder-white/50 focus:outline-none"
          />
          {query.trim().length >= 2 && (
            <div
              id="admin-search-results"
              className="absolute left-0 right-0 top-[58px] z-30 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 text-gray-900 shadow-xl"
              role="listbox"
            >
              {searching && <p className="px-3 py-2 text-sm text-gray-500">Searching...</p>}
              {searchError && (
                <p className="px-3 py-2 text-sm text-red-600" role="alert">
                  {searchError}
                </p>
              )}
              {pageItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setQuery("")}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
                  role="option"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="shrink-0 text-xs text-gray-500">Page</span>
                </Link>
              ))}
              {!searching &&
                recordItems.map((item, index) => (
                  <Link
                    key={`${item.detail}-${item.label}-${index}`}
                    href={item.href}
                    onClick={() => setQuery("")}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
                    role="option"
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="shrink-0 text-xs text-gray-500">{item.detail}</span>
                  </Link>
                ))}
              {!searching && !searchError && results && pageItems.length === 0 && recordItems.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-500">No matching pages or records.</p>
              )}
            </div>
          )}
        </div>

        {/* Search icon — mobile only */}
        <span aria-hidden="true" className="md:hidden flex items-center justify-center w-[40px] h-[40px] rounded-[10px] bg-[rgba(255,255,255,0.12)] flex-shrink-0">
          <Search className="w-[18px] h-[18px] text-white" />
        </span>

        {/* Bell — live inbox (TASK-057); badge only when there are unread items */}
        <NotificationBell />

        {/* Profile — Figma: Frame 36, display:flex, align-items:center, gap:26px, padding:22px */}
        <div className="flex items-center gap-[10px] h-[40px] md:h-[52px] px-[8px] md:px-[14px] rounded-[10px] bg-[rgba(255,255,255,0.12)] flex-shrink-0">
          <div className="w-[28px] h-[28px] md:w-[34px] md:h-[34px] rounded-full overflow-hidden flex-shrink-0 bg-white/20 relative">
            <Image
              src="/admin/profile.png"
              alt={user?.name ?? "Admin"}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b19cd9") {
                  target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b19cd9";
                  target.srcset = "";
                }
              }}
            />
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-white whitespace-nowrap">{user?.name ?? "Admin"}</span>
            <span className="text-[11px] text-white/60 whitespace-nowrap">{user?.email ?? ""}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
