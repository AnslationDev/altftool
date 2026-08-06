"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  LEUCINE_FRACTION,
  LEUCINE_TRIGGER_G,
  MAX_MEALS,
  MIN_MEALS,
  PER_MEAL_MIN_G_PER_KG,
  PHASES,
  computeBodybuilderProtein,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const grams = (v) => (Number.isFinite(v) ? `${NUM.format(v)} g` : DASH);
const grams1 = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} g` : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  weightKg: "85",
  bodyFatPct: "",
  phase: "bulk",
  meals: "4",
  proteinSource: "mixed",
};

const SOURCE_LABELS = {
  mixed: "Mixed animal protein (meat, eggs, dairy)",
  whey: "Whey protein",
  plant: "Plant protein (soy / pea blend)",
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
  const [bodyFatPct, setBodyFatPct] = useState(DEFAULTS.bodyFatPct);
  const [phase, setPhase] = useState(DEFAULTS.phase);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [proteinSource, setProteinSource] = useState(DEFAULTS.proteinSource);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () =>
      computeBodybuilderProtein({
        weightKg: weightKg === "" ? NaN : Number(weightKg),
        bodyFatPct: bodyFatPct === "" ? null : Number(bodyFatPct),
        phase,
        meals: meals === "" ? NaN : Number(meals),
        proteinSource,
      }),
    [weightKg, bodyFatPct, phase, meals, proteinSource],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Bodybuilder Protein Calculator",
      `Phase: ${result.phaseLabel}`,
      `Bodyweight: ${NUM1.format(result.weightKg)} kg`,
      result.ffmKg ? `Fat-free mass: ${NUM1.format(result.ffmKg)} kg` : null,
      `Daily protein target: ${NUM.format(result.dailyTarget)} g (${NUM.format(result.dailyMin)}-${NUM.format(result.dailyMax)} g range)`,
      `That is ${num2(result.gPerKgBodyweight)} g per kg bodyweight, ${NUM.format(result.proteinKcal)} kcal from protein`,
      `${result.meals} meals of ${NUM1.format(result.perMeal)} g (${num2(result.perMealGPerKg)} g/kg per meal)`,
      `Estimated leucine per meal: ${num2(result.leucinePerMeal)} g`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "protein target result" });
  };

  const reset = () => {
    setWeightKg(DEFAULTS.weightKg);
    setBodyFatPct(DEFAULTS.bodyFatPct);
    setPhase(DEFAULTS.phase);
    setMeals(DEFAULTS.meals);
    setProteinSource(DEFAULTS.proteinSource);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Hypertrophy nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bodybuilder Protein Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Daily protein for a bulk, cut or maintenance block using bodyweight- and fat-free-mass-based
          g/kg ranges, then split into per-meal doses that each clear the 0.4 g/kg muscle protein
          synthesis threshold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-weight">
              Bodyweight (kg)
            </label>
            <input
              id="bb-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="250"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-bodyfat">
              Body fat % (optional)
            </label>
            <input
              id="bb-bodyfat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="60"
              step="0.5"
              placeholder="e.g. 14"
              value={bodyFatPct}
              onChange={(event) => setBodyFatPct(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Needed to base a cutting target on fat-free mass.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-phase">
              Training phase
            </label>
            <select
              id="bb-phase"
              className={`mt-2 ${INPUT_CLASS}`}
              value={phase}
              onChange={(event) => setPhase(event.target.value)}
            >
              {Object.values(PHASES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-meals">
              Protein meals per day
            </label>
            <input
              id="bb-meals"
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
            <label className={LABEL_CLASS} htmlFor="bb-source">
              Main protein source (for the leucine estimate)
            </label>
            <select
              id="bb-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={proteinSource}
              onChange={(event) => setProteinSource(event.target.value)}
            >
              {Object.keys(LEUCINE_FRACTION).map((key) => (
                <option key={key} value={key}>
                  {SOURCE_LABELS[key]}
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily protein target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : grams(result.dailyTarget)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your target."
                : `Working range ${NUM.format(result.dailyMin)}–${NUM.format(result.dailyMax)} g per day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={isCopied("result") ? "Copied protein target result to clipboard" : "Copy protein target result"}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
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
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            [
              "Basis for the g/kg figure",
              hasError
                ? DASH
                : result.basis === "ffm"
                  ? `${NUM1.format(result.referenceKg)} kg fat-free mass`
                  : `${NUM1.format(result.referenceKg)} kg bodyweight`,
            ],
            [
              "Target rate",
              hasError
                ? DASH
                : `${num2(result.gPerKg)} g/kg (band ${num2(result.bandLow)}–${num2(result.bandHigh)})`,
            ],
            [
              "Equivalent per kg bodyweight",
              hasError ? DASH : `${num2(result.gPerKgBodyweight)} g/kg`,
            ],
            [
              "Fat-free mass",
              hasError || result.ffmKg === null
                ? DASH
                : `${NUM1.format(result.ffmKg)} kg (fat mass ${NUM1.format(result.fatMassKg)} kg)`,
            ],
            ["Protein per meal", hasError ? DASH : grams1(result.perMeal)],
            [
              "Per-meal dose",
              hasError
                ? DASH
                : `${num2(result.perMealGPerKg)} g/kg (threshold ${num2(PER_MEAL_MIN_G_PER_KG)} g/kg = ${NUM1.format(result.perMealDoseG)} g)`,
            ],
            [
              "Estimated leucine per meal",
              hasError
                ? DASH
                : `${num2(result.leucinePerMeal)} g (trigger dose ~${num2(LEUCINE_TRIGGER_G)} g)`,
            ],
            [
              "Energy from protein",
              hasError ? DASH : `${NUM.format(result.proteinKcal)} kcal`,
            ],
            [
              "Pre-sleep protein",
              hasError ? DASH : `${NUM.format(result.preSleepProteinG)} g slow-digesting protein`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.basisNote}</p>
        )}
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-4 grid gap-2" aria-live="polite" role="status">
          {result.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]"
            >
              {warning}
            </p>
          ))}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Meal-by-meal plan</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {result.meals > 1
              ? `Meals about ${NUM1.format(result.spacingHours)} h apart across a 14-hour eating window. Times are illustrative from a 07:00 first meal.`
              : "A single feeding — times are illustrative."}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Meal
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Approx. time
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Protein
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Leucine
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.index}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {row.clock}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{grams1(row.grams)}</td>
                    <td
                      className={`py-2 text-right ${row.leucine >= LEUCINE_TRIGGER_G ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                    >
                      {num2(row.leucine)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and built for healthy adults training with weights. Very high protein
        intakes are not appropriate for everyone — if you have kidney or liver disease, are
        pregnant, or take medication that affects protein handling, speak to a doctor or a
        registered dietitian before changing your intake.
      </p>
    </main>
  );
}
