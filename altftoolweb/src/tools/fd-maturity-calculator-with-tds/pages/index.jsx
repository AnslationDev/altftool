"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  SENIOR_AGE,
  TDS_RATE,
  TDS_THRESHOLD,
  TDS_THRESHOLD_SENIOR,
  computeFdMaturity,
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

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  principal: "500000",
  rate: "7.1",
  years: "5",
  months: "0",
  slab: "30",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [isSenior, setIsSenior] = useState(false);
  const [panFurnished, setPanFurnished] = useState(true);
  const [formFiled, setFormFiled] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFdMaturity({
        principal: toNumber(principal),
        annualRate: toNumber(rate),
        years: toNumber(years) || 0,
        months: toNumber(months) || 0,
        isSenior,
        panFurnished,
        formFiled,
        taxSlabPercent: toNumber(slab) || 0,
      }),
    [principal, rate, years, months, slab, isSenior, panFurnished, formFiled],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Bank FD Maturity Calculator with TDS",
      `Deposit: ${money(result.principal)} at ${pct(result.annualRate)} for ${result.totalMonths} months`,
      `Maturity value: ${money(result.maturityValue)}`,
      `Total interest: ${money(result.totalInterest)}`,
      `Effective annual yield: ${pct(result.effectiveYield)}`,
      `TDS deducted over the term: ${money(result.totalTds)}`,
      `Tax at ${pct(result.taxSlabPercent)} slab: ${money(result.taxOnInterest)}`,
      `Value after tax: ${money(result.postTaxValue)}`,
      `Post-tax annual return: ${pct(result.postTaxYield)}`,
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
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setMonths(DEFAULTS.months);
    setSlab(DEFAULTS.slab);
    setIsSenior(false);
    setPanFurnished(true);
    setFormFiled(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Fixed deposit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bank FD Maturity Calculator with TDS
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Quarterly compounding gives your deposit a higher effective yield than the quoted rate.
          This shows the maturity value, the interest credited in each year, the TDS the bank
          deducts under section 194A and what is left after tax at your slab.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-principal">
              Deposit amount (INR)
            </label>
            <input
              id="fd-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-rate">
              Interest rate (% per year)
            </label>
            <input
              id="fd-rate"
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
            <label className={LABEL_CLASS} htmlFor="fd-years">
              Term — years
            </label>
            <input
              id="fd-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-months">
              Term — extra months
            </label>
            <input
              id="fd-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-slab">
              Your marginal slab rate
            </label>
            <select
              id="fd-slab"
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
          <fieldset className="rounded-md border border-[var(--border)] p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              TDS status
            </legend>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="fd-senior">
              <input
                id="fd-senior"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={isSenior}
                onChange={(event) => setIsSenior(event.target.checked)}
              />
              Depositor is {SENIOR_AGE} or older
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="fd-pan">
              <input
                id="fd-pan"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              PAN given to the bank
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="fd-form">
              <input
                id="fd-form"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={formFiled}
                onChange={(event) => setFormFiled(event.target.checked)}
              />
              Form 15G / 15H filed
            </label>
          </fieldset>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3, 5].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setYears(String(term));
                setMonths("0");
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {term} year{term > 1 ? "s" : ""}
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
                : `${money(result.principal)} grows by ${money(result.totalInterest)} over ${result.totalMonths} months`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy fixed deposit maturity result"
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
            ["Total interest earned", show(result.totalInterest)],
            ["Effective annual yield (quarterly compounding)", show(result.effectiveYield, pct)],
            [
              "TDS threshold that applies to you",
              hasError ? DASH : money(result.tdsThreshold),
            ],
            ["TDS deducted across the term", show(result.totalTds)],
            ["Amount credited at maturity after TDS", show(result.payoutAtMaturity)],
            [
              `Tax on interest at ${hasError ? DASH : pct(result.taxSlabPercent)}`,
              show(result.taxOnInterest),
            ],
            [
              result.excessTdsRefundable > 0 ? "Excess TDS refundable" : "Balance tax still payable",
              show(
                result.excessTdsRefundable > 0
                  ? result.excessTdsRefundable
                  : result.balanceTaxPayable,
              ),
            ],
            ["Value after tax", show(result.postTaxValue)],
            ["Post-tax annual return", show(result.postTaxYield, pct)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.anyTds && !formFiled && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            No year's interest crosses{" "}
            {money(isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD)}, so the bank deducts no TDS on
            this deposit. The interest is still fully taxable at your slab rate.
          </p>
        )}
        {!hasError && !panFurnished && result.anyTds && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            Without PAN the bank must deduct at 20% under section 206AA instead of {TDS_RATE}%, and
            the deduction will not show in your Form 26AS against your name.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Interest credited year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Opening
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
                    <td className="py-2 pr-3 text-right">{money(row.opening)}</td>
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
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            TDS is tested on the interest credited in each year across all your deposits at that
            bank, so a second deposit at the same branch can push you over the threshold even when
            this one alone stays under it.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Banks round interest to the rupee, may use a 365 or 366 day base for
        broken periods, and quote different rates for different tenure buckets. Confirm the figure
        on your deposit advice, and consult a tax professional about your own position.
      </p>
    </main>
  );
}
