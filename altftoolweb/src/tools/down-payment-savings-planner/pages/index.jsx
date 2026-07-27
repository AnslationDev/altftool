"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";

import { planDownPayment } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  price: "8000000",
  years: "3",
  growth: "5",
  downPct: "20",
  charges: "7",
  existing: "1000000",
  returnPct: "8",
  loanRate: "8.5",
  loanYears: "20",
};

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [years, setYears] = useState(DEFAULTS.years);
  const [growth, setGrowth] = useState(DEFAULTS.growth);
  const [downPct, setDownPct] = useState(DEFAULTS.downPct);
  const [charges, setCharges] = useState(DEFAULTS.charges);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [loanRate, setLoanRate] = useState(DEFAULTS.loanRate);
  const [loanYears, setLoanYears] = useState(DEFAULTS.loanYears);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planDownPayment({
        propertyPrice: price,
        yearsToBuy: years,
        priceGrowth: growth,
        downPaymentPct: downPct,
        chargesPct: charges,
        existingSavings: existing,
        expectedReturn: returnPct,
        loanRate,
        loanYears,
      }),
    [price, years, growth, downPct, charges, existing, returnPct, loanRate, loanYears],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "House Down Payment Plan",
      `Price on the purchase date: ${money(result.futurePrice)}`,
      `Down payment at ${num(result.downPaymentPct)}%: ${money(result.downPayment)}`,
      `Stamp duty, registration and charges: ${money(result.chargesAmount)}`,
      `Cash needed on the day: ${money(result.cashNeeded)}`,
      `Existing savings grown to then: ${money(result.existingFuture)}`,
      result.fullyFunded
        ? "No further monthly saving needed."
        : `Monthly saving required: ${money(result.monthlySaving)} for ${result.months} months`,
      `Loan of ${money(result.loanAmount)} at the chosen rate: EMI ${money(result.emi)}`,
      `RBI LTV ceiling for this value: ${result.maxLtvPct}% (minimum down payment ${money(result.minDownPayment)})`,
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
    setPrice(DEFAULTS.price);
    setYears(DEFAULTS.years);
    setGrowth(DEFAULTS.growth);
    setDownPct(DEFAULTS.downPct);
    setCharges(DEFAULTS.charges);
    setExisting(DEFAULTS.existing);
    setReturnPct(DEFAULTS.returnPct);
    setLoanRate(DEFAULTS.loanRate);
    setLoanYears(DEFAULTS.loanYears);
    setCopied(false);
  };

  const fields = [
    { id: "dp-price", label: "Property price today (₹)", value: price, set: setPrice, step: "100000", min: "0" },
    { id: "dp-years", label: "Years until you buy", value: years, set: setYears, step: "1", min: "1" },
    { id: "dp-growth", label: "Property price growth (% per year)", value: growth, set: setGrowth, step: "0.5", min: "0" },
    { id: "dp-down", label: "Down payment (% of price)", value: downPct, set: setDownPct, step: "1", min: "1" },
    { id: "dp-charges", label: "Stamp duty, registration & charges (%)", value: charges, set: setCharges, step: "0.5", min: "0" },
    { id: "dp-existing", label: "Already saved for this (₹)", value: existing, set: setExisting, step: "50000", min: "0" },
    { id: "dp-return", label: "Return on those savings (% per year)", value: returnPct, set: setReturnPct, step: "0.5", min: "0" },
    { id: "dp-loanrate", label: "Home loan rate (% per year)", value: loanRate, set: setLoanRate, step: "0.05", min: "0" },
    { id: "dp-loanyears", label: "Home loan tenure (years)", value: loanYears, set: setLoanYears, step: "1", min: "1" },
  ];

  const rows = hasError
    ? [
        ["Price on the purchase date", DASH],
        ["Down payment", DASH],
        ["Stamp duty, registration & charges", DASH],
        ["Cash needed on the day", DASH],
        ["Existing savings grown to then", DASH],
        ["Shortfall to save", DASH],
        ["You contribute", DASH],
        ["Growth contributes", DASH],
        ["Loan and EMI", DASH],
      ]
    : [
        [
          "Price on the purchase date",
          `${money(result.futurePrice)} (+${money(result.priceIncrease)})`,
        ],
        ["Down payment", `${money(result.downPayment)} at ${num(result.downPaymentPct)}%`],
        ["Stamp duty, registration & charges", money(result.chargesAmount)],
        ["Cash needed on the day", money(result.cashNeeded)],
        ["Existing savings grown to then", money(result.existingFuture)],
        ["Shortfall to save", money(result.gap)],
        ["You contribute", money(result.totalContributed)],
        ["Growth contributes", money(result.growthEarned)],
        [
          "Loan and EMI",
          `${money(result.loanAmount)} · ${money(result.emi)} for ${result.loanMonths} months`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Home purchase
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">House Down Payment Savings Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The down payment is only part of the cash you need. This planner inflates the price to
          the purchase date, adds stamp duty and registration — which no lender finances — grows
          what you already hold, and returns the monthly amount that closes the rest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
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
              Save every month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.monthlySaving)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : result.fullyFunded
                  ? "What you already hold covers the cash needed on the day."
                  : `For ${result.months} months, to reach ${money(result.cashNeeded)} in cash`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy down payment plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Against the RBI loan-to-value ceiling</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{result.ltvSlabLabel}</p>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Maximum LTV allowed</dt>
              <dd className="text-right font-semibold">{result.maxLtvPct}%</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Largest loan sanctionable</dt>
              <dd className="text-right font-semibold">{money(result.maxLoan)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Minimum down payment</dt>
              <dd className="text-right font-semibold">
                {money(result.minDownPayment)} ({num(result.minDownPaymentPct)}%)
              </dd>
            </div>
          </dl>
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm font-medium ${
              result.meetsLtvCap
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.meetsLtvCap
              ? "Your down payment satisfies the regulatory minimum. Individual lenders may still ask for more."
              : `Your down payment is ${money(result.shortfallVsCap)} below the regulatory minimum for a property at this value — a bank cannot lend the balance.`}
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Stamp duty and registration rates are set by each state and vary by buyer category, so
        check the rate where the property is registered. LTV ceilings shown are the RBI limits for
        individual housing loans; lenders often apply stricter internal policies. Informational
        only — not lending, tax or investment advice.
      </p>
    </main>
  );
}
