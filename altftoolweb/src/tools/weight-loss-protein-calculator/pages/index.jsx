"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  ACTIVITY_LEVELS,
  AMDR_MAX_PCT,
  AMDR_MIN_PCT,
  MAX_MEALS,
  MIN_MEALS,
  PER_MEAL_MPS_G,
  PROTEIN_RDA_G_PER_KG,
  computeWeightLossProtein,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const grams = (v) => (Number.isFinite(v) ? `${NUM.format(v)} g` : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  weightKg: "85",
  heightCm: "172",
  sex: "male",
  activity: "resistance2",
  meals: "3",
  dailyKcal: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [dailyKcal, setDailyKcal] = useState(DEFAULTS.dailyKcal);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeWeightLossProtein({
        weightKg: weightKg === "" ? NaN : Number(weightKg),
        heightCm: heightCm === "" ? NaN : Number(heightCm),
        sex,
        activity,
        meals: meals === "" ? NaN : Number(meals),
        dailyKcal: dailyKcal === "" ? null : Number(dailyKcal),
      }),
    [weightKg, heightCm, sex, activity, meals, dailyKcal],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Weight-Loss Protein Calculator",
      `Weight ${num1(result.weightKg)} kg, height ${num1(result.heightCm)} cm, BMI ${num1(result.bmi)}`,
      `Reference weight: ${num1(result.referenceKg)} kg (${result.referenceLabel})`,
      `Activity: ${result.activityLabel}`,
      `Daily protein floor: ${NUM.format(result.proteinFloor)} g at ${num2(result.gPerKg)} g/kg`,
      `RDA baseline for comparison: ${NUM.format(result.rdaBaseline)} g (${num2(result.rdaMultiple)}x)`,
      `${result.meals} meals of about ${NUM.format(result.perMeal)} g`,
      `Energy from protein: ${NUM.format(result.proteinKcal)} kcal`,
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
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setSex(DEFAULTS.sex);
    setActivity(DEFAULTS.activity);
    setMeals(DEFAULTS.meals);
    setDailyKcal(DEFAULTS.dailyKcal);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Dieting nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Weight-Loss Protein Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The daily protein floor that protects lean mass while you lose fat. From BMI 30 upward it
          scales to adjusted body weight, so the target stays realistic instead of ballooning with
          scale weight.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wl-weight">
              Current weight (kg)
            </label>
            <input
              id="wl-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="300"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wl-height">
              Height (cm)
            </label>
            <input
              id="wl-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="230"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wl-sex">
              Sex (for the ideal-weight formula)
            </label>
            <select
              id="wl-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wl-meals">
              Protein meals per day
            </label>
            <input
              id="wl-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MEALS}
              max={MAX_MEALS}
              step="1"
              value={meals}
              onChange={(event) => setMeals(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wl-activity">
              Activity and training
            </label>
            <select
              id="wl-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label} · {level.gPerKg} g/kg
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wl-kcal">
              Daily calorie target while dieting (optional)
            </label>
            <input
              id="wl-kcal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="800"
              max="5000"
              step="50"
              placeholder="e.g. 1800"
              value={dailyKcal}
              onChange={(event) => setDailyKcal(event.target.value)}
            />
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily protein floor
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : grams(result.proteinFloor)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your floor."
                : `${num2(result.gPerKg)} g/kg of ${num1(result.referenceKg)} kg ${result.referenceLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy weight-loss protein result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["BMI", hasError ? DASH : num1(result.bmi)],
            [
              "Ideal body weight (Devine)",
              hasError ? DASH : `${num1(result.ibwKg)} kg`,
            ],
            [
              "Adjusted body weight",
              hasError
                ? DASH
                : `${num1(result.adjustedKg)} kg${result.usesAdjustedWeight ? " (used)" : " (not used)"}`,
            ],
            [
              `RDA baseline (${num1(PROTEIN_RDA_G_PER_KG)} g/kg actual weight)`,
              hasError ? DASH : grams(result.rdaBaseline),
            ],
            [
              "Above the RDA by",
              hasError ? DASH : `${grams(result.aboveRda)} (${num2(result.rdaMultiple)}× the RDA)`,
            ],
            [
              "Protein per meal",
              hasError
                ? DASH
                : `${grams(result.perMeal)} across ${NUM.format(result.meals)} meals`,
            ],
            [
              "Per-meal MPS threshold",
              hasError
                ? DASH
                : result.meetsPerMealMps
                  ? `Cleared (${NUM.format(PER_MEAL_MPS_G)} g)`
                  : `Below ${NUM.format(PER_MEAL_MPS_G)} g`,
            ],
            ["Energy from protein", hasError ? DASH : `${NUM.format(result.proteinKcal)} kcal`],
            [
              "Share of calorie target",
              hasError || result.proteinPctOfIntake === null
                ? DASH
                : `${num1(result.proteinPctOfIntake)}% (AMDR ${AMDR_MIN_PCT}–${AMDR_MAX_PCT}%)`,
            ],
            [
              "Calories left for carbs and fat",
              hasError || result.remainingKcal === null
                ? DASH
                : `${NUM.format(result.remainingKcal)} kcal`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.activityNote}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-4 grid gap-2">
          {result.notes.map((note) => (
            <p
              key={note}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and intended for healthy adults. Higher protein intakes are not suitable
        for everyone — people with chronic kidney disease, liver disease or on certain medications
        need individual limits. Talk to a doctor or registered dietitian before starting a
        weight-loss diet, especially if you take medication for diabetes or blood pressure.
      </p>
    </main>
  );
}
