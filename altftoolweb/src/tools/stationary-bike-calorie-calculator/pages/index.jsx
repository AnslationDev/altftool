"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import { RESISTANCE_SCALES, computeBikeCalories } from "../lib";

const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DASH = "—";

const DEFAULTS = {
  weight: "70",
  weightUnit: "kg",
  mode: "resistance",
  watts: "150",
  level: "10",
  maxLevel: "20",
  cadence: "80",
  minutes: "45",
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
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [watts, setWatts] = useState(DEFAULTS.watts);
  const [level, setLevel] = useState(DEFAULTS.level);
  const [maxLevel, setMaxLevel] = useState(DEFAULTS.maxLevel);
  const [cadence, setCadence] = useState(DEFAULTS.cadence);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = [weight, watts, level, maxLevel, cadence, minutes].map(toNumber);
    if (values.some((v) => Number.isNaN(v))) {
      return { error: "Enter numbers only — check every field." };
    }
    const [weightValue, wattsValue, levelValue, maxLevelValue, cadenceValue, minutesValue] = values;
    return computeBikeCalories({
      weight: weightValue === null ? undefined : weightValue,
      weightUnit,
      mode,
      watts: wattsValue,
      level: levelValue,
      maxLevel: maxLevelValue === null ? undefined : maxLevelValue,
      cadence: cadenceValue,
      minutes: minutesValue === null ? undefined : minutesValue,
    });
  }, [weight, weightUnit, mode, watts, level, maxLevel, cadence, minutes]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Stationary Bike Calorie Burn (ACSM cycling equation)",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      result.estimatedPower
        ? `Resistance ${NUM0.format(result.level)} of ${NUM0.format(result.maxLevel)} at ${NUM0.format(result.cadence)} rpm ≈ ${NUM0.format(result.powerW)} W`
        : `Average power: ${NUM0.format(result.powerW)} W`,
      `Duration: ${NUM0.format(result.minutes)} minutes`,
      `Gross calories: ${NUM0.format(result.grossKcal)} kcal`,
      `Net calories (above rest): ${NUM0.format(result.netKcal)} kcal`,
      `Intensity: ${NUM1.format(result.mets)} METs (${NUM1.format(result.vo2)} mL/kg/min)`,
      `Mechanical work: ${NUM0.format(result.workKj)} kJ`,
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
    setMode(DEFAULTS.mode);
    setWatts(DEFAULTS.watts);
    setLevel(DEFAULTS.level);
    setMaxLevel(DEFAULTS.maxLevel);
    setCadence(DEFAULTS.cadence);
    setMinutes(DEFAULTS.minutes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Cycle ergometry
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Stationary Bike Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter watts if your console shows them, or a resistance level and cadence if it does not.
          Energy comes from the ACSM leg-ergometry equation rather than a generic MET table.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>How do you want to describe the effort?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["watts", "Average power (watts)", "Most accurate — use it if the console shows watts."],
              ["resistance", "Resistance level + cadence", "Approximated from flywheel physics."],
            ].map(([key, title, hint]) => (
              <label
                key={key}
                htmlFor={`bike-mode-${key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)] has-checked:border-[var(--primary)]"
              >
                <input
                  id={`bike-mode-${key}`}
                  type="radio"
                  name="bike-mode"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  value={key}
                  checked={mode === key}
                  onChange={(event) => setMode(event.target.value)}
                />
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="bike-weight"
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
            <label className={LABEL_CLASS} htmlFor="bike-minutes">
              Duration (minutes)
            </label>
            <input
              id="bike-minutes"
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

          {mode === "watts" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="bike-watts">
                Average power (watts)
              </label>
              <input
                id="bike-watts"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="1000"
                step="1"
                value={watts}
                onChange={(event) => setWatts(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="bike-level">
                  Resistance level
                </label>
                <input
                  id="bike-level"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="bike-maxlevel">
                  Levels on your bike
                </label>
                <select
                  id="bike-maxlevel"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={maxLevel}
                  onChange={(event) => setMaxLevel(event.target.value)}
                >
                  {RESISTANCE_SCALES.map((scale) => (
                    <option key={scale} value={String(scale)}>
                      1–{scale}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="bike-cadence">
                  Average cadence (rpm)
                </label>
                <input
                  id="bike-cadence"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="200"
                  step="1"
                  value={cadence}
                  onChange={(event) => setCadence(event.target.value)}
                />
              </div>
            </>
          )}
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
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
                : `${NUM1.format(result.kcalPerMin)} kcal per minute at ${NUM0.format(result.powerW)} W`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy stationary bike calorie result"
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
            ["Net calories (above resting)", hasError ? DASH : `${NUM0.format(result.netKcal)} kcal`],
            ["Estimated power", hasError ? DASH : `${NUM0.format(result.powerW)} W`],
            ["Power to weight", hasError ? DASH : `${NUM2.format(result.wattsPerKg)} W/kg`],
            ["Intensity", hasError ? DASH : `${NUM1.format(result.mets)} METs`],
            ["Oxygen uptake", hasError ? DASH : `${NUM1.format(result.vo2)} mL/kg/min`],
            ["Mechanical work done", hasError ? DASH : `${NUM0.format(result.workKj)} kJ`],
            [
              "Gross mechanical efficiency",
              hasError || result.grossEfficiency === null
                ? DASH
                : `${NUM1.format(result.grossEfficiency)}%`,
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
        Informational estimate. The ACSM cycling equation is validated for roughly 50-200 W of
        steady-state work; interval sessions, very high power and uncalibrated resistance dials all
        add error. Console calorie readouts are usually gross rather than net and often assume a
        default body weight.
      </p>
    </main>
  );
}
