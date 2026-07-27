"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import { STAGES, pregnancyProteinTarget } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const g0 = (value) => `${NUM0.format(value)} g`;
const g1 = (value) => `${NUM1.format(value)} g`;

const DASH = "—";

const DEFAULTS = {
  prePregnancyWeightKg: "60",
  heightCm: "162",
  stage: "trimester2",
  twins: false,
  mealsPerDay: "4",
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

/** Everyday portions and the protein they carry, for building the daily total. */
const PROTEIN_PORTIONS = [
  ["1 large egg", "6 g"],
  ["250 mL toned milk", "8 g"],
  ["1 katori (150 g) curd", "5 g"],
  ["100 g paneer", "18 g"],
  ["1 katori (150 g) cooked dal", "6 g"],
  ["100 g cooked chicken breast", "31 g"],
  ["100 g cooked fish", "22 g"],
  ["30 g almonds", "6 g"],
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [prePregnancyWeightKg, setPrePregnancyWeightKg] = useState(
    DEFAULTS.prePregnancyWeightKg,
  );
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [stage, setStage] = useState(DEFAULTS.stage);
  const [twins, setTwins] = useState(DEFAULTS.twins);
  const [mealsPerDay, setMealsPerDay] = useState(DEFAULTS.mealsPerDay);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      pregnancyProteinTarget({
        prePregnancyWeightKg: toNumber(prePregnancyWeightKg),
        heightCm: toNumber(heightCm),
        stage,
        twins,
        mealsPerDay: toNumber(mealsPerDay),
      }),
    [prePregnancyWeightKg, heightCm, stage, twins, mealsPerDay],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pregnancy Protein Intake Calculator",
      `Stage: ${result.stageLabel}`,
      `Recommended protein: ${g0(result.recommendedGrams)} a day`,
      `Set by ${result.basisLabel}`,
      `Non-pregnant baseline: ${g0(result.baselineGrams)} (0.8 g/kg)`,
      `Extra above baseline: ${g0(result.extraOverBaselineGrams)}`,
      `Additional energy: ${result.extraKcal} kcal a day`,
      `Per meal across ${result.mealsPerDay}: ${g0(result.perMealGrams)}`,
      result.gainRangeKg
        ? `Weight-gain range (${result.bmiCategory}): ${result.gainRangeKg[0]}-${result.gainRangeKg[1]} kg`
        : "Weight-gain range: no IOM recommendation for this combination",
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
    setPrePregnancyWeightKg(DEFAULTS.prePregnancyWeightKg);
    setHeightCm(DEFAULTS.heightCm);
    setStage(DEFAULTS.stage);
    setTwins(DEFAULTS.twins);
    setMealsPerDay(DEFAULTS.mealsPerDay);
    setCopied(false);
  };

  const gainText = hasError
    ? DASH
    : result.gainRangeKg
      ? `${result.gainRangeKg[0]}-${result.gainRangeKg[1]} kg`
      : "No IOM range published";

  const rows = hasError
    ? [
        ["Protein per kg of pre-pregnancy weight", DASH],
        ["Target from the g/kg form", DASH],
        ["Target from the +25 g/day form", DASH],
        ["Non-pregnant baseline (0.8 g/kg)", DASH],
        ["Extra above baseline", DASH],
        ["Estimated average requirement (EAR)", DASH],
        ["Additional energy for this stage", DASH],
        ["Per meal", DASH],
        ["Pre-pregnancy BMI", DASH],
        ["Recommended total weight gain", DASH],
      ]
    : [
        ["Protein per kg of pre-pregnancy weight", `${result.rdaPerKg} g/kg`],
        ["Target from the g/kg form", g1(result.perKgGrams)],
        [
          "Target from the +25 g/day form",
          result.additiveIncreaseG > 0 ? g1(result.additiveGrams) : "Not applied at this stage",
        ],
        ["Non-pregnant baseline (0.8 g/kg)", g1(result.baselineGrams)],
        ["Extra above baseline", g1(result.extraOverBaselineGrams)],
        ["Estimated average requirement (EAR)", `${g1(result.earGrams)} · ${result.earPerKg} g/kg`],
        ["Additional energy for this stage", `${result.extraKcal} kcal a day`],
        ["Per meal", `${g0(result.perMealGrams)} across ${result.mealsPerDay}`],
        [
          "Pre-pregnancy BMI",
          `${NUM1.format(result.bmi)} · ${result.bmiCategory ?? "unclassified"}`,
        ],
        ["Recommended total weight gain", gainText],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Pregnancy and breastfeeding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pregnancy Protein Intake Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Trimester-adjusted protein from the IOM Dietary Reference Intakes, based on pre-pregnancy
          weight — with the additional energy allowance for the stage and the published gestational
          weight-gain range for your BMI.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-weight">
              Pre-pregnancy weight (kg)
            </label>
            <input
              id="pp-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="35"
              max="200"
              step="0.5"
              value={prePregnancyWeightKg}
              onChange={(event) => setPrePregnancyWeightKg(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Reference values are based on weight before pregnancy, not current weight.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-height">
              Height (cm)
            </label>
            <input
              id="pp-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="130"
              max="210"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pp-stage">
              Stage
            </label>
            <select
              id="pp-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stage}
              onChange={(event) => setStage(event.target.value)}
            >
              {Object.entries(STAGES).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-meals">
              Meals and snacks with protein
            </label>
            <input
              id="pp-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="6"
              step="1"
              value={mealsPerDay}
              onChange={(event) => setMealsPerDay(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="pp-twins"
            >
              <input
                id="pp-twins"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={twins}
                onChange={(event) => setTwins(event.target.checked)}
              />
              Twin pregnancy
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
              Protein a day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : g0(result.recommendedGrams)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the target."
                : `${result.stageLabel} · set by ${result.basisLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy pregnancy protein target"
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
            <p className={NOTE_CLASS}>{result.stageNote}</p>
            {result.twinsNoProteinDri && (
              <p className={NOTE_CLASS}>
                There is no Dietary Reference Intake for protein in twin pregnancy, so the figure
                above is still the singleton value. Twin pregnancies need more, but how much has
                never been set by a reference body — ask your obstetrician or a dietitian to
                individualise it.
              </p>
            )}
            {result.gainRangeMissing && (
              <p className={NOTE_CLASS}>
                The IOM issued no gestational weight-gain range for underweight women carrying
                twins, citing insufficient data. Your care team will set a target instead.
              </p>
            )}
            <p className={NOTE_CLASS}>
              The RDA covers 97-98% of healthy people, while the estimated average requirement of{" "}
              {g1(result.earGrams)} is the median need. Aim at the RDA rather than the EAR — the
              gap between them is the safety margin.
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Protein in everyday portions</h2>
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
        Informational only, based on the published IOM Dietary Reference Intakes and the 2009
        gestational weight-gain guidelines. This is not medical advice and does not account for
        gestational diabetes, hyperemesis, multiple births or any existing condition. Agree your
        pregnancy nutrition plan with your obstetrician, midwife or a registered dietitian.
      </p>
    </main>
  );
}
