"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  EyeOff,
  Flame,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function DetectionDashboard({
  detectedItems = [],
  onRedactItem,
  onIgnoreItem,
  onRedactAllHighRisk,
  onRedactAllSelected,
  onClearDetected,
  activePageIndex,
  onJumpToPage,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filteredItems = useMemo(() => {
    return detectedItems.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          item.label.toLowerCase().includes(query) ||
          item.value.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [detectedItems, categoryFilter, search]);

  const categories = useMemo(() => {
    const set = new Set();
    detectedItems.forEach((item) => set.add(item.category));
    return Array.from(set);
  }, [detectedItems]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const highRiskUnredactedCount = useMemo(
    () =>
      detectedItems.filter((i) => i.severity === "high" && i.status !== "redacted")
        .length,
    [detectedItems],
  );

  return (
    <div className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-[var(--foreground)]">
            <Zap className="size-4 text-[var(--primary)]" aria-hidden="true" />
            <span>Sensitive Data Radar</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {detectedItems.length} sensitive items identified locally
          </p>
        </div>

        {highRiskUnredactedCount > 0 && (
          <button
            type="button"
            onClick={onRedactAllHighRisk}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] px-3 text-xs font-extrabold text-[var(--danger)] transition-all hover:bg-[var(--danger)] hover:text-white"
          >
            <Flame className="size-3.5" aria-hidden="true" />
            <span>Mask High Risk ({highRiskUnredactedCount})</span>
          </button>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="mt-3.5 space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Filter detected items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              categoryFilter === "all"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-2xs"
                : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All ({detectedItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                categoryFilter === cat
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-2xs"
                  : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Controls */}
      {filteredItems.length > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs font-bold">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:underline"
          >
            <CheckCheck className="size-4" />
            <span>
              {selectedIds.size === filteredItems.length ? "Deselect All" : "Select All"}
            </span>
          </button>

          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                onRedactAllSelected(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-2.5 text-[11px] font-extrabold text-[var(--primary-foreground)] shadow-xs"
            >
              <EyeOff className="size-3" />
              <span>Redact Selected ({selectedIds.size})</span>
            </button>
          )}
        </div>
      )}

      {/* Detected Items Scrollable List */}
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
            <ShieldCheck className="mx-auto size-8 text-[var(--success)] opacity-80" />
            <p className="mt-2 font-bold">No items match current filters.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isRedacted = item.status === "redacted";
            const isIgnored = item.status === "ignored";

            return (
              <div
                key={item.id}
                className={`group flex items-start justify-between gap-3 rounded-2xl border p-3 transition-all ${
                  isRedacted
                    ? "border-[var(--success)] bg-[var(--success-soft)]"
                    : isIgnored
                    ? "border-[var(--border)] bg-[var(--surface-soft)] opacity-50"
                    : item.severity === "high"
                    ? "border-[var(--danger)]/30 bg-[var(--danger-soft)]/20"
                    : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-0.5 size-4 accent-[var(--primary)]"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-xs font-bold text-[var(--foreground)]">
                        {item.label}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                          item.severity === "high"
                            ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                            : item.severity === "medium"
                            ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                            : "bg-[var(--primary-soft)] text-[var(--primary)]"
                        }`}
                      >
                        {item.severity.toUpperCase()}
                      </span>
                      <span className="rounded-md bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--muted-foreground)]">
                        P{item.pageNumber}
                      </span>
                    </div>

                    <p className="mt-1 truncate font-mono text-[11px] font-semibold text-[var(--muted-foreground)]">
                      {item.value}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isRedacted ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--success)] px-2.5 py-1 text-[10px] font-extrabold text-[var(--primary-foreground)]">
                      <Check className="size-3" /> Masked
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onRedactItem(item)}
                        className="inline-flex h-7 items-center gap-1 rounded-lg bg-[var(--primary)] px-2.5 text-[10px] font-extrabold text-[var(--primary-foreground)] hover:opacity-90 shadow-2xs"
                      >
                        <EyeOff className="size-3" /> Mask
                      </button>
                      <button
                        type="button"
                        onClick={() => onIgnoreItem(item.id)}
                        className="inline-flex h-7 items-center rounded-lg border border-[var(--border)] px-2 text-[10px] font-semibold text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
                      >
                        Ignore
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
