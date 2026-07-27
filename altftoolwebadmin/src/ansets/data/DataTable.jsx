"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { cn } from "@altftool/ui";
import { DataState } from "../states/States";

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
}) {
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
            {rows.map((row, index) => (
              <tr
                key={getRowKey ? getRowKey(row, index) : (row.id ?? index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer",
                  "hover:bg-[var(--surface-soft)]",
                )}
              >
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
            ))}
          </tbody>
        </table>
      </div>
    </DataState>
  );
}

export default DataTable;
