"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = {
  principal: "5000000",
  rate: "8.5",
  years: "20",
  lumpsum: "500000",
  lumpsumMonth: "12",
  extraMonthly: "5000",
};

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

function amortise({ principal, monthlyRate, emi, extraMonthly = 0, lumpsum = 0, lumpsumMonth = 0 }) {
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let prepaid = 0;
  let months = 0;
  let lumpsumApplied = false;

  for (let month = 1; month <= 1200 && balance > 0.005; month += 1) {
    const interest = balance * monthlyRate;
    const applyLumpsum = lumpsum > 0 && month === lumpsumMonth;
    let payment = emi + extraMonthly;
    if (applyLumpsum) payment += lumpsum;

    const payoff = balance + interest;
    if (payment >= payoff) {
      payment = payoff;
      totalInterest += interest;
      totalPaid += payment;
      prepaid += Math.max(0, payment - emi);
      if (applyLumpsum) lumpsumApplied = true;
      balance = 0;
      months = month;
      break;
    }

    balance = payoff - payment;
    totalInterest += interest;
    totalPaid += payment;
    prepaid += extraMonthly + (applyLumpsum ? lumpsum : 0);
    if (applyLumpsum) lumpsumApplied = true;
    months = month;
  }

  return { months, totalInterest, totalPaid, prepaid, balance, lumpsumApplied };
}

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [lumpsum, setLumpsum] = useState(DEFAULTS.lumpsum);
  const [lumpsumMonth, setLumpsumMonth] = useState(DEFAULTS.lumpsumMonth);
  const [extraMonthly, setExtraMonthly] = useState(DEFAULTS.extraMonthly);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(
    () => ({
      principal: Number(principal),
      rate: Number(rate),
      years: Number(years),
      lumpsum: Number(lumpsum),
      lumpsumMonth: Math.round(Number(lumpsumMonth)),
      extraMonthly: Number(extraMonthly),
    }),
    [principal, rate, years, lumpsum, lumpsumMonth, extraMonthly]
  );

  const error = useMemo(() => {
    const values = [
      parsed.principal,
      parsed.rate,
      parsed.years,
      parsed.lumpsum,
      parsed.lumpsumMonth,
      parsed.extraMonthly,
    ];
    if (!values.every((value) => Number.isFinite(value))) {
      return "Please enter numbers in every field.";
    }
    if (parsed.principal <= 0) return "Outstanding loan amount must be greater than zero.";
    if (parsed.rate < 0 || parsed.rate > 30) {
      return "Interest rate should be between 0% and 30% per year.";
    }
    if (parsed.years <= 0 || parsed.years > 40) {
      return "Remaining tenure should be between 1 and 40 years.";
    }
    if (parsed.lumpsum < 0) return "Lump-sum prepayment cannot be negative.";
    if (parsed.lumpsum >= parsed.principal) {
      return "A lump sum this large closes the loan outright — use a foreclosure calculator instead.";
    }
    if (parsed.extraMonthly < 0) return "Extra monthly payment cannot be negative.";
    const totalMonths = Math.round(parsed.years * 12);
    if (parsed.lumpsum > 0 && (parsed.lumpsumMonth < 1 || parsed.lumpsumMonth > totalMonths)) {
      return `The lump sum month must be between 1 and ${totalMonths}.`;
    }
    return "";
  }, [parsed]);

  const result = useMemo(() => {
    if (error) return null;

    const months = Math.round(parsed.years * 12);
    const monthlyRate = parsed.rate / 1200;
    const emi = emiFor(parsed.principal, monthlyRate, months);

    const baseline = amortise({ principal: parsed.principal, monthlyRate, emi });
    const withPrepay = amortise({
      principal: parsed.principal,
      monthlyRate,
      emi,
      extraMonthly: parsed.extraMonthly,
      lumpsum: parsed.lumpsum,
      lumpsumMonth: parsed.lumpsumMonth,
    });

    return {
      emi,
      months,
      baseline,
      withPrepay,
      interestSaved: baseline.totalInterest - withPrepay.totalInterest,
      monthsSaved: baseline.months - withPrepay.months,
      totalPrepaid: withPrepay.prepaid,
      lumpsumUnused: parsed.lumpsum > 0 && !withPrepay.lumpsumApplied,
    };
  }, [error, parsed]);

  const summaryText = useMemo(() => {
    if (!result) return "";
    return [
      "Home Loan Prepayment Calculator — ALTFTool",
      `Outstanding loan: ${inr(parsed.principal)} at ${num(parsed.rate)}% for ${num(
        parsed.years
      )} years`,
      `EMI: ${inr(result.emi)}`,
      "",
      `Without prepayment — interest: ${inr(result.baseline.totalInterest)}, tenure: ${monthsToLabel(
        result.baseline.months
      )}`,
      `With prepayment — interest: ${inr(result.withPrepay.totalInterest)}, tenure: ${monthsToLabel(
        result.withPrepay.months
      )}`,
      "",
      parsed.lumpsum > 0
        ? result.lumpsumUnused
          ? `Lump sum: ${inr(parsed.lumpsum)} in month ${parsed.lumpsumMonth} — NOT applied, loan already closes in month ${result.withPrepay.months}`
          : `Lump sum: ${inr(parsed.lumpsum)} in month ${parsed.lumpsumMonth}`
        : "Lump sum: none",
      `Extra every month: ${inr(parsed.extraMonthly)}`,
      `Total prepaid: ${inr(result.totalPrepaid)}`,
      "",
      `Interest saved: ${inr(result.interestSaved)}`,
      `Tenure cut by: ${monthsToLabel(result.monthsSaved)}`,
    ].join("\n");
  }, [parsed, result]);

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
    setYears(DEFAULTS.years);
    setLumpsum(DEFAULTS.lumpsum);
    setLumpsumMonth(DEFAULTS.lumpsumMonth);
    setExtraMonthly(DEFAULTS.extraMonthly);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Loans
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Home Loan Prepayment Calculator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Keep your EMI the same and put a bonus or a little extra towards the principal. This
          calculator amortises both schedules month by month and shows the interest you avoid and
          the tenure you shave off.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-label="Loan and prepayment inputs"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="pre-principal">
                Outstanding loan amount (₹)
              </label>
              <input
                id="pre-principal"
                type="number"
                inputMode="decimal"
                min="0"
                step="50000"
                className={`mt-2 ${inputClass}`}
                value={principal}
                onChange={(event) => setPrincipal(event.target.value)}
              />
              <p className={hintClass}>{inr(parsed.principal)} still to be repaid.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="pre-rate">
                Interest rate (% per year)
              </label>
              <input
                id="pre-rate"
                type="number"
                inputMode="decimal"
                min="0"
                max="30"
                step="0.05"
                className={`mt-2 ${inputClass}`}
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
              <p className={hintClass}>Use your current floating rate.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="pre-years">
                Remaining tenure (years)
              </label>
              <input
                id="pre-years"
                type="number"
                inputMode="decimal"
                min="1"
                max="40"
                step="1"
                className={`mt-2 ${inputClass}`}
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
              <p className={hintClass}>EMI is derived from these three fields.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="pre-extra">
                Extra with every EMI (₹)
              </label>
              <input
                id="pre-extra"
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                className={`mt-2 ${inputClass}`}
                value={extraMonthly}
                onChange={(event) => setExtraMonthly(event.target.value)}
              />
              <p className={hintClass}>Goes straight to principal each month.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="pre-lumpsum">
                Lump-sum prepayment (₹)
              </label>
              <input
                id="pre-lumpsum"
                type="number"
                inputMode="decimal"
                min="0"
                step="25000"
                className={`mt-2 ${inputClass}`}
                value={lumpsum}
                onChange={(event) => setLumpsum(event.target.value)}
              />
              <p className={hintClass}>A bonus, maturity amount or arrears.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="pre-lumpsum-month">
                Lump sum paid in month
              </label>
              <input
                id="pre-lumpsum-month"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                className={`mt-2 ${inputClass}`}
                value={lumpsumMonth}
                onChange={(event) => setLumpsumMonth(event.target.value)}
              />
              <p className={hintClass}>Earlier prepayments save far more interest.</p>
            </div>
          </div>

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
              aria-label="Copy the prepayment savings summary to clipboard"
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
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Interest saved</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
            {result ? inr(result.interestSaved) : "—"}
          </p>
          {result ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.monthsSaved > 0
                ? `Loan closes ${monthsToLabel(result.monthsSaved)} earlier — in ${monthsToLabel(
                    result.withPrepay.months
                  )} instead of ${monthsToLabel(result.baseline.months)}.`
                : result.interestSaved > 0.005
                ? `Tenure stays ${monthsToLabel(result.baseline.months)}, but you pay ${inr(
                    result.interestSaved
                  )} less interest overall.`
                : "Add a lump sum or extra monthly amount to shorten the loan."}
            </p>
          ) : null}

          {result && result.lumpsumUnused ? (
            <p className="mt-3 rounded-md border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--warning-text)]">
              Lump sum not applied: with your extra monthly payment, the loan is projected to close
              in month {result.withPrepay.months} — before your chosen lump-sum month{" "}
              {parsed.lumpsumMonth}. Choose an earlier lump-sum month to include it.
            </p>
          ) : null}

          {result ? (
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Your EMI</dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.emi)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Interest without prepayment</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.baseline.totalInterest)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Interest with prepayment</dt>
                <dd className="font-semibold text-[var(--success)]">
                  {inr(result.withPrepay.totalInterest)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Total prepaid towards principal</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.totalPrepaid)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">New tenure</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {monthsToLabel(result.withPrepay.months)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Total outgo (EMIs + prepayments)</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.withPrepay.totalPaid)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm text-[var(--muted-foreground)]">
              Fix the highlighted input to see your savings.
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            This keeps the EMI fixed and shortens the tenure, which saves the most interest. Banks
            can instead reduce the EMI and keep the tenure — ask for tenure reduction in writing. RBI
            rules bar prepayment charges on floating-rate loans taken by individuals for
            non-business purposes.
          </p>
        </section>
      </div>
    </div>
  );
}
