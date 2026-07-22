"use client";

import { useState } from "react";
import { Play, BookOpen, Timer, Heart } from "lucide-react";
import { DIFFICULTY_LEVELS, GAME_MODES } from "../constants";

const MODE_ICONS = { practice: BookOpen, timed: Timer, survival: Heart };

export default function GameSetup({ onStart }) {
  const [difficulty, setDifficulty] = useState("easy");
  const [mode, setMode] = useState("practice");
  const [count, setCount] = useState(10);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Difficulty</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {DIFFICULTY_LEVELS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  difficulty === d.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <p className={`text-sm font-bold ${d.color}`}>{d.label}</p>
                <p className="mt-0.5 font-mono text-xs text-[var(--muted-foreground)]">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--foreground)]">Game Mode</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {GAME_MODES.map((m) => {
              const Icon = MODE_ICONS[m.id] || BookOpen;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    mode === m.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                  }`}
                >
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">{m.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {mode !== "survival" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <p className="mb-3 text-sm font-bold text-[var(--foreground)]">Number of Questions</p>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 30].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  count === n
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onStart({ difficulty, mode, count })}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
      >
        <Play className="h-5 w-5" />
        Start Practice
      </button>
    </div>
  );
}
