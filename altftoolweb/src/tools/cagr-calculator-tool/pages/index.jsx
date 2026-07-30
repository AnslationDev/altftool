"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import { buildGrowthPath, computeCagr, yearsBetween } from "../lib";

const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "₹ Indian rupee" },
  { code: "USD", locale: "en-US", label: "$ US dollar" },
  { code: "EUR", locale: "de-DE", label: "€ Euro" },
  { code: "GBP", locale: "en-GB", label: "£ Pound sterling" },
];

const DEFAULTS = {
  beginValue: "250000",
  endValue: "1000000",
  years: "10",
  startDate: "2015-04-01",
  endDate: "2025-04-01",
  currency: "INR",
  mode: "years",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [beginValue, setBeginValue] = useState(DEFAULTS.beginValue);
  const [endValue, setEndValue] = useState(DEFAULTS.endValue);
  const [years, setYears] = useState(DEFAULTS.years);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [copied, setCopied] = useState(false);

  const active = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];

  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(active.locale, {
      style: "currency",
      currency: active.code,
      maximumFractionDigits: 0,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [active]);

  const num = useMemo(() => {
    const formatter = new Intl.NumberFormat(active.locale, { maximumFractionDigits: 2 });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [active]);

  const pct = useMemo(
    () => (value) => (Number.isFinite(value) ? `${num(value)}%` : DASH),
    [num],
  );

  const period = useMemo(() => {
    if (mode === "dates") return yearsBetween(startDate, endDate);
    const value = toNumber(years);
    if (Number.isNaN(value)) return { error: "Enter the holding period in years." };
    if (value <= 0) return { error: "The holding period must be greater than zero." };
    return { years: value, days: null };
  }, [mode, years, startDate, endDate]);

  const result = useMemo(() => {
    if (period.error) return { error: period.error };
    return computeCagr({
      beginValue: toNumber(beginValue),
      endValue: toNumber(endValue),
      years: period.years,
    });
  }, [beginValue, endValue, period]);

  const path = useMemo(() => {
    if (result.error) return [];
    return buildGrowthPath({
      beginValue: result.beginValue,
      cagr: result.cagr,
      years: result.years,
    });
  }, [result]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "CAGR & Doubling Time Calculator",
      `Starting value: ${money(result.beginValue)}`,
      `Ending value: ${money(result.endValue)}`,
      `Period: ${num(result.years)} years`,
      `CAGR: ${pct(result.cagrPercent)} per year`,
      `Absolute return: ${pct(result.absoluteReturnPercent)}`,
      `Growth multiple: ${num(result.multiple)}x`,
      `Total gain: ${money(result.totalGain)}`,
      result.doublingYears
        ? `Doubling time at this rate: ${num(result.doublingYears)} years`
        : "Doubling time: not applicable at a flat or negative rate",
    ].join("\n");
  }, [result, money, num, pct]);

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
    setBeginValue(DEFAULTS.beginValue);
    setEndValue(DEFAULTS.endValue);
    setYears(DEFAULTS.years);
    setStartDate(DEFAULTS.startDate);
    setEndDate(DEFAULTS.endDate);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  const hasError = Boolean(result.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Growth rate
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">CAGR & Doubling Time Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what an investment was worth at the start and the end, plus how long you held it, to
          get the compound annual growth rate — the constant yearly rate that links the two values.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cagr-begin">
              Starting value
            </label>
            <input
              id="cagr-begin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={beginValue}
              onChange={(event) => setBeginValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cagr-end">
              Ending value
            </label>
            <input
              id="cagr-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={endValue}
              onChange={(event) => setEndValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cagr-currency">
              Currency
            </label>
            <select
              id="cagr-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cagr-mode">
              Period entered as
            </label>
            <select
              id="cagr-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="years">Number of years</option>
              <option value="dates">Start and end dates</option>
            </select>
          </div>

          {mode === "years" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="cagr-years">
                Holding period (years)
              </label>
              <input
                id="cagr-years"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="cagr-start-date">
                  Start date
                </label>
                <input
                  id="cagr-start-date"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="cagr-end-date">
                  End date
                </label>
                <input
                  id="cagr-end-date"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </>
          )}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Compound annual growth rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : pct(result.cagrPercent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `per year over ${num(result.years)} years`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy CAGR result to clipboard"
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
            ["Absolute (total) return", hasError ? DASH : pct(result.absoluteReturnPercent)],
            ["Growth multiple", hasError ? DASH : `${num(result.multiple)}x`],
            ["Total gain", hasError ? DASH : money(result.totalGain)],
            [
              "Simple average per year (not compounded)",
              hasError ? DASH : pct(result.simpleAnnualReturnPercent),
            ],
            [
              "Years to double at this rate",
              hasError || !result.doublingYears ? DASH : `${num(result.doublingYears)} years`,
            ],
            [
              "Period used",
              hasError
                ? DASH
                : `${num(result.years)} years${period.days ? ` (${num(period.days)} days)` : ""}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && path.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Smooth growth path at this CAGR</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            What the value would be each year if it compounded at exactly {pct(result.cagrPercent)}.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Value
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cumulative gain
                  </th>
                </tr>
              </thead>
              <tbody>
                {path.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{num(row.year)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.value)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {money(row.gain)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        CAGR smooths out every peak and dip in between, so two investments with the same CAGR can
        have very different volatility. It also ignores money added or withdrawn mid-period — use an
        XIRR calculation for a portfolio with ongoing contributions. Informational only, not
        investment advice.
      </p>
    </main>
  );
}
