import { useMemo, useState } from "react";
import {
  Activity,
  FolderOpen,
  Layers3,
} from "lucide-react";
import {
  formatDateTime,
  formatNumber,
  getFreshnessStatus,
} from "@/lib/analytics/analytics.utils";

const TONE_STYLES = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  idle: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_META = {
  all: {
    label: "All",
    tone: "bg-white text-gray-700 border-gray-200",
    description: "Show every tracked module regardless of freshness.",
  },
  success: {
    label: "Healthy",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Updated recently and within the freshness threshold.",
  },
  warning: {
    label: "Watch",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Approaching stale status and should be monitored soon.",
  },
  danger: {
    label: "Stale",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
    description: "No recent update detected within the stale threshold.",
  },
  idle: {
    label: "No Data",
    tone: "bg-gray-100 text-gray-600 border-gray-200",
    description: "No valid freshness signal is available yet for this module.",
  },
};

export default function ProjectHealthGrid({ projects, staleDaysThreshold }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const legendItems = useMemo(
    () => ["all", "success", "warning", "danger", "idle"].map((key) => ({ key, ...STATUS_META[key] })),
    [],
  );

  return (
    <section className="border rounded-md border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="border border-gray-200 bg-gray-100 p-2 text-gray-600">
            <FolderOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Project health</h2>
            <p className="text-sm text-gray-500">
              Freshness, record volume, and module coverage across all tracked projects.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {legendItems.map((item) => {
            const active = statusFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                title={item.description}
                onClick={() => setStatusFilter(item.key)}
                className={`border px-3 py-1.5 text-xs font-semibold transition ${item.tone} ${active ? "ring-1 ring-gray-300" : "opacity-80 hover:opacity-100"}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2 ">
        {projects.map((project) => (
          <div
            key={project.projectId}
            className="border border-gray-200 bg-gray-50 p-5 rounded-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Project
                </p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                  {project.projectName}
                </h3>
              </div>
              <div className="border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 rounded-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Last activity
                </p>
                <p className="mt-1 font-medium text-gray-800">
                  {formatDateTime(project.lastActivityAtMs)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="border border-gray-200 bg-white p-4 rounded-md">
                <div className="flex items-center gap-2 text-gray-500">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-sm">Tracked modules</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">
                  {formatNumber(project.totalModules)}
                </p>
              </div>
              <div className="border border-gray-200 bg-white p-4 rounded-md">
                <div className="flex items-center gap-2 text-gray-500">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Records</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">
                  {formatNumber(project.totalRecords)}
                </p>
              </div>
              <div className="border border-gray-200 bg-white p-4 rounded-md">
                <div className="flex items-center gap-2 text-gray-500">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm">Stale modules</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">
                  {formatNumber(project.staleModules)}
                </p>
              </div>
            </div>

            <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {project.modules
                .filter((module) => {
                  if (statusFilter === "all") return true;
                  return (
                    getFreshnessStatus(module.lastActivityAtMs, staleDaysThreshold).tone ===
                    statusFilter
                  );
                })
                .map((module) => {
                  const freshness = getFreshnessStatus(
                    module.lastActivityAtMs,
                    staleDaysThreshold,
                  );

                  return (
                    <div
                      key={`${project.projectId}-${module.moduleKey}`}
                      className="border border-gray-200 bg-white p-4 rounded-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {module.moduleLabel}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {formatNumber(module.totalRecords)} records tracked
                          </p>
                        </div>
                        <span
                          title={STATUS_META[freshness.tone]?.description}
                          className={`border px-3 py-1 text-xs font-semibold ${TONE_STYLES[freshness.tone]}`}
                        >
                          {freshness.label}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
              {project.modules.filter((module) => {
                if (statusFilter === "all") return true;
                return (
                  getFreshnessStatus(module.lastActivityAtMs, staleDaysThreshold).tone ===
                  statusFilter
                );
              }).length === 0 ? (
                <div className="border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                  No modules match the selected status filter in this project.
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
