"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Percent, RotateCcw } from "lucide-react";

import {
  CGPA_MAX,
  CGPA_OFFSET,
  DIVISION_BANDS,
  SCALE_FACTOR,
  cgpaToPercentage,
  percentageToCgpa,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const DEFAULTS = { mode: "toPercent", cgpa: "8.2", percentage: "74.5" };

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [cgpa, setCgpa] = useState(DEFAULTS.cgpa);
  const [percentage, setPercentage] = useState(DEFAULTS.percentage);
  const [copied, setCopied] = useState(false);

  const toPercent = mode === "toPercent";

  const result = useMemo(
    () => (toPercent ? cgpaToPercentage({ cgpa }) : percentageToCgpa({ percentage })),
    [toPercent, cgpa, percentage],
  );

  const hasError = Boolean(result.error);

  const bigValue = hasError
    ? DASH
    : toPercent
      ? `${NUM.format(result.percentage)}%`
      : NUM.format(result.cgpa);

  const summary = useMemo(() => {
    if (hasError) return "";
    return toPercent
      ? `GGSIPU CGPA ${NUM.format(result.cgpa)} = ${NUM.format(result.percentage)}% (formula: ${result.formula}) — ${result.division}`
      : `GGSIPU ${NUM.format(result.percentage)}% = CGPA ${NUM.format(result.cgpa)} (formula: ${result.formula}) — ${result.division}`;
  }, [hasError, toPercent, result]);

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
    setCgpa(DEFAULTS.cgpa);
    setPercentage(DEFAULTS.percentage);
    setCopied(false);
  };

  const rows = hasError
    ? [
        [toPercent ? "Equivalent percentage" : "Equivalent CGPA", DASH],
        ["Formula applied", DASH],
        ["Division band", DASH],
      ]
    : [
        [
          toPercent ? "Equivalent percentage" : "Equivalent CGPA",
          toPercent ? `${NUM.format(result.percentage)}%` : NUM.format(result.cgpa),
        ],
        ["Formula applied", result.formula],
        ["Division band", result.division],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          GGSIPU conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          IPU CGPA Percentage Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a GGSIPU CGPA to its equivalent percentage using the university&apos;s formula,
          Percentage = (CGPA − {CGPA_OFFSET}) × {SCALE_FACTOR} — or run it in reverse to see the
          CGPA behind a percentage.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ipu-mode">
              Direction
            </label>
            <select
              id="ipu-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="toPercent">CGPA → percentage</option>
              <option value="toCgpa">Percentage → CGPA</option>
            </select>
          </div>
          {toPercent ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ipu-cgpa">
                Your CGPA (0 – {CGPA_MAX})
              </label>
              <input
                id="ipu-cgpa"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max={CGPA_MAX}
                step="0.01"
                value={cgpa}
                onChange={(event) => setCgpa(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="ipu-percentage">
                Your percentage (0 – 100)
              </label>
              <input
                id="ipu-percentage"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
              />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMode(toPercent ? "toCgpa" : "toPercent")}
          className={`mt-4 ${GHOST_BTN}`}
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Swap direction
        </button>
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
              {toPercent ? "Equivalent percentage" : "Equivalent CGPA"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{bigValue}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : !toPercent || !result.flooredAtZero
                  ? `Band: ${result.division}.`
                  : "The formula goes negative below a CGPA of 0.75, so the equivalent percentage floors at 0."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the CGPA conversion result"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Division bands by equivalent percentage</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Percentage
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  CGPA (via formula)
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Division
                </th>
              </tr>
            </thead>
            <tbody>
              {DIVISION_BANDS.filter((band) => band.min > 0).map((band) => (
                <tr key={band.min} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{band.min}% and above</td>
                  <td className="py-2 pr-3">
                    {NUM.format(percentageToCgpa({ percentage: band.min }).cgpa)} and above
                  </td>
                  <td className="py-2 text-right font-semibold">{band.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The (CGPA − 0.75) × 10 conversion is the one GGSIPU notifies for its
        10-point scale; always quote the figure printed on your official transcript or conversion
        certificate for admissions and employment paperwork.
      </p>
    </main>
  );
}
