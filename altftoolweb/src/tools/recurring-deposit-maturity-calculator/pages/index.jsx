"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

import {
  TDS_THRESHOLD,
  TDS_THRESHOLD_SENIOR,
  computeRdMaturity,
  instalmentForTarget,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];
const TENURE_PRESETS = [12, 24, 36, 60];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  instalment: "5000",
  rate: "6.75",
  months: "36",
  slab: "30",
  target: "500000",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [instalment, setInstalment] = useState(DEFAULTS.instalment);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [isSenior, setIsSenior] = useState(false);
  const [panFurnished, setPanFurnished] = useState(true);
  const [formFiled, setFormFiled] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRdMaturity({
        instalment: toNumber(instalment),
        annualRate: toNumber(rate),
        months: toNumber(months),
        isSenior,
        panFurnished,
        formFiled,
        taxSlabPercent: toNumber(slab) || 0,
      }),
    [instalment, rate, months, slab, isSenior, panFurnished, formFiled],
  );

  const neededInstalment = useMemo(
    () =>
      instalmentForTarget({
        target: toNumber(target),
        annualRate: toNumber(rate),
        months: toNumber(months),
      }),
    [target, rate, months],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Recurring Deposit Maturity Calculator",
      `Monthly instalment: ${money(result.instalment)} for ${result.months} months at ${pct(result.annualRate)}`,
      `Total deposited: ${money(result.totalDeposited)}`,
      `Maturity value: ${money(result.maturityValue)}`,
      `Interest earned: ${money(result.totalInterest)}`,
      `TDS deducted: ${money(result.totalTds)}`,
      `Tax at ${pct(result.taxSlabPercent)} slab: ${money(result.taxOnInterest)}`,
      `Value after tax: ${money(result.postTaxValue)}`,
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
    setInstalment(DEFAULTS.instalment);
    setRate(DEFAULTS.rate);
    setMonths(DEFAULTS.months);
    setSlab(DEFAULTS.slab);
    setTarget(DEFAULTS.target);
    setIsSenior(false);
    setPanFurnished(true);
    setFormFiled(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Recurring deposit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Recurring Deposit Maturity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Each instalment earns interest only from the month you pay it, compounded quarterly. This
          works out the maturity value, the interest credited in each year, TDS under section 194A
          and the amount left after tax at your slab.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-instalment">
              Monthly instalment (INR)
            </label>
            <input
              id="rd-instalment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={instalment}
              onChange={(event) => setInstalment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-rate">
              Interest rate (% per year)
            </label>
            <input
              id="rd-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-months">
              Tenure (months)
            </label>
            <input
              id="rd-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="6"
              max="120"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-slab">
              Your marginal slab rate
            </label>
            <select
              id="rd-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              {SLAB_RATES.map((value) => (
                <option key={value} value={String(value)}>
                  {value}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4 rounded-md border border-[var(--border)] p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            TDS status
          </legend>
          <div className="grid gap-1 sm:grid-cols-3">
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="rd-senior">
              <input
                id="rd-senior"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={isSenior}
                onChange={(event) => setIsSenior(event.target.checked)}
              />
              Senior citizen
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="rd-pan">
              <input
                id="rd-pan"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              PAN given to bank
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="rd-form">
              <input
                id="rd-form"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={formFiled}
                onChange={(event) => setFormFiled(event.target.checked)}
              />
              Form 15G / 15H filed
            </label>
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          {TENURE_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMonths(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value} months
            </button>
          ))}
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
              Maturity value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.maturityValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : `${money(result.totalDeposited)} paid in, ${money(result.totalInterest)} earned`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy recurring deposit result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
            ["Total deposited over the term", show(result.totalDeposited)],
            ["Interest earned", show(result.totalInterest)],
            ["Interest as a share of what you paid in", show(result.interestOnDeposits, pct)],
            ["Effective annual yield on money invested", show(result.effectiveYield, pct)],
            ["TDS threshold that applies to you", hasError ? DASH : money(result.tdsThreshold)],
            ["TDS deducted across the term", show(result.totalTds)],
            ["Credited at maturity after TDS", show(result.payoutAtMaturity)],
            [
              `Tax on interest at ${hasError ? DASH : pct(result.taxSlabPercent)}`,
              show(result.taxOnInterest),
            ],
            ["Value after tax", show(result.postTaxValue)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.anyTds && !formFiled && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            No year's interest crosses {money(isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD)}, so
            the bank deducts nothing — but the interest is still taxable at your slab rate.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Work backwards from a goal</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-target">
              Amount you want at maturity (INR)
            </label>
            <input
              id="rd-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Instalment needed
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {neededInstalment === null ? DASH : money(neededInstalment)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              a month, at the same rate and tenure as above
            </p>
          </div>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Interest credited year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Paid in
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Interest
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    TDS
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Closing
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.year}
                      {row.monthsInYear < 12 && (
                        <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">
                          ({row.monthsInYear} mo)
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.deposits)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.interest)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.tdsDeducted ? money(row.tds) : "Nil"}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Banks round to the rupee, charge a penalty for missed instalments,
        and pay a reduced rate if the deposit is closed early. Confirm the figure on your deposit
        receipt and consult a tax professional about your own position.
      </p>
    </main>
  );
}
