"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fish, RotateCcw } from "lucide-react";

import {
  ACTIVITY_FACTORS,
  FISH_TYPES,
  GOALS,
  HIGH_MERCURY_FISH,
  pescatarianPlan,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const g0 = (value) => `${NUM0.format(value)} g`;
const g1 = (value) => `${NUM1.format(value)} g`;
const pct = (fraction) => `${NUM0.format(fraction * 100)}%`;

const DASH = "—";

const DEFAULTS = {
  sex: "male",
  age: "30",
  weightKg: "70",
  heightCm: "175",
  activity: "moderate",
  goal: "maintain",
  proteinPerKg: "1.4",
  fatPercent: "28",
  fishType: "salmon",
  servingsPerWeek: "3",
  servingGrams: "120",
  otherProteinG: "20",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const NOTE_CLASS =
  "mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]";

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
  const [proteinPerKg, setProteinPerKg] = useState(DEFAULTS.proteinPerKg);
  const [fatPercent, setFatPercent] = useState(DEFAULTS.fatPercent);
  const [fishType, setFishType] = useState(DEFAULTS.fishType);
  const [servingsPerWeek, setServingsPerWeek] = useState(DEFAULTS.servingsPerWeek);
  const [servingGrams, setServingGrams] = useState(DEFAULTS.servingGrams);
  const [otherProteinG, setOtherProteinG] = useState(DEFAULTS.otherProteinG);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      pescatarianPlan({
        sex,
        age: toNumber(age),
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        activity,
        goal,
        proteinPerKg: toNumber(proteinPerKg),
        fatShare: toNumber(fatPercent) / 100,
        fishType,
        servingsPerWeek: toNumber(servingsPerWeek),
        servingGrams: toNumber(servingGrams),
        otherProteinG: toNumber(otherProteinG),
      }),
    [
      sex,
      age,
      weightKg,
      heightCm,
      activity,
      goal,
      proteinPerKg,
      fatPercent,
      fishType,
      servingsPerWeek,
      servingGrams,
      otherProteinG,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pescatarian Macro Calculator",
      `Daily calories: ${NUM0.format(result.calories)} kcal`,
      `Fish: ${result.fishLabel}, ${NUM0.format(result.fishGramsPerWeek)} g a week`,
      `EPA + DHA: ${NUM0.format(result.epaDhaPerDayMg)} mg a day (${pct(result.epaDhaShareOfTarget)} of the 250 mg target)`,
      `Protein to eat: ${g0(result.proteinGrams)}`,
      `  from fish: ${g1(result.fishProteinPerDay)}`,
      `  from eggs and dairy: ${g1(result.otherProteinG)}`,
      `  from plants: ${g1(result.plantProteinToEat)}`,
      `Fat: ${g0(result.fatGrams)} · Carbohydrate: ${g0(result.carbGrams)}`,
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
    setProteinPerKg(DEFAULTS.proteinPerKg);
    setFatPercent(DEFAULTS.fatPercent);
    setFishType(DEFAULTS.fishType);
    setServingsPerWeek(DEFAULTS.servingsPerWeek);
    setServingGrams(DEFAULTS.servingGrams);
    setOtherProteinG(DEFAULTS.otherProteinG);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["EPA + DHA a day", DASH],
        ["Fish eaten a week", DASH],
        ["Protein from fish (daily average)", DASH],
        ["Protein from eggs and dairy", DASH],
        ["Protein from dal, soya and grains", DASH],
        ["Total protein to eat", DASH],
        ["Fat", DASH],
        ["Carbohydrate", DASH],
        ["Calories from fish (daily average)", DASH],
        ["Fish needed a week for 250 mg/day", DASH],
        ["Fibre target (14 g per 1,000 kcal)", DASH],
      ]
    : [
        [
          "EPA + DHA a day",
          `${NUM0.format(result.epaDhaPerDayMg)} mg · ${pct(result.epaDhaShareOfTarget)} of target`,
        ],
        ["Fish eaten a week", g0(result.fishGramsPerWeek)],
        ["Protein from fish (daily average)", g1(result.fishProteinPerDay)],
        ["Protein from eggs and dairy", g1(result.otherProteinG)],
        ["Protein from dal, soya and grains", g1(result.plantProteinToEat)],
        ["Total protein to eat", `${g0(result.proteinGrams)} · ${pct(result.proteinShare)}`],
        ["Fat", `${g0(result.fatGrams)} · ${pct(result.fatShare)}`],
        ["Carbohydrate", `${g0(result.carbGrams)} · ${pct(result.carbShare)}`],
        [
          "Calories from fish (daily average)",
          `${NUM0.format(result.fishKcalPerDay)} kcal · ${g1(result.fishFatPerDay)} fat`,
        ],
        [
          "Fish needed a week for 250 mg/day",
          `${g0(result.gramsForTarget)} · ${NUM1.format(result.servingsForTarget)} servings`,
        ],
        ["Fibre target (14 g per 1,000 kcal)", g0(result.fibreTargetG)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fish className="h-4 w-4" aria-hidden="true" />
          Fish-forward eating
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pescatarian Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sets your daily calories and macros, then turns a weekly fish habit into daily protein and
          EPA + DHA — and shows how much of your chosen species it would actually take to reach the
          250 mg a day omega-3 intake.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="pe-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-age">
              Age (years)
            </label>
            <input
              id="pe-age"
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
            <label className={LABEL_CLASS} htmlFor="pe-weight">
              Weight (kg)
            </label>
            <input
              id="pe-weight"
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
            <label className={LABEL_CLASS} htmlFor="pe-height">
              Height (cm)
            </label>
            <input
              id="pe-height"
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
            <label className={LABEL_CLASS} htmlFor="pe-activity">
              Activity level
            </label>
            <select
              id="pe-activity"
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
            <label className={LABEL_CLASS} htmlFor="pe-goal">
              Goal
            </label>
            <select
              id="pe-goal"
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
            <label className={LABEL_CLASS} htmlFor="pe-protein">
              Protein target (g per kg)
            </label>
            <input
              id="pe-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.8"
              max="2.2"
              step="0.05"
              value={proteinPerKg}
              onChange={(event) => setProteinPerKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-fat">
              Fat share of calories (%)
            </label>
            <input
              id="pe-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="15"
              max="45"
              step="1"
              value={fatPercent}
              onChange={(event) => setFatPercent(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your fish habit</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-fish">
              Fish or seafood
            </label>
            <select
              id="pe-fish"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fishType}
              onChange={(event) => setFishType(event.target.value)}
            >
              {Object.entries(FISH_TYPES).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-servings">
              Servings a week
            </label>
            <input
              id="pe-servings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="14"
              step="1"
              value={servingsPerWeek}
              onChange={(event) => setServingsPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-serving-grams">
              Serving size (g cooked)
            </label>
            <input
              id="pe-serving-grams"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="400"
              step="10"
              value={servingGrams}
              onChange={(event) => setServingGrams(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              A standard serving in guidelines is about 100 g cooked.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-other">
              Protein from eggs and dairy (g a day)
            </label>
            <input
              id="pe-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="150"
              step="1"
              value={otherProteinG}
              onChange={(event) => setOtherProteinG(event.target.value)}
            />
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
              EPA + DHA a day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.epaDhaPerDayMg)} mg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `${result.meetsOmega3Target ? "Meets" : "Below"} the ${result.epaDhaTargetMg} mg a day adequate intake · ${g0(result.proteinGrams)} protein target`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy pescatarian macro result"
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
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Omega-3 intake is ${pct(result.epaDhaShareOfTarget)} of the 250 mg a day target`}
              >
                <span
                  className={`block h-full ${result.meetsOmega3Target ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                  style={{ width: `${Math.min(100, result.epaDhaShareOfTarget * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {pct(result.epaDhaShareOfTarget)} of the 250 mg a day EPA + DHA adequate intake
              </p>
            </div>

            {!result.meetsOmega3Target && (
              <p className={NOTE_CLASS}>
                {result.fishLabel} supplies {NUM0.format(result.fishEpaDhaPer100g)} mg of EPA + DHA
                per 100 g, so reaching 250 mg a day on this fish alone would take about{" "}
                {g0(result.gramsForTarget)} a week — roughly{" "}
                {NUM1.format(result.servingsForTarget)} of your current servings. Oily fish such as
                salmon, mackerel or sardines get there far faster.
              </p>
            )}
            {!result.meetsAhaServings && (
              <p className={NOTE_CLASS}>
                You are below the American Heart Association&apos;s advice of at least{" "}
                {result.ahaServingsPerWeek} fish servings a week.
              </p>
            )}
            {result.highQualityCoversTarget && (
              <p className={NOTE_CLASS}>
                Fish, eggs and dairy alone already meet the protein target, so no extra plant protein
                is strictly needed — though legumes and whole grains still carry the fibre.
              </p>
            )}
            {result.nonFishFat < 0 && (
              <p className={NOTE_CLASS}>
                The fish averages {g1(result.fishFatPerDay)} of fat a day, more than the whole fat
                budget of {g1(result.fatGrams)}. Raise the fat share or pick a leaner fish.
              </p>
            )}
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">High-mercury fish to avoid in pregnancy</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The US FDA and EPA advise pregnant and breastfeeding people and young children to avoid
          these species entirely, while still eating two to three weekly servings of lower-mercury
          choices.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {HIGH_MERCURY_FISH.map((name) => (
            <li
              key={name}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm capitalize"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates using USDA composition data and the Mifflin-St Jeor equation. Farmed
        and wild fish differ in fat and omega-3 content, and cooking method changes both. Talk to a
        doctor or registered dietitian before changing your diet, especially during pregnancy or
        with a medical condition.
      </p>
    </main>
  );
}
