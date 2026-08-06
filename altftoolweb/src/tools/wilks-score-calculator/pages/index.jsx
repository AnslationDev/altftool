"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  RELIABLE_BODYWEIGHT_KG,
  WILKS_BANDS,
  computeWilks,
  kgToLb,
  lbToKg,
  totalForWilks,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "male",
  unit: "kg",
  bodyweight: "83",
  squat: "220",
  bench: "140",
  deadlift: "260",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [bodyweight, setBodyweight] = useState(DEFAULTS.bodyweight);
  const [squat, setSquat] = useState(DEFAULTS.squat);
  const [bench, setBench] = useState(DEFAULTS.bench);
  const [deadlift, setDeadlift] = useState(DEFAULTS.deadlift);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(() => {
    const convert = (raw) => {
      const value = toNumber(raw);
      if (Number.isNaN(value)) return NaN;
      return unit === "lb" ? lbToKg(value) : value;
    };
    const bw = convert(bodyweight);
    const s = convert(squat);
    const b = convert(bench);
    const d = convert(deadlift);
    if (Number.isNaN(bw)) return { error: "Enter a bodyweight." };
    if ([s, b, d].some((value) => Number.isNaN(value))) {
      return { error: "Enter all three lifts — squat, bench press and deadlift." };
    }
    return computeWilks({ bodyweightKg: bw, sex, unit, squatKg: s, benchKg: b, deadliftKg: d });
  }, [bodyweight, squat, bench, deadlift, sex, unit]);

  const hasError = Boolean(result.error);

  const reliableRangeLabel = useMemo(() => {
    if (unit === "lb") {
      return `${NUM1.format(kgToLb(RELIABLE_BODYWEIGHT_KG.min))}–${NUM1.format(kgToLb(RELIABLE_BODYWEIGHT_KG.max))} lb`;
    }
    return `${RELIABLE_BODYWEIGHT_KG.min}–${RELIABLE_BODYWEIGHT_KG.max} kg`;
  }, [unit]);

  const targets = useMemo(() => {
    const raw = toNumber(bodyweight);
    if (Number.isNaN(raw)) return [];
    const bw = unit === "lb" ? lbToKg(raw) : raw;
    return [300, 400, 500].map((targetScore) => {
      const row = totalForWilks({ bodyweightKg: bw, sex, targetScore });
      return { targetScore, totalKg: row.error ? null : row.totalKg };
    });
  }, [bodyweight, sex, unit]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Wilks Score Calculator",
      `Bodyweight: ${NUM1.format(result.bodyweightKg)} kg`,
      `Total: ${NUM1.format(result.totalKg)} kg`,
      `Wilks coefficient: ${NUM4.format(result.coefficient)}`,
      `Wilks score: ${NUM2.format(result.score)}`,
      `Band: ${result.band.label}`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "Wilks score result" });
  };

  const reset = () => {
    setSex(DEFAULTS.sex);
    setUnit(DEFAULTS.unit);
    setBodyweight(DEFAULTS.bodyweight);
    setSquat(DEFAULTS.squat);
    setBench(DEFAULTS.bench);
    setDeadlift(DEFAULTS.deadlift);
    resetCopyState();
  };

  const rows = hasError
    ? [
        ["Total lifted", DASH],
        ["Wilks coefficient", DASH],
        ["Bodyweight used", DASH],
        ["Total ÷ bodyweight", DASH],
        ["Kilograms per Wilks point", DASH],
        ["Band", DASH],
      ]
    : [
        ["Total lifted", `${NUM1.format(result.totalKg)} kg · ${NUM1.format(result.totalLb)} lb`],
        ["Wilks coefficient", NUM4.format(result.coefficient)],
        [
          "Bodyweight used",
          `${NUM1.format(result.bodyweightKg)} kg · ${NUM1.format(result.bodyweightLb)} lb`,
        ],
        ["Total ÷ bodyweight", `${NUM2.format(result.totalToBodyweightRatio)}×`],
        ["Kilograms per Wilks point", `${NUM2.format(result.kgPerWilksPoint)} kg`],
        ["Band", `${result.band.label} — ${result.band.note}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Powerlifting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Wilks Score Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The Wilks score multiplies your three-lift total by a bodyweight coefficient so a 60 kg
          and a 120 kg lifter can be ranked on the same scale. This uses the original 1994 Wilks
          polynomial the IPF ran until 2019.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wilks-sex">
              Coefficient set
            </label>
            <select
              id="wilks-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Men</option>
              <option value="female">Women</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wilks-unit">
              Units
            </label>
            <select
              id="wilks-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wilks-bodyweight">
              Bodyweight ({unit})
            </label>
            <input
              id="wilks-bodyweight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={bodyweight}
              onChange={(event) => setBodyweight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wilks-squat">
              Squat ({unit})
            </label>
            <input
              id="wilks-squat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="2.5"
              value={squat}
              onChange={(event) => setSquat(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wilks-bench">
              Bench press ({unit})
            </label>
            <input
              id="wilks-bench"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="2.5"
              value={bench}
              onChange={(event) => setBench(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wilks-deadlift">
              Deadlift ({unit})
            </label>
            <input
              id="wilks-deadlift"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="2.5"
              value={deadlift}
              onChange={(event) => setDeadlift(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Wilks score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM2.format(result.score)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a score."
                : `${NUM1.format(result.totalKg)} kg total × ${NUM4.format(result.coefficient)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("result") ? "Copied Wilks score result" : "Copy Wilks score result"}
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
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

        {!hasError && result.outsideFittedRange && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning-text)]">
            That bodyweight is outside the {reliableRangeLabel} range the Wilks polynomial was fitted
            to, so the coefficient is unreliable there.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Totals needed at this bodyweight</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Wilks target
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Total required
                </th>
              </tr>
            </thead>
            <tbody>
              {targets.map((row) => (
                <tr key={row.targetScore} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.targetScore}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {WILKS_BANDS.filter((band) => band.min <= row.targetScore).slice(-1)[0].label}
                  </td>
                  <td className="py-2 text-right">
                    {row.totalKg === null ? DASH : `${NUM1.format(row.totalKg)} kg`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {targets.length === 0 && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Enter a bodyweight to see the totals behind each Wilks target.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The band labels are informal gym conventions, not federation classifications. The IPF
        replaced Wilks with IPF GL points in 2019, so check which score your federation actually
        uses before entering a meet.
      </p>
    </main>
  );
}
