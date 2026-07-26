"use client";

import { useMemo, useState } from "react";
import { BanknoteArrowDown, Check, Copy, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = {
  corpus: "5000000",
  withdrawal: "30000",
  returnRate: "9",
  stepUp: "0",
};

const MAX_MONTHS = 1200; // 100 years — treated as "does not deplete"

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

function simulateSwp({ corpus, withdrawal, annualReturn, stepUp }) {
  const monthlyRate = annualReturn / 1200;
  const stepUpRate = stepUp / 100;

  let balance = corpus;
  let totalWithdrawn = 0;
  let months = 0;
  let depleted = false;
  let finalWithdrawal = withdrawal;

  const yearly = [];
  let yearWithdrawn = 0;
  let yearStartBalance = corpus;

  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    const growth = balance * monthlyRate;
    balance += growth;

    const yearIndex = Math.floor((month - 1) / 12);
    const target = withdrawal * Math.pow(1 + stepUpRate, yearIndex);
    finalWithdrawal = target;

    if (balance <= target) {
      // Corpus can only fund a partial withdrawal this month — report what is
      // actually received, not the instalment that was scheduled.
      finalWithdrawal = balance;
      totalWithdrawn += balance;
      yearWithdrawn += balance;
      balance = 0;
      months = month;
      depleted = true;
      yearly.push({
        year: yearIndex + 1,
        withdrawn: yearWithdrawn,
        openingBalance: yearStartBalance,
        closingBalance: 0,
      });
      break;
    }

    balance -= target;
    totalWithdrawn += target;
    yearWithdrawn += target;
    months = month;

    if (month % 12 === 0) {
      yearly.push({
        year: yearIndex + 1,
        withdrawn: yearWithdrawn,
        openingBalance: yearStartBalance,
        closingBalance: balance,
      });
      yearWithdrawn = 0;
      yearStartBalance = balance;
    }
  }

  return {
    months,
    depleted,
    balance,
    totalWithdrawn,
    finalWithdrawal,
    growthEarned: totalWithdrawn + balance - corpus,
    yearly,
  };
}

