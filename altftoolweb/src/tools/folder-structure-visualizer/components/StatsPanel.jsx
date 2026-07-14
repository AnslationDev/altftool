"use client";

import { Files, Folders, HardDrive, Layers, BarChart3 } from "lucide-react";
import { formatBytes, formatCount, extensionLabel } from "../utils/format";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--card) p-3 shadow-sm">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-(--muted-foreground)">{label}</p>
        <p className="truncate text-lg font-semibold text-(--foreground)">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function StatsPanel({ stats }) {
  if (!stats) return null;
  const maxCount = stats.topExtensions[0]?.count || 1;

  return (
    <section
      aria-label="Statistics"
      className="rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm"
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--foreground)">
        <BarChart3 className="h-4 w-4 text-(--primary)" aria-hidden="true" />
        Statistics
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Files} label="Files" value={formatCount(stats.files)} />
        <StatCard icon={Folders} label="Folders" value={formatCount(stats.folders)} />
        <StatCard icon={HardDrive} label="Total size" value={formatBytes(stats.totalSize)} />
        <StatCard icon={Layers} label="Max depth" value={formatCount(stats.maxDepth)} />
      </div>

      {stats.topExtensions.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            File types
          </p>
          <ul className="space-y-1.5">
            {stats.topExtensions.map((item) => (
              <li key={item.extension} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 font-medium text-(--foreground)">
                  {extensionLabel(item.extension)}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-(--muted)">
                  <span
                    className="block h-full rounded-full bg-(--primary)"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-(--muted-foreground)">
                  {formatCount(item.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
