"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import { PACES, SEXES, WEIGHT_UNITS, stepsToCalories } from "../lib";

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  steps: "10000",
  weight: "70",
  weightUnit: "kg",
  heightCm: "165",
  sex: "female",
  paceId: "moderate",
};

export default function ToolHome() {
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [paceId, setPaceId] = useState(DEFAULTS.paceId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      stepsToCalories({
        steps: Number(steps),
        weight: Number(weight),
        weightUnit,
        heightCm: Number(heightCm),
        sex,
        paceId,
      }),
    [steps, weight, weightUnit, heightCm, sex, paceId],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${INT.format(result.steps)} steps at ${result.pace.label}`,
      `Calories burnt (gross): ${INT.format(result.grossCalories)} kcal`,
      `Calories burnt above rest (net): ${INT.format(result.netCalories)} kcal`,
      `Distance: ${DEC2.format(result.distanceKm)} km (${DEC2.format(result.distanceMiles)} miles)`,
      `Time on feet: ${INT.format(result.minutes)} minutes`,
      `Step length used: ${DEC1.format(result.stepLengthCm)} cm`,
      `Per 1,000 steps: ${DEC1.format(result.caloriesPer1000Steps)} kcal`,
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
    setSteps(DEFAULTS.steps);
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setHeightCm(DEFAULTS.heightCm);
    setSex(DEFAULTS.sex);
    setPaceId(DEFAULTS.paceId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Net calories (above resting)", DASH],
        ["Distance covered", DASH],
        ["Time on feet", DASH],
        ["Estimated step length", DASH],
        ["MET value used", DASH],
        ["Calories per 1,000 steps", DASH],
      ]
    : [
        ["Net calories (above resting)", `${INT.format(result.netCalories)} kcal`],
        [
          "Distance covered",
          `${DEC2.format(result.distanceKm)} km · ${DEC2.format(result.distanceMiles)} mi`,
        ],
        ["Time on feet", `${INT.format(result.minutes)} min`],
        ["Estimated step length", `${DEC1.format(result.stepLengthCm)} cm`],
        ["MET value used", `${DEC1.format(result.pace.met)} MET (Compendium code ${result.pace.code})`],
        ["Calories per 1,000 steps", `${DEC1.format(result.caloriesPer1000Steps)} kcal`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Walking &amp; fitness
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Steps to Calories Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a step count into calories using your height to estimate step length and the ACSM
          metabolic equation kcal/min = MET × 3.5 × kg ÷ 200, with MET values from the 2011
          Compendium of Physical Activities.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stc-steps">
              Steps walked
            </label>
            <input
              id="stc-steps"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stc-pace">
              Walking pace
            </label>
            <select
              id="stc-pace"
              value={paceId}
              onChange={(event) => setPaceId(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {PACES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stc-weight">
              Body weight
            </label>
            <input
              id="stc-weight"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stc-weight-unit">
              Weight unit
            </label>
            <select
              id="stc-weight-unit"
              value={weightUnit}
              onChange={(event) => setWeightUnit(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {WEIGHT_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stc-height">
              Height (cm)
            </label>
            <input
              id="stc-height"
              type="number"
              inputMode="numeric"
              min="100"
              max="250"
              step="1"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stc-sex">
              Step-length basis
            </label>
            <select
              id="stc-sex"
              value={sex}
              onChange={(event) => setSex(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {SEXES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Calories burnt
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${INT.format(result.grossCalories)} kcal`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Total energy used over ${INT.format(result.minutes)} minutes on your feet, resting metabolism included.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the calorie estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
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
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate for general fitness tracking, not medical or dietary advice. Step length varies
        with pace, terrain and gait, and MET tables describe population averages rather than your
        individual metabolism, so treat the figure as a guide.
      </p>
    </main>
  );
}
