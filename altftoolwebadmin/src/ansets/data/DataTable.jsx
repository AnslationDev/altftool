"use client";

import { useRef, useEffect } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { cn } from "@altftool/ui";
import { DataState } from "../states/States";

/** Header checkbox needs a real DOM node to set `.indeterminate` — a plain
 *  `checked` prop has no way to express "some but not all" selected. */
function HeaderCheckbox({ checked, indeterminate, onChange, label }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
    />
  );
}

/**
 * The admin table.
 *
 * Fourteen screens hand-rolled `<table>` markup, each with its own header
 * styling, its own sort affordance (or none), and its own idea of what an empty
 * body looks like. This owns all of that, and routes loading/error/empty
 * through DataState so a failed fetch can never render as an empty table.
 *
 * Columns are declared, not marked up:
 *   { key, header, render?, sortable?, align?, width?, hideBelow? }
 *
 * `render(row)` returns the cell. Omit it and the raw `row[key]` is printed.
 * `hideBelow: "sm" | "md" | "lg"` drops the column on narrow screens — the
 * header cell and body cell hide together, which the hand-rolled tables kept
 * getting out of sync.
 *
 * `errorTitle` / `errorAction` pass straight through to DataState's ErrorState —
 * use them to keep a screen-specific failure message ("Couldn't load audit
 * logs") instead of the generic default, or to add a secondary action beside
 * Try again.
 *
 * `selectable` turns on a checkbox column (header checkbox selects/clears
 * every row currently visible in `rows` — not the whole unfiltered dataset).
 * The caller owns the selection Set; this component only reads it and reports
 * changes via `onSelectionChange`, so a caller building a bulk-actions toolbar
 * doesn't have to fork this table to get one.
 */
export function DataTable({
  columns = [],
  rows = [],
  getRowKey,
  sort,
  onSortChange,
  loading = false,
  error = null,
  onRetry,
  errorTitle,
  errorAction,
  empty,
  caption,
  rowActions,
  onRowClick,
  className,
  selectable = false,
  selectedKeys,
  onSelectionChange,
}) {
  const keyOf = (row, index) => (getRowKey ? getRowKey(row, index) : (row.id ?? index));
  const visibleKeys = rows.map(keyOf);
  const selectedVisibleCount = selectable
    ? visibleKeys.filter((k) => selectedKeys?.has(k)).length
    : 0;
  const allVisibleSelected = selectable && rows.length > 0 && selectedVisibleCount === rows.length;
  const someVisibleSelected = selectable && selectedVisibleCount > 0 && !allVisibleSelected;

  const toggleRow = (key) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const toggleAllVisible = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (allVisibleSelected) visibleKeys.forEach((k) => next.delete(k));
    else visibleKeys.forEach((k) => next.add(k));
    onSelectionChange(next);
  };
  const hideClass = {
    sm: "hidden sm:table-cell",
    md: "hidden md:table-cell",
    lg: "hidden lg:table-cell",
  };

  const alignClass = { left: "text-left", center: "text-center", right: "text-right" };

  const toggleSort = (key) => {
    if (!onSortChange) return;
    if (sort?.key !== key) return onSortChange({ key, direction: "asc" });
    if (sort.direction === "asc") return onSortChange({ key, direction: "desc" });
    return onSortChange(null);
  };

  return (
    <DataState
      loading={loading}
      error={error}
      isEmpty={!rows.length}
      onRetry={onRetry}
      errorTitle={errorTitle}
      errorAction={errorAction}
      loadingVariant="table"
      empty={empty}
    >
      <div
        className={cn(
          "overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]",
          className,
        )}
      >
        <table className="w-full border-collapse text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}

          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
              {selectable ? (
                <th scope="col" className="w-10 px-4 py-3">
                  <HeaderCheckbox
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    onChange={toggleAllVisible}
                    label={allVisibleSelected ? "Deselect all rows" : "Select all rows"}
                  />
                </th>
              ) : null}
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={
                      active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined
                    }
                    className={cn(
                      "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]",
                      alignClass[col.align] ?? "text-left",
                      col.hideBelow && hideClass[col.hideBelow],
                    )}
                  >
                    {col.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                      >
                        {col.header}
                        {active ? (
                          sort.direction === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
              {rowActions ? (
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((row, index) => {
              const key = keyOf(row, index);
              const isSelected = selectable && Boolean(selectedKeys?.has(key));
              return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer",
                  isSelected ? "bg-[var(--primary-soft)] hover:bg-[color-mix(in_srgb,var(--primary-soft)_65%,var(--primary))]" : "hover:bg-[var(--surface-soft)]",
                )}
              >
                {selectable ? (
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(key)}
                      aria-label={isSelected ? "Deselect row" : "Select row"}
                      className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                    />
                  </td>
                ) : null}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3.5 align-middle text-[var(--foreground)]",
                      alignClass[col.align] ?? "text-left",
                      col.hideBelow && hideClass[col.hideBelow],
                    )}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
                {rowActions ? (
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">{rowActions(row)}</div>
                  </td>
                ) : null}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DataState>
  );
}

export default DataTable;
