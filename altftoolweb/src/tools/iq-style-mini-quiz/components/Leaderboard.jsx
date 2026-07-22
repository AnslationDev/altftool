"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Target, Clock, Trash2, ArrowLeft } from "lucide-react";
import { getLeaderboard, clearLeaderboard } from "../utils/storage";

export default function Leaderboard({ onBack }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const handleClear = () => {
    clearLeaderboard();
    setEntries([]);
  };

  const highestScore = entries.length > 0 ? entries.reduce((b, e) => (e.score > b.score ? e : b), entries[0]) : null;
  const bestAccuracy = entries.length > 0 ? entries.reduce((b, e) => (e.accuracy > b.accuracy ? e : b), entries[0]) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-secondary rounded-lg p-2">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Leaderboard</h2>
        </div>
        {entries.length > 0 && (
          <button onClick={handleClear} className="btn-secondary rounded-lg px-3 py-2 text-xs text-rose-600">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center shadow-sm">
          <Trophy className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="text-lg font-bold text-[var(--foreground)]">No Attempts Yet</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Complete a quiz to see your results here.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <Medal className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-xs font-bold uppercase text-amber-600">Highest Score</p>
                <p className="text-xl font-extrabold text-[var(--foreground)]">{highestScore?.score}%</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <Target className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-xs font-bold uppercase text-emerald-600">Best Accuracy</p>
                <p className="text-xl font-extrabold text-[var(--foreground)]">{bestAccuracy?.accuracy}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
                <Trophy className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                Recent Attempts ({entries.length})
              </h3>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {entries.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--section-highlight)]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--section-highlight)] text-xs font-bold text-[var(--muted-foreground)]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--foreground)]">{entry.score}% Score</span>
                      <span className="rounded-full bg-[var(--section-highlight)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
                        {entry.difficultyLabel || entry.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {entry.correct}/{entry.totalQuestions} correct | {entry.accuracy}% accuracy | {entry.avgResponseTime}ms avg
                    </p>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
