"use client";

import {
  Search,
  Plus,
  Download,
  Upload,
  ArrowUpDown,
  CheckSquare,
  XSquare,
  SlidersHorizontal,
} from "lucide-react";

const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "date", label: "Newest first" },
  { value: "uses", label: "Most used" },
];

export function Toolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  onAdd,
  onImport,
  onExport,
  selectionActive,
  onToggleSelectMode,
  selectedCount,
  totalVisible,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by title, URL, tag, or description…"
            aria-label="Search bookmarks"
            className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-10 pr-4 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              aria-label="Sort bookmarks"
              className="appearance-none rounded-xl border border-(--border) bg-(--background) py-2.5 pl-9 pr-8 text-sm text-(--foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onToggleSelectMode}
            aria-pressed={selectionActive}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              selectionActive
                ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                : "border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
            }`}
          >
            {selectionActive ? (
              <XSquare className="h-4 w-4" />
            ) : (
              <CheckSquare className="h-4 w-4" />
            )}
            {selectionActive ? "Cancel" : "Select"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {totalVisible} bookmark{totalVisible === 1 ? "" : "s"}
          {selectionActive ? ` · ${selectedCount} selected` : ""}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onImport}
            className="flex items-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--muted)"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--muted)"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-xl bg-(--primary) px-3 py-2 text-sm font-semibold text-(--primary-foreground) hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add bookmark
          </button>
        </div>
      </div>
    </div>
  );
}
