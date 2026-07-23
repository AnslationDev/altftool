"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw } from "lucide-react";

export default function WordCard({ words }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index] || words[0];

  const next = () => { setIndex((i) => (i + 1) % words.length); setFlipped(false); };
  const prev = () => { setIndex((i) => (i - 1 + words.length) % words.length); setFlipped(false); };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--foreground)]">Flashcards</h3>
          <span className="text-xs text-[var(--muted-foreground)]">{index + 1} / {words.length}</span>
        </div>
      </div>

      <div className="p-6">
        <div
          onClick={() => setFlipped(!flipped)}
          className="mx-auto flex min-h-[180px] w-full max-w-md cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--section-highlight)] p-6 transition-all hover:border-[var(--primary)]"
        >
          {!flipped ? (
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[var(--foreground)]">{word.word}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">Tap to reveal</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--foreground)]">{word.def}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">({word.pos})</p>
              <p className="mt-2 text-sm italic text-[var(--muted-foreground)]">"{word.ex}"</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {word.syn.map((s, i) => (
                  <span key={i} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={prev} className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:bg-[var(--section-highlight)]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setFlipped(!flipped)} className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--section-highlight)]">
            <RotateCcw className="h-3.5 w-3.5" /> Flip
          </button>
          <button onClick={() => { setIndex(Math.floor(Math.random() * words.length)); setFlipped(false); }} className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--section-highlight)]">
            <Shuffle className="h-3.5 w-3.5" /> Random
          </button>
          <button onClick={next} className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:bg-[var(--section-highlight)]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
