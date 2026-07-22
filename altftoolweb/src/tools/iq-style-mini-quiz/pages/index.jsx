"use client";

import { useState, useCallback } from "react";
import {
  Brain,
  CheckCircle2,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Trophy,
  BarChart2,
  Settings,
  AlertCircle,
} from "lucide-react";
import { useQuiz } from "../hooks/useQuiz";
import { useTimer } from "../hooks/useTimer";
import { CATEGORIES, DIFFICULTY_LEVELS, PHASES } from "../constants/quizConfig";
import TimerBar from "../components/TimerBar";
import ProgressBar from "../components/ProgressBar";
import QuestionCard from "../components/QuestionCard";
import QuestionNavigator from "../components/QuestionNavigator";
import ResultsReport from "../components/ResultsReport";
import Leaderboard from "../components/Leaderboard";

export default function ToolHome() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const quiz = useQuiz();
  const { timeLeft, isRunning, start: startTimer, stop: stopTimer } = useTimer(30, handleTimeUp);

  function handleTimeUp() {
    if (quiz.currentQuestion && !quiz.currentQuestion.isAnswered) {
      quiz.skipQuestion();
    }
    if (quiz.currentIndex < quiz.totalQuestions - 1) {
      quiz.goToNext();
    } else {
      quiz.finishQuiz();
      setPhase(PHASES.REPORT);
    }
  }

  const handleStartQuiz = useCallback(() => {
    quiz.startQuiz();
    setPhase(PHASES.RUNNING);
    const diff = DIFFICULTY_LEVELS.find((d) => d.id === quiz.selectedDifficulty);
    startTimer(diff?.timeLimit || 30);
  }, [quiz, startTimer]);

  const handleAnswer = useCallback(
    (optionIndex) => {
      quiz.answerQuestion(optionIndex);
    },
    [quiz]
  );

  const handleNext = useCallback(() => {
    if (quiz.currentIndex < quiz.totalQuestions - 1) {
      quiz.goToNext();
      const diff = DIFFICULTY_LEVELS.find((d) => d.id === quiz.selectedDifficulty);
      startTimer(diff?.timeLimit || 30);
    } else {
      stopTimer();
      quiz.finishQuiz();
      setPhase(PHASES.REPORT);
    }
  }, [quiz, startTimer, stopTimer]);

  const handlePrevious = useCallback(() => {
    quiz.goToPrevious();
  }, [quiz]);

  const handleSkip = useCallback(() => {
    quiz.skipQuestion();
    if (quiz.currentIndex < quiz.totalQuestions - 1) {
      quiz.goToNext();
      const diff = DIFFICULTY_LEVELS.find((d) => d.id === quiz.selectedDifficulty);
      startTimer(diff?.timeLimit || 30);
    } else {
      stopTimer();
      quiz.finishQuiz();
      setPhase(PHASES.REPORT);
    }
  }, [quiz, startTimer, stopTimer]);

  const handleRestart = useCallback(() => {
    setPhase(PHASES.SETUP);
  }, []);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
          <Brain className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          IQ Style Mini Quiz
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Challenge your brain with logical reasoning, pattern recognition, memory, and problem-solving questions.
        </p>
      </header>

      {phase === PHASES.SETUP && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[var(--foreground)]">Quiz Setup</h2>

            <div className="mb-6 w-full max-w-sm">
              <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">Category</label>
              <select
                value={quiz.selectedCategory}
                onChange={(e) => quiz.setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6 w-full max-w-sm">
              <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTY_LEVELS.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => quiz.setSelectedDifficulty(diff.id)}
                    className={`rounded-lg border p-3 text-sm font-bold transition-all ${
                      quiz.selectedDifficulty === diff.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {diff.label}
                    <span className="mt-1 block text-xs font-normal opacity-70">{diff.timeLimit}s/question</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 w-full rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4">
              <p className="mb-3 text-center text-xs font-bold uppercase text-[var(--muted-foreground)]">Quiz Info</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-[var(--muted-foreground)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 10 Questions
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" /> Timed per question
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" /> Instant feedback
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-purple-500" /> Score report
                </div>
              </div>
            </div>

            <p className="mb-6 max-w-lg rounded-xl bg-amber-500/10 p-3 text-center text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
              This is not a clinical IQ test. Scores are estimates for entertainment and learning purposes.
            </p>

            <div className="flex w-full max-w-sm flex-col gap-3">
              <button onClick={handleStartQuiz} className="btn-primary w-full rounded-xl py-4 text-lg">
                Start Quiz
              </button>
              <button onClick={() => setPhase(PHASES.LEADERBOARD)} className="btn-secondary w-full rounded-xl py-3 text-sm">
                <Trophy className="mr-2 inline h-4 w-4" />
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === PHASES.RUNNING && (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[var(--section-highlight)] px-4 py-1 text-sm font-bold text-[var(--muted-foreground)]">
              {quiz.selectedDifficulty.charAt(0).toUpperCase() + quiz.selectedDifficulty.slice(1)}
            </span>
            <span className="rounded-full bg-[var(--section-highlight)] px-4 py-1 text-sm font-bold text-[var(--muted-foreground)]">
              Score: {quiz.score}/{quiz.answeredCount}
            </span>
          </div>

          <TimerBar
            timeLeft={timeLeft}
            total={DIFFICULTY_LEVELS.find((d) => d.id === quiz.selectedDifficulty)?.timeLimit || 30}
            isRunning={isRunning}
          />

          <ProgressBar current={quiz.currentIndex} total={quiz.totalQuestions} />

          <QuestionNavigator
            questions={quiz.questions}
            currentIndex={quiz.currentIndex}
            onGoTo={quiz.goToQuestion}
          />

          <QuestionCard
            question={quiz.currentQuestion}
            onAnswer={handleAnswer}
            answered={quiz.currentQuestion?.isAnswered || false}
            selectedOption={quiz.currentQuestion?.selectedOption}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={quiz.currentIndex === 0}
              className="btn-secondary rounded-xl px-4 py-2.5 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="mr-1 inline h-4 w-4" />
              Previous
            </button>
            <button
              onClick={handleSkip}
              disabled={quiz.currentIndex >= quiz.totalQuestions - 1}
              className="btn-secondary rounded-xl px-4 py-2.5 text-sm disabled:opacity-40"
            >
              <SkipForward className="mr-1 inline h-4 w-4" />
              Skip
            </button>
            {quiz.currentQuestion?.isAnswered ? (
              <button onClick={handleNext} className="btn-primary rounded-xl px-6 py-2.5 text-sm">
                {quiz.currentIndex >= quiz.totalQuestions - 1 ? "Finish" : "Next"}
                <ChevronRight className="ml-1 inline h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={quiz.currentIndex >= quiz.totalQuestions - 1}
                className="btn-primary rounded-xl px-6 py-2.5 text-sm disabled:opacity-40"
              >
                Skip to End
              </button>
            )}
          </div>
        </div>
      )}

      {phase === PHASES.REPORT && (
        <ResultsReport results={quiz.quizResults} onRestart={handleRestart} onLeaderboard={() => setPhase(PHASES.LEADERBOARD)} />
      )}

      {phase === PHASES.LEADERBOARD && (
        <Leaderboard onBack={handleRestart} />
      )}
    </div>
  );
}
