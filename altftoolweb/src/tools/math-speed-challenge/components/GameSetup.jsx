"use client";

import { useState, useMemo } from "react";
import { Play, Trophy, Clock, Zap } from "lucide-react";
import { OPERATIONS, TIME_OPTIONS, STREAK_THRESHOLDS } from "../constants";
import { getHighScores } from "../utils/mathSpeed";

export default function GameSetup({ onStart }) {
  const [selectedOps, setSelectedOps] = useState(["add", "sub"]);
  const [timeLimit, setTimeLimit] = useState(60);
  const highScores = useMemo(() => getHighScores(), []);

  const toggleOp = (op) => {
    setSelectedOps((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    );
  };

  return (
    <div className="space-y-6">
      {/* Operations */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Select Operations</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OPERATIONS.map((op) => (
              <button
                key={op.id}
                onClick={() => toggleOp(op.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  selectedOps.includes(op.id)
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <span className={`text-3xl font-extrabold ${op.color}`}>{op.symbol}</span>
                <span className="text-xs font-bold text-[var(--foreground)]">{op.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Time Limit */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Time Limit</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeLimit(t.id)}
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                  timeLimit === t.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Difficulty Tiers */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Difficulty Tiers</h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Difficulty increases automatically as your streak grows</p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {STREAK_THRESHOLDS.map((t) => (
            <div key={t.streak} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ background: t.color }} />
                <span className="text-sm font-bold text-[var(--foreground)]">{t.label}</span>
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">
                {t.streak === 0 ? "Start" : `${t.streak}+ streak`} — numbers up to {t.numberMax}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* High Scores */}
      {highScores.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-[var(--foreground)]">High Scores</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {highScores.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--muted-foreground)]">#{i + 1}</span>
                  <span className="text-sm text-[var(--foreground)]">{s.score} pts</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--muted-foreground)]">Streak: {s.streak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (selectedOps.length > 0) onStart({ operations: selectedOps, timeLimit });
        }}
        disabled={selectedOps.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-40"
      >
        <Play className="h-5 w-5" />
        Start Challenge
      </button>
    </div>
  );
}
