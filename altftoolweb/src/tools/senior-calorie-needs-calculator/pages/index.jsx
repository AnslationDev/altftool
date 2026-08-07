"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  ACTIVITY_LEVELS,
  GOALS,
  MAX_AGE,
  MAX_HEIGHT_CM,
  MAX_WEIGHT_KG,
  MIN_AGE,
  MIN_HEIGHT_CM,
  MIN_WEIGHT_KG,
  computeSeniorCalories,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  sex: "female",
  age: "70",
  weight: "65",
  height: "160",
  activity: "light",
  goal: "maintain",
  illness: false,
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
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [illness, setIllness] = useState(DEFAULTS.illness);
  const {
    copy: copyToClipboard,
    isCopied,
    reset: resetCopyState,
    announcement,
  } = useCopyToClipboard();

  const result = useMemo(
    () =>
      computeSeniorCalories({
        sex,
        ageYears: age === "" ? NaN : Number(age),
        weightKg: weight === "" ? NaN : Number(weight),
        heightCm: height === "" ? NaN : Number(height),
        activityKey: activity,
        goalKey: goal,
        illnessOrRecovery: illness,
      }),
    [sex, age, weight, height, activity, goal, illness],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Senior Calorie Needs Calculator",
      `${result.sex === "male" ? "Male" : "Female"} · ${result.ageYears} years · ${DEC.format(result.weightKg)} kg · ${DEC.format(result.heightCm)} cm`,
      `Activity: ${result.activity.label} (factor ${result.activity.factor})`,
      `Goal: ${result.goal.label}`,
      "",
      `Resting energy (Mifflin-St Jeor BMR): ${INT.format(result.bmr)} kcal/day`,
      `Maintenance calories: ${INT.format(result.maintenance)} kcal/day`,
      `Daily target: ${INT.format(result.target)} kcal/day`,
      result.floorApplied
        ? `Note: the goal figure of ${INT.format(result.rawTarget)} kcal was raised to the ${INT.format(result.floor)} kcal minimum.`
        : `Expected weight change: ${DEC.format(result.weeklyChangeKg)} kg a week`,
      "",
      `Protein target: ${INT.format(result.proteinMinG)}-${INT.format(result.proteinMaxG)} g/day (${result.proteinBand.min}-${result.proteinBand.max} g per kg)`,
      `Fluid guide: about ${INT.format(result.fluidMl)} mL a day`,
      `Ageing effect: roughly ${INT.format(result.kcalPerDecade)} kcal a day less per decade at this activity level.`,
      "",
      "Informational estimate — check with a doctor or dietitian before changing intake.",
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "Calorie needs result" });
  };

  const reset = () => {
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setWeight(DEFAULTS.weight);
    setHeight(DEFAULTS.height);
    setActivity(DEFAULTS.activity);
    setGoal(DEFAULTS.goal);
    setIllness(DEFAULTS.illness);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Senior health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Senior Calorie Needs Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Energy needs fall with age because resting metabolism drops with lost muscle. This
          calculator uses the Mifflin-St Jeor equation, which carries that age effect explicitly, and
          adds the higher protein targets recommended for older adults.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="snc-sex">
              Sex
            </label>
            <select id="snc-sex" className={`mt-2 ${INPUT_CLASS}`} value={sex} onChange={(event) => setSex(event.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="snc-age">
              Age (years)
            </label>
            <input
              id="snc-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={MAX_AGE}
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="snc-weight">
              Weight (kg)
            </label>
            <input
              id="snc-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_WEIGHT_KG}
              max={MAX_WEIGHT_KG}
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="snc-height">
              Height (cm)
            </label>
            <input
              id="snc-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HEIGHT_CM}
              max={MAX_HEIGHT_CM}
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="snc-activity">
              Activity level
            </label>
            <select
              id="snc-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {ACTIVITY_LEVELS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label} ({row.factor})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="snc-goal">
              Goal
            </label>
            <select id="snc-goal" className={`mt-2 ${INPUT_CLASS}`} value={goal} onChange={(event) => setGoal(event.target.value)}>
              {GOALS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              htmlFor="snc-illness"
            >
              <input
                id="snc-illness"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={illness}
                onChange={(event) => setIllness(event.target.checked)}
              />
              Living with illness or recovering from surgery (raises the protein target)
            </label>
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
              Daily calorie target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${INT.format(result.target)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.floorApplied
                  ? `${result.goal.label} · Raised to the ${INT.format(result.floor)} kcal safety floor`
                  : `${result.goal.label} · ${result.goal.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the calorie needs result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("result") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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
            ["Resting energy (BMR)", hasError ? DASH : `${INT.format(result.bmr)} kcal/day`],
            ["Maintenance calories", hasError ? DASH : `${INT.format(result.maintenance)} kcal/day`],
            [
              "Activity factor applied",
              hasError ? DASH : `${result.activity.factor} — ${result.activity.detail}`,
            ],
            [
              "Expected weight change",
              hasError
                ? DASH
                : result.floorApplied
                  ? `Not applicable — raised to the ${INT.format(result.floor)} kcal floor`
                  : result.weeklyChangeKg === 0
                    ? "Stable"
                    : `${DEC.format(result.weeklyChangeKg)} kg a week`,
            ],
            [
              "Protein target",
              hasError
                ? DASH
                : `${INT.format(result.proteinMinG)}–${INT.format(result.proteinMaxG)} g/day (${result.proteinBand.min}–${result.proteinBand.max} g per kg)`,
            ],
            [
              "Protein as calories",
              hasError ? DASH : `${INT.format(result.proteinKcalMin)}–${INT.format(result.proteinKcalMax)} kcal of the daily total`,
            ],
            ["Fluid guide", hasError ? DASH : `about ${INT.format(result.fluidMl)} mL a day`],
            [
              "Effect of ageing at this activity level",
              hasError ? DASH : `about ${INT.format(result.kcalPerDecade)} kcal/day less per decade`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.floorApplied && (
          <p
            role="status"
            className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            The chosen deficit would have given {INT.format(result.rawTarget)} kcal a day, below the{" "}
            {INT.format(result.floor)} kcal floor used here. Very low intakes make it hard to get
            enough protein, calcium, B12 and vitamin D, and should only be followed under
            supervision, so the target has been raised.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Activity factors used</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Level</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Factor</th>
                  <th scope="col" className="py-2 font-semibold">Looks like</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_LEVELS.map((row) => (
                  <tr
                    key={row.key}
                    className={`border-b border-[var(--border)] last:border-0 ${row.key === activity ? "text-[var(--primary)] font-semibold" : ""}`}
                  >
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{row.factor}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not dietary or medical advice. Prediction equations carry an error of
        roughly 10% for any one person, and needs change with illness, medication, kidney or liver
        disease and mobility. Unintentional weight loss in later life should always be reviewed by a
        doctor, and anyone with kidney disease needs a protein target set by their clinician.
      </p>
    </main>
  );
}
