"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  Timer,
  RotateCcw,
  Trophy,
  BookOpen,
  Lightbulb,
  ChevronRight,
  BarChart3,
  Zap,
  Star,
  Medal,
  TrendingUp,
} from "lucide-react";
import { QUESTIONS, TOPICS, DIFFICULTIES, ACHIEVEMENTS } from "../constants/questions";

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────
const LS_STATS = "altf_grammar_stats";
const QUIZ_TIME = 30; // seconds per question

function loadStats() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(LS_STATS)) || null;
  } catch {
    return null;
  }
}

function saveStats(stats) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
  } catch {}
}

// ────────────────────────────────────────────────────────────────
// Difficulty badge
// ────────────────────────────────────────────────────────────────
function DiffBadge({ level }) {
  const map = {
    easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    hard: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[level] ?? ""}`}
    >
      {level}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────
// Progress bar
// ────────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = "var(--primary)" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Topic Selector Screen
// ────────────────────────────────────────────────────────────────
function TopicSelector({ onStart, stats }) {
  const [topic, setTopic] = useState("All Topics");
  const [difficulty, setDifficulty] = useState("All");

  const count = useMemo(() => {
    return QUESTIONS.filter((q) => {
      const matchT = topic === "All Topics" || q.topic === topic;
      const matchD = difficulty === "All" || q.difficulty === difficulty;
      return matchT && matchD;
    }).length;
  }, [topic, difficulty]);

  const achievements = useMemo(() => {
    if (!stats) return [];
    return ACHIEVEMENTS.filter((a) => a.condition(stats));
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Medal className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-bold text-amber-600">Your Achievements</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <span
                key={a.id}
                className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600"
                title={a.description}
              >
                {a.icon} {a.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats if available */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <p className="text-2xl font-extrabold text-[var(--primary)]">{stats.totalQuizzes || 0}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Quizzes Taken</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{stats.bestScore || 0}%</p>
            <p className="text-xs text-[var(--muted-foreground)]">Best Score</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <p className="text-2xl font-extrabold text-[var(--primary)]">{stats.totalCorrect || 0}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Correct Answers</p>
          </div>
        </div>
      )}

      {/* Topic Selection */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          Select Topic
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              aria-pressed={topic === t}
              className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                topic === t
                  ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          Difficulty
        </label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
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

      {/* Available count + Start */}
      <div className="flex items-center justify-between rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] px-4 py-3">
        <span className="text-sm text-[var(--muted-foreground)]">
          <span className="font-bold text-[var(--foreground)]">{count}</span> questions available
        </span>
        <button
          disabled={count === 0}
          onClick={() => onStart({ topic, difficulty })}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Start Quiz
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Active Quiz Screen
// ────────────────────────────────────────────────────────────────
function ActiveQuiz({ config, onFinish }) {
  const questions = useMemo(() => {
    const pool = QUESTIONS.filter((q) => {
      const matchT = config.topic === "All Topics" || q.topic === config.topic;
      const matchD = config.difficulty === "All" || q.difficulty === config.difficulty;
      return matchT && matchD;
    });
    return pool.sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
  }, [config]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [answers, setAnswers] = useState([]);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  const current = questions[idx];

  // Timer
  useEffect(() => {
    setTimeLeft(QUIZ_TIME);
    setTimedOut(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setSelected("__timeout__");
          setShowExplanation(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx]);

  const choose = (opt) => {
    if (selected) return;
    clearInterval(timerRef.current);
    setSelected(opt);
    setShowExplanation(true);
    const isCorrect = opt === current.answer;
    setAnswers((prev) => [
      ...prev,
      { question: current, selected: opt, correct: isCorrect, timeTaken: QUIZ_TIME - timeLeft },
    ]);
  };

  const next = () => {
    if (!selected && !timedOut) return;
    setShowHint(false);
    setShowExplanation(false);
    if (idx + 1 >= questions.length) {
      const score = [...answers].filter((a) => a.correct).length + (selected === current.answer ? 1 : 0);
      onFinish({ answers, questions, score: answers.filter((a) => a.correct).length });
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  const timerColor =
    timeLeft > 15 ? "#16a34a" : timeLeft > 8 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-5">
      {/* Progress + Timer */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              Question {idx + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" style={{ color: timerColor }} />
              <span className="text-xs font-bold tabular-nums" style={{ color: timerColor }}>
                {timeLeft}s
              </span>
            </div>
          </div>
          <ProgressBar value={idx + 1} max={questions.length} />
        </div>
      </div>

      {/* Timer ring */}
      <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(timeLeft / QUIZ_TIME) * 100}%`,
            background: timerColor,
            transition: "width 1s linear, background 0.3s",
          }}
        />
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--primary)]">
            {current.topic}
          </span>
          <DiffBadge level={current.difficulty} />
        </div>
        <p className="text-base font-semibold text-[var(--foreground)] leading-relaxed">
          {current.question}
        </p>

        {/* Hint */}
        {!selected && (
          <button
            onClick={() => setShowHint((v) => !v)}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        {showHint && (
          <p className="mt-2 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/20 px-3 py-2 text-xs text-[var(--primary)] italic">
            💡 {current.hint}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {current.options.map((opt, i) => {
          const isCorrect = opt === current.answer;
          const isSelected = opt === selected;
          let cls =
            "w-full text-left rounded-xl border p-4 text-sm font-medium transition-all duration-150 flex items-start gap-3 ";
          if (!selected) {
            cls +=
              "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 cursor-pointer";
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
              onClick={() => choose(opt)}
              disabled={!!selected || timedOut}
              aria-label={`Option ${i + 1}: ${opt}`}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {selected && isCorrect && <CheckCircle className="shrink-0 h-4 w-4 text-emerald-600" />}
              {selected && isSelected && !isCorrect && <XCircle className="shrink-0 h-4 w-4 text-red-500" />}
            </button>
          );
        })}
      </div>

      {/* Timed out */}
      {timedOut && !selected && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-600">
          ⏰ Time&apos;s up! The correct answer was:{" "}
          <span className="font-bold">{current.answer}</span>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
            Explanation
          </p>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {current.explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      {(selected || timedOut) && (
        <button
          onClick={next}
          className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
        >
          {idx + 1 >= questions.length ? "See Results" : "Next Question"}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Results Screen
// ────────────────────────────────────────────────────────────────
function Results({ data, onRestart, onHome }) {
  const { answers, questions } = data;
  const correct = answers.filter((a) => a.correct).length;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);
  const avgTime = answers.length
    ? Math.round(answers.reduce((s, a) => s + (a.timeTaken || 0), 0) / answers.length)
    : 0;

  // Topic performance
  const topicMap = {};
  answers.forEach((a) => {
    const t = a.question.topic;
    if (!topicMap[t]) topicMap[t] = { correct: 0, total: 0 };
    topicMap[t].total++;
    if (a.correct) topicMap[t].correct++;
  });

  const grade =
    pct >= 90 ? { label: "Excellent! 🏆", color: "text-amber-500" } :
    pct >= 70 ? { label: "Great work! 🎉", color: "text-emerald-600" } :
    pct >= 50 ? { label: "Good effort! 💪", color: "text-blue-600" } :
    { label: "Keep practicing! 📚", color: "text-orange-600" };

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--card)] p-6 text-center">
        <Trophy className="mx-auto h-12 w-12 text-amber-400 mb-3" />
        <p className={`text-4xl font-extrabold ${grade.color} mb-1`}>{pct}%</p>
        <p className="text-lg font-bold text-[var(--foreground)]">{grade.label}</p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {correct} of {total} correct
        </p>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-2xl font-extrabold text-emerald-600">{correct}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Correct</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
          <p className="text-2xl font-extrabold text-red-500">{total - correct}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Wrong</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
          <p className="text-2xl font-extrabold text-[var(--primary)]">{avgTime}s</p>
          <p className="text-xs text-[var(--muted-foreground)]">Avg Time</p>
        </div>
      </div>

      {/* Topic performance */}
      {Object.keys(topicMap).length > 1 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-sm font-bold text-[var(--foreground)]">Topic Performance</p>
          </div>
          <div className="space-y-3">
            {Object.entries(topicMap).map(([topic, { correct: c, total: t }]) => (
              <div key={topic}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">{topic}</span>
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    {c}/{t}
                  </span>
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

      {/* Answer review */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm font-bold text-[var(--foreground)] mb-4">Answer Review</p>
        <div className="space-y-3">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                a.correct
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-red-400/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-2">
                {a.correct ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-2">
                    {a.question.question}
                  </p>
                  {!a.correct && (
                    <p className="text-xs text-emerald-600 mt-0.5">
                      ✓ {a.question.answer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          Change Topic
        </button>
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────
export default function GrammarQuizPage() {
  const [screen, setScreen] = useState("home"); // home | quiz | results
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState(null);
  const [stats, setStats] = useState(() => loadStats());

  const handleStart = (cfg) => {
    setConfig(cfg);
    setScreen("quiz");
  };

  const handleFinish = useCallback(
    (data) => {
      setResults(data);
      setScreen("results");
      const pct = Math.round((data.score / data.questions.length) * 100);
      const topicsTried = [...new Set([...(stats?.topicsTried || []), config?.topic])];
      const newStats = {
        totalQuizzes: (stats?.totalQuizzes || 0) + 1,
        totalCorrect: (stats?.totalCorrect || 0) + data.score,
        bestScore: Math.max(stats?.bestScore || 0, pct),
        perfectScores: (stats?.perfectScores || 0) + (pct === 100 ? 1 : 0),
        topicsTried,
      };
      setStats(newStats);
      saveStats(newStats);
    },
    [stats, config]
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        {/* ── Hero Header ── */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
            <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--primary)]">
              Interactive Grammar Practice
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Grammar Quiz
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-[var(--muted-foreground)]">
            Test and improve your English grammar skills across 13 topics. Get instant feedback,
            hints, and detailed explanations for every question.
          </p>
        </div>

        {/* ── Content ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          {screen === "home" && (
            <TopicSelector onStart={handleStart} stats={stats} />
          )}
          {screen === "quiz" && config && (
            <ActiveQuiz
              config={config}
              onFinish={handleFinish}
            />
          )}
          {screen === "results" && results && (
            <Results
              data={results}
              onRestart={() => handleStart(config)}
              onHome={() => setScreen("home")}
            />
          )}
        </div>

        {/* Feature chips */}
        {screen === "home" && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { icon: Zap, label: "30-Second Timer" },
              { icon: Lightbulb, label: "Hints & Explanations" },
              { icon: BarChart3, label: "Performance Analytics" },
              { icon: Star, label: "Achievements" },
              { icon: BookOpen, label: "13 Grammar Topics" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
