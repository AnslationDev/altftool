"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";
import {
  POOL_LENGTHS,
  SWIM_RIEGEL_EXPONENT,
  computeSwimPace,
  formatSwimTime,
  parseSwimTime,
} from "../lib";

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
  distance: "400",
  time: "6:00",
  pool: "scm25",
  exponent: String(SWIM_RIEGEL_EXPONENT),
};

const DISTANCE_PRESETS = ["100", "200", "400", "800", "1500"];

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [time, setTime] = useState(DEFAULTS.time);
  const [poolId, setPoolId] = useState(DEFAULTS.pool);
  const [exponent, setExponent] = useState(DEFAULTS.exponent);
  const [copied, setCopied] = useState(false);

  const pool = POOL_LENGTHS.find((option) => option.id === poolId) ?? POOL_LENGTHS[0];
  const unitLabel = pool.unit === "yd" ? "yards" : "metres";

  const result = useMemo(() => {
    const seconds = parseSwimTime(time);
    if (seconds === null) {
      return { error: "Enter the time as m:ss, for example 6:00 or 1:02:30." };
    }
    return computeSwimPace({
      distance: toNumber(distance),
      timeSeconds: seconds,
      unit: pool.unit,
      poolLength: pool.length,
      exponent: toNumber(exponent),
    });
  }, [distance, time, pool.unit, pool.length, exponent]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Swim Pace Calculator",
      `${NUM1.format(result.distance)} ${unitLabel} in ${formatSwimTime(result.timeSeconds)}`,
      `Pace: ${formatSwimTime(result.pacePer100, 1)} per 100 ${pool.unit}`,
      `Speed: ${NUM2.format(result.speedMps)} m/s (${NUM2.format(result.speedKmh)} km/h)`,
      `${NUM1.format(result.lengths)} lengths of a ${pool.label} pool at ${formatSwimTime(result.secondsPerLength, 1)} each`,
      `Predicted 1500: ${formatSwimTime(result.predictions[result.predictions.length - 1].riegelSeconds)}`,
    ].join("\n");
  }, [failed, result, unitLabel, pool.unit, pool.label]);

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
    setDistance(DEFAULTS.distance);
    setTime(DEFAULTS.time);
    setPoolId(DEFAULTS.pool);
    setExponent(DEFAULTS.exponent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Swimming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Swim Pace Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter any swim and get the number swimmers actually talk in — time per 100. It also gives
          your speed, seconds per length in your pool, and predicted times across the standard pool
          and triathlon distances.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-distance">
              Distance ({unitLabel})
            </label>
            <input
              id="swim-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="25000"
              step="25"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-time">
              Time (m:ss or h:mm:ss)
            </label>
            <input
              id="swim-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              placeholder="6:00"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-pool">
              Pool length
            </label>
            <select
              id="swim-pool"
              className={`mt-2 ${INPUT_CLASS}`}
              value={poolId}
              onChange={(event) => setPoolId(event.target.value)}
            >
              {POOL_LENGTHS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-exponent">
              Fatigue exponent for predictions
            </label>
            <input
              id="swim-exponent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1.2"
              step="0.01"
              value={exponent}
              onChange={(event) => setExponent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              1.03 suits swimming; 1.00 means holding exactly the same pace.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DISTANCE_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDistance(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value} {pool.unit}
            </button>
          ))}
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
              Pace per 100 {pool.unit}
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
              {failed ? DASH : formatSwimTime(result.pacePer100, 1)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Check the distance and time above."
                : `${NUM1.format(result.distance)} ${unitLabel} in ${formatSwimTime(result.timeSeconds)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the swim pace result" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [`Pace per 50 ${pool.unit}`, failed ? DASH : formatSwimTime(result.pacePer50, 1)],
            [`Pace per 25 ${pool.unit}`, failed ? DASH : formatSwimTime(result.pacePer25, 1)],
            ["Speed", failed ? DASH : `${NUM2.format(result.speedMps)} m/s`],
            ["Speed in km/h", failed ? DASH : `${NUM2.format(result.speedKmh)} km/h`],
            ["Lengths of this pool", failed ? DASH : NUM1.format(result.lengths)],
            ["Time per length", failed ? DASH : formatSwimTime(result.secondsPerLength, 1)],
            ["Distance in metres", failed ? DASH : `${NUM1.format(result.metres)} m`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Predicted pool times</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Riegel prediction at an exponent of {NUM2.format(result.exponent)}, next to what an
              unchanged pace would give.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Distance</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Predicted</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">At even pace</th>
                    <th scope="col" className="py-2 text-right font-semibold">Per 100</th>
                  </tr>
                </thead>
                <tbody>
                  {result.predictions.map((row) => (
                    <tr
                      key={row.distance}
                      className={`border-b border-[var(--border)] last:border-0 ${row.isSource ? "text-[var(--primary)]" : ""}`}
                    >
                      <td className="py-2 pr-3 font-semibold">
                        {row.distance} {pool.unit}
                        {row.isSource ? " (yours)" : ""}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {formatSwimTime(row.riegelSeconds)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {formatSwimTime(row.evenPaceSeconds)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatSwimTime((row.riegelSeconds * 100) / row.distance, 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Open-water and triathlon swims</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Race</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Distance</th>
                    <th scope="col" className="py-2 text-right font-semibold">Predicted time</th>
                  </tr>
                </thead>
                <tbody>
                  {result.openWater.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {NUM1.format(row.metres)} m
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatSwimTime(row.riegelSeconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Predictions assume similar conditions and an even effort. Open-water times are usually slower
        than the pool equivalent because of sighting, chop, currents and mass starts — treat these as
        planning estimates rather than targets.
      </p>
    </main>
  );
}
