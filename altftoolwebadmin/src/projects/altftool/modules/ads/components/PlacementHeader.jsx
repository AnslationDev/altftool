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
    ? "bg-[var(--success)]"
    : activePercent >= 40
    ? "bg-[var(--warning)]"
    : "bg-[var(--danger)]";
  const healthLabel = activePercent >= 70 ? "Healthy" : activePercent >= 40 ? "Moderate" : "Low";
  const healthTextColor = activePercent >= 70
    ? "text-[var(--success-text)]"
    : activePercent >= 40
    ? "text-[var(--warning-text)]"
    : "text-[var(--danger-text)]";

  return (
    <>
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-[var(--surface-soft)]">
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
                  <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                    {placement?.label || placementKey}
                  </h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    activePercent >= 70
                      ? "bg-[var(--success-soft)] text-[var(--success-text)]"
                      : activePercent >= 40
                      ? "bg-[var(--warning-soft)] text-[var(--warning-text)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger-text)]"
                  }`}>
                    {healthLabel}
                  </span>
                </div>
                {placement?.description && (
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
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
                  <span className="text-[var(--muted)] font-medium">Active Ratio</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold tabular-nums ${healthTextColor}`}>{activePercent}%</span>
                    <span className="text-[var(--muted)]">·</span>
                    <span className={`text-[10px] font-semibold ${healthTextColor}`}>{healthLabel}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                  <div className={`h-full rounded-full ${healthColor} transition-all duration-700`}
                    style={{ width: `${activePercent}%` }} />
                </div>
                {total === 0 && (
                  <p className="text-xs text-[var(--muted)]">No ads in this placement yet.</p>
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
                  iconBg="bg-[var(--surface-soft)]"
                  iconColor="text-[var(--muted)]"
                />
                <StatCard
                  label="Active"
                  value={activeCount}
                  icon={<Activity className="w-4 h-4" />}
                  iconBg="bg-[var(--success-soft)]"
                  iconColor="text-[var(--success-text)]"
                  valueColor="text-[var(--success-text)]"
                />
                <StatCard
                  label="Paused"
                  value={pausedCount}
                  icon={<PauseCircle className="w-4 h-4" />}
                  iconBg="bg-[var(--warning-soft)]"
                  iconColor="text-[var(--warning-text)]"
                  valueColor="text-[var(--warning-text)]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-[var(--border)] text-[var(--muted)] rounded-xl hover:bg-[var(--surface-soft)] transition"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={onCreate}
                  disabled={onCreateDisabled}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-[var(--primary-foreground)] rounded-xl transition shadow-sm"
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
    <div className="inline-flex items-center gap-1.5 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-2.5 py-1.5">
      <span className="text-[var(--muted)]">{icon}</span>
      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{label}</span>
      <span className={`text-xs font-semibold text-[var(--foreground)] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, icon, iconBg, iconColor, valueColor = "text-[var(--foreground)]" }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] min-w-[90px]">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="text-center">
        <p className={`text-2xl font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
        <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}