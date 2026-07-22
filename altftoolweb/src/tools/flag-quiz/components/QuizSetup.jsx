"use client";

import { useState, useMemo } from "react";
import {
  Play,
  Flag,
  Globe,
  Building2,
  Map,
  Banknote,
  Languages,
  Ruler,
  MapPin,
  Shuffle,
  Trophy,
} from "lucide-react";
import { DIFFICULTIES, QUESTION_TYPES, QUESTION_COUNTS, TIME_OPTIONS } from "../constants";
import { loadStats, loadLeaderboard } from "../utils/storage";

export default function QuizSetup({ onStart, loading }) {
  const [questionType, setQuestionType] = useState("random");
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const stats = useMemo(() => loadStats(), []);
  const leaderboard = useMemo(() => loadLeaderboard().slice(0, 5), []);

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-[var(--primary)]">{stats.totalQuizzes || 0}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Quizzes Taken</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-emerald-600">{stats.bestScore || 0}%</p>
            <p className="text-xs text-[var(--muted-foreground)]">Best Score</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-[var(--primary)]">{stats.totalCorrect || 0}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Correct Answers</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-amber-600">{stats.bestStreak || 0}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Best Streak</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Question Type</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUESTION_TYPES.map((t) => {
              const icons = {
                identify: Flag,
                reverse: Globe,
                capital: Building2,
                continent: Map,
                currency: Banknote,
                language: Languages,
                area: Ruler,
                region: MapPin,
                random: Shuffle,
              };
              const Icon = icons[t.id] || Flag;
              return (
                <button
                  key={t.id}
                  onClick={() => setQuestionType(t.id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    questionType === t.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      questionType === t.id
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)] text-[var(--primary)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--foreground)]">{t.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Difficulty</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  difficulty === d.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <p className="text-sm font-bold text-[var(--foreground)]">{d.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{d.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Number of Questions</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                  questionCount === count
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Time Per Question</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTimePerQuestion(t.id)}
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                  timePerQuestion === t.id
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          onStart({
            type: questionType,
            difficulty,
            count: questionCount,
            timePerQuestion,
          })
        }
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-40"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Loading Flags...
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            Start Flag Quiz
          </>
        )}
      </button>

      {leaderboard.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-[var(--foreground)]">Recent Best Scores</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {leaderboard.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--muted-foreground)]">#{i + 1}</span>
                  <span className="text-sm text-[var(--foreground)]">{entry.score}%</span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {entry.correct}/{entry.total} · {entry.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
