"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  ACTIVITY_FACTORS,
  FAT_PER_KG,
  LIMITS,
  LOW_CARB_FLAG_G,
  PROTEIN_PER_KG_BODYWEIGHT,
  PROTEIN_PER_KG_LEAN,
  highProteinMacros,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const g0 = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} g` : DASH);
const kcal = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kcal` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM0.format(v * 100)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_INVALID_CLASS =
  "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/25";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const NOTE_CLASS =
  "mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]";

const DEFAULTS = {
  sex: "male",
  age: "35",
  weightKg: "90",
  heightCm: "178",
  activity: "moderate",
  weeklyLossKg: "0.7",
  proteinBasis: "lean",
  proteinPerKg: "2.6",
  bodyFatPercent: "20",
  fatPerKg: "0.8",
  // 6 meals keeps the default 2.6 g/kg lean-mass target under the per-meal
  // ceiling (0.4 g/kg body weight) so the demo values don't trip the tool's
  // own "spread it across more meals" warning on first load.
  meals: "6",
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

  const switchBasis = (basis) => {
    setForm((prev) => ({
      ...prev,
      proteinBasis: basis,
      proteinPerKg: String(
        basis === "lean" ? PROTEIN_PER_KG_LEAN.sane : PROTEIN_PER_KG_BODYWEIGHT.sane,
      ),
    }));
    setCopied(false);
  };

  const plan = useMemo(
    () =>
      highProteinMacros({
        sex: form.sex,
        age: toNumber(form.age),
        weightKg: toNumber(form.weightKg),
        heightCm: toNumber(form.heightCm),
        activity: form.activity,
        weeklyLossKg: toNumber(form.weeklyLossKg),
        proteinBasis: form.proteinBasis,
        proteinPerKg: toNumber(form.proteinPerKg),
        bodyFatPercent: toNumber(form.bodyFatPercent),
        fatPerKg: toNumber(form.fatPerKg),
        meals: toNumber(form.meals),
      }),
    [form],
  );

  const ok = !plan.error;
  const range = form.proteinBasis === "lean" ? PROTEIN_PER_KG_LEAN : PROTEIN_PER_KG_BODYWEIGHT;

  // Mirrors the bound checks in highProteinMacros() so the specific offending
  // field(s) can be highlighted - lib.js only returns one error string, not a
  // field key, so this is recomputed here from the same LIMITS/range values.
  const invalidFields = useMemo(() => {
    const invalid = new Set();
    const check = (key, value, min, max) => {
      if (!Number.isFinite(value) || value < min || value > max) invalid.add(key);
    };
    check("age", toNumber(form.age), LIMITS.age.min, LIMITS.age.max);
    check("weightKg", toNumber(form.weightKg), LIMITS.weightKg.min, LIMITS.weightKg.max);
    check("heightCm", toNumber(form.heightCm), LIMITS.heightCm.min, LIMITS.heightCm.max);
    check("weeklyLossKg", toNumber(form.weeklyLossKg), 0, LIMITS.weeklyLossKg.max);
    check("meals", toNumber(form.meals), LIMITS.meals.min, LIMITS.meals.max);
    check("fatPerKg", toNumber(form.fatPerKg), FAT_PER_KG.min, FAT_PER_KG.max);
    check("proteinPerKg", toNumber(form.proteinPerKg), range.min, range.max);
    if (form.proteinBasis === "lean") {
      check(
        "bodyFatPercent",
        toNumber(form.bodyFatPercent),
        LIMITS.bodyFatPercent.min,
        LIMITS.bodyFatPercent.max,
      );
    }
    return invalid;
  }, [form, range]);

  const inputClass = (key) =>
    `mt-2 ${INPUT_CLASS} ${invalidFields.has(key) ? INPUT_INVALID_CLASS : ""}`;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "High-Protein Macro Calculator",
      `Daily calories: ${NUM0.format(plan.calories)} kcal (maintenance ${NUM0.format(plan.tdee)} kcal)`,
      `Protein: ${NUM0.format(plan.proteinGrams)} g (${NUM2.format(plan.proteinPerKgBodyweight)} g/kg body weight)`,
      `Fat: ${NUM0.format(plan.fatGrams)} g`,
      `Carbohydrate: ${NUM0.format(plan.carbGrams)} g`,
      `Protein per meal across ${plan.meals} meals: ${NUM0.format(plan.perMealProtein)} g`,
      `Target loss: ${NUM1.format(plan.weeklyLossKg)} kg a week (${NUM0.format(plan.deficit)} kcal/day deficit)`,
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

  const rows = [
    ["Protein", ok ? g0(plan.proteinGrams) : DASH],
    ["Fat", ok ? g0(plan.fatGrams) : DASH],
    ["Carbohydrate", ok ? g0(plan.carbGrams) : DASH],
    ["Protein per kg of body weight", ok ? `${NUM2.format(plan.proteinPerKgBodyweight)} g/kg` : DASH],
    ["Lean body mass used", ok && plan.lean ? `${NUM1.format(plan.lean)} kg` : ok ? "Not used" : DASH],
    ["Protein per meal", ok ? `${g0(plan.perMealProtein)} × ${plan.meals} meals` : DASH],
    ["Maintenance calories (TDEE)", ok ? kcal(plan.tdee) : DASH],
    ["Daily deficit", ok ? kcal(plan.deficit) : DASH],
    ["Expected loss per month", ok ? `${NUM1.format(plan.monthlyLossKg)} kg` : DASH],
    [
      "Energy split (protein / carb / fat)",
      ok ? `${pct(plan.proteinShare)} / ${pct(plan.carbShare)} / ${pct(plan.fatShare)}` : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Cutting macros
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          High-Protein Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sets protein high enough to defend muscle while you diet, puts a floor under dietary fat,
          and gives the remaining calories to carbohydrate. Ranges follow the ISSN protein position
          stand and the Helms review of dieting athletes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-sex">
              Sex (for the BMR equation)
            </label>
            <select id="hp-sex" className={`mt-2 ${INPUT_CLASS}`} value={form.sex} onChange={set("sex")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-age">
              Age (years)
            </label>
            <input
              id="hp-age"
              className={inputClass("age")}
              type="number"
              inputMode="numeric"
              min={LIMITS.age.min}
              max={LIMITS.age.max}
              step="1"
              value={form.age}
              onChange={set("age")}
              aria-invalid={invalidFields.has("age")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-weight">
              Weight (kg)
            </label>
            <input
              id="hp-weight"
              className={inputClass("weightKg")}
              type="number"
              inputMode="decimal"
              min={LIMITS.weightKg.min}
              max={LIMITS.weightKg.max}
              step="0.5"
              value={form.weightKg}
              onChange={set("weightKg")}
              aria-invalid={invalidFields.has("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-height">
              Height (cm)
            </label>
            <input
              id="hp-height"
              className={inputClass("heightCm")}
              type="number"
              inputMode="decimal"
              min={LIMITS.heightCm.min}
              max={LIMITS.heightCm.max}
              step="1"
              value={form.heightCm}
              onChange={set("heightCm")}
              aria-invalid={invalidFields.has("heightCm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-activity">
              Activity level
            </label>
            <select
              id="hp-activity"
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
            <label className={LABEL_CLASS} htmlFor="hp-rate">
              Target loss (kg per week, 0 to maintain)
            </label>
            <input
              id="hp-rate"
              className={inputClass("weeklyLossKg")}
              type="number"
              inputMode="decimal"
              min="0"
              max={LIMITS.weeklyLossKg.max}
              step="0.1"
              value={form.weeklyLossKg}
              onChange={set("weeklyLossKg")}
              aria-invalid={invalidFields.has("weeklyLossKg")}
            />
          </div>
          <div className="sm:col-span-2">
            <span className={LABEL_CLASS}>Base protein on</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                ["bodyweight", "Body weight"],
                ["lean", "Lean body mass"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchBasis(value)}
                  aria-pressed={form.proteinBasis === value}
                  className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    form.proteinBasis === value
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-protein">
              Protein (g per kg, {range.min}–{range.max})
            </label>
            <input
              id="hp-protein"
              className={inputClass("proteinPerKg")}
              type="number"
              inputMode="decimal"
              min={range.min}
              max={range.max}
              step="0.1"
              value={form.proteinPerKg}
              onChange={set("proteinPerKg")}
              aria-invalid={invalidFields.has("proteinPerKg")}
            />
          </div>
          {form.proteinBasis === "lean" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="hp-bf">
                Body fat (%)
              </label>
              <input
                id="hp-bf"
                className={inputClass("bodyFatPercent")}
                type="number"
                inputMode="decimal"
                min={LIMITS.bodyFatPercent.min}
                max={LIMITS.bodyFatPercent.max}
                step="0.5"
                value={form.bodyFatPercent}
                onChange={set("bodyFatPercent")}
                aria-invalid={invalidFields.has("bodyFatPercent")}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-fat">
              Fat (g per kg body weight, {FAT_PER_KG.min}–{FAT_PER_KG.max})
            </label>
            <input
              id="hp-fat"
              className={inputClass("fatPerKg")}
              type="number"
              inputMode="decimal"
              min={FAT_PER_KG.min}
              max={FAT_PER_KG.max}
              step="0.05"
              value={form.fatPerKg}
              onChange={set("fatPerKg")}
              aria-invalid={invalidFields.has("fatPerKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hp-meals">
              Meals a day
            </label>
            <input
              id="hp-meals"
              className={inputClass("meals")}
              type="number"
              inputMode="numeric"
              min={LIMITS.meals.min}
              max={LIMITS.meals.max}
              step="1"
              value={form.meals}
              onChange={set("meals")}
              aria-invalid={invalidFields.has("meals")}
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
              Daily protein target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? g0(plan.proteinGrams) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `On ${NUM0.format(plan.calories)} kcal a day, ${NUM0.format(plan.carbGrams)} g carbs and ${NUM0.format(plan.fatGrams)} g fat`
                : invalidFields.size > 0
                  ? "Fix the highlighted input to see your targets."
                  : "Adjust the inputs above to see your targets."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy high-protein macro result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Protein ${pct(plan.proteinShare)}, carbs ${pct(plan.carbShare)}, fat ${pct(plan.fatShare)} of calories`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${plan.proteinShare * 100}%` }} />
              <span className="block h-full bg-[var(--success)]" style={{ width: `${plan.carbShare * 100}%` }} />
              <span className="block h-full bg-[var(--danger)]" style={{ width: `${plan.fatShare * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Protein {pct(plan.proteinShare)} · Carbs {pct(plan.carbShare)} · Fat {pct(plan.fatShare)}
            </p>
          </div>
        ) : null}

        <div aria-live="polite" role="status">
          {ok && plan.aggressiveLoss ? (
            <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              {NUM1.format(plan.weeklyLossKg)} kg a week is more than 1% of your body weight. Losing
              faster than that costs disproportionately more muscle — even at this protein intake.
            </p>
          ) : null}
          {ok && plan.belowCalorieFloor ? (
            <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              This lands below {plan.calorieFloor} kcal a day. Intakes that low should be medically
              supervised — slow the target loss rate.
            </p>
          ) : null}
          {ok && !plan.belowCalorieFloor && plan.belowBmr ? (
            <p className={NOTE_CLASS}>
              The target is under your estimated resting metabolic rate of {kcal(plan.bmr)}. That is
              survivable short-term but hard to sustain; a slower rate usually holds better.
            </p>
          ) : null}
          {ok && plan.lowFat ? (
            <p className={NOTE_CLASS}>
              Fat is under 20% of calories. Nudge fat per kg up — very low fat intakes are hard to
              stick to and hurt absorption of vitamins A, D, E and K.
            </p>
          ) : null}
          {ok && plan.lowCarb ? (
            <p className={NOTE_CLASS}>
              Carbohydrate is under {LOW_CARB_FLAG_G} g a day, which is effectively ketogenic. Expect
              heavy training sessions to feel flat until you adapt.
            </p>
          ) : null}
          {ok && plan.perMealAboveCeiling ? (
            <p className={NOTE_CLASS}>
              {g0(plan.perMealProtein)} in one sitting is above the roughly {g0(plan.perMealCeiling)}{" "}
              per meal that maximally stimulates muscle protein synthesis. Adding a meal spreads it
              better.
            </p>
          ) : null}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. High-protein intakes are well tolerated by healthy
        adults but are not appropriate in chronic kidney disease or certain metabolic disorders —
        check with your doctor or a registered dietitian before making a large change.
      </p>
    </main>
  );
}
