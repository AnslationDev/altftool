"use client";

import { Play, SlidersHorizontal } from "lucide-react";

const REASON_TITLES = {
  time: "Time's up!",
  missed: "Stray shot!",
  escaped: "Targets escaped!",
};

function Stat({ label, value }) {
  return (
    <div className="rounded-md bg-muted p-2.5 text-center">
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

export default function ResultsCard({ results, best, onPlayAgain, onChangeMode }) {
  const { reason, hits, accuracy, avgMs, isNewBest } = results;
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-card/70 p-3 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-md">
        <p className="text-center text-base font-semibold text-foreground">
          {REASON_TITLES[reason] || "Run over"}
        </p>
        {isNewBest ? (
          <p className="mt-1 text-center text-xs font-semibold text-primary">New best score!</p>
        ) : null}
        <dl className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Hits" value={hits} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Avg hit time" value={avgMs === null ? "—" : `${avgMs} ms`} />
          <Stat label="Best" value={best === null ? "—" : best} />
        </dl>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Play again
          </button>
          <button
            type="button"
            onClick={onChangeMode}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Change mode
          </button>
        </div>
      </div>
    </div>
  );
}
