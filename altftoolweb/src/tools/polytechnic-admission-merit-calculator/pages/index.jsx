"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardHat, RotateCcw } from "lucide-react";

import { MERIT_SCALE, WEIGHT_PRESETS, computePolytechnicMerit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  qualObtained: "480",
  qualMax: "600",
  entranceObtained: "90",
  entranceMax: "150",
  weight: "50",
};

const DASH = "—";

export default function ToolHome() {
  const [qualObtained, setQualObtained] = useState(DEFAULTS.qualObtained);
  const [qualMax, setQualMax] = useState(DEFAULTS.qualMax);
  const [entranceObtained, setEntranceObtained] = useState(DEFAULTS.entranceObtained);
  const [entranceMax, setEntranceMax] = useState(DEFAULTS.entranceMax);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const toNum = (v) => (String(v).trim() === "" ? Number.NaN : Number(v));
    return computePolytechnicMerit({
      qualObtained: toNum(qualObtained),
      qualMax: toNum(qualMax),
      entranceObtained: toNum(entranceObtained),
      entranceMax: toNum(entranceMax),
      qualifyingWeight: toNum(weight),
    });
  }, [qualObtained, qualMax, entranceObtained, entranceMax, weight]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Polytechnic admission merit",
      `Class 10: ${NUM.format(result.qualPercent)}% x ${result.qualifyingWeight}% weight = ${NUM.format(result.qualShare)}`,
      `Entrance: ${NUM.format(result.entrancePercent)}% x ${result.entranceWeight}% weight = ${NUM.format(result.entranceShare)}`,
      `Merit index: ${NUM.format(result.merit)} / ${MERIT_SCALE}`,
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
    setQualObtained(DEFAULTS.qualObtained);
    setQualMax(DEFAULTS.qualMax);
    setEntranceObtained(DEFAULTS.entranceObtained);
    setEntranceMax(DEFAULTS.entranceMax);
    setWeight(DEFAULTS.weight);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Class 10 percentage", DASH],
        ["Entrance percentage", DASH],
        ["Class 10 contribution", DASH],
        ["Entrance contribution", DASH],
      ]
    : [
        ["Class 10 percentage", `${NUM.format(result.qualPercent)}%`],
        ["Entrance percentage", `${NUM.format(result.entrancePercent)}%`],
        [
          `Class 10 contribution (${result.qualifyingWeight}% weight)`,
          NUM.format(result.qualShare),
        ],
        [
          `Entrance contribution (${result.entranceWeight}% weight)`,
          NUM.format(result.entranceShare),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HardHat className="h-4 w-4" aria-hidden="true" />
          Diploma admissions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Polytechnic Admission Merit Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Merit index = Class 10 percentage x its weight + entrance percentage x the remaining
          weight, on a 100-point scale. Pick the weight your state&apos;s brochure publishes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="poly-qual-obtained">
              Class 10 marks obtained
            </label>
            <input
              id="poly-qual-obtained"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={qualObtained}
              onChange={(event) => setQualObtained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poly-qual-max">
              Class 10 maximum marks
            </label>
            <input
              id="poly-qual-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={qualMax}
              onChange={(event) => setQualMax(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poly-ent-obtained">
              Entrance exam score
            </label>
            <input
              id="poly-ent-obtained"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={entranceObtained}
              onChange={(event) => setEntranceObtained(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poly-ent-max">
              Entrance exam maximum
            </label>
            <input
              id="poly-ent-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={entranceMax}
              onChange={(event) => setEntranceMax(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="poly-weight">
              Weight given to Class 10 marks (%)
            </label>
            <input
              id="poly-weight"
              className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {WEIGHT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setWeight(String(preset.qualifyingWeight))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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
              Merit index
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.merit)} / ${MERIT_SCALE}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Higher merit index means a better position on the admission list under this formula."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the polytechnic merit result"
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
        Informational only. States differ: Maharashtra DTE ranks on Class 10 percentage alone,
        while JEECUP (UP), JEXPO (West Bengal) and DCECE (Bihar) rank on the entrance exam with
        Class 10 marks as an eligibility floor and tie-breaker. Always apply the exact formula in
        your state counselling brochure.
      </p>
    </main>
  );
}
