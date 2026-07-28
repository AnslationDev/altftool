"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";
import { computeSwolf, computeSwolfSet, formatSeconds, tradeOffTable } from "../lib";

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
  mode: "single",
  lengthTime: "20",
  strokes: "18",
  pool: "25",
  totalTime: "360",
  totalStrokes: "300",
  lengths: "16",
};

const POOL_OPTIONS = ["25", "33.3", "50"];

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [lengthTime, setLengthTime] = useState(DEFAULTS.lengthTime);
  const [strokes, setStrokes] = useState(DEFAULTS.strokes);
  const [pool, setPool] = useState(DEFAULTS.pool);
  const [totalTime, setTotalTime] = useState(DEFAULTS.totalTime);
  const [totalStrokes, setTotalStrokes] = useState(DEFAULTS.totalStrokes);
  const [lengths, setLengths] = useState(DEFAULTS.lengths);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "single") {
      return computeSwolf({
        lengthTimeSeconds: toNumber(lengthTime),
        strokes: toNumber(strokes),
        poolLengthM: toNumber(pool),
      });
    }
    return computeSwolfSet({
      totalTimeSeconds: toNumber(totalTime),
      totalStrokes: toNumber(totalStrokes),
      lengths: toNumber(lengths),
      poolLengthM: toNumber(pool),
    });
  }, [mode, lengthTime, strokes, pool, totalTime, totalStrokes, lengths]);

  const failed = Boolean(result.error);
  const trade = useMemo(() => (failed ? [] : tradeOffTable(result)), [failed, result]);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "SWOLF Score Calculator",
      `Pool: ${NUM1.format(result.poolLengthM)} m`,
      `Length time ${formatSeconds(result.lengthTimeSeconds)} + ${NUM2.format(result.strokes)} strokes`,
      `SWOLF: ${NUM1.format(result.swolf)}`,
      `SWOLF normalised per 25 m: ${NUM1.format(result.normalisedSwolf25)}`,
      `Pace: ${formatSeconds(result.pacePer100Seconds)} per 100 m · ${NUM2.format(result.distancePerStrokeM)} m per stroke`,
      `Stroke rate: ${NUM1.format(result.strokeRatePerMinute)} strokes per minute`,
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

  const reset = () => {
    setMode(DEFAULTS.mode);
    setLengthTime(DEFAULTS.lengthTime);
    setStrokes(DEFAULTS.strokes);
    setPool(DEFAULTS.pool);
    setTotalTime(DEFAULTS.totalTime);
    setTotalStrokes(DEFAULTS.totalStrokes);
    setLengths(DEFAULTS.lengths);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Swimming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SWOLF Score Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          SWOLF adds the seconds a length takes to the strokes it took — like golf, a lower score is
          better. This works it out for a single length or a whole set, normalises it per 25 m so
          different pools compare, and shows the time-versus-strokes trade-off behind the number.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("single")}
            aria-pressed={mode === "single"}
            className={mode === "single" ? PRIMARY_BTN : GHOST_BTN}
          >
            One length
          </button>
          <button
            type="button"
            onClick={() => setMode("set")}
            aria-pressed={mode === "set"}
            className={mode === "set" ? PRIMARY_BTN : GHOST_BTN}
          >
            Whole set
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swolf-pool">
              Pool length (m)
            </label>
            <select
              id="swolf-pool"
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

          {mode === "single" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="swolf-time">
                  Time for that length (seconds)
                </label>
                <input
                  id="swolf-time"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="600"
                  step="0.5"
                  value={lengthTime}
                  onChange={(event) => setLengthTime(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="swolf-strokes">
                  Strokes in that length
                </label>
                <input
                  id="swolf-strokes"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="200"
                  step="1"
                  value={strokes}
                  onChange={(event) => setStrokes(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="swolf-total-time">
                  Total swim time (seconds)
                </label>
                <input
                  id="swolf-total-time"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={totalTime}
                  onChange={(event) => setTotalTime(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="swolf-total-strokes">
                  Total strokes in the set
                </label>
                <input
                  id="swolf-total-strokes"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={totalStrokes}
                  onChange={(event) => setTotalStrokes(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="swolf-lengths">
                  Lengths swum
                </label>
                <input
                  id="swolf-lengths"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="400"
                  step="1"
                  value={lengths}
                  onChange={(event) => setLengths(event.target.value)}
                />
              </div>
            </>
          )}
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
              SWOLF score
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]">
              {failed ? DASH : NUM1.format(result.swolf)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Enter a valid time and stroke count."
                : `${NUM1.format(result.lengthTimeSeconds)} s + ${NUM2.format(result.strokes)} strokes per ${NUM1.format(result.poolLengthM)} m length`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the SWOLF result" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Time makes up ${NUM1.format(result.timeShare * 100)} percent of the score and strokes ${NUM1.format(result.strokeShare * 100)} percent`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${result.timeShare * 100}%` }} />
              <span className="block h-full bg-[var(--success)]" style={{ width: `${result.strokeShare * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Time {NUM1.format(result.timeShare * 100)}% · strokes {NUM1.format(result.strokeShare * 100)}% of the score
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["SWOLF normalised per 25 m", failed ? DASH : NUM1.format(result.normalisedSwolf25)],
            ["Speed", failed ? DASH : `${NUM2.format(result.speedMps)} m/s`],
            ["Pace per 100 m", failed ? DASH : formatSeconds(result.pacePer100Seconds)],
            ["Distance per stroke", failed ? DASH : `${NUM2.format(result.distancePerStrokeM)} m`],
            ["Stroke rate", failed ? DASH : `${NUM1.format(result.strokeRatePerMinute)} strokes/min`],
            [
              "Set distance",
              failed || !result.totalDistanceM ? DASH : `${NUM1.format(result.totalDistanceM)} m`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && trade.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Same score, different trade-off</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Every stroke you save has to be paid for with a second. These combinations all produce a
            SWOLF of {NUM1.format(result.swolf)}.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Strokes</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Time needed</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Speed</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per stroke</th>
                </tr>
              </thead>
              <tbody>
                {trade.map((row) => (
                  <tr
                    key={row.strokes}
                    className={`border-b border-[var(--border)] last:border-0 ${row.offset === 0 ? "text-[var(--primary)]" : ""}`}
                  >
                    <td className="py-2 pr-3 font-semibold tabular-nums">
                      {row.strokes}
                      {row.offset === 0 ? " (yours)" : ""}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {NUM1.format(row.requiredTimeSeconds)} s
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {NUM2.format(row.speedMps)} m/s
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {NUM2.format(row.distancePerStrokeM)} m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        SWOLF only compares like with like: the same stroke, the same pool length and a similar
        effort. A lower score achieved purely by gliding longer usually means swimming slower, so
        read it next to your actual pace. General training information only.
      </p>
    </main>
  );
}
