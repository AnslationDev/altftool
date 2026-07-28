"use client";

import { useMemo } from "react";
import { TrendingUp, Activity, PauseCircle, Layers, BarChart2, Clock } from "lucide-react";

export default function OverviewDashboard({ ads }) {
  const total = ads.length;
  const active = ads.filter((a) => a.status === "active").length;
  const paused = ads.filter((a) => a.status === "paused").length;
  const activeRate = total ? Math.round((active / total) * 100) : 0;

  const byPlacement = useMemo(() => {
    const map = {};
    ads.forEach((ad) => (ad.placements || []).forEach((p) => { map[p] = (map[p] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [ads]);

  const recentAds = useMemo(() =>
    [...ads].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 6),
    [ads]);

  const topPlacement = byPlacement[0];

  return (
    <div className="space-y-8">

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Ads"
          value={total}
          icon={<Layers className="w-5 h-5" />}
          iconBg="bg-[var(--surface-soft)]"
          iconColor="text-[var(--muted)]"
        />
        <KpiCard
          label="Active Ads"
          value={active}
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-[var(--success-soft)]"
          iconColor="text-[var(--success-text)]"
          valueColor="text-[var(--success-text)]"
        />
        <KpiCard
          label="Paused Ads"
          value={paused}
          icon={<PauseCircle className="w-5 h-5" />}
          iconBg="bg-[var(--warning-soft)]"
          iconColor="text-[var(--warning-text)]"
          valueColor="text-[var(--warning-text)]"
        />
        <KpiCard
          label="Active Rate"
          value={`${activeRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg={activeRate >= 70 ? "bg-[var(--success-soft)]" : "bg-[var(--danger-soft)]"}
          iconColor={activeRate >= 70 ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}
          valueColor={activeRate >= 70 ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}
          hint={activeRate >= 70 ? "Looking healthy" : "Below 70% threshold"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Placement breakdown ── */}
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Ads by Placement</h3>
            </div>
            <span className="text-xs text-[var(--muted)]">{byPlacement.length} placement{byPlacement.length !== 1 ? "s" : ""}</span>
          </div>

          {total === 0 ? (
            <EmptyState message="No ads to display yet." />
          ) : (
            <div className="space-y-4">
              {byPlacement.map(([key, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-[var(--foreground)] capitalize">{key.replaceAll("_", " ")}</span>
                      <span className="text-xs text-[var(--muted)] tabular-nums">{count} ad{count !== 1 ? "s" : ""} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/70 transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick insights ── */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--warning-soft)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[var(--warning-text)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">Insights</h3>
          </div>

          {total === 0 ? (
            <EmptyState message="No insights yet." />
          ) : (
            <div className="space-y-1">
              <InsightRow label="Top Placement" value={topPlacement ? topPlacement[0].replaceAll("_", " ") : "—"} capitalize />
              <InsightRow label="Most Used" value={topPlacement ? `${topPlacement[1]} ads` : "—"} />
              <InsightRow
                label="Active Rate"
                value={`${activeRate}%`}
                accent={activeRate >= 70 ? "green" : "red"}
              />
              <InsightRow label="Total Placements" value={byPlacement.length} />
              <InsightRow label="Paused" value={paused} accent={paused > 0 ? "amber" : undefined} />
            </div>
          )}
        </div>
      </div>

      {/* ── Recent ads ── */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-soft)] flex items-center justify-center">
            <Clock className="w-4 h-4 text-[var(--muted)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">Recently Created</h3>
        </div>

        {recentAds.length === 0 ? (
          <EmptyState message="No ads created yet." />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {recentAds.map((ad) => (
              <div key={ad.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{ad.title || ad.id}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                    {ad.placements?.map((p) => p.replaceAll("_", " ")).join(", ") || "No placements"}
                  </p>
                </div>
                <StatusBadge status={ad.status} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

/* ── Sub-components ── */

function KpiCard({ label, value, icon, iconBg, iconColor, valueColor = "text-[var(--foreground)]", hint }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      {hint && <p className="text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

function InsightRow({ label, value, accent, capitalize }) {
  const color = accent === "green" ? "text-[var(--success-text)]"
    : accent === "red" ? "text-[var(--danger-text)]"
    : accent === "amber" ? "text-[var(--warning-text)]"
    : "text-[var(--foreground)]";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className={`text-sm font-semibold ${color} ${capitalize ? "capitalize" : ""}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
      status === "active" ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--warning-soft)] text-[var(--warning-text)]"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} />
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return <p className="text-sm text-[var(--muted)] py-4 text-center">{message}</p>;
}