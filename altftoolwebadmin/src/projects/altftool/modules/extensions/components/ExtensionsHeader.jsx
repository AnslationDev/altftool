"use client";

import { Plus, Puzzle, Chrome, Star, Tag, AlertTriangle } from "lucide-react";

export default function ExtensionsHeader({
  total,
  chromeCount,
  noChromeCount,
  categories,
  avgRating,
  onCreate,
}) {
  return (
    <div className="space-y-5">

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Extensions</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Manage all browser extensions in one place</p>
        </div>
        <button onClick={onCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] text-sm font-semibold rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" />Add Extension
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total" value={total} icon={<Puzzle className="w-4 h-4" />} iconBg="bg-[var(--surface-soft)]" iconColor="text-[var(--muted)]" />
        <KpiCard label="Chrome Store" value={chromeCount} icon={<Chrome className="w-4 h-4" />} iconBg="bg-[var(--primary-soft)]" iconColor="text-[var(--primary)]" valueColor="text-[var(--primary)]" />
        <KpiCard label="Missing URL" value={noChromeCount} icon={<AlertTriangle className="w-4 h-4" />} iconBg="bg-[var(--warning-soft)]" iconColor="text-[var(--warning-text)]" valueColor={noChromeCount > 0 ? "text-[var(--warning-text)]" : "text-[var(--foreground)]"} />
        <KpiCard label="Categories" value={categories} icon={<Tag className="w-4 h-4" />} iconBg="bg-[var(--accent-soft)]" iconColor="text-[var(--accent)]" />
        <KpiCard label="Avg Rating" value={avgRating ? avgRating.toFixed(1) : "—"} icon={<Star className="w-4 h-4" />} iconBg="bg-[var(--info-soft)]" iconColor="text-[var(--info)]" valueColor="text-[var(--info)]" />
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, iconBg, iconColor, valueColor = "text-[var(--foreground)]" }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider truncate">{label}</p>
        <p className={`text-xl font-bold tabular-nums leading-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}