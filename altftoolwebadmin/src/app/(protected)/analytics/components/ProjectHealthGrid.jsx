import { useMemo, useState } from "react";
import {
  Activity,
  FolderOpen,
  Layers3,
} from "lucide-react";
import { EmptyState, SectionCard, StatGrid } from "@/ansets";
import {
  formatDateTime,
  formatNumber,
  getFreshnessStatus,
} from "@/lib/analytics/analytics.utils";

/**
 * Status tint for the freshness badge.
 *
 * The label is --foreground (or --danger-text) rather than the raw status hue:
 * at 12px semibold, --success / --warning / --info on their own soft background
 * land between 1.9:1 and 3.1:1 and fail AA. The hue still carries the meaning
 * through the background and border, which only need 3:1 as non-text.
 */
const TONE_STYLES = {
  success: "border-[var(--success)]/40 bg-[var(--success-soft)] text-[var(--foreground)]",
  warning: "border-[var(--warning)]/40 bg-[var(--warning-soft)] text-[var(--foreground)]",
  danger: "border-[var(--danger)]/40 bg-[var(--danger-soft)] text-[var(--danger-text)]",
  idle: "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]",
};

const STATUS_META = {
  all: {
    label: "All",
    tone: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
    description: "Show every tracked module regardless of freshness.",
  },
  success: {
    label: "Healthy",
    tone: TONE_STYLES.success,
    description: "Updated recently and within the freshness threshold.",
  },
  warning: {
    label: "Watch",
    tone: TONE_STYLES.warning,
    description: "Approaching stale status and should be monitored soon.",
  },
  danger: {
    label: "Stale",
    tone: TONE_STYLES.danger,
    description: "No recent update detected within the stale threshold.",
  },
  idle: {
    label: "No Data",
    tone: TONE_STYLES.idle,
    description: "No valid freshness signal is available yet for this module.",
  },
};

const STATUS_KEYS = ["all", "success", "warning", "danger", "idle"];

export default function ProjectHealthGrid({ projects, staleDaysThreshold }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const legendItems = useMemo(
    () => STATUS_KEYS.map((key) => ({ key, ...STATUS_META[key] })),
    [],
  );

  return (
    <SectionCard
      title="Project health"
      description="Freshness, record volume, and module coverage across all tracked projects."
      actions={
        <div className="flex flex-wrap gap-2">
          {legendItems.map((item) => {
            const active = statusFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                title={item.description}
                aria-pressed={active}
                onClick={() => setStatusFilter(item.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${item.tone} ${
                  active ? "ring-1 ring-[var(--border-strong)]" : "opacity-80 hover:opacity-100"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-2">
        {projects.map((project) => {
          const visibleModules = project.modules.filter((module) => {
            if (statusFilter === "all") return true;
            return (
              getFreshnessStatus(module.lastActivityAtMs, staleDaysThreshold).tone === statusFilter
            );
          });

          return (
            // Not using title/headingLevel="h3": that slot adds SectionCard's
            // bordered header band, and this row is meant to read as plain card
            // body. The manual h3 below is already correctly nested under this
            // card's own h2 ("Project health").
            <SectionCard key={project.projectId} className="bg-[var(--surface-soft)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Project
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                    {project.projectName}
                  </h3>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Last activity
                  </p>
                  <p className="mt-1 font-medium text-[var(--foreground)]">
                    {formatDateTime(project.lastActivityAtMs)}
                  </p>
                </div>
              </div>

              <StatGrid
                className="mt-5"
                columns={3}
                items={[
                  {
                    key: "modules",
                    label: "Tracked modules",
                    icon: Layers3,
                    value: formatNumber(project.totalModules),
                  },
                  {
                    key: "records",
                    label: "Records",
                    icon: Activity,
                    value: formatNumber(project.totalRecords),
                  },
                  {
                    key: "stale",
                    label: "Stale modules",
                    icon: FolderOpen,
                    value: formatNumber(project.staleModules),
                    tone: project.staleModules > 0 ? "danger" : "default",
                  },
                ]}
              />

              <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {visibleModules.map((module) => {
                  const freshness = getFreshnessStatus(
                    module.lastActivityAtMs,
                    staleDaysThreshold,
                  );

                  return (
                    <div
                      key={`${project.projectId}-${module.moduleKey}`}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {module.moduleLabel}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {formatNumber(module.totalRecords)} records tracked
                          </p>
                        </div>
                        <span
                          title={STATUS_META[freshness.tone]?.description}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            TONE_STYLES[freshness.tone] ?? TONE_STYLES.idle
                          }`}
                        >
                          {freshness.label}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
                        <span>Last update: {formatDateTime(module.lastActivityAtMs)}</span>
                        <span>
                          {module.daysSinceUpdate == null
                            ? "No detected signal"
                            : `${module.daysSinceUpdate} day${module.daysSinceUpdate === 1 ? "" : "s"} since update`}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {visibleModules.length === 0 ? (
                  <EmptyState
                    className="py-8"
                    icon={Layers3}
                    title="No modules match this status"
                    description="No modules match the selected status filter in this project."
                  />
                ) : null}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </SectionCard>
  );
}
