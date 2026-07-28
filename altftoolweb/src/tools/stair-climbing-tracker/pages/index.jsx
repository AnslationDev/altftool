"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import {
  DEFAULT_DAILY_FLIGHT_GOAL,
  DEFAULT_STEP_RISE_CM,
  computeStairClimb,
  stepsForFlights,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : "—");
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DASH = "—";

const DEFAULTS = {
  steps: "180",
  rise: String(DEFAULT_STEP_RISE_CM),
  weight: "70",
  minutes: "4",
  goal: String(DEFAULT_DAILY_FLIGHT_GOAL),
  descent: false,
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
  if (trimmed === "") return NaN;
  return Number(trimmed.replace(/,/g, ""));
};

export default function ToolHome() {
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [rise, setRise] = useState(DEFAULTS.rise);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [descent, setDescent] = useState(DEFAULTS.descent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeStairClimb({
        stepsClimbed: toNumber(steps),
        stepRiseCm: toNumber(rise),
        weightKg: toNumber(weight),
        includeDescent: descent,
        minutes: toNumber(minutes),
        flightGoal: toNumber(goal),
      }),
    [steps, rise, weight, minutes, goal, descent],
  );

  const goalSteps = useMemo(
    () => stepsForFlights({ flights: toNumber(goal), stepRiseCm: toNumber(rise) }),
    [goal, rise],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Stair Climbing Tracker",
      `Steps climbed: ${zero(result.stepsClimbed)}`,
      `Elevation gain: ${one(result.elevationM)} m (${one(result.elevationFt)} ft)`,
      `Floors (10 ft each): ${one(result.flights)}`,
      `Calories from climbing: ${one(result.netKcal)} kcal`,
      result.hasDuration ? `Intensity: ${one(result.grossMet)} METs (${result.intensityLabel})` : "",
      result.hasDuration ? `Cadence: ${zero(result.stepsPerMin)} steps/min` : "",
      `Daily floor goal: ${one(result.goalPercent)}% of ${one(result.flightGoal)} floors`,
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
    setSteps(DEFAULTS.steps);
    setRise(DEFAULTS.rise);
    setWeight(DEFAULTS.weight);
    setMinutes(DEFAULTS.minutes);
    setGoal(DEFAULTS.goal);
    setDescent(DEFAULTS.descent);
    setCopied(false);
  };

  const rows = [
    ["Elevation gain", ok ? `${one(result.elevationM)} m / ${one(result.elevationFt)} ft` : DASH],
    ["Steps climbed", ok ? zero(result.stepsClimbed) : DASH],
    ["Calories climbing up", ok ? `${one(result.climbKcal)} kcal` : DASH],
    ["Calories walking down", ok ? `${one(result.descentKcal)} kcal` : DASH],
    ["Activity calories (net)", ok ? `${one(result.netKcal)} kcal` : DASH],
    [
      "Including resting burn (gross)",
      ok && result.hasDuration ? `${one(result.grossKcal)} kcal` : DASH,
    ],
    [
      "Intensity",
      ok && result.hasDuration ? `${one(result.grossMet)} METs · ${result.intensityLabel}` : DASH,
    ],
    ["Cadence", ok && result.hasDuration ? `${zero(result.stepsPerMin)} steps/min` : DASH],
    ["Daily floor goal progress", ok ? `${one(result.goalPercent)}%` : DASH],
    [
      "Floors still to go",
      ok ? (result.goalFlightsRemaining > 0 ? one(result.goalFlightsRemaining) : "Goal met") : DASH,
    ],
  ];

  const goalPct = ok ? Math.max(0, Math.min(100, result.goalPercent)) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Walking &amp; steps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stair Climbing Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn the stair steps you actually climbed into elevation gain, Fitbit-style floors and a
          calorie estimate worked out from the physics of lifting your body weight.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-steps">
              Stair steps climbed
            </label>
            <input
              id="stair-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-rise">
              Height of one step (cm)
            </label>
            <input
              id="stair-rise"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="30"
              step="0.1"
              value={rise}
              onChange={(event) => setRise(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-weight">
              Body weight (kg)
            </label>
            <input
              id="stair-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-minutes">
              Active minutes (0 if unknown)
            </label>
            <input
              id="stair-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stair-goal">
              Daily floor goal
            </label>
            <input
              id="stair-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="stair-descent"
            >
              <input
                id="stair-descent"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={descent}
                onChange={(event) => setDescent(event.target.checked)}
              />
              I walked back down too
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[60, 120, 180, 340].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSteps(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} steps
            </button>
          ))}
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
              Floors climbed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? one(result.flights) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${one(result.netKcal)} kcal burned · ${one(result.elevationM)} m of climbing`
                : "Fix the inputs above to see your result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy stair climbing result"
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

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={ok ? `${one(result.goalPercent)} percent of the daily floor goal` : "No result"}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {ok
              ? `${one(result.flights)} of ${one(result.flightGoal)} floors — about ${zero(goalSteps.steps ?? NaN)} stair steps at this riser height.`
              : "Daily floor goal progress unavailable."}
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Calories are derived from vertical work at about 23% mechanical
        efficiency and will differ from a wrist tracker, which uses heart rate and barometric
        pressure. Talk to a clinician before starting stair training if you have knee, hip or
        cardiac conditions.
      </p>
    </main>
  );
}
