import { useMemo, useState } from "react";
import { Clock4 } from "lucide-react";
import { EmptyState, FilterBar, SectionCard } from "@/ansets";
import { formatDateTime, formatRelativeTime } from "@/lib/analytics/analytics.utils";

export default function RecentUpdatesFeed({ items, moduleOptions = [] }) {
  const [selectedModule, setSelectedModule] = useState("all");

  const filteredItems = useMemo(() => {
    if (selectedModule === "all") return items;
    return items.filter((item) => item.moduleKey === selectedModule);
  }, [items, selectedModule]);

  const filterOptions = useMemo(
    () => [{ value: "all", label: "All modules" }, ...moduleOptions],
    [moduleOptions],
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
            <div
              key={item.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
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
            </div>
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
