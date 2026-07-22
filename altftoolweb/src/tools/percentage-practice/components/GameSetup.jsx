"use client";

import { useState } from "react";
import { Play, Percent, Zap, Hash, Timer, Heart, Shuffle } from "lucide-react";
import { QUESTION_TYPES, DIFFICULTY_LEVELS, GAME_MODES, QUESTION_COUNTS, TIMER_OPTIONS } from "../constants";

export default function GameSetup({ onStart }) {
  const [questionType, setQuestionType] = useState("find-percent");
  const [difficulty, setDifficulty] = useState("easy");
  const [gameMode, setGameMode] = useState("practice");
  const [questionCount, setQuestionCount] = useState(20);
  const [timerDuration, setTimerDuration] = useState(60);

  return (
    <div className="space-y-6">
      {/* Game Mode */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <Shuffle className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Game Mode</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setGameMode(mode.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  gameMode === mode.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  gameMode === mode.id ? "bg-[var(--primary)] text-white" : "bg-[var(--section-highlight)] text-[var(--primary)]"
                }`}>
                  {mode.id === "practice" && <Hash className="h-5 w-5" />}
                  {mode.id === "timed" && <Timer className="h-5 w-5" />}
                  {mode.id === "survival" && <Heart className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--foreground)]">{mode.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{mode.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Type */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <Percent className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Question Type</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setQuestionType(type.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  questionType === type.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <p className="text-sm font-bold text-[var(--foreground)]">{type.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{type.description}</p>
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
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {gameMode === "practice" && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Hash className="h-4 w-4 shrink-0 text-[var(--primary)]" />
              Number of Questions
            </span>
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
          </div>
        )}
        {(gameMode === "timed" || gameMode === "survival") && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Timer className="h-4 w-4 shrink-0 text-[var(--primary)]" />
              Time Limit
            </span>
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
          </div>
        )}
      </div>

      <button
        onClick={() => onStart({ questionType, difficulty, gameMode, questionCount, timerDuration })}
        className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
      >
        <Play className="h-4 w-4" />
        Start Practice
      </button>
    </div>
  );
}
