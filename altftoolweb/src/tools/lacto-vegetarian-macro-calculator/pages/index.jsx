"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Milk, RotateCcw } from "lucide-react";

import {
  ACTIVITY_FACTORS,
  CURD_KATORI_GRAMS,
  GOALS,
  MILK_TYPES,
  lactoVegetarianPlan,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const g0 = (value) => `${NUM0.format(value)} g`;
const g1 = (value) => `${NUM1.format(value)} g`;
const pct = (fraction) => `${NUM0.format(fraction * 100)}%`;

const DASH = "—";

const DEFAULTS = {
  sex: "female",
  age: "32",
  weightKg: "62",
  heightCm: "160",
  activity: "moderate",
  goal: "maintain",
  proteinPerKg: "1.1",
  fatPercent: "28",
  milkType: "toned",
  milkMl: "500",
  curdKatoris: "1",
  paneerG: "100",
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
  const [milkType, setMilkType] = useState(DEFAULTS.milkType);
  const [milkMl, setMilkMl] = useState(DEFAULTS.milkMl);
  const [curdKatoris, setCurdKatoris] = useState(DEFAULTS.curdKatoris);
  const [paneerG, setPaneerG] = useState(DEFAULTS.paneerG);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      lactoVegetarianPlan({
        sex,
        age: toNumber(age),
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        activity,
        goal,
        proteinPerKg: toNumber(proteinPerKg),
        fatShare: toNumber(fatPercent) / 100,
        milkType,
        milkMl: toNumber(milkMl),
        curdKatoris: toNumber(curdKatoris),
        paneerG: toNumber(paneerG),
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
      milkType,
      milkMl,
      curdKatoris,
      paneerG,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Lacto-Vegetarian Macro Calculator",
      `Daily calories: ${NUM0.format(result.calories)} kcal`,
      `Protein to eat: ${g0(result.proteinGrams)} (${pct(result.proteinShare)})`,
      `  from dairy: ${g1(result.dairyProtein)}`,
      `  from plants: ${g1(result.plantProteinToEat)}`,
      `Fat: ${g0(result.fatGrams)} · Carbohydrate: ${g0(result.carbGrams)}`,
      `Calcium from dairy: ${NUM0.format(result.calciumMg)} mg (${pct(result.calciumShareOfRda)} of RDA)`,
      `Vitamin B12 from dairy: ${NUM1.format(result.b12Mcg)} mcg (${pct(result.b12ShareOfRda)} of RDA)`,
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
    setProteinPerKg(DEFAULTS.proteinPerKg);
    setFatPercent(DEFAULTS.fatPercent);
    setMilkType(DEFAULTS.milkType);
    setMilkMl(DEFAULTS.milkMl);
    setCurdKatoris(DEFAULTS.curdKatoris);
    setPaneerG(DEFAULTS.paneerG);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Protein to eat", DASH],
        ["…from milk, curd and paneer", DASH],
        ["…from dal, soya, nuts and grains", DASH],
        ["Usable protein target", DASH],
        ["Fat", DASH],
        ["Carbohydrate", DASH],
        ["Calories already used by dairy", DASH],
        ["Calcium from dairy", DASH],
        ["Vitamin B12 from dairy", DASH],
        ["Saturated fat from dairy", DASH],
        ["Fibre target (14 g per 1,000 kcal)", DASH],
      ]
    : [
        ["Protein to eat", `${g0(result.proteinGrams)} · ${pct(result.proteinShare)}`],
        ["…from milk, curd and paneer", g1(result.dairyProtein)],
        ["…from dal, soya, nuts and grains", g1(result.plantProteinToEat)],
        ["Usable protein target", g1(result.usableProteinTarget)],
        ["Fat", `${g0(result.fatGrams)} · ${pct(result.fatShare)}`],
        ["Carbohydrate", `${g0(result.carbGrams)} · ${pct(result.carbShare)}`],
        ["Calories already used by dairy", `${NUM0.format(result.dairyKcal)} kcal`],
        [
          "Calcium from dairy",
          `${NUM0.format(result.calciumMg)} mg · ${pct(result.calciumShareOfRda)} of RDA`,
        ],
        [
          "Vitamin B12 from dairy",
          `${NUM1.format(result.b12Mcg)} mcg · ${pct(result.b12ShareOfRda)} of RDA`,
        ],
        [
          "Saturated fat from dairy",
          `${g1(result.dairySaturatedFat)} of a ${g0(result.satFatMaxGrams)} ceiling`,
        ],
        ["Fibre target (14 g per 1,000 kcal)", g0(result.fibreTargetG)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Milk className="h-4 w-4" aria-hidden="true" />
          Lacto-vegetarian
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Lacto-Vegetarian Macro Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set your daily calories and macros, then see how much of your protein your milk, curd and
          paneer already deliver — and how many grams still have to come from dal, soya and nuts,
          with the 12.5% uplift plant protein needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lv-sex">
              Sex (for the BMR equation)
            </label>
            <select
              id="lv-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lv-age">
              Age (years)
            </label>
            <input
              id="lv-age"
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
            <label className={LABEL_CLASS} htmlFor="lv-weight">
              Weight (kg)
            </label>
            <input
              id="lv-weight"
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
            <label className={LABEL_CLASS} htmlFor="lv-height">
              Height (cm)
            </label>
            <input
              id="lv-height"
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
            <label className={LABEL_CLASS} htmlFor="lv-activity">
              Activity level
            </label>
            <select
              id="lv-activity"
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
            <label className={LABEL_CLASS} htmlFor="lv-goal">
              Goal
            </label>
            <select
              id="lv-goal"
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
            <label className={LABEL_CLASS} htmlFor="lv-protein">
              Protein target (g per kg)
            </label>
            <input
              id="lv-protein"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.8"
              max="2.2"
              step="0.05"
              value={proteinPerKg}
              onChange={(event) => setProteinPerKg(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              0.8 g/kg is the RDA floor; 1.0-1.4 suits most active vegetarians.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lv-fat">
              Fat share of calories (%)
            </label>
            <input
              id="lv-fat"
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
        <h2 className="text-base font-semibold">Your daily dairy</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lv-milktype">
              Milk type
            </label>
            <select
              id="lv-milktype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={milkType}
              onChange={(event) => setMilkType(event.target.value)}
            >
              {Object.entries(MILK_TYPES).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lv-milkml">
              Milk (mL a day)
            </label>
            <input
              id="lv-milkml"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2000"
              step="50"
              value={milkMl}
              onChange={(event) => setMilkMl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lv-curd">
              Curd / dahi (katoris a day)
            </label>
            <input
              id="lv-curd"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="8"
              step="0.5"
              value={curdKatoris}
              onChange={(event) => setCurdKatoris(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              One katori is counted as {CURD_KATORI_GRAMS} g.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lv-paneer">
              Paneer (g a day)
            </label>
            <input
              id="lv-paneer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="500"
              step="10"
              value={paneerG}
              onChange={(event) => setPaneerG(event.target.value)}
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
              Protein to eat each day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : g0(result.proteinGrams)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `${NUM0.format(result.calories)} kcal a day · ${pct(result.dairyShareOfProtein)} of the protein comes from dairy`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy lacto-vegetarian macro result"
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
                aria-label={`Dairy supplies ${pct(result.dairyShareOfProtein)} of the protein, plants the rest`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.min(100, result.dairyShareOfProtein * 100)}%` }}
                />
                <span
                  className="block h-full bg-[var(--success)]"
                  style={{ width: `${Math.max(0, 100 - result.dairyShareOfProtein * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Dairy {pct(result.dairyShareOfProtein)} · Plants{" "}
                {pct(Math.max(0, 1 - result.dairyShareOfProtein))}
              </p>
            </div>

            {result.dairyCoversTarget && (
              <p className={NOTE_CLASS}>
                Your dairy alone already meets the whole protein target, so nothing extra is needed
                from plants. Dal and legumes still matter for fibre, iron and folate.
              </p>
            )}
            {result.fatBudgetExceeded && (
              <p className={NOTE_CLASS}>
                Milk, curd and paneer supply {g1(result.dairyFat)} of fat, more than the whole
                day&apos;s fat budget of {g1(result.fatGrams)}. Switch to a lower-fat milk, cut the
                paneer, or raise the fat share.
              </p>
            )}
            {result.satFatOverCeiling && (
              <p className={NOTE_CLASS}>
                Milk fat is about 65% saturated, so your dairy contributes roughly{" "}
                {g1(result.dairySaturatedFat)} of saturated fat against a 10%-of-energy ceiling of{" "}
                {g0(result.satFatMaxGrams)}. Double-toned milk and less paneer bring it down.
              </p>
            )}
            {result.b12ShareOfRda < 1 && (
              <p className={NOTE_CLASS}>
                Your dairy supplies {NUM1.format(result.b12Mcg)} mcg of vitamin B12, below the 2.4
                mcg adult RDA. B12 is essentially absent from plant foods, so lacto-vegetarians
                eating little dairy usually need fortified foods or a supplement — ask your doctor
                about testing rather than guessing.
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates. Dairy composition follows the FSSAI milk classes and typical
        published values for curd and paneer; brands differ, so check the pack. Speak to a doctor or
        registered dietitian before large dietary changes, particularly with kidney disease,
        diabetes or lactose intolerance.
      </p>
    </main>
  );
}
