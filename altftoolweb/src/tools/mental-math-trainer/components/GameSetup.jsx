"use client";

import { useState } from "react";
import {
  Settings,
  Hash,
  Timer,
  Shuffle,
  Play,
  RefreshCcw,
  Zap,
  Heart,
  Calendar,
  BookOpen,
  Infinity,
} from "lucide-react";
import { QUESTION_TYPES, DIFFICULTY_LEVELS, GAME_MODES, QUESTION_COUNTS, TIMER_OPTIONS } from "../constants";

const MODE_ICONS = {
  practice: BookOpen,
  timed: Timer,
  daily: Calendar,
  survival: Heart,
  speed: Zap,
  endless: Infinity,
};

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" />}
        <span className="min-w-0 break-words">{label}</span>
      </span>
      {children}
    </label>
  );
}

export default function GameSetup({ onStart, onDailyChallenge }) {
  const [questionType, setQuestionType] = useState("addition");
  const [difficulty, setDifficulty] = useState("easy");
  const [gameMode, setGameMode] = useState("practice");
  const [questionCount, setQuestionCount] = useState(20);
  const [timerDuration, setTimerDuration] = useState(60);

  const handleStart = () => {
    onStart({ questionType, difficulty, gameMode, questionCount, timerDuration });
  };

  return (
    <div className="space-y-6">
      {/* Game Mode Selection */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <Shuffle className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Game Mode</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GAME_MODES.map((mode) => {
              const ModeIcon = MODE_ICONS[mode.id] || BookOpen;
              return (
                <button
                  key={mode.id}
                  onClick={() => setGameMode(mode.id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    gameMode === mode.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      gameMode === mode.id
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--section-highlight)] text-[var(--primary)]"
                    }`}
                  >
                    <ModeIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--foreground)]">{mode.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{mode.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Type */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <Hash className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Question Type</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setQuestionType(type.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  questionType === type.id
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <Zap className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Difficulty Level</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setDifficulty(level.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  difficulty === level.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <p className="text-sm font-bold text-[var(--foreground)]">{level.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(gameMode === "practice" || gameMode === "survival" || gameMode === "endless") && (
          <Field label="Number of Questions" icon={Hash}>
            <div className="flex flex-wrap gap-2">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    questionCount === count
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </Field>
        )}
        {(gameMode === "timed" || gameMode === "speed" || gameMode === "daily") && (
          <Field label="Time Limit" icon={Timer}>
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimerDuration(opt.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    timerDuration === opt.id
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleStart}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          <Play className="h-4 w-4" />
          Start Training
        </button>
        <button
          onClick={onDailyChallenge}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--section-highlight)]"
        >
          <Calendar className="h-4 w-4" />
          Daily Challenge
        </button>
      </div>
    </div>
  );
}
