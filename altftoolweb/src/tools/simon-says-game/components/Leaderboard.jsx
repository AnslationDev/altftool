"use client";

import { Medal } from "lucide-react";

export default function Leaderboard({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
        <p className="text-xs font-semibold uppercase text-[var(--primary)]">Leaderboard</p>
        <h3 className="mt-1 text-lg font-semibold">Top Scores</h3>
        <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">
          No scores yet. Play a game to get on the board!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Leaderboard</p>
      <h3 className="mt-1 text-lg font-semibold">Top Scores</h3>

      <div className="mt-3 space-y-2">
        {entries.slice(0, 5).map((entry, i) => (
          <div
            key={`${entry.score}-${i}`}
            className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--foreground)]">
              {i < 3 ? (
                <Medal className={`h-4 w-4 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-700"}`} />
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {entry.mode} · {entry.difficulty}
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Level {entry.level} · {entry.date}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-[var(--primary)]">
              {entry.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
