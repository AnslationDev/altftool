"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Leaf, RotateCcw } from "lucide-react";

import {
  ACTIVITY_FACTORS,
  GOALS,
  MED_SHARES,
  PYRAMID_OLIVE_OIL_TBSP,
  WEEKLY_PATTERN,
  mediterraneanMacros,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const g0 = (value) => `${NUM0.format(value)} g`;
const pct = (fraction) => `${NUM0.format(fraction * 100)}%`;

const DASH = "—";

const DEFAULTS = {
  sex: "male",
  age: "35",
  weightKg: "70",
  heightCm: "172",
  activity: "moderate",
  goal: "maintain",
  fatPercent: "37",
  proteinPercent: "17",
  oliveOilPercent: "45",
  includeNuts: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [fatPercent, setFatPercent] = useState(DEFAULTS.fatPercent);
  const [proteinPercent, setProteinPercent] = useState(DEFAULTS.proteinPercent);
  const [oliveOilPercent, setOliveOilPercent] = useState(DEFAULTS.oliveOilPercent);
  const [includeNuts, setIncludeNuts] = useState(DEFAULTS.includeNuts);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      mediterraneanMacros({
        sex,
        age: toNumber(age),
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        activity,
        goal,
        fatShare: toNumber(fatPercent) / 100,
        proteinShare: toNumber(proteinPercent) / 100,
        oliveOilShare: toNumber(oliveOilPercent) / 100,
        includeNuts,
      }),
    [
      sex,
      age,
      weightKg,
      heightCm,
      activity,
      goal,
      fatPercent,
      proteinPercent,
      oliveOilPercent,
      includeNuts,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mediterranean Diet Macro Calculator",
      `Daily calories: ${NUM0.format(result.calories)} kcal`,
      `Protein: ${g0(result.proteinGrams)} (${pct(result.proteinShare)})`,
      `Fat: ${g0(result.fatGrams)} (${pct(result.fatShare)})`,
      `Carbohydrate: ${g0(result.carbGrams)} (${pct(result.carbShare)})`,
      `Olive oil: ${NUM1.format(result.oliveOilTbsp)} tbsp (${NUM0.format(result.oliveOilMl)} mL)`,
      result.nutsIncluded ? `Mixed nuts: ${g0(result.nutsGrams)}` : "Mixed nuts: none",
      `Saturated fat ceiling: ${g0(result.satFatMaxGrams)}`,
      `Fibre target: ${g0(result.fibreTargetG)}`,
    ].join("\n");
  }, [hasError, result]);

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
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setActivity(DEFAULTS.activity);
    setGoal(DEFAULTS.goal);
    setFatPercent(DEFAULTS.fatPercent);
    setProteinPercent(DEFAULTS.proteinPercent);
    setOliveOilPercent(DEFAULTS.oliveOilPercent);
    setIncludeNuts(DEFAULTS.includeNuts);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Protein", DASH],
        ["Fat (olive-oil led)", DASH],
        ["Carbohydrate", DASH],
        ["Protein per kg body weight", DASH],
        ["Olive oil", DASH],
        ["Mixed nuts (PREDIMED serving)", DASH],
        ["Fat from fish, dairy and whole foods", DASH],
        ["Saturated fat ceiling (under 10% of energy)", DASH],
        ["Fibre target (14 g per 1,000 kcal)", DASH],
        ["Resting metabolic rate", DASH],
      ]
    : [
        ["Protein", `${g0(result.proteinGrams)} · ${pct(result.proteinShare)}`],
        ["Fat (olive-oil led)", `${g0(result.fatGrams)} · ${pct(result.fatShare)}`],
        ["Carbohydrate", `${g0(result.carbGrams)} · ${pct(result.carbShare)}`],
        ["Protein per kg body weight", `${NUM1.format(result.proteinPerKg)} g/kg`],
        [
          "Olive oil",
          `${NUM1.format(result.oliveOilTbsp)} tbsp · ${NUM0.format(result.oliveOilMl)} mL`,
        ],
        [
          "Mixed nuts (PREDIMED serving)",
          result.nutsIncluded
            ? `${g0(result.nutsGrams)} · ${NUM0.format(result.nutsKcal)} kcal`
            : "Not included",
        ],
        ["Fat from fish, dairy and whole foods", g0(result.wholeFoodFatGrams)],
        ["Saturated fat ceiling (under 10% of energy)", g0(result.satFatMaxGrams)],
        ["Fibre target (14 g per 1,000 kcal)", g0(result.fibreTargetG)],
        ["Resting metabolic rate", `${NUM0.format(result.bmr)} kcal`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Leaf className="h-4 w-4" aria-hidden="true" />
          Mediterranean pattern
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mediterranean Diet Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns your body size and activity into Mediterranean-style calories and macros — a higher
          fat, olive-oil-led split — then converts the fat budget into daily tablespoons of olive oil
          alongside the 30 g mixed-nut serving used in the PREDIMED trial.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="med-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="med-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-age">
              Age (years)
            </label>
            <input
              id="med-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-weight">
              Weight (kg)
            </label>
            <input
              id="med-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="35"
              max="250"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-height">
              Height (cm)
            </label>
            <input
              id="med-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="130"
              max="230"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-activity">
              Activity level
            </label>
            <select
              id="med-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {Object.entries(ACTIVITY_FACTORS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-goal">
              Goal
            </label>
            <select
              id="med-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {Object.entries(GOALS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-fat">
              Fat share of calories (%)
            </label>
            <input
              id="med-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MED_SHARES.fat.min * 100}
              max={MED_SHARES.fat.max * 100}
              step="1"
              value={fatPercent}
              onChange={(event) => setFatPercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Traditional pattern: 35-40%, mostly monounsaturated.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-protein">
              Protein share of calories (%)
            </label>
            <input
              id="med-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MED_SHARES.protein.min * 100}
              max={MED_SHARES.protein.max * 100}
              step="1"
              value={proteinPercent}
              onChange={(event) => setProteinPercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Typically 15-18%, largely fish, legumes and dairy.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="med-oliveoil">
              Share of fat from olive oil (%)
            </label>
            <input
              id="med-oliveoil"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="90"
              step="5"
              value={oliveOilPercent}
              onChange={(event) => setOliveOilPercent(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="med-nuts"
            >
              <input
                id="med-nuts"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeNuts}
                onChange={(event) => setIncludeNuts(event.target.checked)}
              />
              Include 30 g mixed nuts daily
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
              {hasError ? DASH : `${NUM0.format(result.calories)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `${NUM1.format(result.oliveOilTbsp)} tbsp of olive oil a day across your main meals`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Mediterranean macro result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
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

        {!hasError && (
          <>
            <div className="mt-5">
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Carbohydrate ${pct(result.carbShare)}, fat ${pct(result.fatShare)}, protein ${pct(result.proteinShare)} of calories`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${result.carbShare * 100}%` }}
                />
                <span
                  className="block h-full bg-[var(--success)]"
                  style={{ width: `${result.fatShare * 100}%` }}
                />
                <span
                  className="block h-full bg-[var(--muted-foreground)]"
                  style={{ width: `${result.proteinShare * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Carbs {pct(result.carbShare)} · Fat {pct(result.fatShare)} · Protein{" "}
                {pct(result.proteinShare)}
              </p>
            </div>

            {(result.oliveOilBelowPyramid || result.oliveOilAbovePyramid) && (
              <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
                The Mediterranean Diet Pyramid puts {PYRAMID_OLIVE_OIL_TBSP.min}-
                {PYRAMID_OLIVE_OIL_TBSP.max} tablespoons of olive oil a day at the base of every main
                meal, and PREDIMED supplied {result.predimedEvooMl} mL a day. Your plan lands{" "}
                {result.oliveOilBelowPyramid ? "below" : "above"} that band — change the olive-oil
                share if you want to match it.
              </p>
            )}
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Weekly pattern from the Mediterranean pyramid</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Food group
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Frequency
                </th>
              </tr>
            </thead>
            <tbody>
              {WEEKLY_PATTERN.map(([food, frequency]) => (
                <tr key={food} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{food}</td>
                  <td className="py-2 text-right font-semibold">{frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates based on the Mifflin-St Jeor equation and the published Mediterranean
        Diet Pyramid. Real energy needs vary by roughly 10% either side of any prediction equation.
        Speak to a doctor or registered dietitian before changing your diet if you are pregnant or
        managing diabetes, kidney disease or a heart condition.
      </p>
    </main>
  );
}
