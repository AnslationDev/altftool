"use client";

import { useEffect } from "react";
import { Trophy, Target, Flame, Clock, TrendingUp, RotateCcw, Medal, Download } from "lucide-react";
import { saveHighScore } from "../utils/mathSpeed";
import { OPERATIONS } from "../constants";

export default function Results({ data, onRestart, onReset }) {
  const { score, correct, wrong, totalAnswered, bestStreak, time, operations } = data;
  const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

  useEffect(() => {
    saveHighScore(score, bestStreak, time, operations);
  }, []);

  const grade =
    score >= 500 ? { label: "S+", color: "text-purple-600", bg: "bg-purple-500/10" }
    : score >= 300 ? { label: "S", color: "text-amber-600", bg: "bg-amber-500/10" }
    : score >= 200 ? { label: "A", color: "text-emerald-600", bg: "bg-emerald-500/10" }
    : score >= 100 ? { label: "B", color: "text-blue-600", bg: "bg-blue-500/10" }
    : score >= 50 ? { label: "C", color: "text-amber-600", bg: "bg-amber-500/10" }
    : { label: "D", color: "text-rose-600", bg: "bg-rose-500/10" };

  const opSymbols = operations.map((o) => OPERATIONS.find((op) => op.id === o)?.symbol).join(" ");

  return (
    <div className="space-y-6">
      {/* Grade + Score */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${grade.bg}`}>
          <span className={`text-4xl font-extrabold ${grade.color}`}>{grade.label}</span>
        </div>
        <p className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">Final Score</p>
        <p className="mt-2 text-5xl font-extrabold text-[var(--foreground)]">{score}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {opSymbols} — {time}s — {totalAnswered} questions answered
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Correct</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{correct}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{wrong} wrong</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Accuracy</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{accuracy}%</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Best Streak</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{bestStreak}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Avg Speed</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">
            {totalAnswered > 0 ? (time / totalAnswered).toFixed(1) : "0.0"}s
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">per question</p>
        </div>
      </div>

      {/* Performance */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Performance Summary</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-[var(--section-highlight)] p-3">
            <span className="text-sm text-[var(--foreground)]">Score per question</span>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {totalAnswered > 0 ? (score / totalAnswered).toFixed(1) : 0} pts
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--section-highlight)] p-3">
            <span className="text-sm text-[var(--foreground)]">Questions per minute</span>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {time > 0 ? ((totalAnswered / time) * 60).toFixed(1) : 0}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--section-highlight)] p-3">
            <span className="text-sm text-[var(--foreground)]">Correct rate</span>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {accuracy}% ({correct}/{totalAnswered})
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          <RotateCcw className="h-4 w-4" /> Play Again
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--section-highlight)]"
        >
          New Setup
        </button>
      </div>
    </div>
  );
}
