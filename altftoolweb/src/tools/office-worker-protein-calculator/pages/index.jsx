"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import { GOALS, officeProteinPlan } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const g0 = (value) => `${NUM0.format(value)} g`;
const g1 = (value) => `${NUM1.format(value)} g`;
const pct = (fraction) => `${NUM1.format(fraction * 100)}%`;

const DASH = "—";

const DEFAULTS = {
  sex: "male",
  age: "32",
  weightKg: "78",
  heightCm: "178",
  deskHours: "8",
  steps: "6000",
  sessionsPerWeek: "3",
  sessionMinutes: "45",
  goal: "maintain",
  mealsPerDay: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const NOTE_CLASS =
  "mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [deskHours, setDeskHours] = useState(DEFAULTS.deskHours);
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(DEFAULTS.sessionsPerWeek);
  const [sessionMinutes, setSessionMinutes] = useState(DEFAULTS.sessionMinutes);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [mealsPerDay, setMealsPerDay] = useState(DEFAULTS.mealsPerDay);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      officeProteinPlan({
        sex,
        age: toNumber(age),
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        deskHours: toNumber(deskHours),
        steps: toNumber(steps),
        sessionsPerWeek: toNumber(sessionsPerWeek),
        sessionMinutes: toNumber(sessionMinutes),
        goal,
        mealsPerDay: toNumber(mealsPerDay),
      }),
    [
      sex,
      age,
      weightKg,
      heightCm,
      deskHours,
      steps,
      sessionsPerWeek,
      sessionMinutes,
      goal,
      mealsPerDay,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Office Worker Protein Calculator",
      `Recommended: ${g0(result.recommendedGrams)} of protein a day`,
      `Range: ${g0(result.minGrams)} to ${g0(result.maxGrams)} (${result.minPerKg}-${result.maxPerKg} g/kg)`,
      `Per meal across ${result.mealsPerDay}: ${g0(result.perMealGrams)}`,
      `Adult RDA for comparison: ${g0(result.rdaGrams)} (0.8 g/kg)`,
      `Estimated daily energy: ${NUM0.format(result.calories)} kcal`,
      `Protein as a share of energy: ${pct(result.proteinShareOfEnergy)}`,
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
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setDeskHours(DEFAULTS.deskHours);
    setSteps(DEFAULTS.steps);
    setSessionsPerWeek(DEFAULTS.sessionsPerWeek);
    setSessionMinutes(DEFAULTS.sessionMinutes);
    setGoal(DEFAULTS.goal);
    setMealsPerDay(DEFAULTS.mealsPerDay);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Daily range", DASH],
        ["Protein per kg", DASH],
        ["Per meal", DASH],
        ["Useful minimum per meal", DASH],
        ["Adult RDA (0.8 g/kg) for comparison", DASH],
        ["Extra above the RDA", DASH],
        ["Estimated daily energy", DASH],
        ["…from resting metabolism and daily movement", DASH],
        ["…from training sessions", DASH],
        ["Step band used", DASH],
        ["Protein as a share of energy", DASH],
      ]
    : [
        ["Daily range", `${g0(result.minGrams)} to ${g0(result.maxGrams)}`],
        ["Protein per kg", `${result.minPerKg} to ${result.maxPerKg} g/kg`],
        ["Per meal", `${g0(result.perMealGrams)} across ${result.mealsPerDay}`],
        [
          "Useful minimum per meal",
          `${g1(result.perMealMinimumGrams)} · ${result.perMealPerKg} g/kg`,
        ],
        ["Adult RDA (0.8 g/kg) for comparison", g1(result.rdaGrams)],
        [
          "Extra above the RDA",
          `${g0(result.extraOverRdaGrams)} · ${NUM1.format(result.multipleOfRda)}x the RDA`,
        ],
        ["Estimated daily energy", `${NUM0.format(result.calories)} kcal`],
        [
          "…from resting metabolism and daily movement",
          `${NUM0.format(result.baseTdee)} kcal`,
        ],
        [
          "…from training sessions",
          `${NUM0.format(result.trainingKcalPerDay)} kcal a day · ${NUM0.format(result.perSessionKcal)} kcal per session`,
        ],
        ["Step band used", `${result.stepBandLabel} · factor ${result.activityFactor}`],
        ["Protein as a share of energy", pct(result.proteinShareOfEnergy)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Desk lifestyle
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Office Worker Protein Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A protein target built for low-movement days, split across your meals — with your step
          count setting the activity factor and gym sessions costed separately so training is never
          scored as sedentary.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="ow-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-age">
              Age (years)
            </label>
            <input
              id="ow-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="80"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-weight">
              Weight (kg)
            </label>
            <input
              id="ow-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="35"
              max="250"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-height">
              Height (cm)
            </label>
            <input
              id="ow-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="130"
              max="230"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your working day</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-desk">
              Hours seated at work
            </label>
            <input
              id="ow-desk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="16"
              step="0.5"
              value={deskHours}
              onChange={(event) => setDeskHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-steps">
              Average daily steps
            </label>
            <input
              id="ow-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="40000"
              step="500"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-sessions">
              Resistance sessions a week
            </label>
            <input
              id="ow-sessions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="14"
              step="1"
              value={sessionsPerWeek}
              onChange={(event) => setSessionsPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-minutes">
              Minutes per session
            </label>
            <input
              id="ow-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="180"
              step="5"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-goal">
              Goal
            </label>
            <select
              id="ow-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {Object.entries(GOALS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ow-meals">
              Meals with protein a day
            </label>
            <input
              id="ow-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="6"
              step="1"
              value={mealsPerDay}
              onChange={(event) => setMealsPerDay(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Protein a day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : g0(result.recommendedGrams)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your target."
                : `${g0(result.minGrams)} to ${g0(result.maxGrams)} · about ${g0(result.perMealGrams)} at each of ${result.mealsPerDay} meals`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy office worker protein target"
              className={GHOST_BTN}
              disabled={hasError}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <p className={NOTE_CLASS}>{result.goalNote}</p>
            {result.perMealBelowMinimum && (
              <p className={NOTE_CLASS}>
                Each meal carries {g0(result.perMealGrams)}, below the{" "}
                {g1(result.perMealMinimumGrams)} that reliably triggers the muscle-building
                response at {result.perMealPerKg} g/kg. Concentrating the same total into fewer,
                larger protein meals usually works better.
              </p>
            )}
            {result.buildingWithoutTraining && (
              <p className={NOTE_CLASS}>
                You have chosen to build muscle but logged no resistance sessions. Protein is the
                raw material; the training is the signal. Without it, extra grams mostly become
                extra calories.
              </p>
            )}
            {!result.meetsWhoStrength && (
              <p className={NOTE_CLASS}>
                The WHO 2020 guidelines ask adults for muscle-strengthening activity on at least{" "}
                {result.whoStrengthDays} days a week, plus {result.whoModerateMinutes.min}-
                {result.whoModerateMinutes.max} minutes of moderate aerobic activity. You are
                currently below the strength part.
              </p>
            )}
            {result.aboveAmdr && (
              <p className={NOTE_CLASS}>
                Protein here is {pct(result.proteinShareOfEnergy)} of estimated energy, above the 35%
                ceiling of the acceptable range for adults. That usually means the calorie estimate
                is low rather than the protein being wrong.
              </p>
            )}
            {result.deskHours >= 8 && (
              <p className={NOTE_CLASS}>
                {NUM1.format(result.deskHours)} hours of sitting a day blunts the muscle-building
                signal independently of what you eat, which is why the protein floor and the
                strength sessions matter more on a desk schedule, not less.
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates using the Mifflin-St Jeor equation, the Tudor-Locke step bands and
        the ACSM metabolic equation. Prediction equations carry roughly 10% error either way. This
        is not medical or dietetic advice — check with a doctor before large changes in protein
        intake, particularly with kidney or liver disease.
      </p>
    </main>
  );
}
