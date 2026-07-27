"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  MAX_COUNT,
  MAX_WALK_MINUTES,
  TOTAL_WEIGHT,
  formatWalkabilityText,
  scoreWalkability,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_AMENITIES = {
  grocery: { minutes: "6", count: "1" },
  restaurants: { minutes: "4", count: "8" },
  shopping: { minutes: "7", count: "4" },
  coffee: { minutes: "5", count: "3" },
  banks: { minutes: "8", count: "1" },
  parks: { minutes: "9", count: "1" },
  schools: { minutes: "11", count: "1" },
  books: { minutes: "16", count: "1" },
  entertainment: { minutes: "14", count: "1" },
};

const DEFAULTS = {
  intersectionDensity: "160",
  blockLength: "135",
  transitWalk: "7",
  transitHeadway: "15",
};

export default function ToolHome() {
  const [amenities, setAmenities] = useState(DEFAULT_AMENITIES);
  const [intersectionDensity, setIntersectionDensity] = useState(DEFAULTS.intersectionDensity);
  const [blockLength, setBlockLength] = useState(DEFAULTS.blockLength);
  const [transitWalk, setTransitWalk] = useState(DEFAULTS.transitWalk);
  const [transitHeadway, setTransitHeadway] = useState(DEFAULTS.transitHeadway);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsed = Object.fromEntries(
      Object.entries(amenities).map(([id, value]) => [
        id,
        { minutes: Number(value.minutes), count: Number(value.count) },
      ]),
    );
    return scoreWalkability({
      amenities: parsed,
      intersectionDensity: Number(intersectionDensity),
      blockLength: Number(blockLength),
      transitWalkMinutes: Number(transitWalk),
      transitHeadwayMinutes: Number(transitHeadway),
    });
  }, [amenities, intersectionDensity, blockLength, transitWalk, transitHeadway]);

  const setAmenity = (id, key, value) =>
    setAmenities((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));

  const copyResult = async () => {
    const text = formatWalkabilityText(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAmenities(DEFAULT_AMENITIES);
    setIntersectionDensity(DEFAULTS.intersectionDensity);
    setBlockLength(DEFAULTS.blockLength);
    setTransitWalk(DEFAULTS.transitWalk);
    setTransitHeadway(DEFAULTS.transitHeadway);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Walkability
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Neighbourhood Walkability Scorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the walking minutes from a front door to each kind of amenity. Scoring follows the Walk
          Score model — full marks inside a five-minute walk, nothing past thirty minutes, then a penalty
          for street layouts that force detours.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Walking time to amenities</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Use the real walking route, not the straight line. For the counted categories, add how many are
          within a ten-minute walk.
        </p>
        <div className="mt-4 space-y-3">
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <p className="text-sm font-semibold">{category.label}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`nws-min-${category.id}`}>
                    Walk to nearest (minutes)
                  </label>
                  <input
                    id={`nws-min-${category.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={MAX_WALK_MINUTES}
                    step="1"
                    value={amenities[category.id].minutes}
                    onChange={(event) => setAmenity(category.id, "minutes", event.target.value)}
                  />
                </div>
                {category.counted && (
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`nws-count-${category.id}`}>
                      How many within 10 minutes
                    </label>
                    <input
                      id={`nws-count-${category.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max={MAX_COUNT}
                      step="1"
                      value={amenities[category.id].count}
                      onChange={(event) => setAmenity(category.id, "count", event.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Street layout and transit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nws-density">
              Intersections per km²
            </label>
            <input
              id="nws-density"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1000"
              step="10"
              value={intersectionDensity}
              onChange={(event) => setIntersectionDensity(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              A tight grid runs above 200; a suburban cul-de-sac layout is often under 60.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nws-block">
              Average block length (metres)
            </label>
            <input
              id="nws-block"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="2000"
              step="5"
              value={blockLength}
              onChange={(event) => setBlockLength(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Under 120 m is penalty-free; over 195 m costs the full 5%.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nws-transit-walk">
              Walk to nearest transit stop (minutes)
            </label>
            <input
              id="nws-transit-walk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={transitWalk}
              onChange={(event) => setTransitWalk(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nws-headway">
              Typical gap between services (minutes)
            </label>
            <input
              id="nws-headway"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="240"
              step="1"
              value={transitHeadway}
              onChange={(event) => setTransitHeadway(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Walkability score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? "Fix the input above to score this address." : `${result.band.label} — ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy walkability score"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!result.error && (
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Walkability ${result.score} out of 100`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${result.score}%` }} />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Amenity points earned", result.error ? DASH : `${result.earnedPoints} of ${TOTAL_WEIGHT}`],
            ["Score before penalties", result.error ? DASH : result.baseScore],
            [
              "Pedestrian-friendliness penalty",
              result.error ? DASH : `${result.penaltyPct}% (${result.intersectionBand.label}; ${result.blockBand.label})`,
            ],
            ["Transit access", result.error ? DASH : `${result.transit}/100 — ${result.transitLabel}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Points by category</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Walk</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Points</th>
                  <th scope="col" className="py-2 text-right font-semibold">Earned</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.minutes} min · {row.metres} m
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {Math.round(row.earned * 100) / 100} / {Math.round(row.possible * 100) / 100}
                    </td>
                    <td className="py-2 text-right font-semibold">{Math.round(row.share * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.weakest.length > 0 && (
            <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm">
              <p className="font-semibold">Biggest gaps</p>
              <ul className="mt-2 space-y-1 text-[var(--muted-foreground)]">
                {result.weakest.map((row) => (
                  <li key={row.id}>
                    {row.label} — {row.minutes} minute walk, keeping only {Math.round(row.share * 100)}% of its points.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate for comparing addresses, not an official Walk Score. Distances you enter by hand,
        pavement quality, traffic speed, lighting and personal mobility all change how walkable a street
        really feels.
      </p>
    </main>
  );
}
