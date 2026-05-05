import { useMemo, useState } from "react";
import { Database } from "lucide-react";
import {
  formatDateTime,
} from "@/lib/analytics/analytics.utils";

export default function RecentDataTable({ entries, moduleOptions = [] }) {
  const [selectedModule, setSelectedModule] = useState("all");

  const filteredEntries = useMemo(() => {
    if (selectedModule === "all") return entries;
    return entries.filter((entry) => entry.moduleKey === selectedModule);
  }, [entries, selectedModule]);

  return (
    <section className="border border-gray-200 bg-white p-6 shadow-sm rounded-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="border border-gray-200 bg-gray-100 p-2 text-gray-600">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recently added data</h2>
            <p className="text-sm text-gray-500">
              Newest analyzable records across projects and modules.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedModule}
            onChange={(event) => setSelectedModule(event.target.value)}
            className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none"
          >
            <option value="all">All modules</option>
            {moduleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-gray-200">
        <div className="max-h-[420px] overflow-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              <span>Item</span>
              <span>Project</span>
              <span>Module</span>
              <span>Created</span>
            </div>
            <div className="divide-y divide-gray-200 bg-white">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] gap-4 px-4 py-4 text-sm text-gray-600"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{entry.title}</p>
                      <p className="mt-1 text-xs text-gray-400">{entry.sourceLabel}</p>
                    </div>
                    <span>{entry.projectName}</span>
                    <span>{entry.moduleLabel}</span>
                    <span>{formatDateTime(entry.timestampMs)}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500">
                  No recently added records found for the selected module.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
