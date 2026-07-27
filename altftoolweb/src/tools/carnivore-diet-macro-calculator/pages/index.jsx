"use client";

import { useMemo, useState } from "react";
import { Beef, Check, Copy, RotateCcw } from "lucide-react";

import {
  ACTIVITY_LEVELS,
  CARB_ALLOWANCE_DEFAULT_G,
  CARB_ALLOWANCE_MAX_G,
  FAT_PROTEIN_RATIO_HIGH,
  FAT_PROTEIN_RATIO_LOW,
  GOALS,
  PROTEIN_ENERGY_CEILING_PCT,
  PROTEIN_PER_KG_DEFAULT,
  computeCarnivoreMacros,
} from "../lib";

const G = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const G1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const G2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const grams = (value) => (Number.isFinite(value) ? `${G.format(value)} g` : DASH);
const kcal = (value) => (Number.isFinite(value) ? `${G.format(value)} kcal` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${G1.format(value)}%` : DASH);
const ratio = (value) => (value === null || !Number.isFinite(value) ? DASH : `${G2.format(value)} : 1`);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "male",
  weight: "90",
  height: "183",
  age: "32",
  activity: "moderate",
  goal: "maintain",
  proteinPerKg: String(PROTEIN_PER_KG_DEFAULT),
  carbGrams: String(CARB_ALLOWANCE_DEFAULT_G),
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      computeCarnivoreMacros({
        sex: form.sex,
        weightKg: Number(form.weight),
        heightCm: Number(form.height),
        age: Number(form.age),
        activityId: form.activity,
        goalId: form.goal,
        proteinPerKg: Number(form.proteinPerKg),
        carbGrams: Number(form.carbGrams),
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Carnivore Diet Macro Calculator",
      `BMR (Mifflin-St Jeor): ${kcal(result.bmr)}`,
      `TDEE: ${kcal(result.tdee)}`,
      `Daily calories: ${kcal(result.calories)}`,
      `Protein: ${grams(result.protein.grams)} (${pct(result.protein.pct)} of energy)`,
      `Fat: ${grams(result.fat.grams)} (${pct(result.fat.pct)})`,
      `Fat to protein ratio: ${ratio(result.fatProteinRatio)} by weight`,
      result.bestMatch
        ? `Closest single cut: ${result.bestMatch.label} at ${grams(result.bestMatch.gramsForProtein)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
          <Beef className="h-4 w-4" aria-hidden="true" />
          All-animal eating
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Carnivore Diet Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          With carbohydrate at zero, only two numbers matter: how much protein you need, and how much
          fat has to sit alongside it. This works out both, reports the fat-to-protein ratio by
          weight, and shows which cuts naturally land near it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="carn-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="carn-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={(event) => setField("sex", event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carn-age">
              Age (years)
            </label>
            <input
              id="carn-age"
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
            <label className={LABEL_CLASS} htmlFor="carn-weight">
              Weight (kg)
            </label>
            <input
              id="carn-weight"
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
            <label className={LABEL_CLASS} htmlFor="carn-height">
              Height (cm)
            </label>
            <input
              id="carn-height"
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
            <label className={LABEL_CLASS} htmlFor="carn-activity">
              Activity level
            </label>
            <select
              id="carn-activity"
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
            <label className={LABEL_CLASS} htmlFor="carn-goal">
              Goal
            </label>
            <select
              id="carn-goal"
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
            <label className={LABEL_CLASS} htmlFor="carn-protein">
              Protein (g per kg of body weight)
            </label>
            <input
              id="carn-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.8"
              max="3"
              step="0.1"
              value={form.proteinPerKg}
              onChange={(event) => setField("proteinPerKg", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="carn-carbs">
              Carbohydrate allowance (g)
            </label>
            <input
              id="carn-carbs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={CARB_ALLOWANCE_MAX_G}
              step="1"
              value={form.carbGrams}
              onChange={(event) => setField("carbGrams", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Strict carnivore is 0 g; raise it if you count the trace carbohydrate in liver, dairy
              or eggs.
            </p>
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
              Fat to protein ratio by weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : ratio(result.fatProteinRatio)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${grams(result.fat.grams)} fat alongside ${grams(result.protein.grams)} protein · ${kcal(result.calories)} a day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy carnivore macro targets" className={GHOST_BTN}>
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
            ["Protein share of energy", failed ? DASH : pct(result.protein.pct)],
            [
              "Ratio inside the usual 1-2 : 1 band",
              failed ? DASH : result.ratioInRange ? "Yes" : "No",
            ],
            [
              "Closest single cut",
              failed || !result.bestMatch
                ? DASH
                : `${result.bestMatch.label} · ${grams(result.bestMatch.gramsForProtein)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.proteinCeilingBreached ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
            Protein is above {PROTEIN_ENERGY_CEILING_PCT}% of your energy. That is the level
            associated with protein poisoning on very lean all-meat diets — add fattier cuts or added
            fat, or lower the grams per kilogram.
          </p>
        ) : null}

        {!failed && result.floored ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
            Your deficit would fall below {kcal(result.floor)} a day, so the target is held at the
            floor. Go no lower without medical supervision.
          </p>
        ) : null}

        {!failed && !result.ratioInRange && !result.proteinCeilingBreached ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Most carnivore eaters sit between {FAT_PROTEIN_RATIO_LOW}:1 and {FAT_PROTEIN_RATIO_HIGH}:1
            fat to protein by weight. Outside that band, adjust protein per kilogram or the size of
            your deficit rather than forcing the fat.
          </p>
        ) : null}
      </section>

      {failed ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cuts against your targets</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Grams needed to hit the protein target, the fat that comes with it, and the{" "}
            {result.topupFoodLabel ? result.topupFoodLabel.toLowerCase() : "added fat"} needed to
            close the gap.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Food</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Fat : protein</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">For the day</th>
                  <th scope="col" className="py-2 text-right font-semibold">Fat to add</th>
                </tr>
              </thead>
              <tbody>
                {result.foods.map((food) => (
                  <tr key={food.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{food.label}</span>
                      {result.bestMatch && result.bestMatch.id === food.id ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                          closest match
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">{ratio(food.ratio)}</td>
                    <td className="py-2 pr-3 text-right">
                      {food.gramsForProtein === null ? DASH : grams(food.gramsForProtein)}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {food.topupGrams === null ? DASH : grams(food.topupGrams)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or dietary advice. An all-animal diet removes fibre and most
        dietary sources of vitamin C, folate and several other nutrients, and it interacts with
        cholesterol management, kidney conditions and diabetes medication. Talk to a doctor or
        registered dietitian before starting, and do not adjust medication on your own.
      </p>
    </main>
  );
}
