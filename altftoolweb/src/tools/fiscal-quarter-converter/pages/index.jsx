"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Check, Copy, RotateCcw } from "lucide-react";

import {
  CONVENTIONS,
  FISCAL_PRESETS,
  MONTH_NAMES,
  dateToFiscal,
  fiscalToRange,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  mode: "toFiscal",
  date: "2026-07-26",
  fyStartMonth: "4",
  convention: "start",
  labelYear: "2026",
  quarter: "2",
};

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function pretty(iso) {
  if (!iso) return DASH;
  const [y, m, d] = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(y, m - 1, d)));
}

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [date, setDate] = useState(DEFAULTS.date);
  const [fyStartMonth, setFyStartMonth] = useState(DEFAULTS.fyStartMonth);
  const [convention, setConvention] = useState(DEFAULTS.convention);
  const [labelYear, setLabelYear] = useState(DEFAULTS.labelYear);
  const [quarter, setQuarter] = useState(DEFAULTS.quarter);
  const [copied, setCopied] = useState(false);

  const isToFiscal = mode === "toFiscal";

  const result = useMemo(() => {
    const startMonth = Number(fyStartMonth);
    if (isToFiscal) {
      return dateToFiscal({ date, fyStartMonth: startMonth, convention });
    }
    const year = Number(labelYear);
    if (labelYear.trim() === "" || !Number.isFinite(year)) {
      return { error: "Enter the fiscal year as a number, e.g. 2026." };
    }
    return fiscalToRange({
      labelYear: year,
      quarter: Number(quarter),
      fyStartMonth: startMonth,
      convention,
    });
  }, [isToFiscal, date, fyStartMonth, convention, labelYear, quarter]);

  const hasError = Boolean(result.error);

  const headline = hasError ? DASH : isToFiscal ? result.fiscalLabel : `${pretty(result.start)} – ${pretty(result.end)}`;

  const rows = hasError
    ? [
        ["Calendar quarter", DASH],
        ["Fiscal quarter", DASH],
        ["Quarter runs", DASH],
        ["Fiscal year runs", DASH],
      ]
    : isToFiscal
      ? [
          ["Calendar quarter", result.calendarLabel],
          ["Fiscal quarter", result.fiscalLabel],
          ["Quarter runs", `${pretty(result.quarterStart)} – ${pretty(result.quarterEnd)}`],
          ["Fiscal year runs", `${pretty(result.fiscalYearStart)} – ${pretty(result.fiscalYearEnd)}`],
          [
            "Day of quarter",
            `${result.dayOfQuarter} of ${result.daysInQuarter} (${result.daysLeftInQuarter} left)`,
          ],
          ["Quarter progress", `${result.progressPctQuarter}%`],
          ["Fiscal year progress", `${result.progressPctYear}%`],
        ]
      : [
          ["Fiscal period", result.fiscalLabel],
          ["Starts", pretty(result.start)],
          ["Ends", pretty(result.end)],
          ["Length", `${result.days} days`],
          ["Months covered", result.months.join(", ")],
        ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return ["Quarter and fiscal period converter", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
    // rows is derived from result, so this stays in sync.
  }, [hasError, rows]);

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
    setDate(DEFAULTS.date);
    setFyStartMonth(DEFAULTS.fyStartMonth);
    setConvention(DEFAULTS.convention);
    setLabelYear(DEFAULTS.labelYear);
    setQuarter(DEFAULTS.quarter);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setFyStartMonth(String(preset.startMonth));
    setConvention(preset.convention);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Any fiscal year start
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Quarter and Fiscal Period Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a date into its calendar and fiscal quarter — or a fiscal quarter into exact
          dates — for any fiscal year start month, with both the India-style (FY 2025-26) and
          US-style (FY2026) year names.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div
          role="group"
          aria-label="Conversion direction"
          className="grid grid-cols-2 gap-2 rounded-lg bg-[var(--muted)] p-1"
        >
          {[
            ["toFiscal", "Date → quarter"],
            ["toRange", "Quarter → dates"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === value
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {isToFiscal ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fqc-date">
                Date to convert
              </label>
              <input
                id="fqc-date"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="fqc-year">
                  Fiscal year (as written in the label)
                </label>
                <input
                  id="fqc-year"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1900"
                  max="3000"
                  value={labelYear}
                  onChange={(event) => setLabelYear(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="fqc-quarter">
                  Fiscal quarter
                </label>
                <select
                  id="fqc-quarter"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={quarter}
                  onChange={(event) => setQuarter(event.target.value)}
                >
                  {["1", "2", "3", "4"].map((q) => (
                    <option key={q} value={q}>
                      Q{q}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="fqc-start">
              Fiscal year starts in
            </label>
            <select
              id="fqc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyStartMonth}
              onChange={(event) => setFyStartMonth(event.target.value)}
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={String(index + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fqc-convention">
              Year naming
            </label>
            <select
              id="fqc-convention"
              className={`mt-2 ${INPUT_CLASS}`}
              value={convention}
              onChange={(event) => setConvention(event.target.value)}
            >
              {CONVENTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FISCAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {isToFiscal ? "Fiscal period" : "Date range"}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the conversion result"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The two naming conventions</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          India names a fiscal year after the calendar year it starts in: 1 April 2025 to 31 March
          2026 is FY 2025-26. The US federal government names it after the year it ends in: 1
          October 2025 to 30 September 2026 is FY2026. Same twelve months can carry different
          numbers — always check which convention a report uses before comparing figures.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Quarters here are standard 3-month blocks from the fiscal year start. Some companies use
        4-4-5 retail calendars or 52/53-week years, which shift the boundary a few days — check
        the company&apos;s own filings for those.
      </p>
    </main>
  );
}
