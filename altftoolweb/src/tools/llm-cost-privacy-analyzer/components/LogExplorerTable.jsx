"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  FileCode,
  Search,
} from "lucide-react";

function formatTokens(value) {
  return Number(value || 0).toLocaleString();
}

export default function LogExplorerTable({
  records = [],
  costFormatter,
}) {
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const pageSize = 15;

  const modelsList = useMemo(() => {
    const set = new Set();
    records.forEach((r) => set.add(r.model));
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedModel !== "all" && r.model !== selectedModel) return false;
      if (search.trim()) {
        return r.model.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [records, selectedModel, search]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const copyRecord = (rec) => {
    navigator.clipboard.writeText(JSON.stringify(rec, null, 2));
    setCopiedId(rec.index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!records.length) return null;

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--foreground)] sm:text-lg">
            <FileCode className="size-5 text-[var(--primary)]" />
            <span>Parsed Request Explorer</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Explore individual request token usage and calculated pricing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search request logs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)] sm:w-56"
            />
          </div>

          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Models ({records.length})</option>
            {modelsList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs font-medium">
          <thead>
            <tr className="border-b border-[var(--border)] text-[11px] font-extrabold uppercase text-[var(--muted-foreground)]">
              <th className="px-3 py-3">Record #</th>
              <th className="px-3 py-3">Model</th>
              <th className="px-3 py-3 text-right">Input Tokens</th>
              <th className="px-3 py-3 text-right">Output Tokens</th>
              <th className="px-3 py-3 text-right">Total Tokens</th>
              <th className="px-3 py-3 text-right">Estimated Cost</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((rec) => {
              const isExpanded = expandedId === rec.index;

              return (
                <tr
                  key={rec.index}
                  className="border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-soft)]/50"
                >
                  <td className="px-3 py-3 font-mono font-bold text-[var(--foreground)]">
                    #{rec.index}
                  </td>
                  <td className="break-all px-3 py-3 font-mono font-semibold text-[var(--foreground)]">
                    {rec.model}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[var(--foreground)]">
                    {formatTokens(rec.inputTokens)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[var(--foreground)]">
                    {formatTokens(rec.outputTokens)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-[var(--foreground)]">
                    {formatTokens(rec.totalTokens)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-[var(--success)]">
                    {rec.estimatedCost !== null
                      ? costFormatter.format(rec.estimatedCost)
                      : "—"}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                        rec.priceable
                          ? "bg-[var(--success-soft)] text-[var(--success)]"
                          : "bg-[var(--warning-soft)] text-[var(--warning)]"
                      }`}
                    >
                      {rec.priceable ? "Priced" : "Unpriced"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyRecord(rec)}
                        title="Copy JSON Record"
                        className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs font-semibold">
        <span className="text-[var(--muted-foreground)]">
          Page {currentPage} of {totalPages} ({filteredRecords.length} records)
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex size-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface)] disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex size-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface)] disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
