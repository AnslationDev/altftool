"use client";

import { ChevronDown, ChevronUp, EyeOff, Search, X } from "lucide-react";

export default function SearchPanel({
  searchQuery,
  onSearchChange,
  searchMatches = [],
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  onRedactAllMatches,
  onClose,
}) {
  return (
    <div className="rounded-3xl border border-[var(--primary)] bg-[var(--surface)] p-5 shadow-xl">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <Search className="size-4 text-[var(--primary)]" />
          <h2 className="text-xs font-extrabold text-[var(--foreground)]">Full Document Text Search</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="rounded-xl p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3.5 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search account #, holder name, transaction reference, or amount..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevMatch}
            disabled={searchMatches.length === 0}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNextMatch}
            disabled={searchMatches.length === 0}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      {searchQuery && (
        <div className="mt-3 flex items-center justify-between text-xs font-bold">
          <span className="text-[var(--muted-foreground)]">
            {searchMatches.length > 0
              ? `Match ${currentMatchIndex + 1} of ${searchMatches.length}`
              : "No text matches found"}
          </span>

          {searchMatches.length > 0 && (
            <button
              type="button"
              onClick={onRedactAllMatches}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 text-[11px] font-extrabold text-[var(--primary-foreground)] shadow-xs hover:opacity-90 transition-opacity"
            >
              <EyeOff className="size-3.5" />
              <span>Redact All Matches ({searchMatches.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
