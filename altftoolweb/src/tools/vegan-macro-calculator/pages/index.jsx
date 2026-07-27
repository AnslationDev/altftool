"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Leaf, RotateCcw } from "lucide-react";

import {
  ACTIVITY_LEVELS,
  COMPLEMENTARY_PAIRS,
  FAT_PCT_DEFAULT,
  GOALS,
  PLANT_PROTEIN_ADJUSTMENT,
  PROTEIN_PER_KG_DEFAULT,
  computeVeganMacros,
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
  sex: "female",
  weight: "62",
  height: "165",
  age: "28",
  activity: "light",
  goal: "maintain",
  proteinPerKg: String(PROTEIN_PER_KG_DEFAULT),
  adjustment: String(PLANT_PROTEIN_ADJUSTMENT),
  fatPct: String(FAT_PCT_DEFAULT),
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      computeVeganMacros({
        sex: form.sex,
        weightKg: Number(form.weight),
        heightCm: Number(form.height),
        age: Number(form.age),
        activityId: form.activity,
        goalId: form.goal,
        proteinPerKg: Number(form.proteinPerKg),
        plantAdjustment: Number(form.adjustment),
        fatPct: Number(form.fatPct),
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Vegan Macro Calculator",
      `BMR (Mifflin-St Jeor): ${kcal(result.bmr)}`,
      `TDEE: ${kcal(result.tdee)}`,
      `Daily calories: ${kcal(result.calories)}`,
      `Protein: ${grams(result.protein.grams)} (${pct(result.protein.pct)}) — base ${grams(result.proteinBaseGrams)} x ${result.plantAdjustment} plant adjustment`,
      `Fat: ${grams(result.fat.grams)} (${pct(result.fat.pct)})`,
      `Carbohydrate: ${grams(result.carbs.grams)} (${pct(result.carbs.pct)})`,
      `Fibre target: ${grams(result.fibreGrams)}`,
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Leaf className="h-4 w-4" aria-hidden="true" />
          Plant-based nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Vegan Macro Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Protein, fat and carbohydrate targets for a plant-based diet, with the protein figure
          raised to allow for lower plant digestibility, a fibre goal, and how much of each source
          it takes to hit the number.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vegan-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="vegan-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={(event) => setField("sex", event.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vegan-age">
              Age (years)
            </label>
            <input
              id="vegan-age"
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
            <label className={LABEL_CLASS} htmlFor="vegan-weight">
              Weight (kg)
            </label>
            <input
              id="vegan-weight"
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
            <label className={LABEL_CLASS} htmlFor="vegan-height">
              Height (cm)
            </label>
            <input
              id="vegan-height"
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
            <label className={LABEL_CLASS} htmlFor="vegan-activity">
              Activity level
            </label>
            <select
              id="vegan-activity"
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
            <label className={LABEL_CLASS} htmlFor="vegan-goal">
              Goal
            </label>
            <select
              id="vegan-goal"
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
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Plant-based settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vegan-protein">
              Protein (g per kg of body weight)
            </label>
            <input
              id="vegan-protein"
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
            <label className={LABEL_CLASS} htmlFor="vegan-adjust">
              Plant digestibility adjustment (1.0-1.3)
            </label>
            <input
              id="vegan-adjust"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1.3"
              step="0.05"
              value={form.adjustment}
              onChange={(event) => setField("adjustment", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Use 1.0 if most of your protein is soy; raise it towards 1.2 for a diet built on
              grains and pulses.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vegan-fat">
              Fat (% of energy)
            </label>
            <input
              id="vegan-fat"
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
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Daily protein target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : grams(result.protein.grams)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${grams(result.proteinBaseGrams)} base x ${result.plantAdjustment} plant adjustment · ${kcal(result.calories)} a day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy vegan macro targets" className={GHOST_BTN}>
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
            ["Protein", failed ? null : result.protein],
            ["Fat", failed ? null : result.fat],
            ["Carbohydrate", failed ? null : result.carbs],
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
            ["Resting metabolic rate (BMR)", failed ? DASH : kcal(result.bmr)],
            ["Maintenance calories (TDEE)", failed ? DASH : kcal(result.tdee)],
            ["Goal adjustment", failed ? DASH : result.goalLabel],
            ["Fibre target (14 g per 1,000 kcal)", failed ? DASH : grams(result.fibreGrams)],
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
            Your deficit would fall below {kcal(result.floor)} a day, so the target is held at the
            floor. Go no lower without medical supervision.
          </p>
        ) : null}
      </section>

      {failed ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What the protein target looks like in food</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            How much of a single source would supply the whole day&apos;s protein. In practice you
            would spread it across several — this is a scale check, not a meal plan.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Source</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Protein /100 g</th>
                  <th scope="col" className="py-2 text-right font-semibold">Grams for the day</th>
                </tr>
              </thead>
              <tbody>
                {result.sourcePortions.map((source) => (
                  <tr key={source.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{source.label}</span>
                      {source.complete ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                          complete
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">{G1.format(source.proteinPer100g)} g</td>
                    <td className="py-2 text-right font-semibold">
                      {source.gramsForDailyProtein === null ? DASH : grams(source.gramsForDailyProtein)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Complementary protein pairings</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Cereals are typically short on lysine and pulses on methionine, so the two cover each
          other. Current guidance is that this variety only needs to happen across the day, not
          within every meal.
        </p>
        <ul className="mt-3 grid gap-2 text-sm">
          {COMPLEMENTARY_PAIRS.map(([pair, why]) => (
            <li key={pair} className="rounded-md border border-[var(--border)] px-3 py-2">
              <span className="font-semibold">{pair}</span>
              <span className="block text-xs text-[var(--muted-foreground)]">{why}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietary advice. A well-planned vegan diet still needs a
        reliable vitamin B12 source, and iron, iodine, zinc, calcium, vitamin D and omega-3 intake
        are worth reviewing with a doctor or registered dietitian.
      </p>
    </main>
  );
}
