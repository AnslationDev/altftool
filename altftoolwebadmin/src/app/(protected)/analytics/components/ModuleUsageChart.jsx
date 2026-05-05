import { BarChart3 } from "lucide-react";
import {
  formatDateTime,
  formatNumber,
} from "@/lib/analytics/analytics.utils";

export default function ModuleUsageChart({ modules }) {
  const maxActivity = Math.max(...modules.map((module) => module.activityScore), 1);

  return (
    <section className="border border-gray-200 bg-white p-6 shadow-sm rounded-md">
      <div className="flex items-center gap-3">
        <div className="border border-gray-200 bg-gray-100 p-2 text-gray-600">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Module activity</h2>
          <p className="text-sm text-gray-500">
            Ranked by recent content movement and overall record activity.
          </p>
        </div>
      </div>

      <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {modules.map((module) => {
          const percent = Math.max(
            8,
            Math.round(((module.activityScore || 0) / maxActivity) * 100),
          );

          return (
            <div
              key={module.moduleKey}
              className="border border-gray-200 bg-gray-50 p-4 rounded-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {module.moduleLabel}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {module.projects.join(", ")} · {formatNumber(module.recordCount)} records
                  </p>
                </div>
                <span className="border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                  Score {formatNumber(module.activityScore)}
                </span>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white">
                <div
                  className="h-2 rounded-full bg-gray-900 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <span>
                  {formatNumber(module.recentCreatedCount)} additions · {formatNumber(module.recentUpdatedCount)} updates
                </span>
                <span>Last activity: {formatDateTime(module.latestActivityAtMs)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
