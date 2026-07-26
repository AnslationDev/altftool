"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = {
  principal: "800000",
  rate: "11",
  months: "36",
  chargePercent: "2",
  addGst: true,
  altReturn: "7",
};

const GST_RATE = 0.18;

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const num = (value, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const labelClass = "text-sm font-medium text-[var(--foreground)]";
const hintClass = "mt-1 text-xs text-[var(--muted-foreground)]";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ghostButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function monthsToLabel(months) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} month${rest === 1 ? "" : "s"}`;
  if (rest === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} yr ${rest} mo`;
}

function emiFor(principal, monthlyRate, months) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** Future value of an end-of-month annuity. */
function annuityFutureValue(payment, monthlyRate, months) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return payment * months;
  return payment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [chargePercent, setChargePercent] = useState(DEFAULTS.chargePercent);
  const [addGst, setAddGst] = useState(DEFAULTS.addGst);
  const [altReturn, setAltReturn] = useState(DEFAULTS.altReturn);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(
    () => ({
      principal: Number(principal),
      rate: Number(rate),
      months: Math.round(Number(months)),
      chargePercent: Number(chargePercent),
      altReturn: Number(altReturn),
    }),
    [principal, rate, months, chargePercent, altReturn]
  );

  const error = useMemo(() => {
    const values = [
      parsed.principal,
      parsed.rate,
      parsed.months,
      parsed.chargePercent,
      parsed.altReturn,
    ];
    if (!values.every((value) => Number.isFinite(value))) {
      return "Please enter numbers in every field.";
    }
    if (parsed.principal <= 0) return "Outstanding principal must be greater than zero.";
    if (parsed.rate < 0 || parsed.rate > 40) {
      return "Interest rate should be between 0% and 40% per year.";
    }
    if (parsed.months < 1 || parsed.months > 480) {
      return "Remaining tenure should be between 1 and 480 months.";
    }
    if (parsed.chargePercent < 0 || parsed.chargePercent > 10) {
      return "Foreclosure charge should be between 0% and 10% of the outstanding principal.";
    }
    if (parsed.altReturn < 0 || parsed.altReturn > 30) {
      return "Alternative return should be between 0% and 30% per year.";
    }
    return "";
  }, [parsed]);

  const result = useMemo(() => {
    if (error) return null;

    const monthlyRate = parsed.rate / 1200;
    const emi = emiFor(parsed.principal, monthlyRate, parsed.months);
    const remainingInterest = emi * parsed.months - parsed.principal;

    const charge = (parsed.principal * parsed.chargePercent) / 100;
    const gst = addGst ? charge * GST_RATE : 0;
    const closingCost = charge + gst;
    const payoutToday = parsed.principal + closingCost;

    const netSavings = remainingInterest - closingCost;

    const altMonthly = parsed.altReturn / 1200;
    const wealthIfForeclosed = annuityFutureValue(emi, altMonthly, parsed.months);
    const wealthIfInvested = payoutToday * Math.pow(1 + altMonthly, parsed.months);

    return {
      emi,
      remainingInterest,
      totalIfContinued: emi * parsed.months,
      charge,
      gst,
      closingCost,
      payoutToday,
      netSavings,
      savingShare: remainingInterest > 0 ? (netSavings / remainingInterest) * 100 : 0,
      wealthIfForeclosed,
      wealthIfInvested,
      investEdge: wealthIfForeclosed - wealthIfInvested,
    };
  }, [error, parsed, addGst]);

  const summaryText = useMemo(() => {
    if (!result) return "";
    return [
      "Loan Foreclosure Savings Calculator — ALTFTool",
      `Outstanding principal: ${inr(parsed.principal)} at ${num(parsed.rate)}%`,
      `Remaining tenure: ${monthsToLabel(parsed.months)} (${parsed.months} EMIs of ${inr(
        result.emi
      )})`,
      "",
      `Interest still payable if you continue: ${inr(result.remainingInterest)}`,
      `Foreclosure charge (${num(parsed.chargePercent)}%): ${inr(result.charge)}`,
      addGst ? `GST at 18% on the charge: ${inr(result.gst)}` : "GST on charge: not applied",
      `Amount to pay today: ${inr(result.payoutToday)}`,
      "",
      `Net savings from foreclosing: ${inr(result.netSavings)}`,
      "",
      `If you foreclose and invest the freed EMIs at ${num(parsed.altReturn)}%: ${inr(
        result.wealthIfForeclosed
      )}`,
      `If you keep the loan and invest the payout amount instead: ${inr(result.wealthIfInvested)}`,
    ].join("\n");
  }, [addGst, parsed, result]);

  const handleCopy = async () => {
    if (!summaryText) return;
    const ok = await safeCopyText(summaryText);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setMonths(DEFAULTS.months);
    setChargePercent(DEFAULTS.chargePercent);
    setAddGst(DEFAULTS.addGst);
    setAltReturn(DEFAULTS.altReturn);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Loans
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Loan Foreclosure Savings Calculator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Closing a loan early wipes out the interest still to come, but the bank may charge a
          foreclosure fee plus GST. This tool nets the two off and also checks whether investing that
          money would have done better.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-label="Loan and foreclosure inputs"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="fc-principal">
                Outstanding principal (₹)
              </label>
              <input
                id="fc-principal"
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                className={`mt-2 ${inputClass}`}
                value={principal}
                onChange={(event) => setPrincipal(event.target.value)}
              />
              <p className={hintClass}>Take this from your latest statement, not the sanctioned amount.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="fc-rate">
                Interest rate (% per year)
              </label>
              <input
                id="fc-rate"
                type="number"
                inputMode="decimal"
                min="0"
                max="40"
                step="0.05"
                className={`mt-2 ${inputClass}`}
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
              <p className={hintClass}>Your current running rate on the loan.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="fc-months">
                Remaining tenure (months)
              </label>
              <input
                id="fc-months"
                type="number"
                inputMode="numeric"
                min="1"
                max="480"
                step="1"
                className={`mt-2 ${inputClass}`}
                value={months}
                onChange={(event) => setMonths(event.target.value)}
              />
              <p className={hintClass}>{monthsToLabel(Math.max(0, parsed.months || 0))} left.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="fc-charge">
                Foreclosure charge (% of principal)
              </label>
              <input
                id="fc-charge"
                type="number"
                inputMode="decimal"
                min="0"
                max="10"
                step="0.25"
                className={`mt-2 ${inputClass}`}
                value={chargePercent}
                onChange={(event) => setChargePercent(event.target.value)}
              />
              <p className={hintClass}>Personal loans often charge 2% – 5%; enter 0 if waived.</p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="fc-alt-return">
                Return if you invest the money instead (% per year)
              </label>
              <input
                id="fc-alt-return"
                type="number"
                inputMode="decimal"
                min="0"
                max="30"
                step="0.25"
                className={`mt-2 ${inputClass}`}
                value={altReturn}
                onChange={(event) => setAltReturn(event.target.value)}
              />
              <p className={hintClass}>Used only for the invest-instead comparison below.</p>
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              id="fc-gst"
              checked={addGst}
              onChange={(event) => setAddGst(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <span>
              Add 18% GST on the foreclosure charge
              <span className="block text-xs text-[var(--muted-foreground)]">
                Lenders levy GST on the fee, not on the principal you repay.
              </span>
            </span>
          </label>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className={primaryButton}
              onClick={handleCopy}
              disabled={!result}
              aria-label="Copy the foreclosure savings summary to clipboard"
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
              className={ghostButton}
              onClick={handleReset}
              aria-label="Reset all inputs to default values"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {result && result.netSavings < 0 ? "Net cost of foreclosing" : "Net savings"}
          </p>
          <p
            className={`mt-1 text-3xl font-semibold sm:text-4xl ${
              result && result.netSavings < 0 ? "text-[var(--danger)]" : "text-[var(--primary)]"
            }`}
          >
            {result ? inr(Math.abs(result.netSavings)) : "—"}
          </p>
          {result ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.netSavings >= 0
                ? `You avoid ${inr(result.remainingInterest)} of interest and pay ${inr(
                    result.closingCost
                  )} in charges — keeping ${num(result.savingShare)}% of the interest.`
                : "The closing charges are larger than the interest you would still pay."}
            </p>
          ) : null}

          {result ? (
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">EMI</dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.emi)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Interest left if you continue</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.remainingInterest)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">
                  Foreclosure charge ({num(parsed.chargePercent)}%)
                </dt>
                <dd className="font-semibold text-[var(--danger)]">{inr(result.charge)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">GST on the charge</dt>
                <dd className="font-semibold text-[var(--danger)]">{inr(result.gst)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Pay today to close the loan</dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.payoutToday)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Total outgo if you continue</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.totalIfContinued)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm text-[var(--muted-foreground)]">
              Fix the highlighted input to see your foreclosure maths.
            </p>
          )}
        </section>
      </div>

      {result ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Foreclose now vs invest the same money
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Both paths start with {inr(result.payoutToday)} in hand and the same monthly income, and
            are measured after {monthsToLabel(parsed.months)} at {num(parsed.altReturn)}% a year.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Foreclose, then invest the freed EMIs
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                {inr(result.wealthIfForeclosed)}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {inr(result.emi)} invested every month for {parsed.months} months.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Keep the loan, invest the payout amount
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                {inr(result.wealthIfInvested)}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {inr(result.payoutToday)} invested today while you keep paying the EMI.
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            {result.investEdge >= 0
              ? `Foreclosing leaves you ${inr(result.investEdge)} better off, because your loan rate of ${num(
                  parsed.rate
                )}% beats the ${num(parsed.altReturn)}% you would earn.`
              : `Investing leaves you ${inr(Math.abs(result.investEdge))} better off at a ${num(
                  parsed.altReturn
                )}% return — the loan is cheaper than the returns you can earn.`}
          </p>

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            RBI bars foreclosure charges on floating-rate loans given to individual borrowers for
            non-business purposes, so set the charge to 0% for most home loans. Investment returns
            are not guaranteed and may be taxed, while the interest saved on a loan is certain —
            this is informational, not investment advice.
          </p>
        </section>
      ) : null}
    </div>
  );
}
