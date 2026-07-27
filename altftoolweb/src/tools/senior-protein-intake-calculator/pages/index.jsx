"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import { HEALTH_STATUS, TRAINING_LEVELS, seniorProteinTarget } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const g0 = (value) => `${NUM0.format(value)} g`;
const g1 = (value) => `${NUM1.format(value)} g`;

const DASH = "—";

const DEFAULTS = {
  sex: "male",
  age: "72",
  weightKg: "70",
  heightCm: "170",
  healthStatus: "healthy",
  training: "some",
  mealsPerDay: "3",
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

/** Portions of everyday foods and the protein they carry, for meal planning. */
const PROTEIN_PORTIONS = [
  ["1 large egg", "6 g"],
  ["250 mL toned milk", "8 g"],
  ["1 katori (150 g) curd", "5 g"],
  ["100 g paneer", "18 g"],
  ["1 katori (150 g) cooked dal", "6 g"],
  ["100 g cooked chicken breast", "31 g"],
  ["100 g cooked fish", "22 g"],
  ["30 g whey protein powder", "24 g"],
];

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
  const [healthStatus, setHealthStatus] = useState(DEFAULTS.healthStatus);
  const [training, setTraining] = useState(DEFAULTS.training);
  const [mealsPerDay, setMealsPerDay] = useState(DEFAULTS.mealsPerDay);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      seniorProteinTarget({
        sex,
        age: toNumber(age),
        weightKg: toNumber(weightKg),
        heightCm: toNumber(heightCm),
        healthStatus,
        training,
        mealsPerDay: toNumber(mealsPerDay),
      }),
    [sex, age, weightKg, heightCm, healthStatus, training, mealsPerDay],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Senior Protein Intake Calculator",
      `Recommended: ${g0(result.recommendedGrams)} of protein a day`,
      `Range: ${g0(result.minGrams)} to ${g0(result.maxGrams)} (${result.minPerKg}-${result.maxPerKg} g/kg)`,
      `Dosing weight: ${NUM1.format(result.dosingWeightKg)} kg${result.usesAdjustedWeight ? " (adjusted body weight)" : ""}`,
      `Per meal across ${result.mealsPerDay} meals: ${g0(result.perMealGrams)}`,
      `Adult RDA for comparison: ${g0(result.rdaGrams)} (0.8 g/kg)`,
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
    setHealthStatus(DEFAULTS.healthStatus);
    setTraining(DEFAULTS.training);
    setMealsPerDay(DEFAULTS.mealsPerDay);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Daily range", DASH],
        ["Protein per kg", DASH],
        ["Per meal", DASH],
        ["Per-meal dose at 0.40 g/kg", DASH],
        ["Adult RDA (0.8 g/kg) for comparison", DASH],
        ["Extra above the RDA", DASH],
        ["Dosing weight used", DASH],
        ["Ideal body weight (Devine)", DASH],
        ["BMI", DASH],
      ]
    : [
        ["Daily range", `${g0(result.minGrams)} to ${g0(result.maxGrams)}`],
        ["Protein per kg", `${result.minPerKg} to ${result.maxPerKg} g/kg`],
        ["Per meal", `${g0(result.perMealGrams)} across ${result.mealsPerDay} meals`],
        ["Per-meal dose at 0.40 g/kg", g0(result.perMealMooreGrams)],
        ["Adult RDA (0.8 g/kg) for comparison", g0(result.rdaGrams)],
        [
          "Extra above the RDA",
          `${g0(result.extraOverRdaGrams)} · ${NUM1.format(result.multipleOfRda)}x the RDA`,
        ],
        [
          "Dosing weight used",
          `${NUM1.format(result.dosingWeightKg)} kg${result.usesAdjustedWeight ? " (adjusted)" : " (actual)"}`,
        ],
        ["Ideal body weight (Devine)", `${NUM1.format(result.idealBodyWeightKg)} kg`],
        ["BMI", NUM1.format(result.bmi)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Ages 60 and over
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Senior Protein Intake Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Daily protein for older adults using the PROT-AGE and ESPEN bands — 1.0-1.2 g/kg when
          healthy, more with illness — plus the per-meal dose ageing muscle actually needs to
          respond.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-sex">
              Sex (for ideal body weight)
            </label>
            <select
              id="sp-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-age">
              Age (years)
            </label>
            <input
              id="sp-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="60"
              max="110"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-weight">
              Weight (kg)
            </label>
            <input
              id="sp-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="250"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-height">
              Height (cm)
            </label>
            <input
              id="sp-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="220"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sp-status">
              Health status
            </label>
            <select
              id="sp-status"
              className={`mt-2 ${INPUT_CLASS}`}
              value={healthStatus}
              onChange={(event) => setHealthStatus(event.target.value)}
            >
              {Object.entries(HEALTH_STATUS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-training">
              Resistance training
            </label>
            <select
              id="sp-training"
              className={`mt-2 ${INPUT_CLASS}`}
              value={training}
              onChange={(event) => setTraining(event.target.value)}
            >
              {Object.entries(TRAINING_LEVELS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-meals">
              Protein meals a day
            </label>
            <input
              id="sp-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="6"
              step="1"
              value={mealsPerDay}
              onChange={(event) => setMealsPerDay(event.target.value)}
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
              Protein a day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : g0(result.recommendedGrams)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your target."
                : `${g0(result.minGrams)} to ${g0(result.maxGrams)} · ${g0(result.perMealGrams)} at each of ${result.mealsPerDay} meals`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy senior protein target"
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
            <p className={NOTE_CLASS}>{result.statusNote}</p>
            {result.restricted && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                With severe kidney disease, protein is restricted rather than raised. The figure
                shown is only the standard 0.8 g/kg RDA — your own target must be set by your kidney
                team, not by a calculator.
              </p>
            )}
            {result.perMealBelowThreshold && !result.restricted && (
              <p className={NOTE_CLASS}>
                At {result.mealsPerDay} meals a day each meal carries {g0(result.perMealGrams)},
                below the {result.perMealThresholdG.min}-{result.perMealThresholdG.max} g that older
                muscle needs to respond. Concentrating the same total into{" "}
                {Math.max(2, result.mealsToClearThreshold)} larger protein meals usually works
                better than spreading it thin.
              </p>
            )}
            {result.usesAdjustedWeight && (
              <p className={NOTE_CLASS}>
                At a BMI of {NUM1.format(result.bmi)} the target is dosed on adjusted body weight of{" "}
                {NUM1.format(result.dosingWeightKg)} kg rather than actual weight, because dosing on
                actual weight over-estimates lean mass.
              </p>
            )}
            <p className={NOTE_CLASS}>
              A {result.perMealThresholdG.min}-{result.perMealThresholdG.max} g high-quality protein
              meal carries roughly {result.perMealLeucineG.min}-{result.perMealLeucineG.max} g of
              leucine, which is the amino acid that actually triggers the muscle-building response.
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a protein portion looks like</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Portion
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Protein
                </th>
              </tr>
            </thead>
            <tbody>
              {PROTEIN_PORTIONS.map(([food, protein]) => (
                <tr key={food} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{food}</td>
                  <td className="py-2 text-right font-semibold">{protein}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the published PROT-AGE and ESPEN recommendations. It is not
        medical or dietetic advice and does not account for medication, swallowing difficulty or
        kidney function. Talk to your doctor or a registered dietitian before changing protein
        intake, particularly with kidney, liver or metabolic disease.
      </p>
    </main>
  );
}
