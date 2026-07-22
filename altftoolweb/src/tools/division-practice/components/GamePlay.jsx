"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  SkipForward,
  Lightbulb,
  ListOrdered,
  Hash,
  Target,
  TrendingUp,
  Flame,
  Clock,
} from "lucide-react";
import { generateDivisionQuestion, checkDivisionAnswer, generateStepByStepSolution } from "../utils/divisionUtils";
import { HINTS } from "../constants";

export default function GamePlay({ config, onFinish }) {
  const { divisionType, difficulty, questionCount } = config;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    const type = divisionType === "mixed" ? "mixed" : divisionType;
    const qs = [];
    for (let i = 0; i < questionCount; i++) {
      qs.push(generateDivisionQuestion(type, difficulty));
    }
    setQuestions(qs);
  }, [divisionType, difficulty, questionCount]);

  useEffect(() => {
    if (questions.length > 0) {
      setQuestionStartTime(Date.now());
      if (inputRef.current) inputRef.current.focus();
    }
  }, [questions, currentIndex]);

  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(elapsedRef.current);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (isAnswered || userAnswer.trim() === "") return;
    const q = currentQuestion;
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isCorrect = checkDivisionAnswer(userAnswer, q);

    const newAnswer = {
      ...q,
      userAnswer: userAnswer.trim(),
      correct: isCorrect,
      timeTaken,
      hintUsed: showHint,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setIsAnswered(true);
    setShowFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((prev) => prev + Math.round(10 * (1 + Math.min(streak, 10) * 0.5)));
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
    } else {
      setStreak(0);
    }
  };

  const handleSkip = () => {
    if (isAnswered) return;
    const q = currentQuestion;
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    setAnswers((prev) => [
      ...prev,
      { ...q, userAnswer: "Skipped", correct: false, timeTaken, hintUsed: showHint },
    ]);
    setIsAnswered(true);
    setShowFeedback("skipped");
    setStreak(0);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questionCount) {
      onFinish(answers);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setUserAnswer("");
    setIsAnswered(false);
    setShowFeedback(null);
    setShowHint(false);
    setShowSteps(false);
    setHintUsed(false);
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

  const correctCount = answers.filter((a) => a.correct).length;
  const incorrectCount = answers.filter((a) => !a.correct).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 1000) / 10 : 0;
  const avgTime = answers.length > 0 ? (answers.reduce((s, a) => s + (a.timeTaken || 0), 0) / answers.length).toFixed(1) : "0.0";
  const hintsUsed = answers.filter((a) => a.hintUsed).length;

  if (!currentQuestion) return null;

  const hints = HINTS[currentQuestion.type] || HINTS.basic;
  const steps = generateStepByStepSolution(currentQuestion);

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
            {currentIndex + 1}<span className="text-sm font-normal text-[var(--muted-foreground)]">/{questionCount}</span>
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Avg Time</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{avgTime}s</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Hints</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{hintsUsed}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--section-highlight)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questionCount) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-cyan-500/10 px-3 py-0.5 text-xs font-bold text-cyan-600">
            {currentQuestion.type}
          </span>
          <span className="rounded-full bg-[var(--section-highlight)] px-3 py-0.5 text-xs font-bold text-[var(--foreground)]">
            {difficulty}
          </span>
        </div>

        {/* Division Display */}
        <div className="my-6 flex items-center justify-center">
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] px-8 py-6">
            <p className="text-center text-xs font-semibold uppercase text-[var(--muted-foreground)]">Divide</p>
            <p className="mt-2 text-center text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              {currentQuestion.dividend}
            </p>
            <div className="my-2 flex items-center justify-center gap-3">
              <span className="text-2xl text-[var(--muted-foreground)]">÷</span>
              <span className="text-2xl font-bold text-[var(--primary)]">{currentQuestion.divisor}</span>
            </div>
          </div>
        </div>

        {/* Answer Input */}
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
              placeholder={currentQuestion.type === "remainder" ? "quotient R remainder" : "Your answer..."}
              className={`h-14 flex-1 rounded-xl border bg-[var(--background)] px-4 text-center text-xl font-bold text-[var(--foreground)] outline-none transition-all ${
                isAnswered
                  ? showFeedback === "correct"
                    ? "border-emerald-500 bg-emerald-500/5"
                    : showFeedback === "wrong"
                      ? "border-rose-500 bg-rose-500/5"
                      : "border-[var(--border)]"
                  : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              }`}
            />
          </div>

          {/* Feedback */}
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
                : `Wrong! The answer is ${currentQuestion.answer}`}
            </div>
          )}

          {/* Action Buttons */}
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
                  className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-600 transition-all hover:bg-amber-500/20"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showHint ? "Hide Hint" : "Hint"}
                </button>
                <button
                  onClick={() => { setShowSteps(!showSteps); setHintUsed(true); }}
                  className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-600 transition-all hover:bg-violet-500/20"
                >
                  <ListOrdered className="h-4 w-4" />
                  {showSteps ? "Hide Steps" : "Show Steps"}
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
                Next Question
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hint Panel */}
      {showHint && !isAnswered && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-600">
            <Lightbulb className="h-4 w-4" />
            Hint
          </h4>
          <p className="text-sm text-[var(--foreground)]">{hints[Math.floor(Math.random() * hints.length)]}</p>
        </div>
      )}

      {/* Step by Step */}
      {showSteps && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-600">
            <ListOrdered className="h-4 w-4" />
            Step-by-Step Solution
          </h4>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-600">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Live Progress */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Session Progress</p>
        <div className="flex flex-wrap gap-1">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-sm ${a.correct ? "bg-emerald-500" : "bg-rose-500"}`}
              title={`Q${i + 1}: ${a.correct ? "Correct" : "Wrong"}`}
            />
          ))}
          {Array.from({ length: questionCount - answers.length }, (_, i) => (
            <div key={`p-${i}`} className="h-3 w-3 rounded-sm bg-[var(--section-highlight)]" />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Correct: {correctCount}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Wrong: {incorrectCount}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--section-highlight)]" /> Remaining: {questionCount - answers.length}</span>
        </div>
      </div>
    </div>
  );
}
