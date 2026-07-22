"use client";

import { RotateCcw, Shuffle, Trophy } from "lucide-react";

function Metric({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border border-border bg-card px-3 py-2.5">
      <span className="text-lg font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ResultsCard({
  net,
  raw,
  acc,
  correct,
  incorrect,
  best,
  isNewBest,
  duration,
  onRestart,
  onNewWords,
}) {
  return (
    <div
      role="status"
      aria-label="Test results"
      className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/40 p-4 sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Time&apos;s up — {duration} second test
      </p>

      <div className="flex flex-col items-center">
        <span className="text-5xl font-bold tabular-nums text-foreground">{net}</span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Net WPM</span>
      </div>

      {isNewBest ? (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          New best score
        </span>
      ) : best !== null ? (
        <span className="text-xs text-muted-foreground">
          Best: <span className="font-semibold text-foreground">{best} WPM</span>
        </span>
      ) : null}

      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Raw WPM" value={raw} />
        <Metric label="Accuracy" value={`${acc}%`} />
        <Metric label="Correct" value={correct} />
        <Metric label="Incorrect" value={incorrect} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <button
          type="button"
          onClick={onNewWords}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          New words
        </button>
      </div>
    </div>
  );
}
