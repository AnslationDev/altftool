"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  ACTIVITY_LEVELS,
  CUISINES,
  CURRENCIES,
  DAYS_MAX,
  DAYS_MIN,
  DIET_PATTERNS,
  FAT_PERCENT_MAX,
  FAT_PERCENT_MIN,
  GOALS,
  MAJOR_ALLERGENS,
  MEALS_PER_DAY_MAX,
  MEALS_PER_DAY_MIN,
  PROTEIN_PRESETS,
  SEXES,
  buildMealPlanPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "female",
  weightKg: "62",
  heightCm: "163",
  age: "31",
  activity: "moderate",
  goal: "maintain",
  proteinPreset: "active",
  fatPercent: "30",
  people: "2",
  mealsPerDay: "3",
  days: "7",
  totalBudget: "3500",
  currency: "INR",
  cuisine: "North Indian",
  diet: "Vegetarian with eggs",
  dislikesRaw: "Bitter gourd, Raw onion",
  equipmentRaw: "Pressure cooker, Non-stick pan, Oven",
  maxCookMinutes: "40",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [allergens, setAllergens] = useState(["Peanuts"]);
  const [includeLeftovers, setIncludeLeftovers] = useState(true);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  // Rounds an integer-only field to match the whole number the calculation
  // actually uses, so the visible input never disagrees with the generated
  // prompt (e.g. typing "2.5" people would otherwise still show "2.5" while
  // the prompt silently used 3).
  const roundFieldOnBlur = (key) => () =>
    setForm((prev) => {
      const num = Number(prev[key]);
      if (!Number.isFinite(num)) return prev;
      const rounded = String(Math.round(num));
      return rounded === prev[key] ? prev : { ...prev, [key]: rounded };
    });

  const toggleAllergen = (name) =>
    setAllergens((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));

  const result = useMemo(
    () => buildMealPlanPrompt({ ...form, allergens, includeLeftovers }),
    [form, allergens, includeLeftovers],
  );
  const hasError = Boolean(result.error);

  const money = useMemo(() => {
    const entry = result.currency || CURRENCIES[0];
    return new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.key,
      maximumFractionDigits: 2,
    });
  }, [result.currency]);

  const copyPrompt = () => {
    if (hasError) return;
    copy("prompt", result.prompt, { label: "meal plan prompt" });
  };

  const reset = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset all fields to the defaults? This clears everything you've entered.")) {
      return;
    }
    setForm(DEFAULTS);
    setAllergens(["Peanuts"]);
    setIncludeLeftovers(true);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Meal planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Meal Plan Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out an estimated daily energy and macro target with the Mifflin-St Jeor equation, turn
          a weekly budget into a per-serving figure, and fold cuisine, diet pattern and allergen
          exclusions into one prompt.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About the person eating</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-sex">
              Sex used by the equation
            </label>
            <select id="mp-sex" className={`mt-2 ${INPUT_CLASS}`} value={form.sex} onChange={set("sex")}>
              {SEXES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>Mifflin-St Jeor uses a different constant for each.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-age">
              Age (years)
            </label>
            <input
              id="mp-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="100"
              step="1"
              value={form.age}
              onChange={set("age")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-weight">
              Weight (kg)
            </label>
            <input
              id="mp-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="300"
              step="0.5"
              value={form.weightKg}
              onChange={set("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-height">
              Height (cm)
            </label>
            <input
              id="mp-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              step="1"
              value={form.heightCm}
              onChange={set("heightCm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-activity">
              Activity level
            </label>
            <select
              id="mp-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={set("activity")}
            >
              {ACTIVITY_LEVELS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-goal">
              Goal
            </label>
            <select id="mp-goal" className={`mt-2 ${INPUT_CLASS}`} value={form.goal} onChange={set("goal")}>
              {GOALS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-protein">
              Protein target
            </label>
            <select
              id="mp-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.proteinPreset}
              onChange={set("proteinPreset")}
            >
              {PROTEIN_PRESETS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-fat">
              Fat as % of calories
            </label>
            <input
              id="mp-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={FAT_PERCENT_MIN}
              max={FAT_PERCENT_MAX}
              step="1"
              value={form.fatPercent}
              onChange={set("fatPercent")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The plan</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-people">
              People eating
            </label>
            <input
              id="mp-people"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={form.people}
              onChange={set("people")}
              onBlur={roundFieldOnBlur("people")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-meals">
              Meals a day
            </label>
            <input
              id="mp-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MEALS_PER_DAY_MIN}
              max={MEALS_PER_DAY_MAX}
              step="1"
              value={form.mealsPerDay}
              onChange={set("mealsPerDay")}
              onBlur={roundFieldOnBlur("mealsPerDay")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-days">
              Days to plan
            </label>
            <input
              id="mp-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={DAYS_MIN}
              max={DAYS_MAX}
              step="1"
              value={form.days}
              onChange={set("days")}
              onBlur={roundFieldOnBlur("days")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-cook">
              Max hands-on minutes per meal
            </label>
            <input
              id="mp-cook"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="240"
              step="5"
              value={form.maxCookMinutes}
              onChange={set("maxCookMinutes")}
              onBlur={roundFieldOnBlur("maxCookMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-currency">
              Currency
            </label>
            <select
              id="mp-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.currency}
              onChange={set("currency")}
            >
              {CURRENCIES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-budget">
              Total food budget for the plan
            </label>
            <input
              id="mp-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.totalBudget}
              onChange={set("totalBudget")}
            />
            <p className={HINT_CLASS}>Leave at 0 if you do not want a budget constraint.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-diet">
              Eating pattern
            </label>
            <select id="mp-diet" className={`mt-2 ${INPUT_CLASS}`} value={form.diet} onChange={set("diet")}>
              {DIET_PATTERNS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-cuisine">
              Cuisine
            </label>
            <select
              id="mp-cuisine"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.cuisine}
              onChange={set("cuisine")}
            >
              {CUISINES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <fieldset>
              <legend className={LABEL_CLASS}>Allergens to exclude absolutely</legend>
              <p className={HINT_CLASS}>The nine major allergens the US FDA requires to be labelled.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {MAJOR_ALLERGENS.map((name) => {
                  const active = allergens.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleAllergen(name)}
                      className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        active
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-dislikes">
              Will not eat (comma or line separated)
            </label>
            <textarea
              id="mp-dislikes"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.dislikesRaw}
              onChange={set("dislikesRaw")}
              aria-describedby={!hasError && result.dislikesTruncated ? "mp-dislikes-truncated" : undefined}
            />
            {!hasError && result.dislikesTruncated ? (
              <p id="mp-dislikes-truncated" role="alert" className="mt-1 text-xs font-medium text-[var(--danger-text)]">
                Only the first 25 items are used in the prompt — {result.dislikesTotal - 25} more{" "}
                {result.dislikesTotal - 25 === 1 ? "item was" : "items were"} dropped.
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-equipment">
              Kitchen equipment
            </label>
            <textarea
              id="mp-equipment"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.equipmentRaw}
              onChange={set("equipmentRaw")}
              aria-describedby={!hasError && result.equipmentTruncated ? "mp-equipment-truncated" : undefined}
            />
            {!hasError && result.equipmentTruncated ? (
              <p id="mp-equipment-truncated" role="alert" className="mt-1 text-xs font-medium text-[var(--danger-text)]">
                Only the first 25 items are used in the prompt — {result.equipmentTotal - 25} more{" "}
                {result.equipmentTotal - 25 === 1 ? "item was" : "items were"} dropped.
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="mp-leftovers">
              <input
                id="mp-leftovers"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                checked={includeLeftovers}
                onChange={(event) => setIncludeLeftovers(event.target.checked)}
              />
              Reuse ingredients across the week and plan deliberate leftovers
            </label>
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
              Daily energy target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.targets.calories)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `Maintenance is about ${NUM.format(result.targets.maintenance)} kcal. ${result.targets.goalNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated meal plan prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("prompt") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("prompt") ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span aria-live="polite" role="status" className="sr-only">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Resting metabolic rate (Mifflin-St Jeor)",
              hasError ? DASH : `${NUM.format(result.targets.rmr)} kcal`,
            ],
            ["Activity multiplier", hasError ? DASH : `× ${result.targets.activityFactor}`],
            [
              "Protein",
              hasError
                ? DASH
                : `${NUM.format(result.targets.proteinG)} g (${NUM.format(result.targets.proteinKcal)} kcal)`,
            ],
            [
              "Fat",
              hasError ? DASH : `${NUM.format(result.targets.fatG)} g (${NUM.format(result.targets.fatKcal)} kcal)`,
            ],
            [
              "Carbohydrate",
              hasError ? DASH : `${NUM.format(result.targets.carbsG)} g (${NUM.format(result.targets.carbKcal)} kcal)`,
            ],
            ["Servings in the plan", hasError ? DASH : NUM.format(result.budget.servings)],
            [
              "Budget per serving",
              hasError || result.budget.unbudgeted ? DASH : money.format(result.budget.perServing),
            ],
            [
              "Budget per person per day",
              hasError || result.budget.unbudgeted ? DASH : money.format(result.budget.perPersonPerDay),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.targets.belowFloor ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          This target falls below {NUM.format(result.targets.floor)} kcal a day. Eating at that level
          without supervision is not a good idea — speak to a doctor or a registered dietitian before
          using this plan.
        </p>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Rough split per meal</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Meal</th>
                  <th scope="col" className="py-2 text-right font-semibold">Energy</th>
                </tr>
              </thead>
              <tbody>
                {result.mealSplit.map((entry) => (
                  <tr key={entry.meal} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">Meal {entry.meal}</td>
                    <td className="py-2 text-right">{NUM.format(entry.calories)} kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-5 text-[var(--foreground)]">
            {result.prompt}
          </pre>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not medical or dietetic advice. Mifflin-St Jeor is a population
        estimate — individual energy needs vary by 10-20% either side of it, and it does not account
        for pregnancy, breastfeeding, thyroid or metabolic conditions, eating disorders, or growth in
        under-18s. Speak to a doctor or a registered dietitian before making a significant change,
        and never rely on an AI-generated plan to keep a food allergy safe: read every label.
        Everything here runs in your browser and nothing is stored.
      </p>
    </main>
  );
}
