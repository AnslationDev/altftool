"use client";

import { Search, X } from "lucide-react";
import { cn } from "@altftool/ui";

const CONTROL =
  "h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] transition focus:border-[var(--primary)] focus:outline-none focus-visible:[box-shadow:var(--focus-ring)]";

/**
 * Search + dropdown filters + result count, in the layout every list screen was
 * rebuilding by hand.
 *
 * @param {string}   [search]        Controlled search value.
 * @param {Function} [onSearchChange]
 * @param {string}   [searchPlaceholder]
 * @param {Array<{key:string,value:string,onChange:Function,options:Array<{value:string,label:string}>,label:string}>} [filters]
 *   `label` is the accessible name; it is visually hidden because the option
 *   text already reads as the label ("All roles").
 * @param {ReactNode} [count]        e.g. "10 of 42 admins".
 * @param {ReactNode} [actions]      Extra controls on the right.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  count,
  actions,
  className,
}) {
  const showSearch = typeof onSearchChange === "function";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3",
        className,
      )}
    >
      {showSearch ? (
        <div className="relative min-w-[12rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={cn(CONTROL, "w-full pl-9", search && "pr-9")}
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(event) => filter.onChange(event.target.value)}
          aria-label={filter.label}
          className={cn(CONTROL, "min-w-[9rem]")}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {count ? (
        <span className="ml-auto whitespace-nowrap text-sm text-[var(--muted)]">{count}</span>
      ) : null}

      {actions ? (
        <div className={cn("flex items-center gap-2", !count && "ml-auto")}>{actions}</div>
      ) : null}
    </div>
  );
}

export default FilterBar;
