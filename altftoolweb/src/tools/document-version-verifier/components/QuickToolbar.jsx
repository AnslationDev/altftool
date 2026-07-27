"use client";

import { Search, Filter, SlidersHorizontal, Eye, FileText, Sparkles, Shield, Compass } from "lucide-react";

const COMPARISON_MODES = [
  { id: "exact", label: "Exact Compare", icon: FileText },
  { id: "semantic", label: "Semantic Compare", icon: Sparkles },
  { id: "metadata", label: "Metadata Compare", icon: SlidersHorizontal },
  { id: "visual", label: "Visual Compare", icon: Eye },
  { id: "deep", label: "Deep Audit", icon: Shield },
];

export default function QuickToolbar({
  activeMode,
  onModeChange,
  searchQuery,
  onSearchChange,
  activeFilters,
  onToggleFilter,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Comparison Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
          {COMPARISON_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search words, headings, metadata..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs">
        <span className="font-extrabold uppercase text-slate-400 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> Filters:
        </span>

        {[
          { key: "added", label: "Added (+)", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
          { key: "removed", label: "Removed (-)", color: "text-red-600 bg-red-50 dark:bg-red-950/40" },
          { key: "modified", label: "Modified (~)", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
          { key: "tables", label: "Tables", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
          { key: "images", label: "Images", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
          { key: "security", label: "Security Risk", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => onToggleFilter(f.key)}
            className={`rounded-lg px-2.5 py-1 font-bold transition-all border ${
              activeFilters[f.key]
                ? `${f.color} border-current shadow-sm`
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
