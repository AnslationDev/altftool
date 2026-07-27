"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import { computeTreadmillCalories } from "../lib";

const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DASH = "—";

const DEFAULTS = {
  weight: "70",
  weightUnit: "kg",
  speed: "6",
  speedUnit: "kmh",
  incline: "2",
  minutes: "30",
  gait: "auto",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [speedUnit, setSpeedUnit] = useState(DEFAULTS.speedUnit);
  const [incline, setIncline] = useState(DEFAULTS.incline);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [gait, setGait] = useState(DEFAULTS.gait);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = [weight, speed, incline, minutes].map(toNumber);
    if (values.some((v) => Number.isNaN(v))) {
      return { error: "Enter numbers only — check the weight, speed, incline and time fields." };
    }
    const [weightValue, speedValue, inclineValue, minutesValue] = values;
    return computeTreadmillCalories({
      weight: weightValue === null ? undefined : weightValue,
      weightUnit,
      speed: speedValue === null ? undefined : speedValue,
      speedUnit,
      inclinePercent: inclineValue === null ? undefined : inclineValue,
      minutes: minutesValue === null ? undefined : minutesValue,
      gait,
    });
  }, [weight, weightUnit, speed, speedUnit, incline, minutes, gait]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Treadmill Calorie Burn (ACSM metabolic equations)",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Speed: ${NUM1.format(result.speedKmh)} km/h (${NUM1.format(result.speedMph)} mph) at ${NUM1.format(result.inclinePercent)}% incline`,
      `Duration: ${NUM0.format(result.minutes)} minutes — ${result.gaitUsed === "run" ? "running" : "walking"} equation`,
      `Gross calories: ${NUM0.format(result.grossKcal)} kcal`,
      `Net calories (above rest): ${NUM0.format(result.netKcal)} kcal`,
      `Intensity: ${NUM1.format(result.mets)} METs (${NUM1.format(result.vo2)} mL/kg/min)`,
      `Distance: ${NUM2.format(result.distanceKm)} km`,
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
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setSpeed(DEFAULTS.speed);
    setSpeedUnit(DEFAULTS.speedUnit);
    setIncline(DEFAULTS.incline);
    setMinutes(DEFAULTS.minutes);
    setGait(DEFAULTS.gait);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          ACSM equations
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Treadmill Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimates energy cost from oxygen uptake rather than a flat MET table, so incline changes
          the answer the way it changes the effort.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="tm-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={weightUnit}
                onChange={(event) => setWeightUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-speed">
              Speed
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="tm-speed"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={speed}
                onChange={(event) => setSpeed(event.target.value)}
              />
              <select
                aria-label="Speed unit"
                className={`${INPUT_CLASS} w-28`}
                value={speedUnit}
                onChange={(event) => setSpeedUnit(event.target.value)}
              >
                <option value="kmh">km/h</option>
                <option value="mph">mph</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-incline">
              Incline (%)
            </label>
            <input
              id="tm-incline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={incline}
              onChange={(event) => setIncline(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-minutes">
              Duration (minutes)
            </label>
            <input
              id="tm-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="600"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tm-gait">
              Walking or running
            </label>
            <select
              id="tm-gait"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gait}
              onChange={(event) => setGait(event.target.value)}
            >
              <option value="auto">Auto (by speed)</option>
              <option value="walk">Walking</option>
              <option value="run">Running / jogging</option>
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              ACSM uses different equations for the two gaits — running costs roughly twice as much
              per metre on the flat, but incline adds less.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Calories burned (gross)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `${NUM1.format(result.kcalPerMin)} kcal per minute using the ${result.gaitUsed === "run" ? "running" : "walking"} equation`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy treadmill calorie result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.warnings.length > 0
          ? result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                {warning}
              </p>
            ))
          : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Net calories (above resting)",
              hasError ? DASH : `${NUM0.format(result.netKcal)} kcal`,
            ],
            [
              "Resting calories over the same time",
              hasError ? DASH : `${NUM0.format(result.restingKcal)} kcal`,
            ],
            ["Intensity", hasError ? DASH : `${NUM1.format(result.mets)} METs`],
            ["Oxygen uptake", hasError ? DASH : `${NUM1.format(result.vo2)} mL/kg/min`],
            [
              "Distance covered",
              hasError
                ? DASH
                : `${NUM2.format(result.distanceKm)} km (${NUM2.format(result.distanceMiles)} mi)`,
            ],
            [
              "Energy per kilometre",
              hasError || result.kcalPerKm === null
                ? DASH
                : `${NUM0.format(result.kcalPerKm)} kcal/km`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. The ACSM equations describe steady-state oxygen uptake for a
        motorised treadmill and typically fall within about 10% of measured values, but holding the
        handrails, very steep grades, and interval work all move the true figure. Treadmill console
        readouts usually report gross calories and often ignore your actual body weight.
      </p>
    </main>
  );
}
