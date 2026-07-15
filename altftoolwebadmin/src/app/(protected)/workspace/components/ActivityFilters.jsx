"use client";

import { Search, X } from "lucide-react";
import { ACTION_KIND_META } from "./helpers";

const KIND_ORDER = ["create", "update", "delete", "publish", "status", "export", "review", "run", "auth"];

export default function ActivityFilters({ filters, onChange, availableKinds }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const kinds = KIND_ORDER.filter((k) => availableKinds?.has(k));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search summary, actor, entity…"
          className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-8 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
        />
        {filters.search ? (
          <button
            type="button"
            onClick={() => set({ search: "" })}
            className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip active={filters.kind === "all"} onClick={() => set({ kind: "all" })}>All</FilterChip>
        {kinds.map((k) => (
          <FilterChip key={k} active={filters.kind === k} onClick={() => set({ kind: k })}>
            {ACTION_KIND_META[k].label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
        active
          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}
