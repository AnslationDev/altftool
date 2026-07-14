"use client";

import { Trophy, Target, Zap, BarChart3 } from "lucide-react";

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
      <p className="text-lg font-bold leading-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </p>
    </div>
  );
}

export default function StatsPanel({ stats }) {
  const avgAccuracy = stats.accuracyCount > 0
    ? Math.round(stats.totalAccuracy / stats.accuracyCount)
    : 0;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Statistics</p>
      <h3 className="mt-1 text-lg font-semibold">All-Time Stats</h3>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatTile icon={Trophy} label="Best Score" value={stats.highestScore} />
        <StatTile icon={Zap} label="Best Level" value={stats.highestLevel || "—"} />
        <StatTile icon={Target} label="Win Rate" value={
          stats.gamesPlayed > 0
            ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%`
            : "—"
        } />
        <StatTile icon={BarChart3} label="Avg Accuracy" value={avgAccuracy > 0 ? `${avgAccuracy}%` : "—"} />
      </div>

      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">Games Played</span>
          <span className="font-semibold">{stats.gamesPlayed}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-[var(--muted-foreground)]">Games Won</span>
          <span className="font-semibold">{stats.gamesWon}</span>
        </div>
      </div>
    </div>
  );
}
