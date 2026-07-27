"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { CBSE_CGPA_FACTOR, DIVISION_BANDS, convertToUsGpa } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { mode: "percentage", value: "72" };
const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [value, setValue] = useState(DEFAULTS.value);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertToUsGpa({ mode, value: value.trim() === "" ? Number.NaN : Number(value) }),
    [mode, value],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Indian score to US 4.0 GPA",
      `Input: ${value}${mode === "percentage" ? "%" : " CGPA (10-point)"}`,
      result.usedCgpaConversion
        ? `Percentage via CBSE factor (× ${CBSE_CGPA_FACTOR}): ${NUM.format(result.percentage)}%`
        : null,
      `Division: ${result.division} (${result.letter})`,
      `Division-based GPA (WES-style): ${NUM.format(result.divisionGpa)}`,
      `Linear-scale GPA: ${NUM.format(result.linearGpa)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, mode, value]);

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
    setMode(DEFAULTS.mode);
    setValue(DEFAULTS.value);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Percentage used", DASH],
        ["Indian division", DASH],
        ["US letter grade", DASH],
        ["Linear-scale GPA", DASH],
      ]
    : [
        ["Percentage used", `${NUM.format(result.percentage)}%`],
        ["Indian division", result.division],
        ["US letter grade", result.letter],
        ["Linear-scale GPA (percentage ÷ 100 × 4)", NUM.format(result.linearGpa)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Grade Conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian Percentage to US GPA Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts an Indian percentage or 10-point CGPA to the US 4.0 scale using the
          division-based method credential evaluators such as WES apply, alongside a simple linear
          estimate for comparison.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gpa-mode">
              What are you entering?
            </label>
            <select
              id="gpa-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="percentage">Percentage (0–100)</option>
              <option value="cgpa10">CGPA on the 10-point scale</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpa-value">
              {mode === "percentage" ? "Your percentage" : "Your CGPA (out of 10)"}
            </label>
            <input
              id="gpa-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={mode === "percentage" ? 100 : 10}
              step={mode === "percentage" ? 0.1 : 0.01}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            {mode === "cgpa10" ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Converted to a percentage with the CBSE factor: CGPA × {CBSE_CGPA_FACTOR}.
              </p>
            ) : null}
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
              Division-based GPA (WES-style)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.divisionGpa)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.division} maps to a US "${result.letter}", the method used by credential evaluators.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the GPA conversion result"
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
          {rows.map(([label, valueText]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{valueText}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Division mapping used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Indian result
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  US letter
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  GPA
                </th>
              </tr>
            </thead>
            <tbody>
              {DIVISION_BANDS.map((band) => (
                <tr key={band.division} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {band.division}
                    {band.min > 0 ? ` (${band.min}%+)` : " (below 40%)"}
                  </td>
                  <td className="py-2 pr-3">{band.letter}</td>
                  <td className="py-2 text-right font-semibold">{NUM.format(band.gpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative only. Universities and evaluators (WES, ECE, Scholaro) each apply their own
        methodology and may weight individual course grades rather than the overall percentage —
        an official credential evaluation is authoritative for admissions.
      </p>
    </main>
  );
}
