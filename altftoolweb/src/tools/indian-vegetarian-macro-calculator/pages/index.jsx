"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import {
  ACTIVITY_LEVELS,
  FAT_PCT_DEFAULT,
  GOALS,
  INDIAN_VEG_FOODS,
  PROTEIN_PER_KG_DEFAULT,
  VEG_PROTEIN_ADJUSTMENT,
  compareToTargets,
  computeIndianVegMacros,
  tallyPlate,
} from "../lib";

const G = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const G1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const grams = (value) => (Number.isFinite(value) ? `${G.format(value)} g` : DASH);
const kcal = (value) => (Number.isFinite(value) ? `${G.format(value)} kcal` : DASH);
const pct = (value) => (value === null || !Number.isFinite(value) ? DASH : `${G1.format(value)}%`);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_FORM = {
  sex: "male",
  weight: "70",
  height: "172",
  age: "35",
  activity: "moderate",
  goal: "cut",
  proteinPerKg: String(PROTEIN_PER_KG_DEFAULT),
  adjustment: String(VEG_PROTEIN_ADJUSTMENT),
  fatPct: String(FAT_PCT_DEFAULT),
};

const DEFAULT_PLATE = {
  chapati: "4",
  rice: "1",
  dal: "2",
  rajma: "0",
  paneer: "1",
  curd: "1",
  milk: "1",
  soya: "0",
  peanuts: "0",
  ghee: "2",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [plate, setPlate] = useState(DEFAULT_PLATE);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setPortion = (key, value) => setPlate((prev) => ({ ...prev, [key]: value }));

  const targets = useMemo(
    () =>
      computeIndianVegMacros({
        sex: form.sex,
        weightKg: Number(form.weight),
        heightCm: Number(form.height),
        age: Number(form.age),
        activityId: form.activity,
        goalId: form.goal,
        proteinPerKg: Number(form.proteinPerKg),
        proteinAdjustment: Number(form.adjustment),
        fatPct: Number(form.fatPct),
      }),
    [form],
  );

  const tally = useMemo(
    () =>
      tallyPlate(
        Object.fromEntries(INDIAN_VEG_FOODS.map((food) => [food.id, Number(plate[food.id] ?? 0)])),
      ),
    [plate],
  );

  const failed = Boolean(targets.error);
  const plateFailed = Boolean(tally.error);

  const comparison = useMemo(
    () => (failed || plateFailed ? null : compareToTargets(tally.totals, targets)),
    [failed, plateFailed, tally, targets],
  );

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Indian Vegetarian Macro Calculator",
      `BMR (Mifflin-St Jeor): ${kcal(targets.bmr)}`,
      `TDEE: ${kcal(targets.tdee)}`,
      `Daily calories: ${kcal(targets.calories)}`,
      `Protein: ${grams(targets.protein.grams)} (${pct(targets.protein.pct)})`,
      `Fat: ${grams(targets.fat.grams)} (${pct(targets.fat.pct)})`,
      `Carbohydrate: ${grams(targets.carbs.grams)} (${pct(targets.carbs.pct)})`,
      `Fibre target: ${grams(targets.fibreGrams)}`,
    ];
    if (comparison) {
      lines.push(
        "",
        "Today's plate:",
        `  Calories ${kcal(comparison.kcal.eaten)} of ${kcal(comparison.kcal.target)}`,
        `  Protein ${grams(comparison.protein.eaten)} of ${grams(comparison.protein.target)}`,
        `  Carbs ${grams(comparison.carbs.eaten)} of ${grams(comparison.carbs.target)}`,
        `  Fat ${grams(comparison.fat.eaten)} of ${grams(comparison.fat.target)}`,
      );
    }
    return lines.join("\n");
  }, [targets, failed, comparison]);

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
    setForm(DEFAULT_FORM);
    setPlate(DEFAULT_PLATE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Lacto-vegetarian
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian Vegetarian Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Daily protein, fat and carbohydrate targets for an Indian lacto-vegetarian diet — then a
          plate builder in the units you actually eat in: chapatis, katoris, glasses and spoons.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ivm-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="ivm-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={(event) => setField("sex", event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ivm-age">
              Age (years)
            </label>
            <input
              id="ivm-age"
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
            <label className={LABEL_CLASS} htmlFor="ivm-weight">
              Weight (kg)
            </label>
            <input
              id="ivm-weight"
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
            <label className={LABEL_CLASS} htmlFor="ivm-height">
              Height (cm)
            </label>
            <input
              id="ivm-height"
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
            <label className={LABEL_CLASS} htmlFor="ivm-activity">
              Activity level
            </label>
            <select
              id="ivm-activity"
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
            <label className={LABEL_CLASS} htmlFor="ivm-goal">
              Goal
            </label>
            <select
              id="ivm-goal"
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
            <label className={LABEL_CLASS} htmlFor="ivm-protein">
              Protein (g per kg of body weight)
            </label>
            <input
              id="ivm-protein"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="ivm-adjust">
              Protein quality adjustment (1.0-1.25)
            </label>
            <input
              id="ivm-adjust"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1.25"
              step="0.05"
              value={form.adjustment}
              onChange={(event) => setField("adjustment", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ivm-fat">
              Fat (% of energy)
            </label>
            <input
              id="ivm-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="15"
              max="40"
              step="1"
              value={form.fatPct}
              onChange={(event) => setField("fatPct", event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {targets.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily calorie target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : kcal(targets.calories)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `BMR ${kcal(targets.bmr)} · TDEE ${kcal(targets.tdee)} · ${G1.format(targets.weeklyKgChange)} kg/week projected`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy macro targets and plate" className={GHOST_BTN}>
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
            ["Protein", failed ? null : targets.protein],
            ["Fat", failed ? null : targets.fat],
            ["Carbohydrate", failed ? null : targets.carbs],
          ].map(([label, macro]) => (
            <div key={label} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                {macro ? grams(macro.grams) : DASH}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {macro ? `${kcal(macro.kcal)} · ${pct(macro.pct)}` : DASH}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Resting metabolic rate (BMR)", failed ? DASH : kcal(targets.bmr)],
            ["Maintenance calories (TDEE)", failed ? DASH : kcal(targets.tdee)],
            ["Goal adjustment", failed ? DASH : targets.goalLabel],
            [
              "Protein before quality adjustment",
              failed ? DASH : `${grams(targets.proteinBaseGrams)} x ${targets.proteinAdjustment}`,
            ],
            ["Fibre target (14 g per 1,000 kcal)", failed ? DASH : grams(targets.fibreGrams)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && targets.floored ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
            Your deficit would fall below {kcal(targets.floor)} a day, so the target is held at the
            floor. Go no lower without medical supervision.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Build today&apos;s plate</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Enter the number of portions you plan to eat. A katori is taken as 150 g of the cooked
          dish.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {INDIAN_VEG_FOODS.map((food) => (
            <div key={food.id}>
              <label className={LABEL_CLASS} htmlFor={`ivm-food-${food.id}`}>
                {food.label}
              </label>
              <input
                id={`ivm-food-${food.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="50"
                step="0.5"
                value={plate[food.id]}
                onChange={(event) => setPortion(food.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Portion: {food.portionLabel}
              </p>
            </div>
          ))}
        </div>
      </section>

      {plateFailed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {tally.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Plate against target</h2>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Calories", comparison ? kcal(comparison.kcal.eaten) : DASH, comparison ? comparison.kcal : null, kcal],
            ["Protein", comparison ? grams(comparison.protein.eaten) : DASH, comparison ? comparison.protein : null, grams],
            ["Carbohydrate", comparison ? grams(comparison.carbs.eaten) : DASH, comparison ? comparison.carbs : null, grams],
            ["Fat", comparison ? grams(comparison.fat.eaten) : DASH, comparison ? comparison.fat : null, grams],
          ].map(([label, eaten, row, formatter]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">
                {eaten}
                {row ? (
                  <span
                    className={`block text-xs font-medium ${
                      row.remaining < 0 ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {row.remaining >= 0
                      ? `${formatter(row.remaining)} left of ${formatter(row.target)} (${pct(row.pct)})`
                      : `${formatter(Math.abs(row.remaining))} over ${formatter(row.target)} (${pct(row.pct)})`}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>

        {!plateFailed && tally.rows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Portions</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Calories</th>
                  <th scope="col" className="py-2 text-right font-semibold">Protein</th>
                </tr>
              </thead>
              <tbody>
                {tally.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{row.portionLabel}</span>
                    </td>
                    <td className="py-2 pr-3 text-right">{G1.format(row.portions)}</td>
                    <td className="py-2 pr-3 text-right">{kcal(row.kcal)}</td>
                    <td className="py-2 text-right font-semibold">{grams(row.protein)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietary advice. Food values are representative — the
        thickness of your dal, the tempering oil and the brand of paneer all shift them. Vegetarian
        diets in India commonly need attention to vitamin B12, iron and vitamin D; discuss that with
        a doctor or registered dietitian.
      </p>
    </main>
  );
}
