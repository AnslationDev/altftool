"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import {
  KVP_ANNUAL_RATE,
  KVP_MIN_INVESTMENT,
  KVP_MULTIPLE,
  KVP_TENURE_MONTHS,
  computeKvp,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num2 = (value) => NUM2.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  amount: "100000",
  rate: String(KVP_ANNUAL_RATE),
  months: String(KVP_TENURE_MONTHS),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

const tenureLabel = (tenure) => {
  if (!tenure) return DASH;
  const parts = [];
  if (tenure.years) parts.push(`${tenure.years} year${tenure.years === 1 ? "" : "s"}`);
  if (tenure.months) parts.push(`${tenure.months} month${tenure.months === 1 ? "" : "s"}`);
  return parts.length ? parts.join(" ") : "0 months";
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeKvp({
        principal: toNumber(amount),
        annualRate: toNumber(rate),
        tenureMonths: toNumber(months),
      }),
    [amount, rate, months],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Kisan Vikas Patra Doubling Calculator",
      `Amount invested: ${money(result.principal)}`,
      `Interest rate: ${num2(result.annualRate)}% p.a. compounded annually`,
      `Holding period: ${result.tenureMonths} months (${tenureLabel(result.tenure)})`,
      `Maturity value: ${money(result.maturityValue)}`,
      `Interest earned: ${money(result.interest)}`,
      `Growth: ${num2(result.growthMultiple)}x`,
      `Exact doubling period at this rate: ${num2(result.exactDoublingMonths)} months`,
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
    setAmount(DEFAULTS.amount);
    setRate(DEFAULTS.rate);
    setMonths(DEFAULTS.months);
    setCopied(false);
  };

  const useNotified = () => {
    setRate(String(KVP_ANNUAL_RATE));
    setMonths(String(KVP_TENURE_MONTHS));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          KVP
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Kisan Vikas Patra Doubling Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Kisan Vikas Patra pays {num2(KVP_ANNUAL_RATE)}% a year compounded annually and is notified
          to mature at exactly double the amount invested in {KVP_TENURE_MONTHS} months. Change the
          rate or the holding period to see how the doubling period moves.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kvp-amount">
              Amount invested (₹)
            </label>
            <input
              id="kvp-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kvp-rate">
              Interest rate (% p.a., compounded yearly)
            </label>
            <input
              id="kvp-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="25"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kvp-months">
              Holding period (months)
            </label>
            <input
              id="kvp-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              The notified tenure is {KVP_TENURE_MONTHS} months (9 years 7 months) at{" "}
              {num2(KVP_ANNUAL_RATE)}% p.a.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={useNotified} className={GHOST_BTN}>
            Use notified {num2(KVP_ANNUAL_RATE)}% / {KVP_TENURE_MONTHS} months
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Maturity value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.maturityValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see the maturity value."
                : `After ${result.tenureMonths} months (${tenureLabel(result.tenure)}) at ${num2(
                    result.annualRate,
                  )}% p.a.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Kisan Vikas Patra result"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Amount invested", hasError ? DASH : money(result.principal)],
            ["Interest earned", hasError ? DASH : money(result.interest)],
            ["Growth on investment", hasError ? DASH : `${num2(result.growthMultiple)}×`],
            [
              "Total return over the period",
              hasError ? DASH : `${num2(result.totalReturnPercent)}%`,
            ],
            [
              "Exact doubling period at this rate",
              hasError
                ? DASH
                : `${num2(result.exactDoublingMonths)} months (${tenureLabel(
                    result.doublingTenure,
                  )})`,
            ],
            [
              "Premature closure allowed after",
              hasError ? DASH : tenureLabel(result.prematureLockTenure),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.isNotifiedCombination && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            This is a rate and tenure combination notified by the Ministry of Finance, so the
            certificate matures at exactly twice its face value.
          </p>
        )}

        {!hasError && (result.belowMinimum || result.offMultiple) && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            {result.belowMinimum
              ? `The scheme minimum is ${money(KVP_MIN_INVESTMENT)}. `
              : ""}
            {result.offMultiple
              ? `Certificates are issued in multiples of ${money(KVP_MULTIPLE)}, so the counter will round your purchase.`
              : ""}
          </p>
        )}
      </section>

      {!hasError && result.schedule.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Year-by-year growth</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Period
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Opening
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Interest
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Closing
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{money(row.opening)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.interest)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Interest is compounded once a year and paid only at maturity, so nothing reaches your
            bank account until the certificate is encashed.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. KVP interest is fully taxable as income from other sources in the year of
        accrual or receipt, no deduction is available under section 80C, and the rate is reset by the
        Ministry of Finance every quarter for fresh purchases. Confirm the rate in force and your tax
        position with the post office or a qualified adviser.
      </p>
    </main>
  );
}
