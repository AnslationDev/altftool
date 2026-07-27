"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import {
  ACTIVITY_LEVELS,
  GOALS,
  KETO_FAT_TARGET_PCT,
  KETO_NET_CARB_DEFAULT_G,
  KETO_NET_CARB_MAX_G,
  PROTEIN_PER_KG_DEFAULT,
  computeKetoMacros,
  splitAcrossMeals,
} from "../lib";

const G = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const G1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const grams = (value) => (Number.isFinite(value) ? `${G.format(value)} g` : DASH);
const kcal = (value) => (Number.isFinite(value) ? `${G.format(value)} kcal` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${G1.format(value)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "male",
  weight: "80",
  height: "180",
  age: "30",
  activity: "moderate",
  goal: "cut",
  netCarbs: String(KETO_NET_CARB_DEFAULT_G),
  proteinPerKg: String(PROTEIN_PER_KG_DEFAULT),
  bodyFat: "",
  meals: "3",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      computeKetoMacros({
        sex: form.sex,
        weightKg: Number(form.weight),
        heightCm: Number(form.height),
        age: Number(form.age),
        activityId: form.activity,
        goalId: form.goal,
        netCarbGrams: Number(form.netCarbs),
        proteinPerKg: Number(form.proteinPerKg),
        bodyFatPct: form.bodyFat === "" ? 0 : Number(form.bodyFat),
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const meals = Number(form.meals);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Keto Macro Calculator",
      `BMR (Mifflin-St Jeor): ${kcal(result.bmr)}`,
      `TDEE: ${kcal(result.tdee)}`,
      `Daily calorie target: ${kcal(result.calories)}`,
      `Fat: ${grams(result.fat.grams)} (${pct(result.fat.pct)})`,
      `Protein: ${grams(result.protein.grams)} (${pct(result.protein.pct)})`,
      `Net carbs: ${grams(result.netCarbs.grams)} (${pct(result.netCarbs.pct)})`,
      `Projected change: ${G1.format(result.weeklyKgChange)} kg per week`,
    ].join("\n");
  }, [result, failed]);

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

  const perMeal = (value) => {
    const split = splitAcrossMeals(value, meals);
    return split === null ? DASH : grams(split);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Ketogenic diet
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Keto Macro Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fixes your net carbs first, sets protein from grams per kilogram, and lets fat take the
          remaining calories — the order that actually keeps a ketogenic diet ketogenic.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="keto-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={(event) => setField("sex", event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-age">
              Age (years)
            </label>
            <input
              id="keto-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="14"
              max="100"
              step="1"
              value={form.age}
              onChange={(event) => setField("age", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-weight">
              Weight (kg)
            </label>
            <input
              id="keto-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="300"
              step="0.5"
              value={form.weight}
              onChange={(event) => setField("weight", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-height">
              Height (cm)
            </label>
            <input
              id="keto-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              step="1"
              value={form.height}
              onChange={(event) => setField("height", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-activity">
              Activity level
            </label>
            <select
              id="keto-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={(event) => setField("activity", event.target.value)}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-goal">
              Goal
            </label>
            <select
              id="keto-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.goal}
              onChange={(event) => setField("goal", event.target.value)}
            >
              {GOALS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-bodyfat">
              Body fat % (optional — switches protein to lean mass)
            </label>
            <input
              id="keto-bodyfat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="70"
              step="0.5"
              placeholder="leave blank if unknown"
              value={form.bodyFat}
              onChange={(event) => setField("bodyFat", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-meals">
              Meals per day
            </label>
            <input
              id="keto-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              step="1"
              value={form.meals}
              onChange={(event) => setField("meals", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Keto settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-carbs">
              Net carb budget (g per day)
            </label>
            <input
              id="keto-carbs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={KETO_NET_CARB_MAX_G}
              step="5"
              value={form.netCarbs}
              onChange={(event) => setField("netCarbs", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Under {KETO_NET_CARB_MAX_G} g defines a standard ketogenic diet; 20-30 g is the usual
              working range.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="keto-protein">
              Protein (g per kg of body weight)
            </label>
            <input
              id="keto-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.8"
              max="2.5"
              step="0.1"
              value={form.proteinPerKg}
              onChange={(event) => setField("proteinPerKg", event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
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
              {failed ? DASH : kcal(result.calories)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `BMR ${kcal(result.bmr)} · TDEE ${kcal(result.tdee)} · ${G1.format(result.weeklyKgChange)} kg/week projected`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy keto macro targets" className={GHOST_BTN}>
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Fat", failed ? null : result.fat],
            ["Protein", failed ? null : result.protein],
            ["Net carbs", failed ? null : result.netCarbs],
          ].map(([label, macro]) => (
            <div key={label} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                {macro ? grams(macro.grams) : DASH}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {macro ? `${kcal(macro.kcal)} · ${pct(macro.pct)} of energy` : DASH}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Per meal: {macro ? perMeal(macro.grams) : DASH}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Resting metabolic rate (BMR)", failed ? DASH : kcal(result.bmr)],
            ["Maintenance calories (TDEE)", failed ? DASH : kcal(result.tdee)],
            ["Goal adjustment", failed ? DASH : result.goalLabel],
            ["Activity level used", failed ? DASH : result.activityLabel],
            [
              "Protein reference weight",
              failed
                ? DASH
                : `${G1.format(result.referenceWeight)} kg ${result.usedLeanMass ? "(lean mass)" : "(body weight)"}`,
            ],
            ["Projected weekly change", failed ? DASH : `${G1.format(result.weeklyKgChange)} kg`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.floored ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
            Your chosen deficit would drop you below {kcal(result.floor)} a day, so the target has
            been held at the floor. Diets below that level need medical supervision.
          </p>
        ) : null}

        {!failed && result.proteinWarning ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Protein is over 35% of your energy, which is high for a ketogenic diet. Lower the grams
            per kilogram if you find ketosis hard to hold.
          </p>
        ) : null}

        {!failed && result.fat.pct < KETO_FAT_TARGET_PCT ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Fat is under {KETO_FAT_TARGET_PCT}% of energy. That is fine on a deficit, where body fat
            makes up the difference, but check that protein and carbs are not creeping up.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietary advice. A ketogenic diet interacts with diabetes
        medication, kidney and liver conditions, and pregnancy — speak to a doctor or a registered
        dietitian before starting, and especially before changing any medication.
      </p>
    </main>
  );
}
