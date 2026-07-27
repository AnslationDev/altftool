"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import {
  ACTIVITY_FACTORS,
  ALLOWED_FOODS,
  EXCLUDED_FOODS,
  FAT_PORTIONS_PER_MEAL,
  GOALS,
  LIMITS,
  MEALS_PER_DAY,
  PROGRAM_DAYS,
  whole30Plan,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const g0 = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} g` : DASH);
const kcal = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kcal` : DASH);
const one = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM0.format(v * 100)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "male",
  age: "35",
  weightKg: "90",
  heightCm: "178",
  activity: "moderate",
  goal: "lose",
  proteinPerKg: "1.6",
  fruitServings: "2",
  starchyVegCups: "2",
  vegCups: "6",
  day: "1",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const plan = useMemo(
    () =>
      whole30Plan({
        sex: form.sex,
        age: toNumber(form.age),
        weightKg: toNumber(form.weightKg),
        heightCm: toNumber(form.heightCm),
        activity: form.activity,
        goal: form.goal,
        proteinPerKg: toNumber(form.proteinPerKg),
        fruitServings: toNumber(form.fruitServings),
        starchyVegCups: toNumber(form.starchyVegCups),
        vegCups: toNumber(form.vegCups),
        day: toNumber(form.day),
      }),
    [form],
  );

  const ok = !plan.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Whole30 Macro Planner",
      `Day ${plan.progress.day} of ${PROGRAM_DAYS} (${plan.progress.daysRemaining} left)`,
      `Daily calories: ${NUM0.format(plan.calories)} kcal`,
      `Protein: ${NUM0.format(plan.proteinGrams)} g (${NUM1.format(plan.palmsPerMeal)} palms per meal)`,
      `Carbs: ${NUM0.format(plan.carbGrams)} g from vegetables and fruit`,
      `Fat: ${NUM0.format(plan.fatGrams)} g total, of which ${NUM0.format(plan.addedFatGrams)} g added`,
      `Added fat portions: ${NUM1.format(plan.fatPortionsPerMeal)} per meal`,
      `Vegetables: ${NUM1.format(plan.vegCupsPerMeal)} cups per meal`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const macroRows = [
    ["Protein", ok ? g0(plan.proteinGrams) : DASH],
    ["Carbohydrate (vegetables + fruit)", ok ? g0(plan.carbGrams) : DASH],
    ["Fat, total", ok ? g0(plan.fatGrams) : DASH],
    ["…already in the protein foods", ok ? g0(plan.inherentFatGrams) : DASH],
    ["…added at meals (oil, ghee, avocado, nuts)", ok ? g0(plan.addedFatGrams) : DASH],
    ["Daily calories", ok ? kcal(plan.calories) : DASH],
    ["Maintenance calories (TDEE)", ok ? kcal(plan.tdee) : DASH],
    [
      "Energy split (protein / carb / fat)",
      ok ? `${pct(plan.proteinShare)} / ${pct(plan.carbShare)} / ${pct(plan.fatShare)}` : DASH,
    ],
  ];

  const templateRows = [
    ["Palms of protein per meal", ok ? one(plan.palmsPerMeal) : DASH],
    ["Cups of vegetables per meal", ok ? one(plan.vegCupsPerMeal) : DASH],
    ["Added-fat portions per meal", ok ? one(plan.fatPortionsPerMeal) : DASH],
    ["Fruit servings per day", ok ? one(plan.fruitServings) : DASH],
    ["Starchy vegetable cups per day", ok ? one(plan.starchyVegCups) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          30-day reset
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Whole30 Macro Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Whole30 asks you not to count calories, so this planner works the way the programme does:
          you choose the plants, protein is set per kilogram, and fat closes the gap — then the grams
          are converted back into palms, cups and fat portions.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-sex">
              Sex (for the BMR equation)
            </label>
            <select id="w30-sex" className={`mt-2 ${INPUT_CLASS}`} value={form.sex} onChange={set("sex")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-age">
              Age (years)
            </label>
            <input
              id="w30-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.age.min}
              max={LIMITS.age.max}
              step="1"
              value={form.age}
              onChange={set("age")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-weight">
              Weight (kg)
            </label>
            <input
              id="w30-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.weightKg.min}
              max={LIMITS.weightKg.max}
              step="0.5"
              value={form.weightKg}
              onChange={set("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-height">
              Height (cm)
            </label>
            <input
              id="w30-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.heightCm.min}
              max={LIMITS.heightCm.max}
              step="1"
              value={form.heightCm}
              onChange={set("heightCm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-activity">
              Activity level
            </label>
            <select
              id="w30-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={set("activity")}
            >
              {Object.entries(ACTIVITY_FACTORS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-goal">
              Goal
            </label>
            <select id="w30-goal" className={`mt-2 ${INPUT_CLASS}`} value={form.goal} onChange={set("goal")}>
              {Object.entries(GOALS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-protein">
              Protein (g per kg body weight)
            </label>
            <input
              id="w30-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.proteinPerKg.min}
              max={LIMITS.proteinPerKg.max}
              step="0.1"
              value={form.proteinPerKg}
              onChange={set("proteinPerKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-day">
              Day of the {PROGRAM_DAYS}
            </label>
            <input
              id="w30-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.day.min}
              max={LIMITS.day.max}
              step="1"
              value={form.day}
              onChange={set("day")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-veg">
              Non-starchy vegetables (cups/day)
            </label>
            <input
              id="w30-veg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.vegCups.min}
              max={LIMITS.vegCups.max}
              step="0.5"
              value={form.vegCups}
              onChange={set("vegCups")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-starchy">
              Starchy vegetables (cups/day)
            </label>
            <input
              id="w30-starchy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.starchyVegCups.min}
              max={LIMITS.starchyVegCups.max}
              step="0.5"
              value={form.starchyVegCups}
              onChange={set("starchyVegCups")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w30-fruit">
              Fruit servings per day
            </label>
            <input
              id="w30-fruit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.fruitServings.min}
              max={LIMITS.fruitServings.max}
              step="0.5"
              value={form.fruitServings}
              onChange={set("fruitServings")}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily calorie target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kcal(plan.calories) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Day ${plan.progress.day} of ${PROGRAM_DAYS} · ${plan.progress.daysRemaining} days to reintroduction`
                : "Fix the highlighted input to see your targets."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy Whole30 macro plan"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
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

        {ok ? (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${NUM0.format(plan.progress.percentComplete)} percent through the 30 days`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${plan.progress.percentComplete}%` }}
              />
            </div>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {macroRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && plan.addedFatNegative ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            The protein target alone carries more fat than the calorie budget allows, so there is no
            room for cooking fat at all. Lower protein per kg or raise the calorie target.
          </p>
        ) : null}
        {ok && plan.fatAboveTemplate ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This works out at more than {FAT_PORTIONS_PER_MEAL.max} added-fat portions a meal, above
            what the meal template suggests. Add another starchy vegetable cup or fruit serving to
            move some of those calories to carbohydrate.
          </p>
        ) : null}
        {ok && plan.fatBelowTemplate ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Under {FAT_PORTIONS_PER_MEAL.min} added-fat portion a meal. The template asks for at
            least one, so trim a starchy vegetable or fruit serving to make room for cooking fat.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Meal template ({MEALS_PER_DAY} meals, no snacking)</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {templateRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          One palm ≈ 25 g protein · one cup of non-starchy vegetables ≈ 5 g carbohydrate · one fat
          portion ≈ 20 g fat (1–2 thumbs of oil or ghee, half an avocado, a closed handful of nuts or
          a quarter can of coconut milk).
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--danger)]">Out for {PROGRAM_DAYS} days</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {EXCLUDED_FOODS.map(([title, detail]) => (
              <li key={title}>
                <p className="font-semibold">{title}</p>
                <p className="text-[var(--muted-foreground)]">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--success)]">Stays in</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {ALLOWED_FOODS.map(([title, detail]) => (
              <li key={title}>
                <p className="font-semibold">{title}</p>
                <p className="text-[var(--muted-foreground)]">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietetic advice. Whole30 removes several food groups for
        a month and asks you not to weigh yourself — if you are pregnant or breastfeeding, managing
        diabetes, or have a history of disordered eating, work through it with a doctor or registered
        dietitian.
      </p>
    </main>
  );
}
