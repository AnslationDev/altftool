"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Egg, RotateCcw } from "lucide-react";

import { ACTIVITY_FACTORS, EGG_SIZES, GOALS, eggetarianPlan } from "../lib";

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
  proteinPerKg: "1.2",
  fatPercent: "28",
  eggSize: "large",
  eggSharePercent: "35",
  extraWhites: "0",
  dairyProteinG: "16",
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
  const [eggSize, setEggSize] = useState(DEFAULTS.eggSize);
  const [eggSharePercent, setEggSharePercent] = useState(DEFAULTS.eggSharePercent);
  const [extraWhites, setExtraWhites] = useState(DEFAULTS.extraWhites);
  const [dairyProteinG, setDairyProteinG] = useState(DEFAULTS.dairyProteinG);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      eggetarianPlan({
        sex,
        age: toNumber(age),
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        activity,
        goal,
        proteinPerKg: toNumber(proteinPerKg),
        fatShare: toNumber(fatPercent) / 100,
        eggSize,
        eggShare: toNumber(eggSharePercent) / 100,
        extraWhites: toNumber(extraWhites),
        dairyProteinG: toNumber(dairyProteinG),
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
      eggSize,
      eggSharePercent,
      extraWhites,
      dairyProteinG,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Eggetarian Macro Calculator",
      `Daily calories: ${NUM0.format(result.calories)} kcal`,
      `Eggs a day: ${result.wholeEggsPractical} whole${result.extraWhites > 0 ? ` + ${result.extraWhites} whites` : ""}`,
      `Protein to eat: ${g0(result.proteinGrams)}`,
      `  from eggs: ${g1(result.eggProteinActual)}`,
      `  from dairy: ${g1(result.dairyProteinG)}`,
      `  from plants: ${g1(result.plantProteinToEat)}`,
      `Fat: ${g0(result.fatGrams)} · Carbohydrate: ${g0(result.carbGrams)}`,
      `Cholesterol from eggs: ${NUM0.format(result.cholesterolMg)} mg`,
      `Choline: ${NUM0.format(result.cholineMg)} mg · B12: ${NUM1.format(result.b12Mcg)} mcg`,
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
    setEggSize(DEFAULTS.eggSize);
    setEggSharePercent(DEFAULTS.eggSharePercent);
    setExtraWhites(DEFAULTS.extraWhites);
    setDairyProteinG(DEFAULTS.dairyProteinG);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Whole eggs a day", DASH],
        ["Extra egg whites", DASH],
        ["Protein from eggs", DASH],
        ["Protein from dairy", DASH],
        ["Protein from dal, soya and grains", DASH],
        ["Total protein to eat", DASH],
        ["Fat", DASH],
        ["Carbohydrate", DASH],
        ["Calories from eggs", DASH],
        ["Cholesterol from yolks", DASH],
        ["Choline", DASH],
        ["Vitamin B12", DASH],
        ["Vitamin D", DASH],
        ["Fibre target (14 g per 1,000 kcal)", DASH],
      ]
    : [
        ["Whole eggs a day", `${result.wholeEggsPractical} (${NUM1.format(result.wholeEggsExact)} exactly)`],
        ["Extra egg whites", `${result.extraWhites}`],
        [
          "Protein from eggs",
          `${g1(result.eggProteinActual)} · ${pct(result.eggShareAchieved)} of target`,
        ],
        ["Protein from dairy", g1(result.dairyProteinG)],
        ["Protein from dal, soya and grains", g1(result.plantProteinToEat)],
        ["Total protein to eat", `${g0(result.proteinGrams)} · ${pct(result.proteinShare)}`],
        ["Fat", `${g0(result.fatGrams)} · ${pct(result.fatShare)}`],
        ["Carbohydrate", `${g0(result.carbGrams)} · ${pct(result.carbShare)}`],
        ["Calories from eggs", `${NUM0.format(result.eggKcal)} kcal · ${g1(result.eggFat)} fat`],
        [
          "Cholesterol from yolks",
          `${NUM0.format(result.cholesterolMg)} mg (${NUM0.format(result.cholesterolPerEgg)} mg per egg)`,
        ],
        [
          "Choline",
          `${NUM0.format(result.cholineMg)} mg · ${pct(result.cholineShareOfAi)} of the ${result.cholineAiMg} mg AI`,
        ],
        [
          "Vitamin B12",
          `${NUM1.format(result.b12Mcg)} mcg · ${pct(result.b12ShareOfRda)} of RDA`,
        ],
        [
          "Vitamin D",
          `${NUM1.format(result.vitaminDMcg)} mcg · ${pct(result.vitaminDShareOfRda)} of RDA`,
        ],
        ["Fibre target (14 g per 1,000 kcal)", g0(result.fibreTargetG)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Egg className="h-4 w-4" aria-hidden="true" />
          Vegetarian plus eggs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Eggetarian Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns your protein target into an actual number of eggs a day, splits whole eggs from
          extra whites so you can lift protein without lifting cholesterol, and totals the choline,
          B12 and vitamin D the yolks bring along.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-sex">
              Sex (for BMR and the choline AI)
            </label>
            <select
              id="eg-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-age">
              Age (years)
            </label>
            <input
              id="eg-age"
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
            <label className={LABEL_CLASS} htmlFor="eg-weight">
              Weight (kg)
            </label>
            <input
              id="eg-weight"
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
            <label className={LABEL_CLASS} htmlFor="eg-height">
              Height (cm)
            </label>
            <input
              id="eg-height"
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
            <label className={LABEL_CLASS} htmlFor="eg-activity">
              Activity level
            </label>
            <select
              id="eg-activity"
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
            <label className={LABEL_CLASS} htmlFor="eg-goal">
              Goal
            </label>
            <select
              id="eg-goal"
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
            <label className={LABEL_CLASS} htmlFor="eg-protein">
              Protein target (g per kg)
            </label>
            <input
              id="eg-protein"
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
            <label className={LABEL_CLASS} htmlFor="eg-fat">
              Fat share of calories (%)
            </label>
            <input
              id="eg-fat"
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
        <h2 className="text-base font-semibold">Eggs and other protein</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-size">
              Egg size
            </label>
            <select
              id="eg-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={eggSize}
              onChange={(event) => setEggSize(event.target.value)}
            >
              {Object.entries(EGG_SIZES).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-share">
              Share of protein from eggs (%)
            </label>
            <input
              id="eg-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="80"
              step="5"
              value={eggSharePercent}
              onChange={(event) => setEggSharePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-whites">
              Extra egg whites a day
            </label>
            <input
              id="eg-whites"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="12"
              step="1"
              value={extraWhites}
              onChange={(event) => setExtraWhites(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Whites are counted first, so they reduce the whole eggs needed.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eg-dairy">
              Protein from dairy (g a day)
            </label>
            <input
              id="eg-dairy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="120"
              step="1"
              value={dairyProteinG}
              onChange={(event) => setDairyProteinG(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              500 mL of toned milk is about 16 g; 100 g of paneer about 18 g.
            </p>
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
              Whole eggs a day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.wholeEggsPractical}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `${g1(result.proteinPerEgg)} of protein each · ${NUM0.format(result.calories)} kcal a day overall`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy eggetarian macro result"
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
            {result.cholesterolOverReference && (
              <p className={NOTE_CLASS}>
                {result.wholeEggsPractical} yolks carry {NUM0.format(result.cholesterolMg)} mg of
                cholesterol, above the {result.cholesterolReferenceMg} mg marker that US guidelines
                used until 2015. Each whole egg you swap for a white removes{" "}
                {NUM0.format(result.cholesterolPerEgg)} mg while keeping{" "}
                {g1(result.proteinPerWhite)} of protein. If you have raised LDL cholesterol or
                diabetes, discuss egg intake with your doctor.
              </p>
            )}
            {result.highQualityCoversTarget && (
              <p className={NOTE_CLASS}>
                Eggs and dairy alone already meet the protein target, so no extra plant protein is
                strictly needed. Dal, rajma and whole grains still matter for fibre, folate and
                iron.
              </p>
            )}
            {result.nonEggFat < 0 && (
              <p className={NOTE_CLASS}>
                The eggs supply {g1(result.eggFat)} of fat, more than the day&apos;s whole fat budget
                of {g1(result.fatGrams)}. Use more whites, or raise the fat share.
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates using USDA egg composition and the Mifflin-St Jeor equation. Egg
        weight varies by grade and region, so the size you pick changes every figure here. This is
        not medical advice — talk to a doctor or registered dietitian about egg intake if you manage
        cholesterol, diabetes or heart disease.
      </p>
    </main>
  );
}
