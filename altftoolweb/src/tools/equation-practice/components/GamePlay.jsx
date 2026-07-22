"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  SkipForward,
  Hash,
  Target,
  TrendingUp,
  Flame,
  Timer,
  Zap,
  Heart,
  Lightbulb,
  Info,
} from "lucide-react";
import { generateEquation, checkAnswer, formatAnswer } from "../utils/equationGen";

export default function GamePlay({ config, onFinish }) {
  const { difficulty, mode, count } = config;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lives, setLives] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);
  const timeUpRef = useRef(false);
  const livesRef = useRef(3);

  useEffect(() => {
    const maxCount = mode === "survival" ? 100 : count;
    const qs = [];
    for (let i = 0; i < maxCount; i++) {
      qs.push(generateEquation(difficulty));
    }
    setQuestions(qs);
  }, [difficulty, mode, count]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex === 0) {
      setQuestionStartTime(Date.now());
      if (inputRef.current) inputRef.current.focus();
    }
  }, [questions, currentIndex]);

  useEffect(() => {
    if (mode === "timed" && timeRemaining > 0 && !isAnswered) {
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
      return () => clearInterval(timerRef.current);
    }
  }, [currentIndex, isAnswered, mode, timeRemaining > 0]);

  useEffect(() => {
    if (timeUpRef.current) {
      timeUpRef.current = false;
      handleTimeUp();
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (mode === "timed") setTimeRemaining(60);
  }, [mode, questions.length > 0]);

  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, []);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  const handleTimeUp = useCallback(() => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    setAnswers((prev) => [...prev, { ...q, userAnswer: "Time's up", correct: false, timeTaken }]);
    setIsAnswered(true);
    setShowFeedback("wrong");
    setStreak(0);
  }, [isAnswered, questions, currentIndex, questionStartTime]);

  const handleSubmit = () => {
    if (isAnswered || userAnswer.trim() === "") return;
    if (timerRef.current) clearInterval(timerRef.current);

    const q = questions[currentIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isCorrect = checkAnswer(userAnswer, q);

    setAnswers((prev) => [...prev, { ...q, userAnswer: userAnswer.trim(), correct: isCorrect, timeTaken }]);
    setIsAnswered(true);
    setShowFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const speedBonus = Math.max(0, Math.round(20 - timeTaken));
      setScore((prev) => prev + 10 + speedBonus + Math.min(streak, 10) * 2);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
    } else {
      setStreak(0);
      if (mode === "survival") {
        const newLives = lives - 1;
        setLives(newLives);
        livesRef.current = newLives;
      }
    }
  };

  const handleSkip = () => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    setAnswers((prev) => [...prev, { ...q, userAnswer: "Skipped", correct: false, timeTaken }]);
    setIsAnswered(true);
    setShowFeedback("skipped");
    setStreak(0);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    const maxCount = mode === "survival" ? questions.length : count;

    if (mode === "survival" && livesRef.current <= 0) {
      onFinish(answers);
      return;
    }
    if (nextIndex >= maxCount) {
      onFinish(answers);
      return;
    }

    setCurrentIndex(nextIndex);
    setUserAnswer("");
    setIsAnswered(false);
    setShowFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setQuestionStartTime(Date.now());
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isAnswered) handleNext();
      else handleSubmit();
    }
  };

  const currentQuestion = questions[currentIndex];
  const maxCount = mode === "survival" ? questions.length : count;
  const correctCount = answers.filter((a) => a.correct).length;
  const incorrectCount = answers.filter((a) => !a.correct).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 1000) / 10 : 0;

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Question</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">
            {currentIndex + 1}<span className="text-sm font-normal text-[var(--muted-foreground)]">/{maxCount}</span>
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Score</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{score}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Accuracy</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{accuracy}%</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Streak</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">
            {streak}<span className="text-sm font-normal text-[var(--muted-foreground)]"> (best: {bestStreak})</span>
          </p>
        </div>
        {mode === "timed" && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Timer</span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{timeRemaining}s</p>
          </div>
        )}
        {mode === "survival" && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Lives</span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={i < lives ? "text-rose-500" : "text-[var(--muted-foreground)] opacity-30"}>♥ </span>
              ))}
            </p>
          </div>
        )}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Elapsed</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">
            {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Timer Progress */}
      {mode === "timed" && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--section-highlight)]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeRemaining > 30 ? "bg-emerald-500" : timeRemaining > 10 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${(timeRemaining / 60) * 100}%` }}
          />
        </div>
      )}

      {/* Question Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-indigo-500/10 px-3 py-0.5 text-xs font-bold text-indigo-600">
            {currentQuestion.type === "quadratic" || currentQuestion.type === "quadratic_two" ? "Quadratic" : difficulty}
          </span>
        </div>
        <p className="my-6 text-center font-mono text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {currentQuestion.question}
        </p>

        <div className="mx-auto max-w-md">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAnswered}
              placeholder={currentQuestion.type === "quadratic_two" ? "x1, x2" : "x = ?"}
              className={`h-14 flex-1 rounded-xl border bg-[var(--background)] px-4 text-center font-mono text-xl font-bold text-[var(--foreground)] outline-none transition-all ${
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
                : showFeedback === "skipped"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-rose-500/10 text-rose-600"
            }`}>
              {showFeedback === "correct" && <CheckCircle2 className="h-5 w-5" />}
              {showFeedback === "wrong" && <XCircle className="h-5 w-5" />}
              {showFeedback === "correct"
                ? "Correct!"
                : `Wrong! Answer: ${currentQuestion.type === "quadratic_two" ? currentQuestion.exact : formatAnswer(currentQuestion.answer, currentQuestion.type)}`}
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {!isAnswered ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={userAnswer.trim() === ""}
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Submit
                </button>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-bold text-amber-600 transition-all hover:bg-amber-500/10"
                >
                  <Lightbulb className="h-4 w-4" />
                  Hint
                </button>
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-bold text-[var(--muted-foreground)] transition-all hover:bg-[var(--section-highlight)]"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
              >
                Next Equation
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      {showHint && !isAnswered && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-bold text-amber-600">Hint</p>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground)]">{currentQuestion.hint}</p>
        </div>
      )}

      {/* Explanation */}
      {isAnswered && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
              <Info className="h-5 w-5 text-[var(--primary)]" />
              {showExplanation ? "Hide" : "Show"} Explanation
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">{showExplanation ? "▲" : "▼"}</span>
          </button>
          {showExplanation && (
            <div className="border-t border-[var(--border)] px-6 py-4">
              <p className="mb-3 font-mono text-sm text-[var(--foreground)]">{currentQuestion.explanation}</p>
              <ol className="space-y-1.5">
                {currentQuestion.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)]">
                      {i + 1}
                    </span>
                    <span className="font-mono">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Session Progress</p>
        <div className="flex flex-wrap gap-1">
          {answers.map((a, i) => (
            <div key={i} className={`h-3 w-3 rounded-sm ${a.correct ? "bg-emerald-500" : "bg-rose-500"}`} />
          ))}
          {Array.from({ length: Math.max(0, maxCount - answers.length) }, (_, i) => (
            <div key={`p-${i}`} className="h-3 w-3 rounded-sm bg-[var(--section-highlight)]" />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Correct: {correctCount}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Wrong: {incorrectCount}</span>
        </div>
      </div>
    </div>
  );
}
