"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";
import {
  ACTIVITY_OFFSETS,
  MAX_MEALS,
  MIN_MEALS,
  PROTEIN_BANDS,
  computeProteinPlan,
  equivalentServings,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  weight: "70",
  age: "72",
  status: "healthy",
  activity: "light",
  meals: "3",
  preSleep: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [age, setAge] = useState(DEFAULTS.age);
  const [status, setStatus] = useState(DEFAULTS.status);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [preSleep, setPreSleep] = useState(DEFAULTS.preSleep);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      computeProteinPlan({
        weightKg: toNumber(weight),
        ageYears: toNumber(age),
        status,
        activity,
        meals: toNumber(meals),
        preSleep,
      }),
    [weight, age, status, activity, meals, preSleep],
  );

  const ok = !plan.error;

  const servings = useMemo(
    () => (ok ? equivalentServings(plan.mpsDoseGrams) : []),
    [ok, plan.mpsDoseGrams],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Senior Protein Distribution Planner",
      `Body weight: ${NUM.format(plan.weightKg)} kg, age ${NUM.format(plan.ageYears)}`,
      `Situation: ${plan.statusLabel} (${plan.bandLow}-${plan.bandHigh} g/kg/day)`,
      `Activity: ${plan.activityLabel}`,
      `Daily target: ${plan.dailyGrams} g (${plan.targetPerKg} g/kg)`,
      `RDA floor (0.8 g/kg): ${plan.rdaGrams} g`,
      `Per-meal muscle-synthesis dose: ${plan.mpsDoseGrams} g`,
      "",
      ...plan.schedule.map((meal) => `${meal.name}: ${meal.grams} g`),
      "",
      plan.verdict,
    ].join("\n");
  }, [ok, plan]);

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
    setAge(DEFAULTS.age);
    setStatus(DEFAULTS.status);
    setActivity(DEFAULTS.activity);
    setMeals(DEFAULTS.meals);
    setPreSleep(DEFAULTS.preSleep);
    setCopied(false);
  };

  const mealOptions = [];
  for (let i = MIN_MEALS; i <= MAX_MEALS; i += 1) mealOptions.push(i);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Senior health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Senior Protein Distribution Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sets a daily protein target from the PROT-AGE and ESPEN g/kg bands for older adults, then
          splits it across meals and checks each one against the per-meal dose that actually
          triggers muscle protein synthesis.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="spd-weight">
              Body weight (kg)
            </label>
            <input
              id="spd-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="250"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spd-age">
              Age (years)
            </label>
            <input
              id="spd-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="45"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spd-status">
              Health situation
            </label>
            <select
              id="spd-status"
              className={`mt-2 ${INPUT_CLASS}`}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {Object.entries(PROTEIN_BANDS).map(([key, band]) => (
                <option key={key} value={key}>
                  {band.label} ({band.low}-{band.high} g/kg/day)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spd-activity">
              Activity level
            </label>
            <select
              id="spd-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {Object.entries(ACTIVITY_OFFSETS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spd-meals">
              Main meals per day
            </label>
            <select
              id="spd-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              value={meals}
              onChange={(event) => setMeals(event.target.value)}
            >
              {mealOptions.map((count) => (
                <option key={count} value={String(count)}>
                  {count} meals
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="spd-presleep"
            >
              <input
                id="spd-presleep"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={preSleep}
                onChange={(event) => setPreSleep(event.target.checked)}
              />
              Carve out a pre-sleep milk, curd or casein feeding
            </label>
          </div>
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily protein target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${plan.dailyGrams} g` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${plan.targetPerKg} g per kg of body weight, split across ${plan.occasions} eating occasions`
                : "Fix the input above to see a target"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the protein plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Band for this situation", ok ? `${plan.bandLowGrams}-${plan.bandHighGrams} g/day` : DASH],
            ["Per-meal muscle-synthesis dose", ok ? `${plan.mpsDoseGrams} g` : DASH],
            ["Plain adult RDA (0.8 g/kg)", ok ? `${plan.rdaGrams} g/day` : DASH],
            [
              "Extra over the RDA",
              ok ? `${plan.aboveRdaGrams >= 0 ? "+" : ""}${plan.aboveRdaGrams} g/day` : DASH,
            ],
            ["Meals below the dose", ok ? `${plan.mealsBelowThreshold} of ${plan.occasions}` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              plan.mealsBelowThreshold === 0
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--muted)] text-[var(--foreground)]"
            }`}
          >
            {plan.verdict}
          </p>
        ) : null}

        {ok && plan.kidneyCaution ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Protein restriction in kidney disease is prescribed and monitored by a nephrologist and
            renal dietitian. Do not change intake on the strength of this page.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Meal-by-meal split</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{plan.statusNote}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Eating occasion
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Protein
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Share
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Clears dose?
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((meal) => (
                  <tr key={meal.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{meal.name}</td>
                    <td className="py-2 pr-3 text-right">{meal.grams} g</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(meal.share)}%
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        meal.meetsThreshold ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {meal.meetsThreshold ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            What {plan.mpsDoseGrams} g of protein looks like
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Any one of these portions supplies roughly one effective per-meal dose.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {servings.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--muted-foreground)]">{item.label}</span>
                <span className="shrink-0 font-semibold">x{NUM.format(item.servings)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietetic advice. Protein needs change with kidney and
        liver function, medication and appetite - discuss any large change with a doctor or a
        registered dietitian first.
      </p>
    </main>
  );
}
