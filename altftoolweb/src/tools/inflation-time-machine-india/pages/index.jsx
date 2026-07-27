"use client";

import { useMemo, useState } from "react";
import { Check, Copy, History, RotateCcw } from "lucide-react";

import {
  BASE_FY,
  MAX_PROJECTION_YEARS,
  RBI_TARGET_PCT,
  RBI_TOLERANCE_PCT,
  SERIES_END_FY,
  adjustForInflation,
  fyLabel,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  amount: "10000",
  fromYear: String(BASE_FY),
  toYear: String(SERIES_END_FY),
  assumedRatePct: String(RBI_TARGET_PCT),
};

const YEAR_CHOICES = [];
for (let year = BASE_FY; year <= SERIES_END_FY + MAX_PROJECTION_YEARS; year += 1) {
  YEAR_CHOICES.push(year);
}

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [fromYear, setFromYear] = useState(DEFAULTS.fromYear);
  const [toYear, setToYear] = useState(DEFAULTS.toYear);
  const [assumedRatePct, setAssumedRatePct] = useState(DEFAULTS.assumedRatePct);
  const [copied, setCopied] = useState(false);

  const needsAssumption =
    Math.max(Number(fromYear) || BASE_FY, Number(toYear) || BASE_FY) > SERIES_END_FY;

  const result = useMemo(() => {
    const parsedAmount = toNumber(amount);
    const parsedFrom = toNumber(fromYear);
    const parsedTo = toNumber(toYear);
    const parsedRate = toNumber(assumedRatePct);
    if ([parsedAmount, parsedFrom, parsedTo].some((value) => Number.isNaN(value))) {
      return { error: "Enter an amount and pick both years." };
    }
    return adjustForInflation({
      amount: parsedAmount,
      fromYear: Math.trunc(parsedFrom),
      toYear: Math.trunc(parsedTo),
      assumedRatePct: Number.isNaN(parsedRate) ? RBI_TARGET_PCT : parsedRate,
    });
  }, [amount, fromYear, toYear, assumedRatePct]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Inflation time machine — India CPI (Combined)",
      `${money2(result.amount)} in FY ${result.fromLabel} is worth ${money2(result.adjustedAmount)} in FY ${result.toLabel} money.`,
      `Prices rose ${result.totalInflationPct}% between FY ${result.earlierLabel} and FY ${result.laterLabel}.`,
      `Average annual inflation over ${result.years} year(s): ${result.averageAnnualPct}%`,
      `One rupee of FY ${result.earlierLabel} money buys ${result.purchasingPowerOfOneRupee} of FY ${result.laterLabel} money — ${result.purchasingPowerLostPct}% of the purchasing power is gone.`,
      result.usesProjection
        ? `Years after FY ${fyLabel(SERIES_END_FY)} are projected at an assumed ${result.assumedRatePct}% a year.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setAmount(DEFAULTS.amount);
    setFromYear(DEFAULTS.fromYear);
    setToYear(DEFAULTS.toYear);
    setAssumedRatePct(DEFAULTS.assumedRatePct);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <History className="h-4 w-4" aria-hidden="true" />
          All-India CPI (Combined), base 2012 = 100
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Inflation Time Machine India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Restate any rupee amount in the money of another financial year using the published CPI
          inflation series. Run it forward to see what a salary needs to become, or backwards to see
          what an old price is worth now.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="itm-amount">
              Amount (INR)
            </label>
            <input
              id="itm-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="itm-from">
              In the money of financial year
            </label>
            <select
              id="itm-from"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fromYear}
              onChange={(event) => setFromYear(event.target.value)}
            >
              {YEAR_CHOICES.map((year) => (
                <option key={year} value={String(year)}>
                  FY {fyLabel(year)}
                  {year > SERIES_END_FY ? " (projected)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="itm-to">
              Restate into financial year
            </label>
            <select
              id="itm-to"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toYear}
              onChange={(event) => setToYear(event.target.value)}
            >
              {YEAR_CHOICES.map((year) => (
                <option key={year} value={String(year)}>
                  FY {fyLabel(year)}
                  {year > SERIES_END_FY ? " (projected)" : ""}
                </option>
              ))}
            </select>
          </div>
          {needsAssumption && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="itm-rate">
                Assumed inflation after FY {fyLabel(SERIES_END_FY)} (%)
              </label>
              <input
                id="itm-rate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="50"
                step="0.1"
                value={assumedRatePct}
                onChange={(event) => setAssumedRatePct(event.target.value)}
              />
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                India's monetary policy target is {RBI_TARGET_PCT}% with a tolerance band of{" "}
                {RBI_TOLERANCE_PCT} percentage points either side, so {RBI_TARGET_PCT}% is a
                reasonable starting assumption.
              </p>
            </div>
          )}
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
              {hasError ? "Worth today" : `Worth in FY ${result.toLabel} money`}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? "—" : money2(result.adjustedAmount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "—"
                : `${money(result.amount)} in FY ${result.fromLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the inflation adjusted amount"
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
          {[
            ["Years apart", hasError ? "—" : `${result.years}`],
            [
              "Cumulative inflation between them",
              hasError ? "—" : `${result.totalInflationPct}%`,
            ],
            ["Average annual inflation", hasError ? "—" : `${result.averageAnnualPct}%`],
            [
              "What one rupee of the earlier year buys",
              hasError ? "—" : `${result.purchasingPowerOfOneRupee} rupees of later-year money`,
            ],
            ["Purchasing power lost", hasError ? "—" : `${result.purchasingPowerLostPct}%`],
            [
              "CPI index used",
              hasError ? "—" : `${result.fromIndex} to ${result.toIndex} (FY ${fyLabel(BASE_FY)} = 100)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.usesProjection && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2.5 text-sm text-[var(--muted-foreground)]">
            Published CPI data ends at FY {fyLabel(SERIES_END_FY)}. Anything after that is projected
            at your assumed {result.assumedRatePct}% a year and is an estimate, not a measurement.
          </p>
        )}
      </section>

      {!hasError && result.walk.length > 1 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Financial year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    CPI inflation
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Value of the amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.walk.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      FY {row.label}
                      {row.projected ? (
                        <span className="ml-2 rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs text-[var(--muted-foreground)]">
                          projected
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {row.inflationPct === null ? "base" : `${row.inflationPct}%`}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only. Figures come from the published annual average all-India CPI (Combined)
        series, which MoSPI can revise by around a tenth of a percentage point. The series starts at
        FY {fyLabel(BASE_FY)} because that is where a single consistent rural-plus-urban index
        begins — CPI-IW and other older indices are not directly comparable. Your own cost of living
        depends on your basket, which may differ sharply from the national average.
      </p>
    </main>
  );
}
