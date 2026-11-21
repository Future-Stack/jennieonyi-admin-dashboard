"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { initials, statusTone, titleCase, toneClasses, type Tone } from "@/lib/admin/format";

export function StatCard({ label, value, tone = "#4D145D", hint, icon, loading }: { label: string; value: ReactNode; tone?: string; hint?: ReactNode; icon?: ReactNode; loading?: boolean }) {
  return (
    <div className="flex items-start justify-between rounded-[12px] border border-[#F0F1F3] bg-[#F0F1F3] p-5">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
        {loading ? <div className="h-7 w-20 animate-pulse rounded bg-gray-200" aria-label={`Loading ${label}`} /> : <p className="truncate text-[26px] font-bold leading-none" style={{ color: tone }}>{value}</p>}
        {hint ? <p className="text-[12px] text-gray-500">{hint}</p> : null}
      </div>
      {icon ? <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-white/70">{icon}</div> : null}
    </div>
  );
}

export function StatusPill({ status, label, tone }: { status: string; label?: string; tone?: Tone }) {
  const resolved = tone ?? statusTone(status);
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${toneClasses[resolved]}`}>{label ?? titleCase(status)}</span>;
}

export function Avatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  if (src) return <Image src={src} alt="" width={size} height={size} unoptimized className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  return <span aria-hidden className="flex shrink-0 items-center justify-center rounded-full bg-[#4D145D] font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials(name)}</span>;
}

export function PersonCell({ name, avatar }: { name: string; avatar?: string | null }) {
  return <div className="flex items-center gap-2.5"><Avatar name={name} src={avatar} /><span className="text-[13px] font-medium text-[#1E1E1E]">{name}</span></div>;
}

export interface TabDef { key: string; label: string; count?: number }

export function TabBar({ tabs, active, onChange, label }: { tabs: TabDef[]; active: string; onChange: (key: string) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap items-center gap-1 rounded-[10px] border border-gray-200 bg-white p-1">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button key={tab.key} role="tab" aria-selected={isActive} type="button" onClick={() => onChange(tab.key)} className={`flex h-[32px] cursor-pointer items-center gap-2 rounded-[8px] px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D145D] ${isActive ? "bg-[#4D145D] text-white" : "text-gray-600 hover:text-gray-900"}`}>
            {tab.label}
            {tab.count !== undefined ? <span className={`rounded-[4px] px-1.5 py-0.5 text-[11px] ${isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (value: string) => void; placeholder: string; label: string }) {
  return (
    <div className="flex h-[40px] w-full items-center gap-[6px] rounded-lg border border-gray-200 bg-white px-3 focus-within:ring-2 focus-within:ring-[#4D145D] sm:w-[260px]">
      <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      <input type="search" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full border-none bg-transparent text-[13px] text-[#1E1E1E] outline-none placeholder:text-gray-400" />
    </div>
  );
}

export function Pagination({ page, totalPages, total, shown, onPage, noun = "results" }: { page: number; totalPages: number; total: number; shown: number; onPage: (page: number) => void; noun?: string }) {
  const pages = pageWindow(page, totalPages);
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[12px] text-gray-500" aria-live="polite">Showing {shown} of {total} {noun}</p>
      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          {pages.map((entry, index) => entry === "gap" ? <span key={`gap-${index}`} className="px-1 text-gray-400">…</span> : (
            <button key={entry} type="button" aria-current={entry === page ? "page" : undefined} onClick={() => onPage(entry)} className={`h-8 min-w-8 cursor-pointer rounded-md px-2 text-[13px] ${entry === page ? "bg-[#4D145D] text-white" : "text-gray-600 hover:bg-gray-100"}`}>{entry}</button>
          ))}
          <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </nav>
      ) : null}
    </div>
  );
}

export function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const set = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => { if (i > 0 && n - sorted[i - 1] > 1) out.push("gap"); out.push(n); });
  return out;
}

export interface Column { key: string; label: string; className?: string }

/** Purple-header table frame with loading skeleton, error and empty states (Figma list style). */
export function DataTable({ columns, loading, error, empty, onRetry, children, rowCount }: { columns: Column[]; loading: boolean; error: string | null; empty: boolean; onRetry?: () => void; children: ReactNode; rowCount?: number }) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[#E4E6E7]">
      <table className="w-full border-collapse bg-[#FFFFF7] text-left">
        <thead>
          <tr className="bg-[#4D145D]">
            {columns.map((column) => <th key={column.key} scope="col" className={`px-4 py-3.5 text-[12px] font-bold uppercase tracking-wide text-white ${column.className ?? ""}`}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E6E7]">
          {loading ? Array.from({ length: rowCount ?? 6 }, (_, i) => (
            <tr key={i} aria-hidden><td colSpan={columns.length} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-200/70" /></td></tr>
          )) : error ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center"><p role="alert" className="text-[14px] font-medium text-red-700">{error}</p>{onRetry ? <button type="button" onClick={onRetry} className="mt-3 cursor-pointer rounded-md border border-red-200 px-3 py-1.5 text-[13px] text-red-700 hover:bg-red-50">Try again</button> : null}</td></tr>
          ) : empty ? (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center"><p className="text-[14px] font-medium text-gray-800">No records match these filters</p><p className="mt-1 text-[13px] text-gray-500">Adjust the search or status filter, or refresh to check for new activity.</p></td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

export function errorText(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

/** Debounce-free helper: 1-based page → API params. */
export const PAGE_SIZE = 10;
