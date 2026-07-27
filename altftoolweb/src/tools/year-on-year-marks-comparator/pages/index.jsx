"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, TrendingUp } from "lucide-react";

import { MAX_PERIODS, MIN_PERIODS, compareMarks } from "../lib";

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_PERIODS = [
  { label: "Class 9", obtained: "372", max: "500" },
  { label: "Class 10", obtained: "406", max: "500" },
  { label: "Class 11", obtained: "388", max: "500" },
  { label: "Class 12", obtained: "428", max: "500" },
];

const TREND_LABEL = {
  improving: "Improving",
  declining: "Declining",
  stable: "Stable",
};

export default function ToolHome() {
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compareMarks({ periods }), [periods]);
  const hasError = Boolean(result.error);

  const updatePeriod = (index, field, value) => {
    setPeriods((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addPeriod = () => {
    setPeriods((prev) =>
      prev.length >= MAX_PERIODS
        ? prev
        : [...prev, { label: `Period ${prev.length + 1}`, obtained: "", max: "100" }],
    );
  };

  const removePeriod = (index) => {
    setPeriods((prev) =>
      prev.length <= MIN_PERIODS ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Year-on-year marks comparison",
      ...result.rows.map(
        (row) =>
          `${row.label}: ${PCT.format(row.percent)}%` +
          (row.deltaPoints === null
            ? ""
            : ` (${row.deltaPoints >= 0 ? "+" : ""}${PCT.format(row.deltaPoints)} pts)`),
      ),
      `Trend: ${TREND_LABEL[result.trend]} (${PCT.format(result.slopePerPeriod)} pts/period)`,
      `Average: ${PCT.format(result.averagePercent)}%`,
      `Best: ${result.bestLabel} (${PCT.format(result.bestPercent)}%)`,
      `Overall change: ${result.overallChangePoints >= 0 ? "+" : ""}${PCT.format(result.overallChangePoints)} pts`,
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
    setPeriods(DEFAULT_PERIODS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Result analysis
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Year On Year Marks Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your marks for each year or semester. The tool converts every period to a
          percentage, shows the change between periods in percentage points, and fits a
          least-squares trend line across all of them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {periods.map((row, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:border-0 sm:p-0"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`yoy-label-${index}`}>
                  Period {index + 1} name
                </label>
                <input
                  id={`yoy-label-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.label}
                  onChange={(event) => updatePeriod(index, "label", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`yoy-obtained-${index}`}>
                  Marks obtained
                </label>
                <input
                  id={`yoy-obtained-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={row.obtained}
                  onChange={(event) => updatePeriod(index, "obtained", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`yoy-max-${index}`}>
                  Maximum marks
                </label>
                <input
                  id={`yoy-max-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={row.max}
                  onChange={(event) => updatePeriod(index, "max", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removePeriod(index)}
                disabled={periods.length <= MIN_PERIODS}
                aria-label={`Remove ${row.label || `period ${index + 1}`}`}
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addPeriod}
          disabled={periods.length >= MAX_PERIODS}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-40`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add period
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
              Overall trend
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : TREND_LABEL[result.trend]}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.slopePerPeriod >= 0 ? "+" : ""}${PCT.format(result.slopePerPeriod)} percentage points per period on the fitted trend line.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the marks comparison result"
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

        {!hasError ? (
          <div className="mt-5 space-y-3">
            {result.rows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {PCT.format(row.percent)}%
                    {row.deltaPoints !== null ? (
                      <span
                        className={
                          row.deltaPoints >= 0
                            ? " ml-2 font-semibold text-[var(--success)]"
                            : " ml-2 font-semibold text-[var(--danger)]"
                        }
                      >
                        {row.deltaPoints >= 0 ? "+" : ""}
                        {PCT.format(row.deltaPoints)} pts
                      </span>
                    ) : null}
                  </span>
                </div>
                <div
                  className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${row.label}: ${PCT.format(row.percent)} percent`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${Math.min(100, Math.max(0, row.percent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Average across periods", hasError ? DASH : `${PCT.format(result.averagePercent)}%`],
            [
              "Best period",
              hasError ? DASH : `${result.bestLabel} — ${PCT.format(result.bestPercent)}%`,
            ],
            [
              "Weakest period",
              hasError ? DASH : `${result.worstLabel} — ${PCT.format(result.worstPercent)}%`,
            ],
            [
              "Change from first to last",
              hasError
                ? DASH
                : `${result.overallChangePoints >= 0 ? "+" : ""}${PCT.format(result.overallChangePoints)} pts`,
            ],
            [
              "Trend-line projection for next period",
              hasError ? DASH : `${PCT.format(result.projectedNextPercent)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Percentages are compared, not raw marks, so periods with different maximum marks remain
        comparable. The projection is a straight-line extrapolation of past performance, not a
        prediction of future results.
      </p>
    </main>
  );
}
