"use client";

import { useEffect, useMemo } from "react";
import {
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  Target,
  Flame,
  Clock,
  TrendingUp,
  BarChart3,
  Medal,
  ArrowRight,
} from "lucide-react";
import { saveStats, saveHistory, saveLeaderboard } from "../utils/storage";

function ProgressBar({ value, max, color = "var(--primary)" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export default function QuizResults({ data, config, onRestart, onHome }) {
  const { answers, questions, bestStreak } = data;
  const total = questions.length;
  const correct = answers.filter((a) => a.correct).length;
  const skipped = answers.filter((a) => a.selected === "__skipped__").length;
  const pct = Math.round((correct / total) * 100);
  const avgTime = answers.length
    ? Math.round(answers.reduce((s, a) => s + (a.timeTaken || 0), 0) / answers.length)
    : 0;

  const categoryMap = useMemo(() => {
    const map = {};
    answers.forEach((a) => {
      const cat = a.question.category || "Other";
      if (!map[cat]) map[cat] = { correct: 0, total: 0 };
      map[cat].total++;
      if (a.correct) map[cat].correct++;
    });
    return map;
  }, [answers]);

  useEffect(() => {
    const stats = JSON.parse(localStorage.getItem("altft_country_quiz_stats") || "null") || {
      totalQuizzes: 0,
      totalCorrect: 0,
      bestScore: 0,
      bestStreak: 0,
      perfectScores: 0,
    };
    stats.totalQuizzes = (stats.totalQuizzes || 0) + 1;
    stats.totalCorrect = (stats.totalCorrect || 0) + correct;
    stats.bestScore = Math.max(stats.bestScore || 0, pct);
    stats.bestStreak = Math.max(stats.bestStreak || 0, bestStreak || 0);
    stats.perfectScores = (stats.perfectScores || 0) + (pct === 100 ? 1 : 0);
    localStorage.setItem("altft_country_quiz_stats", JSON.stringify(stats));

    saveHistory({
      date: new Date().toISOString(),
      score: pct,
      correct,
      total,
      type: config?.type || "random",
      difficulty: config?.difficulty || "mixed",
    });

    saveLeaderboard({
      score: pct,
      correct,
      total,
      time: avgTime,
      type: config?.type || "random",
    });
  }, []);

  const grade =
    pct >= 90
      ? { label: "Excellent!", color: "text-amber-500", icon: "🏆" }
      : pct >= 70
        ? { label: "Great work!", color: "text-emerald-600", icon: "🎉" }
        : pct >= 50
          ? { label: "Good effort!", color: "text-blue-600", icon: "💪" }
          : { label: "Keep practicing!", color: "text-orange-600", icon: "📚" };

  const strongCategories = Object.entries(categoryMap)
    .filter(([, v]) => v.correct === v.total && v.total > 0)
    .map(([k]) => k);
  const weakCategories = Object.entries(categoryMap)
    .filter(([, v]) => v.correct === 0 && v.total > 0)
    .map(([k]) => k);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--card)] p-6 text-center shadow-sm">
        <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-400" />
        <p className={`text-4xl font-extrabold ${grade.color} mb-1`}>{pct}%</p>
        <p className="text-lg font-bold text-[var(--foreground)]">
          {grade.icon} {grade.label}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {correct} of {total} correct
          {skipped > 0 && ` · ${skipped} skipped`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
          <p className="text-2xl font-extrabold text-emerald-600">{correct}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Correct</p>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-center shadow-sm">
          <XCircle className="mx-auto mb-1 h-5 w-5 text-rose-500" />
          <p className="text-2xl font-extrabold text-rose-500">{total - correct - skipped}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Wrong</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center shadow-sm">
          <Flame className="mx-auto mb-1 h-5 w-5 text-amber-500" />
          <p className="text-2xl font-extrabold text-amber-500">{bestStreak || 0}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Best Streak</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center shadow-sm">
          <Clock className="mx-auto mb-1 h-5 w-5 text-[var(--primary)]" />
          <p className="text-2xl font-extrabold text-[var(--foreground)]">{avgTime}s</p>
          <p className="text-xs text-[var(--muted-foreground)]">Avg Time</p>
        </div>
      </div>

      {Object.keys(categoryMap).length > 1 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-sm font-bold text-[var(--foreground)]">Category Performance</p>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryMap).map(([cat, { correct: c, total: t }]) => (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold capitalize text-[var(--muted-foreground)]">{cat}</span>
                  <span className="text-xs font-bold text-[var(--foreground)]">{c}/{t}</span>
                </div>
                <ProgressBar
                  value={c}
                  max={t}
                  color={c === t ? "#16a34a" : c === 0 ? "#ef4444" : "var(--primary)"}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {(strongCategories.length > 0 || weakCategories.length > 0) && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="mb-3 text-sm font-bold text-[var(--foreground)]">Performance Insights</p>
          <div className="space-y-2">
            {strongCategories.length > 0 && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <p className="text-xs font-bold text-emerald-600">Strong Categories</p>
                <p className="text-xs text-[var(--muted-foreground)]">{strongCategories.join(", ")}</p>
              </div>
            )}
            {weakCategories.length > 0 && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-xs font-bold text-amber-600">Suggested Practice</p>
                <p className="text-xs text-[var(--muted-foreground)]">{weakCategories.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
        <p className="mb-4 text-sm font-bold text-[var(--foreground)]">Answer Review</p>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                a.correct
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-400/20 bg-rose-500/5"
              }`}
            >
              <div className="flex items-start gap-2">
                {a.correct ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-2">
                    {a.question.question}
                  </p>
                  {a.selected === "__skipped__" && (
                    <p className="mt-0.5 text-xs text-amber-500">Skipped</p>
                  )}
                  {!a.correct && a.selected !== "__skipped__" && a.selected !== "__timeout__" && (
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      Your answer: <span className="text-rose-500">{a.selected}</span>
                    </p>
                  )}
                  {!a.correct && (
                    <p className="mt-0.5 text-xs text-emerald-600">✓ {a.question.answer}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--muted)]"
        >
          New Quiz
        </button>
        <button
          onClick={onRestart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          <RotateCcw className="h-4 w-4" />
          Play Again
        </button>
      </div>
    </div>
  );
}
