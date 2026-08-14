"use client";

import { useState } from "react";
import { TIME_BANDS } from "@altftool/core/detour/taxonomy";
import GoButton from "./GoButton";

/*
 * Hero: the button, plus the one filter worth putting in front of it.
 *
 * "How long have you got" is the only question that changes what a good answer
 * looks like — a visitor with two minutes and a visitor with an evening want
 * genuinely different sites. Everything else (mood, topic, work-safety) lives
 * on the browse page, because a hero with six filters is a search form, and the
 * whole appeal of this genre is that it is one button.
 *
 * Work-safe is the exception: it is a toggle here rather than a page away,
 * because someone at a desk needs it before they press the button, not after.
 */

export default function DetourHero() {
  const [time, setTime] = useState(null);
  const [sfwOnly, setSfwOnly] = useState(false);

  const filters = {};
  if (time) filters.time = time;
  if (sfwOnly) filters.sfw = "1";

  return (
    <div className="flex flex-col items-center gap-8">
      <GoButton filters={filters} enableShortcut />

      <div className="flex flex-col items-center gap-3">
        <p
          className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
          id="dtr-time-label"
        >
          How long have you got?
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-2"
          role="group"
          aria-labelledby="dtr-time-label"
        >
          <button
            type="button"
            onClick={() => setTime(null)}
            aria-pressed={time === null}
            className="dtr-time-option rounded-full border border-border px-3.5 py-1.5 text-sm"
          >
            Any
          </button>

          {TIME_BANDS.map((band) => (
            <button
              key={band.id}
              type="button"
              onClick={() => setTime(band.id)}
              aria-pressed={time === band.id}
              title={band.hint}
              className="dtr-time-option rounded-full border border-border px-3.5 py-1.5 text-sm"
            >
              {band.label}
            </button>
          ))}
        </div>

        <label className="mt-1 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={sfwOnly}
            onChange={(event) => setSfwOnly(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-[var(--dtr-accent)]"
          />
          Keep it safe for work
        </label>
      </div>
    </div>
  );
}
