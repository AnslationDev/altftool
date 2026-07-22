"use client";

import { useState } from "react";
import { Settings, Play, Divide, Zap, Hash } from "lucide-react";
import { DIVISION_TYPES, DIFFICULTY_LEVELS, QUESTION_COUNTS } from "../constants";

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

export default function GameSetup({ onStart }) {
  const [divisionType, setDivisionType] = useState("basic");
  const [difficulty, setDifficulty] = useState("easy");
  const [questionCount, setQuestionCount] = useState(20);

  return (
    <div className="space-y-6">
      {/* Division Type */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
          <Divide className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Division Type</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIVISION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setDivisionType(type.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  divisionType === type.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    divisionType === type.id
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--section-highlight)] text-[var(--primary)]"
                  }`}
                >
                  <Divide className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--foreground)]">{type.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{type.description}</p>
                </div>
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

      {/* Question Count */}
      <Field label="Number of Questions" icon={Hash}>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                questionCount === count
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </Field>

      <button
        onClick={() => onStart({ divisionType, difficulty, questionCount })}
        className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
      >
        <Play className="h-4 w-4" />
        Start Practice
      </button>
    </div>
  );
}
