"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import { DOTS_BANDS, computeDots, lbToKg, totalForDots } from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
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
  const [copied, setCopied] = useState(false);

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
    return computeDots({ bodyweightKg: bw, sex, squatKg: s, benchKg: b, deadliftKg: d });
  }, [bodyweight, squat, bench, deadlift, sex, unit]);

  const hasError = Boolean(result.error);

  const targets = useMemo(() => {
    const raw = toNumber(bodyweight);
    if (Number.isNaN(raw)) return [];
    const bw = unit === "lb" ? lbToKg(raw) : raw;
    return [300, 400, 500, 600].map((targetScore) => {
      const row = totalForDots({ bodyweightKg: bw, sex, targetScore });
      const band = DOTS_BANDS.filter((entry) => entry.min <= targetScore).slice(-1)[0];
      return { targetScore, totalKg: row.error ? null : row.totalKg, band: band.label };
    });
  }, [bodyweight, sex, unit]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "DOTS Score Calculator",
      `Bodyweight: ${NUM1.format(result.bodyweightKg)} kg`,
      `Total: ${NUM1.format(result.totalKg)} kg`,
      `DOTS coefficient: ${NUM4.format(result.coefficient)}`,
      `DOTS score: ${NUM2.format(result.score)}`,
      `Band: ${result.band.label}`,
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
    setUnit(DEFAULTS.unit);
    setBodyweight(DEFAULTS.bodyweight);
    setSquat(DEFAULTS.squat);
    setBench(DEFAULTS.bench);
    setDeadlift(DEFAULTS.deadlift);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Total lifted", DASH],
        ["DOTS coefficient", DASH],
        ["Bodyweight used in the formula", DASH],
        ["Total ÷ bodyweight", DASH],
        ["Kilograms per DOTS point", DASH],
        ["Lift split", DASH],
        ["Band", DASH],
      ]
    : [
        ["Total lifted", `${NUM1.format(result.totalKg)} kg · ${NUM1.format(result.totalLb)} lb`],
        ["DOTS coefficient", NUM4.format(result.coefficient)],
        [
          "Bodyweight used in the formula",
          `${NUM1.format(result.bodyweightUsedKg)} kg${result.clamped ? " (clamped)" : ""}`,
        ],
        ["Total ÷ bodyweight", `${NUM2.format(result.totalToBodyweightRatio)}×`],
        ["Kilograms per DOTS point", `${NUM2.format(result.kgPerDotsPoint)} kg`],
        [
          "Lift split",
          result.liftShare
            ? `SQ ${NUM0.format(result.liftShare.squat)}% · BP ${NUM0.format(
                result.liftShare.bench
              )}% · DL ${NUM0.format(result.liftShare.deadlift)}%`
            : DASH,
        ],
        ["Band", `${result.band.label} — ${result.band.note}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Powerlifting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">DOTS Score Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          DOTS multiplies a three-lift total by a fourth-order bodyweight coefficient, so a 59 kg
          and a 120 kg lifter land on the same scale. It was fitted to raw results and is the score
          used by OpenPowerlifting and several federations that dropped Wilks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dots-sex">
              Coefficient set
            </label>
            <select
              id="dots-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Men (40–210 kg)</option>
              <option value="female">Women (40–150 kg)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dots-unit">
              Units
            </label>
            <select
              id="dots-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dots-bodyweight">
              Bodyweight ({unit})
            </label>
            <input
              id="dots-bodyweight"
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
            <label className={LABEL_CLASS} htmlFor="dots-squat">
              Squat ({unit})
            </label>
            <input
              id="dots-squat"
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
            <label className={LABEL_CLASS} htmlFor="dots-bench">
              Bench press ({unit})
            </label>
            <input
              id="dots-bench"
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
            <label className={LABEL_CLASS} htmlFor="dots-deadlift">
              Deadlift ({unit})
            </label>
            <input
              id="dots-deadlift"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              DOTS score
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
              aria-label="Copy DOTS score result"
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

        {!hasError && result.clamped && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            DOTS clamps bodyweight to {result.range.min}–{result.range.max} kg, so the coefficient
            for {NUM1.format(result.bodyweightUsedKg)} kg was used. That is the formula's own rule,
            not a rounding error.
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
        <h2 className="text-base font-semibold">Totals behind each DOTS target</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  DOTS
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
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.band}</td>
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
            Enter a bodyweight to see the totals behind each DOTS target.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Band labels are informal conventions, not federation classifications. DOTS was fitted to raw
        lifting, so equipped totals score high on it — check which formula your federation uses
        before entering a meet.
      </p>
    </main>
  );
}
