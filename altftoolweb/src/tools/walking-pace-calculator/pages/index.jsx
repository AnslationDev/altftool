"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import { computeWalkingPace, formatDuration } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);
const two = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);

const DEFAULTS = {
  distance: "5",
  unit: "km",
  hours: "0",
  minutes: "45",
  seconds: "0",
  weight: "70",
  steps: "6500",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  return Number(trimmed.replace(/,/g, ""));
};

export default function ToolHome() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeWalkingPace({
        distance: toNumber(distance),
        unit,
        hours: toNumber(hours),
        minutes: toNumber(minutes),
        seconds: toNumber(seconds),
        weightKg: toNumber(weight),
        stepsTaken: toNumber(steps),
      }),
    [distance, unit, hours, minutes, seconds, weight, steps],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Walking Pace Calculator",
      `Distance: ${two(result.distanceKm)} km (${two(result.distanceMiles)} mi)`,
      `Time: ${formatDuration(result.totalSeconds)}`,
      `Pace: ${formatDuration(result.paceSecPerKm)} min/km · ${formatDuration(result.paceSecPerMile)} min/mile`,
      `Speed: ${two(result.speedKmh)} km/h (${two(result.speedMph)} mph)`,
      `Intensity: ${one(result.met)} METs — ${result.bandLabel}`,
      result.hasWeight ? `Calories: ${zero(result.kcal)} kcal` : "",
      result.hasSteps ? `Cadence: ${zero(result.cadence)} steps/min · stride ${two(result.strideM)} m` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setUnit(DEFAULTS.unit);
    setHours(DEFAULTS.hours);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setWeight(DEFAULTS.weight);
    setSteps(DEFAULTS.steps);
    setCopied(false);
  };

  const rows = [
    ["Pace per mile", ok ? `${formatDuration(result.paceSecPerMile)} min/mi` : DASH],
    ["Speed", ok ? `${two(result.speedKmh)} km/h · ${two(result.speedMph)} mph` : DASH],
    ["Distance", ok ? `${two(result.distanceKm)} km · ${two(result.distanceMiles)} mi` : DASH],
    ["Elapsed time", ok ? formatDuration(result.totalSeconds) : DASH],
    ["Intensity", ok ? `${one(result.met)} METs · ${result.bandLabel}` : DASH],
    ["Calories burned", ok && result.hasWeight ? `${zero(result.kcal)} kcal` : DASH],
    ["Cadence", ok && result.hasSteps ? `${zero(result.cadence)} steps/min` : DASH],
    ["Average stride length", ok && result.hasSteps ? `${two(result.strideM)} m` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Walking &amp; steps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Walking Pace Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter how far you walked and how long it took to get minutes per kilometre, minutes per
          mile, speed, MET intensity and split times for standard distances.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-distance">
              Distance walked
            </label>
            <input
              id="wp-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-unit">
              Distance unit
            </label>
            <select
              id="wp-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="km">Kilometres</option>
              <option value="mi">Miles</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Time taken</legend>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)]" htmlFor="wp-hours">
                Hours
              </label>
              <input
                id="wp-hours"
                className={`mt-1 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)]" htmlFor="wp-minutes">
                Minutes
              </label>
              <input
                id="wp-minutes"
                className={`mt-1 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)]" htmlFor="wp-seconds">
                Seconds
              </label>
              <input
                id="wp-seconds"
                className={`mt-1 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-weight">
              Body weight (kg, optional)
            </label>
            <input
              id="wp-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wp-steps">
              Steps taken (optional)
            </label>
            <input
              id="wp-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
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
              Pace per kilometre
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatDuration(result.paceSecPerKm) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.bandNote : "Fix the inputs above to see your pace."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy walking pace result"
              className={GHOST_BTN}
              disabled={!ok}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Finish times at this pace</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Distance
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Kilometres
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.splits : []).map((split) => (
                <tr key={split.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{split.label}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {two(split.km)}
                  </td>
                  <td className="py-2 text-right">{formatDuration(split.seconds)}</td>
                </tr>
              ))}
              {ok ? null : (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. MET values are level-ground walking figures from the Compendium of
        Physical Activities; hills, load carriage, heat and age all change the real energy cost.
      </p>
    </main>
  );
}
