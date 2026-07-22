"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Timer,
  Flame,
  Zap,
  TrendingUp,
  Pause,
} from "lucide-react";
import {
  generateProblem,
  checkAnswer,
  calculateScore,
} from "../utils/mathSpeed";
import { OPERATIONS, STREAK_THRESHOLDS } from "../constants";

function getCurrentTier(streak) {
  let tier = STREAK_THRESHOLDS[0];
  for (const t of STREAK_THRESHOLDS) {
    if (streak >= t.streak) tier = t;
  }
  return tier;
}

export default function GamePlay({ config, onFinish }) {
  const { operations, timeLimit } = config;

  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [lastPoints, setLastPoints] = useState(null);
  const [tier, setTier] = useState(STREAK_THRESHOLDS[0]);
  const [combo, setCombo] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const timeUpRef = useRef(false);

  const generateNew = useCallback(() => {
    const p = generateProblem(operations, streak);
    setProblem(p);
    setUserAnswer("");
    setIsAnswered(false);
    setShowFeedback(null);
    setLastPoints(null);
    setQuestionStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [operations, streak]);

  useEffect(() => {
    generateNew();
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timeUpRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    elapsedRef.current = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(elapsedRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeUpRef.current) {
      timeUpRef.current = false;
      onFinish({
        score,
        correct,
        wrong,
        totalAnswered,
        bestStreak,
        time: timeLimit,
        operations,
      });
    }
  }, [timeRemaining]);

  useEffect(() => {
    setTier(getCurrentTier(streak));
  }, [streak]);

  const handleSubmit = () => {
    if (isAnswered || userAnswer.trim() === "" || !problem) return;
    clearInterval(timerRef.current);

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isCorrect = checkAnswer(userAnswer, problem);
    const pts = calculateScore(timeTaken, streak, isCorrect);

    setIsAnswered(true);
    setTotalAnswered((p) => p + 1);

    if (isCorrect) {
      setCorrect((p) => p + 1);
      setScore((p) => p + pts);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
      setCombo((p) => p + 1);
      setShowFeedback("correct");
      setLastPoints(pts);
    } else {
      setWrong((p) => p + 1);
      setStreak(0);
      setCombo(0);
      setShowFeedback("wrong");
    }

    setTimeout(() => {
      if (timeRemaining > 0) {
        generateNew();
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timeUpRef.current = true;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const tierConfig = getCurrentTier(streak);
  const timerPercent = (timeRemaining / timeLimit) * 100;
  const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

  const opSymbols = operations.map((o) => OPERATIONS.find((op) => op.id === o)?.symbol).join(" ");

  return (
    <div className="space-y-6">
      {/* Timer Bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--section-highlight)]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            timerPercent > 50 ? "bg-emerald-500" : timerPercent > 25 ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-rose-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Time</span>
          </div>
          <p className={`mt-1 text-2xl font-extrabold ${timeRemaining <= 10 ? "text-rose-600" : "text-[var(--foreground)]"}`}>
            {timeRemaining}s
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Score</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{score}</p>
          {lastPoints && showFeedback === "correct" && (
            <span className="text-xs font-bold text-emerald-600">+{lastPoints}</span>
          )}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Streak</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">
            {streak}
            <span className="ml-1 text-sm font-bold" style={{ color: tierConfig.color }}>
              {tierConfig.label}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Accuracy</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{accuracy}%</p>
          <p className="text-xs text-[var(--muted-foreground)]">{correct} / {totalAnswered}</p>
        </div>
      </div>

      {/* Tier Progress */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          {STREAK_THRESHOLDS.map((t, i) => (
            <div key={t.streak} className="flex flex-col items-center">
              <div
                className={`h-2 w-2 rounded-full ${streak >= t.streak ? "" : "opacity-30"}`}
                style={{ background: t.color }}
              />
              <span className={`mt-1 ${streak >= t.streak ? "font-bold" : ""}`}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Combo */}
      {combo >= 3 && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3">
          <Flame className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-extrabold text-amber-600">
            {combo}x COMBO! {combo >= 10 ? "ON FIRE!" : combo >= 5 ? "UNSTOPPABLE!" : "NICE STREAK!"}
          </span>
        </div>
      )}

      {/* Question */}
      {problem && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 shadow-sm">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="rounded-full bg-[var(--primary)]/10 px-3 py-0.5 text-xs font-bold text-[var(--primary)]">
              {opSymbols} — {tier.label}
            </span>
          </div>
          <p className="my-8 text-center font-mono text-5xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-6xl">
            {problem.question} = ?
          </p>

          <div className="mx-auto max-w-sm">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnswered}
                placeholder="Answer"
                className={`h-16 flex-1 rounded-xl border bg-[var(--background)] px-4 text-center font-mono text-2xl font-bold text-[var(--foreground)] outline-none transition-all ${
                  isAnswered
                    ? showFeedback === "correct"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-rose-500 bg-rose-500/5"
                    : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                }`}
              />
            </div>

            {isAnswered && showFeedback && (
              <div className={`mt-4 flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-bold ${
                showFeedback === "correct"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-rose-500/10 text-rose-600"
              }`}>
                {showFeedback === "correct" ? (
                  <><CheckCircle2 className="h-5 w-5" /> Correct! +{lastPoints} pts</>
                ) : (
                  <><XCircle className="h-5 w-5" /> Wrong! Answer: {problem.answer}</>
                )}
              </div>
            )}

            {!isAnswered && (
              <button
                onClick={handleSubmit}
                disabled={userAnswer.trim() === ""}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-40"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
