"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import {
  ENDOCRINE_TARGET_NG,
  IOM_ADEQUATE_NG,
  NMOL_PER_L_PER_NG_PER_ML,
  REFERENCE_ROWS,
  UNITS,
  convertVitaminD,
  ngPerMlToNmolPerL,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = { value: "24", unit: "ng/mL" };
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertVitaminD({ value, unit }), [value, unit]);
  const ok = !result.error;

  const converted = ok
    ? unit === "ng/mL"
      ? `${NUM2.format(result.nmolPerL)} nmol/L`
      : `${NUM2.format(result.ngPerMl)} ng/mL`
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Vitamin D (25-OH) unit conversion",
      `Reading entered: ${NUM2.format(result.inputValue)} ${result.unit}`,
      `In ng/mL: ${NUM2.format(result.ngPerMl)}`,
      `In nmol/L: ${NUM2.format(result.nmolPerL)}`,
      `Status band: ${result.band.label}`,
      `Endocrine Society target (${ENDOCRINE_TARGET_NG} ng/mL): ${
        result.meetsEndocrineTarget ? "met" : `short by ${NUM2.format(result.gapToTargetNg)} ng/mL`
      }`,
      "Informational only — discuss results with your doctor.",
    ].join("\n");
  }, [ok, result]);

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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Vitamin D Unit Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a serum 25-hydroxyvitamin D result between ng/mL and nmol/L, and see which
          deficiency, insufficiency or sufficiency band the level falls into.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vitd-value">
              25(OH)D reading
            </label>
            <input
              id="vitd-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vitd-unit">
              Unit on the report
            </label>
            <select
              id="vitd-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["Deficient example", "15", "ng/mL"],
            ["Borderline example", "28", "ng/mL"],
            ["SI example", "82", "nmol/L"],
          ].map(([label, preset, presetUnit]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setValue(preset);
                setUnit(presetUnit);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Converted level
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{converted}</p>
            {ok ? (
              <span
                className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                  TONE_CLASS[result.band.tone]
                }`}
              >
                {result.band.label}
              </span>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Fix the input above to see a result.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the vitamin D conversion result"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["In conventional units", ok ? `${NUM2.format(result.ngPerMl)} ng/mL` : DASH],
            ["In SI units", ok ? `${NUM2.format(result.nmolPerL)} nmol/L` : DASH],
            [
              `Endocrine Society target (${ENDOCRINE_TARGET_NG} ng/mL)`,
              ok
                ? result.meetsEndocrineTarget
                  ? "Met"
                  : `Short by ${NUM2.format(result.gapToTargetNg)} ng/mL`
                : DASH,
            ],
            [
              `IOM adequacy cut-point (${IOM_ADEQUATE_NG} ng/mL)`,
              ok ? (result.iomAdequate ? "Met" : "Below") : DASH,
            ],
            [
              "Share of the 30 ng/mL target",
              ok ? `${NUM.format(result.percentOfEndocrineTarget)}%` : DASH,
            ],
            [
              "Using the rounded 2.5 factor instead",
              ok
                ? `${NUM2.format(result.roundedFactorResult)} ${unit === "ng/mL" ? "nmol/L" : "ng/mL"}`
                : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.band.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Threshold reference</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Exact factor: 1 ng/mL = {NUM2.format(NMOL_PER_L_PER_NG_PER_ML)} nmol/L.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  ng/mL
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  nmol/L
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_ROWS.map((row) => (
                <tr key={row.ng} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.ng}</td>
                  <td className="py-2 pr-3">{NUM.format(ngPerMlToNmolPerL(row.ng))}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Reference ranges differ between laboratories and
        guideline bodies, and targets change in pregnancy, kidney disease and malabsorption. Discuss
        your result and any supplement dose with your doctor.
      </p>
    </main>
  );
}
