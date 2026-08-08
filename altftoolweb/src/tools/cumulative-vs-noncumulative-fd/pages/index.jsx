"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import { PAYOUT_FREQUENCIES, compareFdStructures } from "../lib";

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
  principal: "1000000",
  rate: "7.25",
  years: "5",
  frequency: "12",
  reinvestRate: "6",
  slab: "30",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [isSenior, setIsSenior] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setFields((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      compareFdStructures({
        principal: toNumber(fields.principal),
        annualRate: toNumber(fields.rate),
        years: toNumber(fields.years),
        frequency: toNumber(fields.frequency),
        reinvestRate: toNumber(fields.reinvestRate) || 0,
        taxSlabPercent: toNumber(fields.slab) || 0,
        isSenior,
      }),
    [fields, isSenior],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cumulative vs Non Cumulative FD Comparator",
      `${money(result.principal)} at ${pct(result.annualRate)} for ${result.years} years`,
      "",
      `Cumulative maturity: ${money(result.cumulativeMaturity)} (interest ${money(result.cumulativeInterest)})`,
      `${result.frequencyLabel} payout: ${money(result.payout)} each time, ${money(result.annualIncome)} a year`,
      `Non-cumulative total received: ${money(result.nonCumulativeTotal)}`,
      `Compounding advantage: ${money(result.compoundingAdvantage)}`,
      result.breakEvenReinvestRate === null
        ? ""
        : `Break-even reinvestment rate: ${pct(result.breakEvenReinvestRate)}`,
      `Reinvesting payouts at ${pct(result.reinvestRate)} gives ${money(result.nonCumulativeWithReinvestment)}`,
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
    setFields(DEFAULTS);
    setIsSenior(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Deposit structure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cumulative vs Non Cumulative FD Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Same bank, same rate, same tenure — but one deposit compounds and the other pays you an
          income. This shows the payout you would actually receive, what compounding is worth over
          the term, and the reinvestment rate at which the two draw level.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-principal">
              Deposit amount (INR)
            </label>
            <input
              id="cn-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={fields.principal}
              onChange={(event) => setField("principal", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-rate">
              Interest rate (% per year)
            </label>
            <input
              id="cn-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={fields.rate}
              onChange={(event) => setField("rate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-years">
              Tenure (years)
            </label>
            <input
              id="cn-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="1"
              value={fields.years}
              onChange={(event) => setField("years", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-frequency">
              Payout frequency on the non-cumulative option
            </label>
            <select
              id="cn-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fields.frequency}
              onChange={(event) => setField("frequency", event.target.value)}
            >
              {PAYOUT_FREQUENCIES.map((item) => (
                <option key={item.value} value={String(item.value)}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-reinvest">
              Rate you would reinvest payouts at (%)
            </label>
            <input
              id="cn-reinvest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="25"
              step="0.25"
              value={fields.reinvestRate}
              onChange={(event) => setField("reinvestRate", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Set 0 if the income is spent rather than reinvested.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-slab">
              Your marginal slab rate
            </label>
            <select
              id="cn-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fields.slab}
              onChange={(event) => setField("slab", event.target.value)}
            >
              {SLAB_RATES.map((value) => (
                <option key={value} value={String(value)}>
                  {value}%
                </option>
              ))}
            </select>
          </div>
        </div>
        <label
          className="mt-4 flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm"
          htmlFor="cn-senior"
        >
          <input
            id="cn-senior"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={isSenior}
            onChange={(event) => setIsSenior(event.target.checked)}
          />
          Depositor is a resident senior citizen (higher TDS threshold)
        </label>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              What compounding is worth over the term
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.compoundingAdvantage)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : `extra interest a cumulative deposit earns over ${result.frequencyLabel.toLowerCase()} payouts left uninvested`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy deposit structure comparison"
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cumulative (reinvestment)
            </p>
            <p className="mt-1 text-2xl font-semibold">{show(result.cumulativeMaturity)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              nothing paid out until maturity
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Non-cumulative" : `${result.frequencyLabel} payout`}
            </p>
            <p className="mt-1 text-2xl font-semibold">{show(result.payout)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {hasError ? DASH : `${money(result.annualIncome)} a year, principal returned at maturity`}
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cumulative interest over the term", show(result.cumulativeInterest)],
            ["Total payouts received on the non-cumulative deposit", show(result.totalPayouts)],
            ["Principal plus payouts received", show(result.nonCumulativeTotal)],
            [
              "Break-even reinvestment rate",
              hasError || result.breakEvenReinvestRate === null
                ? DASH
                : pct(result.breakEvenReinvestRate),
            ],
            [
              `Payouts reinvested at ${hasError ? DASH : pct(result.reinvestRate)}`,
              show(result.nonCumulativeWithReinvestment),
            ],
            ["Effective annual yield on the cumulative deposit", show(result.effectiveAnnualYield, pct)],
            ["TDS over the term — cumulative", show(result.cumulativeTds)],
            ["TDS over the term — non-cumulative", show(result.nonCumulativeTds)],
            [
              `Value after tax at ${hasError ? DASH : pct(result.taxSlabPercent)} — cumulative`,
              show(result.cumulativePostTax),
            ],
            [
              `Value after tax at ${hasError ? DASH : pct(result.taxSlabPercent)} — non-cumulative`,
              show(result.nonCumulativePostTax),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.breakEvenReinvestRate === null
              ? "The payout stream cannot match the cumulative deposit at any sensible reinvestment rate over this term."
              : `Reinvest the payouts above ${pct(result.breakEvenReinvestRate)} and the non-cumulative deposit wins; below it, the cumulative deposit does. At the ${pct(result.reinvestRate)} you entered, the ${result.betterForGrowth} deposit ends up ahead.`}
          </p>
        )}
        {!hasError && result.frequency === 12 && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            The monthly payout of {money(result.payout)} is lower than the {money(result.simpleMonthlyGuess)}{" "}
            that dividing the rate by twelve suggests, because banks discount interest paid before
            the quarter ends.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Banks round to the rupee and some price monthly-income deposits at a
        separate card rate. Interest is taxable on both structures — an accrual-basis taxpayer pays
        tax on cumulative interest each year even though nothing has been received. Consult a tax
        professional about your own position.
      </p>
    </main>
  );
}
