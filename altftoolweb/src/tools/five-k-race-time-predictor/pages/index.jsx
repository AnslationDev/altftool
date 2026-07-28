"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import {
  DISTANCE_PRESETS,
  RIEGEL_EXPONENT,
  TARGET_KM,
  formatDuration,
  formatPace,
  predictFiveK,
  toSeconds,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { distance: "10", hours: "0", minutes: "50", seconds: "0" };
const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      predictFiveK({
        knownDistanceKm: toNumber(distance),
        knownTimeSeconds: toSeconds({
          hours: toNumber(hours),
          minutes: toNumber(minutes),
          seconds: toNumber(seconds),
        }),
      }),
    [distance, hours, minutes, seconds],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "5K Race Time Predictor",
      `From: ${NUM2.format(result.knownDistanceKm)} km in ${formatDuration(result.knownTimeSeconds)}`,
      `Predicted 5K: ${formatDuration(result.predictedSeconds)}`,
      `Target pace: ${formatPace(result.pacePerKm)} /km (${formatPace(result.pacePerMile)} /mile)`,
      `Average speed: ${NUM1.format(result.speedKmh)} km/h`,
      `Method: Riegel, exponent ${result.exponent}`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDistance(DEFAULTS.distance);
    setHours(DEFAULTS.hours);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Running
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">5K Race Time Predictor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter a recent race or time trial and get your predicted 5K finish time, target pace and
          kilometre splits, using the Riegel endurance formula.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fivek-distance">
              Recent race distance (km)
            </label>
            <input
              id="fivek-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.4"
              max="200"
              step="0.1"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fivek-hours">
              Hours
            </label>
            <input
              id="fivek-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="23"
              step="1"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="fivek-minutes">
                Minutes
              </label>
              <input
                id="fivek-minutes"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                step="1"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="fivek-seconds">
                Seconds
              </label>
              <input
                id="fivek-seconds"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                step="1"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DISTANCE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setDistance(String(Number(preset.km.toFixed(4))))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Predicted 5K time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.predictedSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a prediction."
                : `${formatPace(result.pacePerKm)} per km · ${formatPace(result.pacePerMile)} per mile`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy 5K prediction"
              disabled={hasError}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            [
              "Based on",
              hasError
                ? DASH
                : `${NUM2.format(result.knownDistanceKm)} km in ${formatDuration(result.knownTimeSeconds)}`,
            ],
            [
              "Current race pace",
              hasError ? DASH : `${formatPace(result.knownPacePerKm)} per km`,
            ],
            ["Target 5K pace", hasError ? DASH : `${formatPace(result.pacePerKm)} per km`],
            ["Target 5K pace (miles)", hasError ? DASH : `${formatPace(result.pacePerMile)} per mile`],
            ["Average speed", hasError ? DASH : `${NUM1.format(result.speedKmh)} km/h`],
            ["Formula", hasError ? DASH : `Riegel, T2 = T1 x (D2/D1)^${RIEGEL_EXPONENT}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.reliable && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            Your race is {NUM1.format(result.ratio)}x the 5K distance. Riegel is most reliable within a
            factor of about four, so treat this as a rough guide and use a race closer to 5 km if you
            have one.
          </p>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Even-pace splits for {TARGET_KM} km</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Marker
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Split
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Clock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.splits.map((row) => (
                    <tr key={row.km} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.km} km</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {formatPace(row.split)}
                      </td>
                      <td className="py-2 text-right">{formatDuration(row.cumulative)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Equivalent times at other distances</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Distance
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Time
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Pace / km
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.equivalents.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{row.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">
                        {formatDuration(row.seconds)}
                      </td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {formatPace(row.seconds / row.km)}
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
        A prediction assumes similar conditions and that you are trained for the target distance. Heat,
        hills, wind and a thin week of training all cost time. Informational only — build up gradually
        and see a clinician before hard racing if you have a heart or joint condition.
      </p>
    </main>
  );
}
