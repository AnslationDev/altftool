import { BarChart3 } from "lucide-react";
import { EmptyState, SectionCard } from "@/ansets";
import {
  formatDateTime,
  formatNumber,
} from "@/lib/analytics/analytics.utils";

export default function ModuleUsageChart({ modules }) {
  const maxActivity = Math.max(...modules.map((module) => module.activityScore), 1);

  return (
    <SectionCard
      title="Module activity"
      description="Ranked by recent content movement and overall record activity."
    >
      {modules.length ? (
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {modules.map((module) => {
            const percent = Math.max(
              8,
              Math.round(((module.activityScore || 0) / maxActivity) * 100),
            );

            return (
              <div
                key={module.moduleKey}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {module.moduleLabel}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {module.projects.join(", ")} · {formatNumber(module.recordCount)} records
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                    Score {formatNumber(module.activityScore)}
                  </span>
                </div>

                {/* The score is already stated in text above, so the bar is
                    decoration for screen readers. */}
                <div className="mt-4 h-2 rounded-full bg-[var(--border)]" aria-hidden="true">
                  <div
                    className="h-2 rounded-full bg-[var(--primary)] transition-all motion-reduce:transition-none"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
                  <span>
                    {formatNumber(module.recentCreatedCount)} additions · {formatNumber(module.recentUpdatedCount)} updates
                  </span>
                  <span>Last activity: {formatDateTime(module.latestActivityAtMs)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No module activity yet"
          description="Once modules start recording additions and updates, the busiest ones are ranked here."
        />
      )}
    </SectionCard>
  );
}
