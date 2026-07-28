"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import { ACTIVITY_LEVELS, TRAINING_LEVELS, computeMuscleGainPlan } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);
const two = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);

const DEFAULTS = {
  sex: "male",
  age: "25",
  height: "178",
  weight: "75",
  activity: "moderate",
  gainPercent: "0.75",
  protein: "1.8",
  fat: "0.9",
  goal: "5",
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
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [gainPercent, setGainPercent] = useState(DEFAULTS.gainPercent);
  const [protein, setProtein] = useState(DEFAULTS.protein);
  const [fat, setFat] = useState(DEFAULTS.fat);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeMuscleGainPlan({
        sex,
        age: toNumber(age),
        heightCm: toNumber(height),
        weightKg: toNumber(weight),
        activity,
        monthlyGainPercent: toNumber(gainPercent),
        proteinPerKg: toNumber(protein),
        fatPerKg: toNumber(fat),
        goalGainKg: toNumber(goal),
      }),
    [sex, age, height, weight, activity, gainPercent, protein, fat, goal],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Muscle Gain Calorie Calculator",
      `Maintenance: ${zero(result.maintenance)} kcal/day (BMR ${zero(result.bmr)} x ${two(result.activityFactorUsed)})`,
      `Target intake: ${zero(result.targetCalories)} kcal/day`,
      `Daily surplus: ${zero(result.dailySurplus)} kcal (${one(result.surplusPercent)}% of maintenance)`,
      `Target gain: ${two(result.weeklyGainKg)} kg a week, ${two(result.monthlyGainKg)} kg a month`,
      `Protein ${zero(result.proteinG)} g · Fat ${zero(result.fatG)} g · Carbs ${zero(result.carbG)} g`,
      `Time to gain ${two(result.goalGainKg)} kg: ${one(result.weeksToGoal)} weeks`,
      ...result.notes.map((note) => `- ${note}`),
    ].join("\n");
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
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setHeight(DEFAULTS.height);
    setWeight(DEFAULTS.weight);
    setActivity(DEFAULTS.activity);
    setGainPercent(DEFAULTS.gainPercent);
    setProtein(DEFAULTS.protein);
    setFat(DEFAULTS.fat);
    setGoal(DEFAULTS.goal);
    setCopied(false);
  };

  const rows = [
    ["Resting metabolic rate (Mifflin-St Jeor)", ok ? `${zero(result.bmr)} kcal` : DASH],
    [
      "Maintenance calories",
      ok ? `${zero(result.maintenance)} kcal (x${two(result.activityFactorUsed)})` : DASH,
    ],
    [
      "Daily surplus",
      ok ? `${zero(result.dailySurplus)} kcal · ${one(result.surplusPercent)}% of maintenance` : DASH,
    ],
    ["Target weekly gain", ok ? `${two(result.weeklyGainKg)} kg` : DASH],
    ["Target monthly gain", ok ? `${two(result.monthlyGainKg)} kg` : DASH],
    [
      "Time to reach the goal",
      ok ? `${one(result.weeksToGoal)} weeks · ${one(result.monthsToGoal)} months` : DASH,
    ],
  ];

  const macros = [
    ["Protein", ok ? result.proteinG : NaN, ok ? result.proteinKcal : NaN, ok ? result.proteinPercent : NaN],
    ["Fat", ok ? result.fatG : NaN, ok ? result.fatKcal : NaN, ok ? result.fatPercent : NaN],
    ["Carbohydrate", ok ? result.carbG : NaN, ok ? result.carbKcal : NaN, ok ? result.carbPercent : NaN],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Men&apos;s health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Muscle Gain Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work the surplus backwards from the rate of gain you actually want, rather than picking a
          round number: maintenance from Mifflin-St Jeor, then calories and macros to hit it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-sex">
              Sex
            </label>
            <select
              id="mg-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-age">
              Age (years)
            </label>
            <input
              id="mg-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="14"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-height">
              Height (cm)
            </label>
            <input
              id="mg-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="250"
              step="0.5"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-weight">
              Weight (kg)
            </label>
            <input
              id="mg-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="300"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mg-activity">
              Activity level
            </label>
            <select
              id="mg-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {ACTIVITY_LEVELS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label} (x{entry.factor})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-rate">
              Target gain (% of body weight per month)
            </label>
            <input
              id="mg-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.05"
              max="5"
              step="0.05"
              value={gainPercent}
              onChange={(event) => setGainPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-goal">
              Total weight to gain (kg)
            </label>
            <input
              id="mg-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-protein">
              Protein (g per kg per day)
            </label>
            <input
              id="mg-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={protein}
              onChange={(event) => setProtein(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-fat">
              Fat (g per kg per day)
            </label>
            <input
              id="mg-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={fat}
              onChange={(event) => setFat(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TRAINING_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setGainPercent(String(level.target))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {level.label} · {level.low}–{level.high}%
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
              Daily calorie target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${zero(result.targetCalories)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${zero(result.dailySurplus)} kcal above maintenance for ${two(result.weeklyGainKg)} kg a week`
                : "Fix the inputs above to see a plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy muscle gain plan"
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
        <h2 className="text-base font-semibold">Daily macronutrient targets</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Macro
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Grams
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Calories
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {macros.map(([label, grams, kcal, percent]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{label}</td>
                  <td className="py-2 pr-3 text-right">{zero(grams)} g</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {zero(kcal)} kcal
                  </td>
                  <td className="py-2 text-right">{zero(percent)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {ok && result.notes.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not dietary advice. Predictive equations carry roughly 10% error for
        an individual, and the 7,700 kcal per kilogram conversion is an approximation that drifts
        over long periods — use two to three weeks of weigh-ins to calibrate, and speak to a
        registered dietitian if you have a medical condition.
      </p>
    </main>
  );
}
