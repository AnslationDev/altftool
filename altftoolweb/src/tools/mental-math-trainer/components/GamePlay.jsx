"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Timer,
  Flame,
  Target,
  TrendingUp,
  ArrowRight,
  SkipForward,
  AlertTriangle,
  Zap,
  Hash,
} from "lucide-react";
import { generateQuestion, generateDailyChallenge, checkAnswer } from "../utils/mathGenerator";
import { formatTime } from "../utils/scoring";

export default function GamePlay({ config, onFinish }) {
  const { questionType, difficulty, gameMode, questionCount, timerDuration } = config;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [lives, setLives] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    if (gameMode === "daily") {
      setQuestions(generateDailyChallenge());
    } else {
      const qs = [];
      const count = gameMode === "endless" ? 100 : questionCount;
      for (let i = 0; i < count; i++) {
        const q = generateQuestion(questionType, difficulty);
        qs.push({ ...q, type: questionType, difficulty });
      }
      setQuestions(qs);
    }
  }, [questionType, difficulty, gameMode, questionCount]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex === 0) {
      setQuestionStartTime(Date.now());
      if (inputRef.current) inputRef.current.focus();
    }
  }, [questions, currentIndex]);

  const timeUpRef = useRef(false);

  useEffect(() => {
    if ((gameMode === "timed" || gameMode === "speed" || gameMode === "daily") && timeRemaining > 0 && !isAnswered) {
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
  }, [currentIndex, isAnswered, gameMode, timeRemaining > 0]);

  useEffect(() => {
    if (timeUpRef.current) {
      timeUpRef.current = false;
      handleTimeUp();
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (gameMode === "speed" && !isAnswered && questions.length > 0) {
      setTimeRemaining(15);
    }
  }, [currentIndex, gameMode, isAnswered, questions.length > 0]);

  useEffect(() => {
    if (gameMode === "timed" || gameMode === "daily") {
      setTimeRemaining(timerDuration);
    }
  }, [gameMode, timerDuration, questions.length > 0]);

  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(elapsedRef.current);
  }, []);

  const handleTimeUp = useCallback(() => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const newAnswer = {
      ...q,
      userAnswer: "Time's up",
      correct: false,
      timeTaken,
      type: q.type,
      difficulty: q.difficulty,
    };
    setAnswers((prev) => [...prev, newAnswer]);
    setIsAnswered(true);
    setShowFeedback("wrong");
    setStreak(0);
    setLives((prev) => prev - 1);
  }, [isAnswered, questions, currentIndex, questionStartTime]);

  const handleSubmit = () => {
    if (isAnswered || userAnswer.trim() === "") return;
    if (timerRef.current) clearInterval(timerRef.current);

    const q = questions[currentIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isCorrect = checkAnswer(userAnswer, q.answer);

    const newAnswer = {
      ...q,
      userAnswer: userAnswer.trim(),
      correct: isCorrect,
      timeTaken,
      displayAnswer: q.displayAnswer || String(q.answer),
      type: q.type,
      difficulty: q.difficulty,
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
      if (gameMode === "survival") {
        setLives((prev) => prev - 1);
      }
    }
  };

  const handleSkip = () => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    setAnswers((prev) => [
      ...prev,
      { ...q, userAnswer: "Skipped", correct: false, timeTaken, type: q.type, difficulty: q.difficulty },
    ]);
    setIsAnswered(true);
    setShowFeedback("skipped");
    setStreak(0);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (gameMode === "survival") {
      if (lives <= 0) {
        onFinish(answers, bestStreak);
        return;
      }
      if (nextIndex >= questions.length) {
        const newQ = generateQuestion(questionType, difficulty);
        setQuestions((prev) => [...prev, { ...newQ, type: questionType, difficulty }]);
      }
      setCurrentIndex(nextIndex);
      setUserAnswer("");
      setIsAnswered(false);
      setShowFeedback(null);
      setQuestionStartTime(Date.now());
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    const effectiveMax = Math.min(questionCount, questions.length);

    if (nextIndex >= effectiveMax || (gameMode !== "endless" && nextIndex >= questionCount)) {
      onFinish(answers, bestStreak);
      return;
    }

    if (gameMode === "endless" && nextIndex >= questions.length) {
      const newQ = generateQuestion(questionType, difficulty);
      setQuestions((prev) => [...prev, { ...newQ, type: questionType, difficulty }]);
    }

    setCurrentIndex(nextIndex);
    setUserAnswer("");
    setIsAnswered(false);
    setShowFeedback(null);
    setQuestionStartTime(Date.now());
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isAnswered) {
        handleNext();
      } else {
        handleSubmit();
      }
    }
  };

  const currentQuestion = questions[currentIndex];
  const effectiveTotal = gameMode === "survival" ? questions.length : Math.min(questionCount, questions.length);
  const correctCount = answers.filter((a) => a.correct).length;
  const incorrectCount = answers.filter((a) => !a.correct).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 1000) / 10 : 0;

  const timerPercent =
    (gameMode === "timed" || gameMode === "daily")
      ? (timeRemaining / timerDuration) * 100
      : gameMode === "speed"
        ? (timeRemaining / 15) * 100
        : 100;

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Question</span>
          </div>
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">
            {currentIndex + 1}<span className="text-sm font-normal text-[var(--muted-foreground)]">/{effectiveTotal}</span>
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
        {(gameMode === "timed" || gameMode === "daily" || gameMode === "speed") && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Timer</span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{formatTime(timeRemaining)}</p>
          </div>
        )}
        {gameMode === "survival" && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
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
          <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">{formatTime(elapsedTime)}</p>
        </div>
      </div>

      {/* Timer Progress */}
      {(gameMode === "timed" || gameMode === "daily" || gameMode === "speed") && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--section-highlight)]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timerPercent > 50 ? "bg-emerald-500" : timerPercent > 25 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}

      {/* Question Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-[var(--primary)]/10 px-3 py-0.5 text-xs font-bold text-[var(--primary)]">
            {currentQuestion.type || questionType}
          </span>
          <span className="rounded-full bg-[var(--section-highlight)] px-3 py-0.5 text-xs font-bold text-[var(--foreground)]">
            {difficulty}
          </span>
        </div>
        <p className="my-6 text-center text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {currentQuestion.question}
        </p>

        {/* Answer Input */}
        <div className="mx-auto max-w-md">
          <div className="flex gap-3">
            <label htmlFor="mental-math-answer-input" className="sr-only">
              Your answer
            </label>
            <input
              id="mental-math-answer-input"
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAnswered}
              placeholder="Your answer..."
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
              {showFeedback === "skipped" && <SkipForward className="h-5 w-5" />}
              {showFeedback === "correct"
                ? "Correct!"
                : showFeedback === "skipped"
                  ? "Skipped"
                  : `Wrong! The answer is ${currentQuestion.displayAnswer || currentQuestion.answer}`}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex justify-center gap-3">
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

      {/* Live Progress */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Session Progress</p>
        <div className="flex flex-wrap gap-1">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-sm ${
                a.correct ? "bg-emerald-500" : "bg-rose-500"
              }`}
              title={`Q${i + 1}: ${a.correct ? "Correct" : "Wrong"}`}
            />
          ))}
          {Array.from({ length: Math.max(0, effectiveTotal - answers.length) }, (_, i) => (
            <div key={`p-${i}`} className="h-3 w-3 rounded-sm bg-[var(--section-highlight)]" />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Correct: {correctCount}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Wrong: {incorrectCount}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--section-highlight)]" /> Remaining: {effectiveTotal - answers.length}</span>
        </div>
      </div>
    </div>
  );
}
