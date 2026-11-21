"use client";

import { RefreshCw } from "lucide-react";

export type ApiRow = Record<string, unknown>;

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "Details available";
}

export function ApiTable({
  title,
  rows,
  loading,
  error,
  onRefresh,
  onSelect,
}: {
  title: string;
  rows: ApiRow[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelect?: (row: ApiRow) => void;
}) {
  const columns = rows[0] ? Object.keys(rows[0]).filter((key) => !["id", "userId", "metadata", "profile", "items", "createdAt", "updatedAt"].includes(key)).slice(0, 6) : [];
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6" aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button type="button" onClick={onRefresh} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700"><RefreshCw size={16} /> Refresh</button>
      </div>
      {loading ? <div className="space-y-3" aria-label={`Loading ${title}`}><div className="h-9 animate-pulse rounded bg-gray-100" /><div className="h-16 animate-pulse rounded bg-gray-100" /><div className="h-16 animate-pulse rounded bg-gray-100" /></div> : error ? <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : rows.length === 0 ? <div className="rounded-lg bg-gray-50 p-8 text-center"><p className="font-medium text-gray-800">No records found</p><p className="mt-1 text-sm text-gray-500">New records will appear here when available.</p></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-gray-500">{columns.map((column) => <th key={column} className="px-3 py-3">{column.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim()}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={valueText(row.id) === "—" ? index : valueText(row.id)} className="border-b last:border-0 hover:bg-gray-50">{columns.map((column) => <td key={column} className="px-3 py-3 text-gray-700">{onSelect && column === columns[0] ? <button type="button" onClick={() => onSelect(row)} className="font-medium text-purple-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700">{valueText(row[column])}</button> : valueText(row[column])}</td>)}</tr>)}</tbody></table></div>}
    </section>
  );
}
