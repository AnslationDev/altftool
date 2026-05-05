"use client";

import { useState } from "react";
import PlacementPreviewModal from "./PlacementPreviewModal";
import { Plus, Eye, Activity, PauseCircle, Layers, Layout, Key, Loader2 } from "lucide-react";

export default function PlacementHeader({
  placementKey,
  placement,
  activeCount,
  pausedCount,
  total,
  onCreate,
  onCreateDisabled = false, // true while dynamic categories are being fetched
}) {
  const [showPreview, setShowPreview] = useState(false);
  const activePercent = total ? Math.round((activeCount / total) * 100) : 0;
  const healthColor = activePercent >= 70
    ? "bg-green-500"
    : activePercent >= 40
    ? "bg-amber-400"
    : "bg-red-500";
  const healthLabel = activePercent >= 70 ? "Healthy" : activePercent >= 40 ? "Moderate" : "Low";
  const healthTextColor = activePercent >= 70
    ? "text-green-600"
    : activePercent >= 40
    ? "text-amber-600"
    : "text-red-500";

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gray-100">
          <div className={`h-full ${healthColor} transition-all duration-700`}
            style={{ width: `${activePercent}%` }} />
        </div>

        <div className="p-7 space-y-7">

          {/* Main row */}
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">

            {/* Left: title + meta + health */}
            <div className="space-y-5 max-w-xl">

              {/* Title + description */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    {placement?.label || placementKey}
                  </h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    activePercent >= 70
                      ? "bg-green-100 text-green-700"
                      : activePercent >= 40
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {healthLabel}
                  </span>
                </div>
                {placement?.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {placement.description}
                  </p>
                )}
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2">
                {placement?.layout && (
                  <MetaChip icon={<Layout className="w-3 h-3" />} label="Layout" value={placement.layout} />
                )}
                <MetaChip icon={<Key className="w-3 h-3" />} label="Key" value={placementKey} mono />
                {placement?.recommended && (
                  <MetaChip
                    icon={<Eye className="w-3 h-3" />}
                    label="Recommended"
                    value={`${placement.recommended.width} × ${placement.recommended.height}px`}
                  />
                )}
              </div>

              {/* Active ratio bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Active Ratio</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold tabular-nums ${healthTextColor}`}>{activePercent}%</span>
                    <span className="text-gray-300">·</span>
                    <span className={`text-[10px] font-semibold ${healthTextColor}`}>{healthLabel}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${healthColor} transition-all duration-700`}
                    style={{ width: `${activePercent}%` }} />
                </div>
                {total === 0 && (
                  <p className="text-xs text-gray-400">No ads in this placement yet.</p>
                )}
              </div>
            </div>

            {/* Right: stats + actions */}
            <div className="flex flex-col items-start xl:items-end gap-6">

              {/* Stats */}
              <div className="flex gap-1">
                <StatCard
                  label="Total"
                  value={total}
                  icon={<Layers className="w-4 h-4" />}
                  iconBg="bg-slate-100"
                  iconColor="text-slate-600"
                />
                <StatCard
                  label="Active"
                  value={activeCount}
                  icon={<Activity className="w-4 h-4" />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  valueColor="text-green-600"
                />
                <StatCard
                  label="Paused"
                  value={pausedCount}
                  icon={<PauseCircle className="w-4 h-4" />}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  valueColor="text-amber-600"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={onCreate}
                  disabled={onCreateDisabled}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl transition shadow-sm"
                >
                  {onCreateDisabled
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Plus className="w-4 h-4" />
                  }
                  {onCreateDisabled ? "Loading…" : "Create Ad"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <PlacementPreviewModal
          placementKey={placementKey}
          placement={placement}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

/* ── Meta chip ── */
function MetaChip({ icon, label, value, mono }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-xs font-semibold text-gray-700 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, icon, iconBg, iconColor, valueColor = "text-gray-800" }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-gray-50 border border-gray-100 min-w-[90px]">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="text-center">
        <p className={`text-2xl font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}