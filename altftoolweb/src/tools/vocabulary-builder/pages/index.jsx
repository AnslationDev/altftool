"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import DifficultyFilter from "../components/DifficultyFilter";
import WordCard from "../components/WordCard";
import QuizSection from "../components/QuizSection";
import { filterWords, getDailyWord } from "../utils/vocabUtils";

export default function VocabBuilder() {
  const [difficulty, setDifficulty] = useState("all");

  const words = useMemo(() => filterWords(difficulty), [difficulty]);
  const dailyWord = useMemo(() => getDailyWord(), []);

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Header />

        <div className="space-y-6">
          {/* Daily Word */}
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Word of the Day</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">{dailyWord.word}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{dailyWord.def} <span className="text-xs">({dailyWord.pos})</span></p>
            <p className="mt-1 text-xs italic text-[var(--muted-foreground)]">"{dailyWord.ex}"</p>
          </div>

          {/* Filter */}
          <DifficultyFilter selected={difficulty} onChange={setDifficulty} />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Easy</p>
              <p className="text-xl font-extrabold text-emerald-600">{filterWords("easy").length}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Medium</p>
              <p className="text-xl font-extrabold text-amber-600">{filterWords("medium").length}</p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">Hard</p>
              <p className="text-xl font-extrabold text-rose-600">{filterWords("hard").length}</p>
            </div>
          </div>

          {/* Flashcards */}
          {words.length > 0 && <WordCard words={words} />}

          {/* Quiz */}
          {words.length >= 4 && <QuizSection words={words} />}

          {/* Word List */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h3 className="text-base font-bold text-[var(--foreground)]">Word List ({words.length})</h3>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {words.map((w, i) => (
                <div key={i} className="flex items-start gap-3 px-6 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--foreground)]">{w.word}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{w.def} <span className="text-[10px]">({w.pos})</span></p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    w.diff === "easy" ? "bg-emerald-500/10 text-emerald-600" : w.diff === "medium" ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {w.diff}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          90 words across 3 levels. All data is local — nothing is uploaded.
        </p>
      </div>
    </div>
  );
}