export default function ToolHome() {
  const [corpus, setCorpus] = useState(DEFAULTS.corpus);
  const [withdrawal, setWithdrawal] = useState(DEFAULTS.withdrawal);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [stepUp, setStepUp] = useState(DEFAULTS.stepUp);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(
    () => ({
      corpus: Number(corpus),
      withdrawal: Number(withdrawal),
      returnRate: Number(returnRate),
      stepUp: Number(stepUp),
    }),
    [corpus, withdrawal, returnRate, stepUp]
  );

  const error = useMemo(() => {
    const { corpus: c, withdrawal: w, returnRate: r, stepUp: s } = parsed;
    if (![c, w, r, s].every((value) => Number.isFinite(value))) {
      return "Please enter numbers in every field.";
    }
    if (c <= 0) return "Investment corpus must be greater than zero.";
    if (w <= 0) return "Monthly withdrawal must be greater than zero.";
    if (r < 0 || r > 30) return "Expected return should be between 0% and 30% per year.";
    if (s < 0 || s > 25) return "Annual withdrawal step-up should be between 0% and 25%.";
    if (w > c) return "Monthly withdrawal cannot be larger than the total corpus.";
    return "";
  }, [parsed]);

  const result = useMemo(() => {
    if (error) return null;
    return simulateSwp({
      corpus: parsed.corpus,
      withdrawal: parsed.withdrawal,
      annualReturn: parsed.returnRate,
      stepUp: parsed.stepUp,
    });
  }, [error, parsed]);

  const sustainableWithdrawal = useMemo(() => {
    if (error) return 0;
    return (parsed.corpus * parsed.returnRate) / 1200;
  }, [error, parsed]);

  const headline = useMemo(() => {
    if (!result) return "—";
    if (!result.depleted) return "Corpus does not run out";
    return monthsToLabel(result.months);
  }, [result]);

  const summaryText = useMemo(() => {
    if (!result) return "";
    return [
      "SWP Withdrawal Calculator — ALTFTool",
      `Starting corpus: ${inr(parsed.corpus)}`,
      `Monthly withdrawal: ${inr(parsed.withdrawal)}`,
      `Expected return: ${num(parsed.returnRate)}% p.a.`,
      `Annual step-up: ${num(parsed.stepUp)}%`,
      result.depleted
        ? `Corpus lasts: ${monthsToLabel(result.months)} (${result.months} withdrawals)`
        : `Corpus lasts: beyond 100 years — withdrawals stay below growth`,
      `Total withdrawn: ${inr(result.totalWithdrawn)}`,
      `Balance left: ${inr(result.balance)}`,
      `Growth earned during withdrawals: ${inr(result.growthEarned)}`,
      `Perpetual (never-ending) monthly withdrawal at this return: ${inr(sustainableWithdrawal)}`,
    ].join("\n");
  }, [parsed, result, sustainableWithdrawal]);

  const handleCopy = async () => {
    if (!summaryText) return;
    const ok = await safeCopyText(summaryText);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setCorpus(DEFAULTS.corpus);
    setWithdrawal(DEFAULTS.withdrawal);
    setReturnRate(DEFAULTS.returnRate);
    setStepUp(DEFAULTS.stepUp);
    setCopied(false);
  };

  const schedule = result ? result.yearly.slice(0, 30) : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BanknoteArrowDown className="h-4 w-4" aria-hidden="true" />
          Mutual funds
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          SWP Withdrawal Calculator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Find out how long your mutual fund corpus can fund a monthly Systematic Withdrawal Plan,
          how much you take out in total, and what is left at the end.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-label="SWP inputs"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="swp-corpus">
                Investment corpus (₹)
              </label>
              <input
                id="swp-corpus"
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                className={`mt-2 ${inputClass}`}
                value={corpus}
                onChange={(event) => setCorpus(event.target.value)}
              />
              <p className={hintClass}>{inr(parsed.corpus)}</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="swp-withdrawal">
                Monthly withdrawal (₹)
              </label>
              <input
                id="swp-withdrawal"
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                className={`mt-2 ${inputClass}`}
                value={withdrawal}
                onChange={(event) => setWithdrawal(event.target.value)}
              />
              <p className={hintClass}>{inr(parsed.withdrawal)} per month</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="swp-return">
                Expected return (% per year)
              </label>
              <input
                id="swp-return"
                type="number"
                inputMode="decimal"
                min="0"
                max="30"
                step="0.1"
                className={`mt-2 ${inputClass}`}
                value={returnRate}
                onChange={(event) => setReturnRate(event.target.value)}
              />
              <p className={hintClass}>Compounded monthly on the remaining balance.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="swp-stepup">
                Annual step-up (%)
              </label>
              <input
                id="swp-stepup"
                type="number"
                inputMode="decimal"
                min="0"
                max="25"
                step="0.5"
                className={`mt-2 ${inputClass}`}
                value={stepUp}
                onChange={(event) => setStepUp(event.target.value)}
              />
              <p className={hintClass}>Raise the withdrawal every 12 months to beat inflation.</p>
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
              aria-label="Copy SWP result summary to clipboard"
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
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Your corpus lasts</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
            {headline}
          </p>
          {result ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.depleted
                ? `${result.months} monthly withdrawals before the balance hits zero.`
                : "Growth is larger than your withdrawals, so the balance keeps rising."}
            </p>
          ) : null}

          {result ? (
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Total withdrawn</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.totalWithdrawn)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">
                  Balance left {result.depleted ? "at the end" : "after 100 years"}
                </dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.balance)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Growth earned while withdrawing</dt>
                <dd className="font-semibold text-[var(--success)]">{inr(result.growthEarned)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Last monthly withdrawal</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.finalWithdrawal)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Never-ending withdrawal limit</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(sustainableWithdrawal)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm text-[var(--muted-foreground)]">
              Fix the highlighted input to see your withdrawal plan.
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Withdraw up to {inr(sustainableWithdrawal)} a month and the corpus theoretically never
            runs out at {num(parsed.returnRate)}% returns. Real fund returns vary month to month, and
            equity SWP gains attract capital gains tax.
          </p>
        </section>
      </div>

      {result && schedule.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Year-by-year balance</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {result.depleted
              ? "Shown until the corpus is exhausted."
              : "First 30 years of an ever-growing balance."}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Opening balance
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Withdrawn
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Closing balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {schedule.map((row) => (
                  <tr key={row.year}>
                    <td className="py-2 pr-3 font-medium text-[var(--foreground)]">{row.year}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {inr(row.openingBalance)}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {inr(row.withdrawn)}
                    </td>
                    <td className="py-2 font-medium text-[var(--foreground)]">
                      {inr(row.closingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
