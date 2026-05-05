import { useMemo, useState } from "react";
import { Clock4 } from "lucide-react";
import { formatDateTime, formatRelativeTime } from "@/lib/analytics/analytics.utils";

export default function RecentUpdatesFeed({ items, moduleOptions = [] }) {
  const [selectedModule, setSelectedModule] = useState("all");

  const filteredItems = useMemo(() => {
    if (selectedModule === "all") return items;
    return items.filter((item) => item.moduleKey === selectedModule);
  }, [items, selectedModule]);

  return (
    <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gray-100 p-2 text-gray-600">
            <Clock4 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent updates</h2>
            
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

      <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto pr-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 bg-gray-50 p-4 rounded-md"
            >
              <div className="flex  items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.projectName} · {item.moduleLabel}
                    {item.actionLabel ? ` · ${item.actionLabel}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {formatRelativeTime(item.timestampMs)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(item.timestampMs)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
            No recent updates found for the selected module.
          </div>
        )}
      </div>
    </section>
  );
}
