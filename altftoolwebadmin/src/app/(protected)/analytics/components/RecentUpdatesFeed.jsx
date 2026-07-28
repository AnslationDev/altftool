import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock4 } from "lucide-react";
import { EmptyState, FilterBar, SectionCard } from "@/ansets";
import { getProjectModuleRoute } from "@/config/adminRoutes";
import { formatDateTime, formatRelativeTime } from "@/lib/analytics/analytics.utils";

export default function RecentUpdatesFeed({ items, moduleOptions = [] }) {
  const [selectedModule, setSelectedModule] = useState("all");

  const filteredItems = useMemo(() => {
    if (selectedModule === "all") return items;
    return items.filter((item) => item.moduleKey === selectedModule);
  }, [items, selectedModule]);

  // Keep the active module selectable even after a project-scope change drops
  // it from moduleOptions — otherwise the <select> renders with no matching
  // option and silently falls back to "All modules" while filteredItems above
  // keeps filtering on the now-stale key.
  const filterOptions = useMemo(
    () => [
      { value: "all", label: "All modules" },
      ...(selectedModule !== "all" && !moduleOptions.some((option) => option.value === selectedModule)
        ? [{ value: selectedModule, label: selectedModule }]
        : []),
      ...moduleOptions,
    ],
    [moduleOptions, selectedModule],
  );

  return (
    <SectionCard
      icon={Clock4}
      title="Recent updates"
      description="The latest content changes across the projects in the current scope."
    >
      <FilterBar
        filters={[
          {
            // The bare <select> here had no accessible name at all; FilterBar
            // labels it.
            id: "module",
            key: "module",
            label: "Filter by module",
            value: selectedModule,
            onChange: setSelectedModule,
            options: filterOptions,
          },
        ]}
        count={`${filteredItems.length} of ${items.length} updates`}
      />

      <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Link
              key={item.id}
              href={getProjectModuleRoute(item.projectId, item.moduleKey)}
              className="group block rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.projectName} · {item.moduleLabel}
                    {item.actionLabel ? ` · ${item.actionLabel}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {formatRelativeTime(item.timestampMs)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDateTime(item.timestampMs)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            icon={Clock4}
            title="No recent updates"
            description="No recent updates found for the selected module."
          />
        )}
      </div>
    </SectionCard>
  );
}
