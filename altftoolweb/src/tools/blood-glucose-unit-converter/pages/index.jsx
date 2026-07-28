"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Droplet, RotateCcw } from "lucide-react";

import {
  CONTEXTS,
  MG_DL_PER_MMOL_L,
  REFERENCE_POINTS,
  UNITS,
  convertGlucose,
  mgdlToMmoll,
} from "../lib";

const MGDL_FMT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const MMOL_FMT = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { value: "110", unit: "mgdl", context: "fasting" };
const DASH = "—";

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [context, setContext] = useState(DEFAULTS.context);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertGlucose({ value, unit, context }), [value, unit, context]);
  const hasError = Boolean(result.error);

  const mgdlText = hasError ? DASH : `${MGDL_FMT.format(result.mgdl)} mg/dL`;
  const mmolText = hasError ? DASH : `${MMOL_FMT.format(result.mmoll)} mmol/L`;
  const primaryText = hasError ? DASH : unit === "mgdl" ? mmolText : mgdlText;

  const swapUnit = () => {
    if (!hasError) {
      setValue(
        unit === "mgdl" ? MMOL_FMT.format(result.mmoll) : MGDL_FMT.format(result.mgdl),
      );
    }
    setUnit((current) => (current === "mgdl" ? "mmoll" : "mgdl"));
  };

  const reset = () => {
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setContext(DEFAULTS.context);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Blood Glucose Unit Converter",
      `${mgdlText} = ${mmolText}`,
      `Context: ${result.band.contextLabel}`,
      `Band: ${result.band.label}`,
      result.band.note,
    ].join("\n");
  }, [hasError, mgdlText, mmolText, result]);

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

  const rows = [
    ["Reading in mg/dL", mgdlText],
    ["Reading in mmol/L", mmolText],
    ["Context", hasError ? DASH : result.band.contextLabel],
    ["Reference band", hasError ? DASH : result.band.label],
    ["Conversion factor", `1 mmol/L = ${MG_DL_PER_MMOL_L} mg/dL`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplet className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Blood Glucose Unit Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a blood sugar reading between mg/dL and mmol/L, and see which reference band it
          falls into for a fasting, post-meal or random sample.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-value">
              Reading
            </label>
            <input
              id="bg-value"
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
            <label className={LABEL_CLASS} htmlFor="bg-unit">
              Unit of that reading
            </label>
            <select
              id="bg-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bg-context">
              When was the sample taken?
            </label>
            <select
              id="bg-context"
              className={`mt-2 ${INPUT_CLASS}`}
              value={context}
              onChange={(event) => setContext(event.target.value)}
            >
              {CONTEXTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button type="button" onClick={swapUnit} className={GHOST_BTN} aria-label="Swap the input unit">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Switch to {unit === "mgdl" ? "mmol/L" : "mg/dL"}
          </button>
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
              Converted reading
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{primaryText}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Enter a valid reading above." : `Same value as ${unit === "mgdl" ? mgdlText : mmolText}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted glucose reading"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p
            className={`mt-5 rounded-md px-3 py-2 text-sm leading-6 ${
              result.isLow
                ? "bg-[var(--danger-soft)] font-medium text-[var(--danger)]"
                : "border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.band.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Common equivalences</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  mg/dL
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  mmol/L
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What it marks
                </th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_POINTS.map((point) => (
                <tr key={point.mgdl} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                    {MGDL_FMT.format(point.mgdl)}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {MMOL_FMT.format(mgdlToMmoll(point.mgdl))}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{point.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational unit conversion only, not a diagnosis. Reference bands follow published
        American Diabetes Association thresholds; diagnosis requires confirmed testing and your own
        clinician&apos;s interpretation. If a reading is below 70 mg/dL (3.9 mmol/L) or you feel
        unwell, treat the low and seek medical help.
      </p>
    </main>
  );
}
