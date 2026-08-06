"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  EXERCISE_INTENSITY,
  LIMITS,
  MAX_SAFE_L_PER_HOUR,
  DAILY_CAUTION_L,
  REPLACEMENT_L_PER_KG_LOST,
  SWEAT_SODIUM,
  humidHydrationPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  sex: "male",
  age: "30",
  weightKg: "70",
  tempC: "33",
  humidityPct: "80",
  intensity: "moderate",
  exerciseHours: "1",
  outdoorHours: "3",
  sweatType: "typical",
  wakingHours: "16",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [tempC, setTempC] = useState(DEFAULTS.tempC);
  const [humidityPct, setHumidityPct] = useState(DEFAULTS.humidityPct);
  const [intensity, setIntensity] = useState(DEFAULTS.intensity);
  const [exerciseHours, setExerciseHours] = useState(DEFAULTS.exerciseHours);
  const [outdoorHours, setOutdoorHours] = useState(DEFAULTS.outdoorHours);
  const [sweatType, setSweatType] = useState(DEFAULTS.sweatType);
  const [wakingHours, setWakingHours] = useState(DEFAULTS.wakingHours);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const num = (value) => (value === "" ? NaN : Number(value));

  const result = useMemo(
    () =>
      humidHydrationPlan({
        sex,
        age: num(age),
        weightKg: num(weightKg),
        tempC: num(tempC),
        humidityPct: num(humidityPct),
        intensity,
        exerciseHours: num(exerciseHours),
        outdoorHours: num(outdoorHours),
        sweatType,
        wakingHours: num(wakingHours),
      }),
    [sex, age, weightKg, tempC, humidityPct, intensity, exerciseHours, outdoorHours, sweatType, wakingHours],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Hydration Calculator — Humid Climate",
      `Conditions: ${tempC} °C, ${humidityPct}% RH — ${result.heatIndexOutOfRange ? "heat index beyond the published chart range (planning calculation capped)" : `heat index ${result.heatIndexC.toFixed(1)} °C`}`,
      `Training: ${result.intensityLabel} for ${exerciseHours} h, ${outdoorHours} h outdoors/without AC, ${wakingHours} h awake`,
      `Drink today: ${result.totalL.toFixed(2)} L (${NUM.format(result.totalMl)} ml, about ${Math.round(result.glassesOf250Ml)} glasses of 250 ml)`,
      `Pace: about ${result.perHourL.toFixed(2)} L/hour across waking hours`,
      `Estimated sweat loss: ${result.totalSweatL.toFixed(2)} L (exercise ${result.exerciseSweatL.toFixed(2)} L + passive ${result.passiveSweatL.toFixed(2)} L)`,
      `Sodium lost in sweat: ${NUM.format(result.sodiumMg)} mg (${result.sweatTypeLabel.toLowerCase()})`,
      `Reference: IOM adequate intake from drinks is ${result.iomDrinksL.toFixed(2)} L/day for ${sex === "male" ? "men" : "women"}`,
    ].join("\n");
  }, [hasError, result, tempC, humidityPct, exerciseHours, outdoorHours, wakingHours, sex]);

  const copyResult = () => copy("plan", summary, { label: "Hydration plan" });

  const reset = () => {
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setWeightKg(DEFAULTS.weightKg);
    setTempC(DEFAULTS.tempC);
    setHumidityPct(DEFAULTS.humidityPct);
    setIntensity(DEFAULTS.intensity);
    setExerciseHours(DEFAULTS.exerciseHours);
    setOutdoorHours(DEFAULTS.outdoorHours);
    setSweatType(DEFAULTS.sweatType);
    setWakingHours(DEFAULTS.wakingHours);
    resetCopyState();
  };

  const rows = [
    [
      "Heat index (feels like)",
      hasError
        ? DASH
        : result.heatIndexOutOfRange
          ? "Beyond published chart range (calculation capped)"
          : `${result.heatIndexC.toFixed(1)} °C / ${result.heatIndexF.toFixed(0)} °F`,
    ],
    ["Sweat multiplier from heat", hasError ? DASH : `${result.sweatMultiplier.toFixed(2)}x`],
    ["Baseline fluid (body weight)", hasError ? DASH : `${result.baselineL.toFixed(2)} L`],
    ["Sweat lost training", hasError ? DASH : `${result.exerciseSweatL.toFixed(2)} L`],
    ["Sweat lost outdoors otherwise", hasError ? DASH : `${result.passiveSweatL.toFixed(2)} L`],
    ["Total sweat loss", hasError ? DASH : `${result.totalSweatL.toFixed(2)} L`],
    ["Sodium lost in sweat", hasError ? DASH : `${NUM.format(result.sodiumMg)} mg`],
    [
      "IOM adequate intake from drinks",
      hasError ? DASH : `${result.iomDrinksL.toFixed(2)} L/day (${sex === "male" ? "men" : "women"})`,
    ],
    [
      "Replace per kg lost after a session",
      hasError
        ? DASH
        : `${REPLACEMENT_L_PER_KG_LOST.min}–${REPLACEMENT_L_PER_KG_LOST.max} L`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Humid-weather hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hydration Calculator — Humid Climate
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimates a day&apos;s fluid target for humid heat from a body-weight baseline, your training
          load and hours outdoors, scaled by the US National Weather Service heat index rather than
          air temperature alone — because sweat only cools you when it evaporates.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-sex">
              Sex
            </label>
            <select
              id="hc-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-age">
              Age
            </label>
            <input
              id="hc-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.age.min}
              max={LIMITS.age.max}
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-weight">
              Body weight (kg)
            </label>
            <input
              id="hc-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.weightKg.min}
              max={LIMITS.weightKg.max}
              step="1"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-waking">
              Waking hours
            </label>
            <input
              id="hc-waking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.wakingHours.min}
              max={LIMITS.wakingHours.max}
              step="1"
              value={wakingHours}
              onChange={(event) => setWakingHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-temp">
              Air temperature (°C)
            </label>
            <input
              id="hc-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.tempC.min}
              max={LIMITS.tempC.max}
              step="1"
              value={tempC}
              onChange={(event) => setTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-humidity">
              Relative humidity (%)
            </label>
            <input
              id="hc-humidity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.humidityPct.min}
              max={LIMITS.humidityPct.max}
              step="5"
              value={humidityPct}
              onChange={(event) => setHumidityPct(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hc-intensity">
              Training intensity today
            </label>
            <select
              id="hc-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intensity}
              onChange={(event) => setIntensity(event.target.value)}
            >
              {Object.entries(EXERCISE_INTENSITY).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-exercise-hours">
              Training hours today
            </label>
            <input
              id="hc-exercise-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.exerciseHours.min}
              max={LIMITS.exerciseHours.max}
              step="0.5"
              value={exerciseHours}
              onChange={(event) => setExerciseHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hc-outdoor-hours">
              Hours outdoors or without AC
            </label>
            <input
              id="hc-outdoor-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.outdoorHours.min}
              max={LIMITS.outdoorHours.max}
              step="0.5"
              value={outdoorHours}
              onChange={(event) => setOutdoorHours(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Independent of training hours — an air-conditioned gym session can have 0 outdoor
              hours.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hc-sweat-type">
              How salty does your sweat run?
            </label>
            <select
              id="hc-sweat-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sweatType}
              onChange={(event) => setSweatType(event.target.value)}
            >
              {Object.entries(SWEAT_SODIUM).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
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
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Drink today
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.totalL.toFixed(2)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${NUM.format(result.totalMl)} ml — about ${Math.round(result.glassesOf250Ml)} glasses of 250 ml`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the hydration plan"
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {isCopied("plan") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("plan") ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
          <span aria-live="polite" role="status" className="sr-only">
            {announcement}
          </span>
        </div>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Spread that across your {wakingHours} waking hours at about{" "}
            <strong>{result.perHourL.toFixed(2)} L per hour</strong>.
            {result.exceedsHourlyCeiling
              ? ` That pace is above the ${MAX_SAFE_L_PER_HOUR.toFixed(1)} L/hour healthy kidneys can safely clear — spread it out further rather than drinking faster, and lean on the tail end of your waking hours.`
              : ""}
          </p>
        )}

        {!hasError && result.exceedsDailyCaution && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            This works out to more than {DAILY_CAUTION_L} litres a day, beyond what kidneys can
            safely clear. Treat it as a signal that the exposure itself needs cutting back, not as a
            drinking target.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" role="status" aria-live="polite">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.needsElectrolytes && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Sweat loss is above 1.5 litres, so replace part of it with an electrolyte drink around{" "}
            {result.drinkSodiumMgPerL.min}–{result.drinkSodiumMgPerL.max} mg sodium per litre rather
            than plain water alone.
          </p>
        )}

        {!hasError && result.aboveIomDrinks && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            This is above the Institute of Medicine&apos;s baseline adequate intake from drinks (
            {result.iomDrinksL.toFixed(2)} L/day for {sex === "male" ? "men" : "women"}), which is
            expected once heat and training load are added on top of a sedentary reference figure.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for healthy adults, not medical advice. Sweat rates vary a great deal
        between individuals and with acclimatisation. Anyone with kidney, liver or heart disease, or
        on diuretics, should follow the fluid limits their doctor has set instead.
      </p>
    </main>
  );
}
