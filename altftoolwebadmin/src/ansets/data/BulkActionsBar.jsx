"use client";

import { X } from "lucide-react";
import { cn } from "@altftool/ui";

/**
 * Sticky toolbar for a DataTable in `selectable` mode. Renders nothing when
 * nothing is selected, so callers can mount it unconditionally above the table.
 *
 * @param {number}    count     Selected row count.
 * @param {Function}  onClear   Clears the selection.
 * @param {ReactNode} children  Action buttons (e.g. Button from @altftool/ui).
 * @param {string}    [noun]    Singular noun for the count label — "ticket" → "3 tickets selected".
 */
export function BulkActionsBar({ count, onClear, children, noun = "item", className }) {
  if (!count) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cn(
        "sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-soft)] px-4 py-2.5",
        className,
      )}
    >
      <span className="text-sm font-semibold text-[var(--foreground)]">
        {count} {noun}
        {count === 1 ? "" : "s"} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Clear
      </button>
    </div>
  );
}

export default BulkActionsBar;
