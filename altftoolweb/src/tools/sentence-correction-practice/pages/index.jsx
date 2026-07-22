"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  Zap,
  Lightbulb,
} from "lucide-react";
import { CATEGORIES, DIFFICULTIES, SENTENCE_CORRECTIONS } from "../constants/data";

// ────────────────────────────────────────────────────────────────
// Progress bar
// ────────────────────────────────────────────────────────────────
function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
        style={{ width: `${pct}%` }}
        role="progressbar"
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Difficulty badge
// ────────────────────────────────────────────────────────────────
function DiffBadge({ level }) {
  const map = {
    beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[level] ?? ""}`}
    >
      {level}
    </span>
  );
}

export default function SentenceCorrectionPage() {
  const [screen, setScreen] = useState("home"); // home | practice | results

  // Settings
  const [category, setCategory] = useState("All Categories");
  const [difficulty, setDifficulty] = useState("All");

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Generate question pool based on filters
  const pool = useMemo(() => {
    return SENTENCE_CORRECTIONS.filter((q) => {
      const matchC = category === "All Categories" || q.category === category;
      const matchD = difficulty === "All" || q.difficulty === difficulty;
      return matchC && matchD;
    });
  }, [category, difficulty]);

  const startPractice = () => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10); // max 10
    setQuestions(shuffled);
    setIdx(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setScreen("practice");
  };

  const handleSelect = (opt) => {
    if (selected) return; // Prevent double click
    setSelected(opt);

    const q = questions[idx];
    const isCorrect = opt === q.correct;
    if (isCorrect) setScore((s) => s + 1);

    setAnswers((prev) => [
      ...prev,
      { question: q, selected: opt, correct: isCorrect },
    ]);
  };

  const nextQuestion = () => {
    if (idx + 1 >= questions.length) {
      setScreen("results");
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  // --- RENDERS ---

  if (screen === "home") {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--primary)]">Practice Tool</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Sentence Correction
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-[var(--muted-foreground)]">
              Identify grammatical errors, learn proper structure, and master English writing mechanics through interactive practice.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-[var(--border)] pb-4">
              <Filter className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">Practice Settings</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                  Category Focus
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition-colors ${
                        category === c
                          ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 rounded-xl border py-2 text-sm font-semibold capitalize transition-colors ${
                        difficulty === d
                          ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] px-4 py-3">
              <span className="text-sm text-[var(--muted-foreground)]">
                <span className="font-bold text-[var(--foreground)]">{pool.length}</span> questions match
              </span>
              <button
                disabled={pool.length === 0}
                onClick={startPractice}
                className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Start Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "practice") {
    const q = questions[idx];
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Question {idx + 1} of {questions.length}
            </span>
            <span className="text-sm font-bold text-[var(--primary)]">Score: {score}</span>
          </div>

          <ProgressBar value={idx + 1} max={questions.length} />

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--primary)]">
                {q.category}
              </span>
              <DiffBadge level={q.difficulty} />
            </div>

            <p className="text-[var(--muted-foreground)] text-sm font-bold uppercase tracking-wider mb-2">
              Identify the correct version of the sentence:
            </p>
            <p className="text-xl font-bold text-[var(--foreground)] italic border-l-4 border-red-500/50 pl-4 py-1">
              &quot;{q.incorrect}&quot;
            </p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = opt === q.correct;
              const isSelected = opt === selected;
              let cls = "w-full text-left rounded-xl border p-4 text-sm font-medium transition-all duration-150 flex items-start gap-3 ";

              if (!selected) {
                cls += "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 cursor-pointer";
              } else if (isCorrect) {
                cls += "border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold";
              } else if (isSelected) {
                cls += "border-red-400 bg-red-500/10 text-red-600 font-bold";
              } else {
                cls += "border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-default";
              }

              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handleSelect(opt)}
                  disabled={!!selected}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                  {selected && isCorrect && <Check className="shrink-0 h-4 w-4 text-emerald-600" />}
                  {selected && isSelected && !isCorrect && <XCircle className="shrink-0 h-4 w-4 text-red-500" />}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-5 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-[var(--primary)]" />
                <p className="font-bold text-[var(--foreground)]">Explanation</p>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {q.explanation}
              </p>
              <button
                onClick={nextQuestion}
                className="mt-4 w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                {idx + 1 >= questions.length ? "View Results" : "Next Question"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results Screen
  const pct = Math.round((score / questions.length) * 100);
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--card)] p-8 text-center shadow-sm">
          <Trophy className="mx-auto h-16 w-16 text-amber-400 mb-4" />
          <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">Practice Complete!</h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            You scored {score} out of {questions.length} (<span className="font-bold text-[var(--foreground)]">{pct}%</span>)
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-[var(--foreground)]">Review Responses</h3>
          <div className="space-y-4">
            {answers.map((a, i) => (
              <div key={i} className={`rounded-xl border p-4 ${a.correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-400/20 bg-red-500/5"}`}>
                <div className="flex items-start gap-2">
                  {a.correct ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" /> : <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm text-[var(--foreground)] mb-2"><span className="font-bold text-[var(--muted-foreground)]">Original:</span> {a.question.incorrect}</p>
                    {!a.correct && (
                      <p className="text-sm text-red-600 mb-1"><span className="font-bold">You selected:</span> {a.selected}</p>
                    )}
                    <p className="text-sm text-emerald-700 font-medium"><span className="font-bold">Correct:</span> {a.question.correct}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setScreen("home")}
            className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Change Settings
          </button>
          <button
            onClick={startPractice}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
