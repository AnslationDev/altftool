import { Trophy, Target, Clock, TrendingUp } from "lucide-react";

export default function GameStats({ stats }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Statistics</p>
      <h2 className="mt-1 text-xl font-semibold">Your Stats</h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
          <Trophy className="mx-auto h-5 w-5 text-[var(--primary)]" />
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.gamesWon}</p>
          <p className="text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">Won</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
          <Target className="mx-auto h-5 w-5 text-[var(--muted-foreground)]" />
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.gamesPlayed}</p>
          <p className="text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">Played</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
          <TrendingUp className="mx-auto h-5 w-5 text-[var(--primary)]" />
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.winPercentage}%</p>
          <p className="text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">Win Rate</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
          <Clock className="mx-auto h-5 w-5 text-[var(--muted-foreground)]" />
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {stats.fastestWin ? `${stats.fastestWin}s` : "--"}
          </p>
          <p className="text-[11px] font-semibold uppercase text-[var(--muted-foreground)]">Fastest</p>
        </div>
      </div>
    </div>
  );
}
