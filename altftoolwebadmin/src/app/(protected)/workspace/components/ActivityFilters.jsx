"use client";

import { FilterBar } from "@/ansets";
import { ACTION_KIND_META } from "./helpers";

const KIND_ORDER = ["create", "update", "delete", "publish", "status", "export", "review", "run", "auth"];

/**
 * Search + action-kind filter for the activity feed.
 *
 * This used to be a bare input (no label of any kind) plus a row of chips. It is
 * now the shared FilterBar, which supplies the accessible names, the clear-search
 * control, and the result count slot.
 */
export default function ActivityFilters({ filters, onChange, availableKinds, count, className }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  const kinds = KIND_ORDER.filter((k) => availableKinds?.has(k));
  // Keep the active kind selectable even after the feed changes and no longer
  // contains it — otherwise the <select> would render with no matching option.
  const options = [
    { value: "all", label: "All actions" },
    ...(filters.kind !== "all" && !kinds.includes(filters.kind) ? [filters.kind] : []).map((k) => ({
      value: k,
      label: ACTION_KIND_META[k]?.label ?? k,
    })),
    ...kinds.map((k) => ({ value: k, label: ACTION_KIND_META[k]?.label ?? k })),
  ];

  return (
    <FilterBar
      className={className}
      search={filters.search}
      onSearchChange={(value) => set({ search: value })}
      searchPlaceholder="Search summary, actor, entity…"
      filters={[
        {
          key: "kind",
          label: "Filter by action type",
          value: filters.kind,
          onChange: (value) => set({ kind: value }),
          options,
        },
      ]}
      count={count}
    />
  );
}
