"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Timer,
  SkipForward,
  ChevronRight,
  Lightbulb,
  Flame,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react";
import useQuizTimer from "../hooks/useQuizTimer";

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}

export default function QuizPlay({ questions, config, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [skipped, setSkipped] = useState(0);

  const current = questions[idx];
  const total = questions.length;
  const correct = answers.filter((a) => a.correct).length;
  const answeredCount = answers.length;

  const handleTimeUp = useCallback(() => {
    if (selected) return;
    setSelected("__timeout__");
    setShowExplanation(true);
    setStreak(0);
    setAnswers((prev) => [
      ...prev,
      { question: current, selected: "__timeout__", correct: false, timeTaken: config.timePerQuestion },
    ]);
  }, [selected, current, config]);

  const timer = useQuizTimer(config.timePerQuestion || 30, handleTimeUp);

  useEffect(() => {
    if (config.timePerQuestion > 0) {
      timer.reset(config.timePerQuestion);
      timer.start(config.timePerQuestion);
    }
    return () => timer.stop();
  }, [idx]);

  const choose = useCallback(
    (opt) => {
      if (selected) return;
      timer.stop();
      const timeTaken = config.timePerQuestion > 0 ? config.timePerQuestion - timer.timeLeft : 0;
      const isCorrect = opt === current.answer;
      setSelected(opt);
      setShowExplanation(true);

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setBestStreak((prev) => Math.max(prev, newStreak));
      } else {
        setStreak(0);
      }

      setAnswers((prev) => [
        ...prev,
        { question: current, selected: opt, correct: isCorrect, timeTaken },
      ]);
    },
    [selected, current, streak, config, timer]
  );

  const skip = useCallback(() => {
    if (selected) return;
    timer.stop();
    setSkipped((s) => s + 1);
    setStreak(0);
    setAnswers((prev) => [
      ...prev,
      { question: current, selected: "__skipped__", correct: false, timeTaken: 0 },
    ]);
    if (idx + 1 >= total) {
      onFinish({
        answers: [...answers, { question: current, selected: "__skipped__", correct: false, timeTaken: 0 }],
        questions,
        bestStreak,
      });
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }, [selected, current, idx, total, answers, questions, bestStreak, config, timer]);

  const next = useCallback(() => {
    if (idx + 1 >= total) {
      onFinish({ answers, questions, bestStreak });
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }, [idx, total, answers, questions, bestStreak, onFinish]);

  const timerPercent = config.timePerQuestion > 0 ? (timer.timeLeft / config.timePerQuestion) * 100 : 100;
  const timerColor =
    !config.timePerQuestion ? "var(--primary)"
    : timer.timeLeft > config.timePerQuestion * 0.5 ? "#16a34a"
    : timer.timeLeft > config.timePerQuestion * 0.25 ? "#f59e0b"
    : "#ef4444";

  const accuracy = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              Question {idx + 1} / {total}
            </span>
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" style={{ color: timerColor }} />
              {config.timePerQuestion > 0 && (
                <span className="text-xs font-bold tabular-nums" style={{ color: timerColor }}>
                  {timer.timeLeft}s
                </span>
              )}
            </div>
          </div>
          <ProgressBar value={idx + 1} max={total} />
        </div>
      </div>

      {config.timePerQuestion > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${timerPercent}%`,
              background: timerColor,
              transition: "width 1s linear, background 0.3s",
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">Correct</span>
          </div>
          <p className="mt-0.5 text-lg font-extrabold text-emerald-600">{correct}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">Wrong</span>
          </div>
          <p className="mt-0.5 text-lg font-extrabold text-rose-500">{answeredCount - correct}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">Streak</span>
          </div>
          <p className="mt-0.5 text-lg font-extrabold text-amber-500">{streak}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">Accuracy</span>
          </div>
          <p className="mt-0.5 text-lg font-extrabold text-blue-600">{accuracy}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        {current.showFlag && (
          <div className="mb-4 flex justify-center">
            <img
              src={current.showFlag}
              alt="Country flag"
              className="h-24 w-auto rounded-lg border border-[var(--border)] shadow-sm object-contain"
              loading="eager"
            />
          </div>
        )}
        <p className="text-base font-semibold text-[var(--foreground)] leading-relaxed">
          {current.question}
        </p>
      </div>

      <div className="space-y-2.5">
        {current.options.map((opt, i) => {
          const isCorrect = opt === current.answer;
          const isSelected = opt === selected;
          let cls =
            "w-full text-left rounded-xl border p-4 text-sm font-medium transition-all duration-150 flex items-center gap-3 ";
          if (!selected) {
            cls +=
              "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 cursor-pointer";
          } else if (isCorrect) {
            cls += "border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold";
          } else if (isSelected) {
            cls += "border-rose-400 bg-rose-500/10 text-rose-600 font-bold";
          } else {
            cls += "border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-default";
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => choose(opt)}
              disabled={!!selected}
              aria-label={`Option ${i + 1}: ${opt}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {selected && isCorrect && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />}
              {selected && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-rose-500" />}
            </button>
          );
        })}
      </div>

      {selected === "__timeout__" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-600">
          Time&apos;s up! The correct answer was: <span className="font-bold">{current.answer}</span>
        </div>
      )}

      {showExplanation && selected && selected !== "__timeout__" && current.explanation && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Explanation</p>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{current.explanation}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!selected && (
          <button
            onClick={skip}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)]"
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </button>
        )}
        {selected && (
          <button
            onClick={next}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
          >
            {idx + 1 >= total ? "See Results" : "Next Question"}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
