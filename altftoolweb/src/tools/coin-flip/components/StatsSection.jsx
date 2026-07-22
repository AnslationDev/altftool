"use client";

import { motion } from "framer-motion";
import { RotateCcw, TrendingUp, Award, BarChart3, Percent, Zap } from "lucide-react";

export default function StatsSection({ stats, onResetStats }) {
  const headsPct = stats.flips ? Math.round((stats.heads / stats.flips) * 100) : 0;
  const tailsPct = stats.flips ? 100 - headsPct : 0;

  const luckScore = stats.flips
    ? Math.max(0, 100 - Math.abs(50 - headsPct) * 2)
    : 100;

  const favoriteSide =
    stats.heads > stats.tails
      ? "Heads"
      : stats.tails > stats.heads
      ? "Tails"
      : stats.flips > 0
      ? "Equal"
      : "-";

  // Build points for SVG trend chart
  const history = stats.history || [];
  let runningHeads = 0;
  const chartPoints = history.map((item, idx) => {
    if (item === "H") runningHeads++;
    const currentPct = ((runningHeads / (idx + 1)) * 100);
    return { x: (idx / Math.max(history.length - 1, 1)) * 260 + 10, y: 70 - (currentPct / 100) * 50 };
  });

  const pathD =
    chartPoints.length > 1
      ? `M ${chartPoints[0].x} ${chartPoints[0].y} ` +
        chartPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
      : "";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--anslation-ds-primary-soft)] text-[var(--primary)]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Running Stats & Analytics</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Fair distribution, streaks, and balance record</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetStats}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Stats
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tosses */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-semibold">
            <span>Total Tosses</span>
            <Zap className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-3xl font-black text-[var(--foreground)]">{stats.flips}</p>
        </motion.div>

        {/* Heads Count */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--anslation-ds-primary-soft)]/40 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--primary)]">
            <span>Heads Count</span>
            <Percent className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-black text-[var(--primary)]">{stats.heads}</p>
            <span className="text-sm font-bold text-[var(--primary)]">{headsPct}%</span>
          </div>
        </motion.div>

        {/* Tails Count */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--anslation-ds-secondary-soft)]/40 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--secondary)]">
            <span>Tails Count</span>
            <Percent className="h-4 w-4" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-black text-[var(--secondary)]">{stats.tails}</p>
            <span className="text-sm font-bold text-[var(--secondary)]">{tailsPct}%</span>
          </div>
        </motion.div>

        {/* Streaks */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-semibold">
            <span>Best Streak</span>
            <Award className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-black text-[var(--foreground)]">
              {stats.bestLength} <span className="text-xs font-medium text-[var(--muted-foreground)]">flips</span>
            </p>
            <span className="text-xs font-bold text-[var(--primary)] uppercase">
              {stats.bestSide || "-"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Progress Split Meter */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[var(--primary)]">Heads: {headsPct}%</span>
          <span className="text-[var(--muted-foreground)]">50/50 Equilibrium</span>
          <span className="text-[var(--secondary)]">Tails: {tailsPct}%</span>
        </div>
        <div className="mt-2 relative h-3 w-full overflow-hidden rounded-full bg-[var(--muted)] border border-[var(--border)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${headsPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-l-full bg-[var(--primary)]"
          />
        </div>
      </div>

      {/* Analytics Breakdown & Mini Chart */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Additional Stats Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--background)] p-3 border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Current Streak
            </span>
            <p className="mt-1 text-base font-bold text-[var(--foreground)]">
              {stats.currentSide ? `${stats.currentLength}x ${stats.currentSide}` : "-"}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--background)] p-3 border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Equilibrium Score
            </span>
            <p className="mt-1 text-base font-bold text-[var(--anslation-ds-success)]">{luckScore}%</p>
          </div>
          <div className="rounded-xl bg-[var(--background)] p-3 border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Dominant Side
            </span>
            <p className="mt-1 text-base font-bold text-[var(--primary)]">{favoriteSide}</p>
          </div>
          <div className="rounded-xl bg-[var(--background)] p-3 border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Random Engine
            </span>
            <p className="mt-1 text-xs font-semibold text-[var(--foreground)]">Web Crypto API</p>
          </div>
        </div>

        {/* Mini SVG Flip Trend Line Chart */}
        <div className="rounded-xl bg-[var(--background)] p-4 border border-[var(--border)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2 font-semibold">
            <span className="text-[var(--foreground)] flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" /> Heads Distribution Trend
            </span>
            <span>Last 30 Tosses</span>
          </div>

          {history.length > 1 ? (
            <svg className="w-full h-20 overflow-visible" viewBox="0 0 280 80">
              <line x1="10" y1="45" x2="270" y2="45" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
              <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
              {chartPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  className={history[idx] === "H" ? "fill-[var(--primary)]" : "fill-[var(--secondary)]"}
                />
              ))}
            </svg>
          ) : (
            <div className="flex h-20 items-center justify-center text-xs text-[var(--muted-foreground)]">
              Flip at least 2 times to generate balance chart
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
