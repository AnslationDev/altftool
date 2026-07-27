"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import {
  absoluteToAnnualised,
  annualisedToAbsolute,
  applyToAmount,
  buildHorizonTable,
  PERIOD_UNITS,
  periodToYears,
} from "../lib";

const DEFAULTS = {
  direction: "absToAnn",
  absolute: "100",
  annualised: "12",
  periodAmount: "5",
  periodUnit: "years",
  amount: "100000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [absolute, setAbsolute] = useState(DEFAULTS.absolute);
  const [annualised, setAnnualised] = useState(DEFAULTS.annualised);
  const [periodAmount, setPeriodAmount] = useState(DEFAULTS.periodAmount);
  const [periodUnit, setPeriodUnit] = useState(DEFAULTS.periodUnit);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [copied, setCopied] = useState(false);

  const toAnnualised = direction === "absToAnn";

  const period = useMemo(
    () => periodToYears(toNumber(periodAmount), periodUnit),
    [periodAmount, periodUnit],
  );

  const result = useMemo(() => {
    if (period.error) return { error: period.error };
    return toAnnualised
      ? absoluteToAnnualised({ absolutePercent: toNumber(absolute), years: period.years })
      : annualisedToAbsolute({ annualisedPercent: toNumber(annualised), years: period.years });
  }, [toAnnualised, absolute, annualised, period]);

  const moneyView = useMemo(() => {
    if (result.error) return null;
    return applyToAmount(toNumber(amount), result.annualisedPercent, result.years);
  }, [amount, result]);

  const horizons = useMemo(
    () => (result.error ? [] : buildHorizonTable(result.annualisedPercent)),
    [result],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Absolute vs Annualised Return",
      `Holding period: ${num(result.years)} years`,
      `Absolute (total) return: ${pct(result.absolutePercent)}`,
      `Annualised return (CAGR): ${pct(result.annualisedPercent)} per year`,
      `Growth multiple: ${num(result.multiple)}x`,
      `Simple average per year: ${pct(result.simpleAnnualPercent)}`,
      result.doublingYears
        ? `Years to double at this rate: ${num(result.doublingYears)}`
        : "Doubling time: not applicable at a flat or negative rate",
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
    setDirection(DEFAULTS.direction);
    setAbsolute(DEFAULTS.absolute);
    setAnnualised(DEFAULTS.annualised);
    setPeriodAmount(DEFAULTS.periodAmount);
    setPeriodUnit(DEFAULTS.periodUnit);
    setAmount(DEFAULTS.amount);
    setCopied(false);
  };

  const headlineLabel = toAnnualised ? "Annualised return (CAGR)" : "Absolute (total) return";
  const headlineValue = toAnnualised
    ? pct(result.annualisedPercent)
    : pct(result.absolutePercent);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Return converter
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Absolute vs Annualised Return Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a whole-period gain into a yearly compounded rate, or a yearly rate into the total
          gain it produces. Both directions use the exact identity 1 + absolute = (1 + annualised)
          <sup>years</sup>.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Direction</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["absToAnn", "Absolute → annualised"],
              ["annToAbs", "Annualised → absolute"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`dir-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  direction === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`dir-${value}`}
                  type="radio"
                  name="direction"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={direction === value}
                  onChange={(event) => setDirection(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {toAnnualised ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="abs-return">
                Absolute (total) return over the whole period (%)
              </label>
              <input
                id="abs-return"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                value={absolute}
                onChange={(event) => setAbsolute(event.target.value)}
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ann-return">
                Annualised return (% per year)
              </label>
              <input
                id="ann-return"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                value={annualised}
                onChange={(event) => setAnnualised(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="period-amount">
              Holding period
            </label>
            <input
              id="period-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={periodAmount}
              onChange={(event) => setPeriodAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="period-unit">
              Period unit
            </label>
            <select
              id="period-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={periodUnit}
              onChange={(event) => setPeriodUnit(event.target.value)}
            >
              {Object.entries(PERIOD_UNITS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="start-amount">
              Optional: amount invested (INR) to see the result in money
            </label>
            <input
              id="start-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {headlineLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : headlineValue}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : toAnnualised
                  ? `compounded each year over ${num(result.years)} years`
                  : `total gain across ${num(result.years)} years`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy converted return to clipboard"
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
            ["Absolute (total) return", hasError ? DASH : pct(result.absolutePercent)],
            ["Annualised return (CAGR)", hasError ? DASH : pct(result.annualisedPercent)],
            ["Growth multiple over the period", hasError ? DASH : `${num(result.multiple)}x`],
            [
              "Simple average per year (total ÷ years)",
              hasError ? DASH : pct(result.simpleAnnualPercent),
            ],
            [
              "Simple average overstates the true rate by",
              hasError ? DASH : `${num(result.simpleOverstatementPoints)} percentage points`,
            ],
            [
              "Years to double at this rate",
              hasError || !result.doublingYears ? DASH : `${num(result.doublingYears)} years`,
            ],
            [
              "Value of the amount invested",
              hasError || !moneyView || moneyView.error ? DASH : money(moneyView.endAmount),
            ],
            [
              "Gain in money terms",
              hasError || !moneyView || moneyView.error ? DASH : money(moneyView.gain),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && horizons.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">
            The same {pct(result.annualisedPercent)} a year over other horizons
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Useful when comparing a fund quoted over 3 years against one quoted over 10.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Years held
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Absolute return
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Multiple
                  </th>
                </tr>
              </thead>
              <tbody>
                {horizons.map((row) => (
                  <tr key={row.years} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.years}</td>
                    <td className="py-2 pr-3 text-right">{pct(row.absolutePercent)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {num(row.multiple)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Annualising a return only makes sense for a single lump sum held over one continuous period.
        If money went in or came out along the way, use an XIRR or money-weighted return instead.
        Informational only, not investment advice.
      </p>
    </main>
  );
}
