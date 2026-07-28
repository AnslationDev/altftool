"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";

import {
  GFR_STAGES,
  REFERENCE_RANGES,
  UMOL_PER_MGDL,
  UNITS,
  convertCreatinine,
  mgdlToUmoll,
} from "../lib";

const TWO_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const ONE_DP = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { value: "1.0", unit: "mgdl", sex: "male", age: "45" };
const DASH = "—";

const POSITION_TEXT = {
  within: "Inside the typical adult reference interval",
  below: "Below the typical adult reference interval",
  above: "Above the typical adult reference interval",
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => convertCreatinine(values), [values]);
  const hasError = Boolean(result.error);

  const mgdlText = hasError ? DASH : `${TWO_DP.format(result.mgdl)} mg/dL`;
  const umolText = hasError ? DASH : `${ONE_DP.format(result.umoll)} µmol/L`;
  const primary = hasError ? DASH : values.unit === "mgdl" ? umolText : mgdlText;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Creatinine Unit Converter",
      `${mgdlText} = ${umolText}`,
      `Reference (${result.range.label}): ${TWO_DP.format(result.range.minMgdl)}-${TWO_DP.format(result.range.maxMgdl)} mg/dL (${INT.format(mgdlToUmoll(result.range.minMgdl))}-${INT.format(mgdlToUmoll(result.range.maxMgdl))} µmol/L)`,
      POSITION_TEXT[result.position],
    ];
    if (result.egfr !== null) {
      lines.push(
        `eGFR (CKD-EPI 2021): ${INT.format(result.egfr)} mL/min/1.73 m² — ${result.stage.label}`,
      );
    }
    lines.push(result.egfrNote);
    return lines.join("\n");
  }, [hasError, mgdlText, umolText, result]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    ["Creatinine in mg/dL", mgdlText],
    ["Creatinine in µmol/L", umolText],
    [
      "Typical reference interval",
      hasError
        ? DASH
        : `${TWO_DP.format(result.range.minMgdl)}-${TWO_DP.format(result.range.maxMgdl)} mg/dL`,
    ],
    ["Where this result sits", hasError ? DASH : POSITION_TEXT[result.position]],
    [
      "eGFR (CKD-EPI 2021)",
      hasError || result.egfr === null ? DASH : `${INT.format(result.egfr)} mL/min/1.73 m²`,
    ],
    ["Conversion factor", `1 mg/dL = ${UMOL_PER_MGDL} µmol/L`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Creatinine Unit Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert serum creatinine between mg/dL and micromoles per litre, compare it against the
          usual adult reference interval, and optionally estimate GFR with the CKD-EPI 2021 equation.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-value">
              Serum creatinine
            </label>
            <input
              id="cr-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.value}
              onChange={(event) => update("value", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-unit">
              Unit on the report
            </label>
            <select
              id="cr-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.unit}
              onChange={(event) => update("unit", event.target.value)}
            >
              {UNITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-sex">
              Reference range to use
            </label>
            <select
              id="cr-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.sex}
              onChange={(event) => update("sex", event.target.value)}
            >
              {REFERENCE_RANGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-age">
              Age in years (blank to skip eGFR)
            </label>
            <input
              id="cr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="110"
              step="1"
              value={values.age}
              onChange={(event) => update("age", event.target.value)}
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
              Converted result
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{primary}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Enter a valid creatinine result above."
                : `Same value as ${values.unit === "mgdl" ? mgdlText : umolText}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted creatinine result"
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
          <p className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.stage ? `${result.stage.label}. ${result.stage.note} ` : ""}
            {result.egfrNote}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">KDIGO GFR categories</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Category
                </th>
                <th scope="col" className="py-2 font-semibold">
                  eGFR (mL/min/1.73 m²)
                </th>
              </tr>
            </thead>
            <tbody>
              {GFR_STAGES.map((stage) => (
                <tr key={stage.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{stage.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{stage.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational unit conversion only, not a diagnosis. Reference intervals differ between
        laboratories and assays, and creatinine is affected by muscle mass, diet, pregnancy and some
        medicines, so a single value does not describe kidney function on its own. Discuss results
        with your own clinician.
      </p>
    </main>
  );
}
