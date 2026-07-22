"use client";

import { Trophy } from "lucide-react";
import { MEDALS } from "../lib/engine";

// Medal discs are game art (fixed vivid palette, same in both page themes);
// everything else on the card uses design tokens.
const MEDAL_DISC_STYLES = {
  gold: {
    background: "radial-gradient(circle at 35% 30%, #FFEFB3, #F5B301 62%, #C98A00)",
    border: "2px solid #A97400",
  },
  silver: {
    background: "radial-gradient(circle at 35% 30%, #F3F6FA, #B9C2CE 62%, #8C97A6)",
    border: "2px solid #76818F",
  },
  bronze: {
    background: "radial-gradient(circle at 35% 30%, #F0C9A0, #C08A53 62%, #8F5F33)",
    border: "2px solid #7A4F28",
  },
};

const bronzeMin = MEDALS[MEDALS.length - 1].min;
const thresholdLine = [...MEDALS]
  .reverse()
  .map((medal) => `${medal.label} ${medal.min}+`)
  .join(" · ");

export default function GameOverCard({ score, best, isNewBest, medal, onPlayAgain }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 p-4"
      role="dialog"
      aria-label="Game over"
    >
      <div className="w-full max-w-xs rounded-lg border border-border bg-card p-5 text-center shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Flight over</h3>

        <div className="mt-4 flex flex-col items-center gap-2">
          {medal ? (
            <>
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full shadow-md"
                style={MEDAL_DISC_STYLES[medal.id]}
              >
                <Trophy className="h-6 w-6" style={{ color: "rgba(70, 45, 5, 0.75)" }} />
              </span>
              <p className="text-sm font-medium text-foreground">{medal.label} medal!</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No medal yet — score {bronzeMin}+ for bronze.
            </p>
          )}
          <p className="text-xs text-muted-foreground">{thresholdLine}</p>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-muted px-3 py-2">
            <dt className="text-xs text-muted-foreground">Score</dt>
            <dd className="text-xl font-bold tabular-nums text-foreground">{score}</dd>
          </div>
          <div className="rounded-md bg-muted px-3 py-2">
            <dt className="text-xs text-muted-foreground">Best</dt>
            <dd className="text-xl font-bold tabular-nums text-foreground">{best ?? score}</dd>
          </div>
        </dl>

        {isNewBest ? (
          <p className="mt-3 inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            New best!
          </p>
        ) : null}

        <button
          type="button"
          onClick={onPlayAgain}
          onPointerDown={(event) => event.stopPropagation()}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Play again
        </button>
        <p className="mt-2 text-xs text-muted-foreground">or tap anywhere</p>
      </div>
    </div>
  );
}
