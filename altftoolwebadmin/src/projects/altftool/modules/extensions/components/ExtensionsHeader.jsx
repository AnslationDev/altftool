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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Extensions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all browser extensions in one place</p>
        </div>
        <button onClick={onCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" />Add Extension
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total" value={total} icon={<Puzzle className="w-4 h-4" />} iconBg="bg-slate-100" iconColor="text-slate-600" />
        <KpiCard label="Chrome Store" value={chromeCount} icon={<Chrome className="w-4 h-4" />} iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-600" />
        <KpiCard label="Missing URL" value={noChromeCount} icon={<AlertTriangle className="w-4 h-4" />} iconBg="bg-amber-100" iconColor="text-amber-600" valueColor={noChromeCount > 0 ? "text-amber-600" : "text-gray-800"} />
        <KpiCard label="Categories" value={categories} icon={<Tag className="w-4 h-4" />} iconBg="bg-indigo-100" iconColor="text-indigo-600" />
        <KpiCard label="Avg Rating" value={avgRating ? avgRating.toFixed(1) : "—"} icon={<Star className="w-4 h-4" />} iconBg="bg-yellow-100" iconColor="text-yellow-600" valueColor="text-yellow-600" />
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, iconBg, iconColor, valueColor = "text-gray-800" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-xl font-bold tabular-nums leading-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}