"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  AMDR_MAX_PCT,
  AMDR_MIN_PCT,
  ATHLETE_MAX_G_PER_KG,
  ATHLETE_MIN_G_PER_KG,
  MAX_MEALS,
  MAX_WEEKLY_HOURS,
  MIN_MEALS,
  PER_MEAL_MIN_G_PER_KG,
  POST_SESSION_G_PER_KG,
  VOLUME_BANDS,
  computeEnduranceProtein,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const grams = (v) => (Number.isFinite(v) ? `${NUM.format(v)} g` : DASH);
const grams1 = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} g` : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  weightKg: "68",
  weeklyHours: "12",
  sessionsPerWeek: "6",
  ageYears: "32",
  energyDeficit: false,
  meals: "4",
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
  const [weeklyHours, setWeeklyHours] = useState(DEFAULTS.weeklyHours);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(DEFAULTS.sessionsPerWeek);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [energyDeficit, setEnergyDeficit] = useState(DEFAULTS.energyDeficit);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [dailyKcal, setDailyKcal] = useState(DEFAULTS.dailyKcal);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      computeEnduranceProtein({
        weightKg: weightKg === "" ? NaN : Number(weightKg),
        weeklyHours: weeklyHours === "" ? NaN : Number(weeklyHours),
        sessionsPerWeek: sessionsPerWeek === "" ? NaN : Number(sessionsPerWeek),
        ageYears: ageYears === "" ? NaN : Number(ageYears),
        energyDeficit,
        meals: meals === "" ? NaN : Number(meals),
        dailyKcal: dailyKcal === "" ? null : Number(dailyKcal),
      }),
    [weightKg, weeklyHours, sessionsPerWeek, ageYears, energyDeficit, meals, dailyKcal],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Endurance Athlete Protein Calculator",
      `Bodyweight: ${NUM1.format(result.weightKg)} kg`,
      `Training volume: ${NUM1.format(result.weeklyHours)} h/week (${result.bandLabel})`,
      `Daily protein target: ${NUM.format(result.dailyTarget)} g at ${num2(result.gPerKg)} g/kg`,
      `Position-stand range: ${NUM.format(result.dailyMin)}-${NUM.format(result.dailyMax)} g/day`,
      `Post-session dose: ${NUM1.format(result.postSessionDose)} g (0.3 g/kg)`,
      `${result.meals} meals of about ${NUM1.format(result.perMeal)} g`,
      `Energy from protein: ${NUM.format(result.proteinKcal)} kcal`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "endurance protein result" });
  };

  const reset = () => {
    setWeightKg(DEFAULTS.weightKg);
    setWeeklyHours(DEFAULTS.weeklyHours);
    setSessionsPerWeek(DEFAULTS.sessionsPerWeek);
    setAgeYears(DEFAULTS.ageYears);
    setEnergyDeficit(DEFAULTS.energyDeficit);
    setMeals(DEFAULTS.meals);
    setDailyKcal(DEFAULTS.dailyKcal);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Endurance nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Endurance Athlete Protein Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scales the ACSM 1.2–2.0 g/kg athlete range to your weekly training hours, then gives you a
          post-session dose and a per-meal split for running, cycling, swimming or triathlon.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ea-weight">
              Bodyweight (kg)
            </label>
            <input
              id="ea-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="200"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ea-hours">
              Training hours per week
            </label>
            <input
              id="ea-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_WEEKLY_HOURS}
              step="0.5"
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ea-sessions">
              Sessions per week
            </label>
            <input
              id="ea-sessions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="21"
              step="1"
              value={sessionsPerWeek}
              onChange={(event) => setSessionsPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ea-age">
              Age (years)
            </label>
            <input
              id="ea-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="12"
              max="100"
              step="1"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ea-meals">
              Protein meals per day
            </label>
            <input
              id="ea-meals"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="ea-kcal">
              Daily calories (optional)
            </label>
            <input
              id="ea-kcal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="800"
              max="8000"
              step="50"
              placeholder="e.g. 2800"
              value={dailyKcal}
              onChange={(event) => setDailyKcal(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
              htmlFor="ea-deficit"
            >
              <input
                id="ea-deficit"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={energyDeficit}
                onChange={(event) => setEnergyDeficit(event.target.checked)}
              />
              Currently eating in a calorie deficit
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {VOLUME_BANDS.map((band) => (
            <span
              key={band.id}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                !hasError && result.bandId === band.id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {band.label} · {num2(band.gPerKg)} g/kg
            </span>
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
              Daily protein target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : grams(result.dailyTarget)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your target."
                : `${num2(result.gPerKg)} g per kg bodyweight · position-stand range ${NUM.format(result.dailyMin)}–${NUM.format(result.dailyMax)} g`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={
                isCopied("result")
                  ? "Copied the endurance protein result to clipboard"
                  : "Copy endurance protein result"
              }
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Volume band", hasError ? DASH : result.bandLabel],
            [
              "Base rate from volume",
              hasError ? DASH : `${num2(result.bandGPerKg)} g/kg`,
            ],
            [
              `Post-session dose (${num2(POST_SESSION_G_PER_KG)} g/kg)`,
              hasError ? DASH : grams1(result.postSessionDose),
            ],
            [
              "Post-session protein across the week",
              hasError
                ? DASH
                : `${NUM.format(result.weeklyPostSessionTotal)} g over ${NUM.format(result.sessionsPerWeek)} sessions`,
            ],
            ["Protein per meal", hasError ? DASH : grams1(result.perMeal)],
            [
              "Per-meal dose check",
              hasError
                ? DASH
                : `${num2(result.perMealGPerKg)} g/kg (minimum ${num2(PER_MEAL_MIN_G_PER_KG)} g/kg = ${NUM1.format(result.perMealDoseG)} g)`,
            ],
            ["Energy from protein", hasError ? DASH : `${NUM.format(result.proteinKcal)} kcal`],
            [
              "Share of stated calories",
              hasError || result.proteinPctOfIntake === null
                ? DASH
                : `${NUM1.format(result.proteinPctOfIntake)}% (AMDR ${AMDR_MIN_PCT}–${AMDR_MAX_PCT}%)`,
            ],
            ["Weekly protein total", hasError ? DASH : grams(result.weeklyTarget)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div
            className="mt-5"
            role="img"
            aria-label={`Your target of ${NUM.format(result.dailyTarget)} grams sits within the athlete range of ${NUM.format(result.dailyMin)} to ${NUM.format(result.dailyMax)} grams per day`}
          >
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.rangePositionPct}%` }}
              />
            </div>
            <p className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>{num2(ATHLETE_MIN_G_PER_KG)} g/kg</span>
              <span>{num2(ATHLETE_MAX_G_PER_KG)} g/kg</span>
            </p>
          </div>
        )}
      </section>

      {!hasError && result.notes.length > 0 && (
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
        Informational only. Protein is one part of endurance fuelling — carbohydrate intake, total
        energy availability and iron status usually matter more for performance. For a plan built
        around your own training and blood work, work with a sports dietitian.
      </p>
    </main>
  );
}
