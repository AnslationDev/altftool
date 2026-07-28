"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, Plus, RotateCcw, Undo2 } from "lucide-react";
import { parseStrokeCounts, summariseStrokes } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  entries: "18, 18, 19, 19, 20, 20, 21, 21",
  pool: "25",
  next: "20",
};

const POOL_OPTIONS = ["25", "33.3", "50"];

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [entries, setEntries] = useState(DEFAULTS.entries);
  const [pool, setPool] = useState(DEFAULTS.pool);
  const [next, setNext] = useState(DEFAULTS.next);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseStrokeCounts(entries), [entries]);

  const result = useMemo(() => {
    if (parsed.error) return { error: parsed.error };
    return summariseStrokes({ counts: parsed.counts, poolLengthM: toNumber(pool) });
  }, [parsed, pool]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Swim Stroke Count Tracker",
      `${result.lengths} lengths of ${NUM1.format(result.poolLengthM)} m (${NUM1.format(result.totalDistanceM)} m)`,
      `Average: ${NUM2.format(result.mean)} strokes per length`,
      `Range: ${result.min} to ${result.max} (spread ${result.spread})`,
      `Distance per stroke: ${NUM2.format(result.distancePerStroke)} m`,
      result.driftPercent === null
        ? "Not enough lengths to measure drift."
        : `Drift first half to second half: ${result.driftPercent >= 0 ? "+" : ""}${NUM1.format(result.driftPercent)}% (${result.driftBand.label})`,
    ].join("\n");
  }, [failed, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const logLength = () => {
    const value = toNumber(next);
    if (!Number.isFinite(value) || value <= 0) return;
    const whole = String(Math.round(value));
    setEntries((current) => (current.trim() === "" ? whole : `${current.trim()}, ${whole}`));
  };

  const undoLength = () => {
    setEntries((current) => {
      const tokens = current.split(/[\s,;]+/).filter((token) => token !== "");
      tokens.pop();
      return tokens.join(", ");
    });
  };

  const reset = () => {
    setEntries(DEFAULTS.entries);
    setPool(DEFAULTS.pool);
    setNext(DEFAULTS.next);
    setCopied(false);
  };

  const chartMax = failed ? 1 : Math.max(...result.counts);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Swimming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Swim Stroke Count Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log the strokes you take in each length and see the average, the spread, your distance per
          stroke and how far the count drifts between the first and second half of the set.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="stroke-entries">
              Strokes in each length, in order
            </label>
            <textarea
              id="stroke-entries"
              className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={entries}
              onChange={(event) => setEntries(event.target.value)}
              placeholder="18, 18, 19, 20"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Separate with commas, spaces or new lines. Count the same way every length.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stroke-pool">
              Pool length (m)
            </label>
            <select
              id="stroke-pool"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pool}
              onChange={(event) => setPool(event.target.value)}
            >
              {POOL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} m
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stroke-next">
              Strokes in the length you just swam
            </label>
            <input
              id="stroke-next"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={next}
              onChange={(event) => setNext(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={logLength} aria-label="Add this length to the log" className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Log length
          </button>
          <button type="button" onClick={undoLength} aria-label="Remove the last logged length" className={GHOST_BTN}>
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Undo last
          </button>
          <button type="button" onClick={() => setEntries("")} aria-label="Clear the log" className={GHOST_BTN}>
            Clear log
          </button>
        </div>
      </section>

      {failed ? (
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
              Average strokes per length
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
              {failed ? DASH : NUM2.format(result.mean)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Log at least one length to see a summary."
                : `${result.lengths} lengths · ${NUM1.format(result.totalDistanceM)} m · ${result.totalStrokes} strokes in total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the stroke count summary" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Distance per stroke", failed ? DASH : `${NUM2.format(result.distancePerStroke)} m`],
            ["Best length's distance per stroke", failed ? DASH : `${NUM2.format(result.bestDistancePerStroke)} m`],
            ["Lowest count", failed ? DASH : String(result.min)],
            ["Highest count", failed ? DASH : String(result.max)],
            ["Spread (high minus low)", failed ? DASH : String(result.spread)],
            ["Median", failed ? DASH : NUM2.format(result.median)],
            ["Standard deviation", failed ? DASH : NUM2.format(result.standardDeviation)],
            [
              "First half average",
              failed || result.firstHalfMean === null ? DASH : NUM2.format(result.firstHalfMean),
            ],
            [
              "Second half average",
              failed || result.secondHalfMean === null ? DASH : NUM2.format(result.secondHalfMean),
            ],
            [
              "Drift across the set",
              failed || result.driftPercent === null
                ? DASH
                : `${result.driftPercent >= 0 ? "+" : ""}${NUM1.format(result.driftPercent)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.driftBand && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.driftBand.label}: {result.driftBand.note}
          </p>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Length by length</h2>
          <ol className="mt-3 space-y-2">
            {result.counts.map((count, index) => (
              <li
                key={`length-${index + 1}`}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-16 shrink-0 text-[var(--muted-foreground)]">
                  Len {index + 1}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${(count / chartMax) * 100}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right font-semibold tabular-nums">{count}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Stroke count only means something alongside speed — taking fewer strokes by gliding longer
        usually makes you slower. Compare counts at the same pace, in the same pool, against your own
        earlier sessions. General training information only.
      </p>
    </main>
  );
}
