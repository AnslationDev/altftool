"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scissors } from "lucide-react";

import {
  MIN_DAYS_FOR_INTEREST,
  TYPICAL_PENALTY_MAX,
  TYPICAL_PENALTY_MIN,
  computePrematureWithdrawal,
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

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  principal: "500000",
  contractedRate: "7.2",
  tenureMonths: "36",
  monthsHeld: "14",
  cardRate: "6.8",
  penalty: "1",
  amountNeeded: "200000",
  loanRate: "8.7",
  reinvestRate: "6.8",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setFields((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computePrematureWithdrawal({
        principal: toNumber(fields.principal),
        contractedRate: toNumber(fields.contractedRate),
        tenureMonths: toNumber(fields.tenureMonths),
        monthsHeld: toNumber(fields.monthsHeld),
        cardRateForRunPeriod: toNumber(fields.cardRate),
        penaltyPercent: toNumber(fields.penalty),
        amountNeeded: toNumber(fields.amountNeeded) || 0,
        loanRate: toNumber(fields.loanRate),
        reinvestRate: toNumber(fields.reinvestRate),
      }),
    [fields],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "FD Break-or-Borrow Calculator",
      `Deposit: ${money(result.principal)} booked at ${pct(result.contractedRate)} for ${result.tenureMonths} months`,
      `Held for ${result.monthsHeld} months, ${result.remainingMonths} still to run`,
      `Rate actually paid: ${pct(result.appliedRate)} (card rate ${pct(result.cardRateForRunPeriod)} less ${pct(result.penaltyPercent)} penalty)`,
      `Amount you receive on breaking: ${money(result.payout)}`,
      `Interest given up versus the contracted rate: ${money(result.interestLost)}`,
      `Realised annual return: ${pct(result.realisedAnnualReturn)}`,
    ];
    if (result.comparisonPossible) {
      lines.push(
        "",
        `Break and redeposit the surplus: ${money(result.breakValueAtOriginalMaturity)} at the original maturity date`,
        `Borrow against the FD instead: ${money(result.loanValueAtOriginalMaturity)}`,
        `Better option: ${result.betterOption === "loan" ? "loan against the deposit" : "break the deposit"} by ${money(Math.abs(result.advantageOfLoan))}`,
      );
    }
    return lines.join("\n");
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
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Breaking a deposit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          FD Break-or-Borrow Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Close a deposit early and the bank reprices it to the card rate for the period it actually
          ran, then deducts a penalty. This shows what you receive, what the repricing costs, and
          whether a loan against the deposit would leave you better off.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The deposit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-principal">
              Deposit amount (INR)
            </label>
            <input
              id="pw-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={fields.principal}
              onChange={(event) => setField("principal", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-contracted">
              Contracted rate (% per year)
            </label>
            <input
              id="pw-contracted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={fields.contractedRate}
              onChange={(event) => setField("contractedRate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-tenure">
              Original tenure (months)
            </label>
            <input
              id="pw-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={fields.tenureMonths}
              onChange={(event) => setField("tenureMonths", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-held">
              Months completed so far
            </label>
            <input
              id="pw-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="119"
              step="1"
              value={fields.monthsHeld}
              onChange={(event) => setField("monthsHeld", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-card">
              Bank&apos;s card rate for the completed period (%)
            </label>
            <input
              id="pw-card"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={fields.cardRate}
              onChange={(event) => setField("cardRate", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The rate the bank quotes today for a deposit of that length, not your booked rate.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-penalty">
              Premature closure penalty (percentage points)
            </label>
            <input
              id="pw-penalty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5"
              step="0.05"
              value={fields.penalty}
              onChange={(event) => setField("penalty", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Usually {TYPICAL_PENALTY_MIN}% to {TYPICAL_PENALTY_MAX}%; set 0 if your bank waives it.
            </p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              You receive on breaking
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.payout)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : `interest paid at ${pct(result.appliedRate)} instead of your booked ${pct(result.contractedRate)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy premature withdrawal result"
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
            ["Rate actually paid after penalty", show(result.appliedRate, pct)],
            ["Interest credited for the run period", show(result.interestOnBreak)],
            ["Interest the contracted rate would have paid", show(result.interestAtContractedRate)],
            ["Interest given up by closing early", show(result.interestLost)],
            ["Realised annual return on the money", show(result.realisedAnnualReturn, pct)],
            ["Months still to run", hasError ? DASH : `${result.remainingMonths}`],
            ["Value if you had left it to mature", show(result.fullMaturityValue)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.appliedRate === 0 && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            The penalty wipes out the whole card rate, so you get your principal back with no
            interest at all. Deposits held for fewer than {MIN_DAYS_FOR_INTEREST} days also earn
            nothing.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Break it, or borrow against it?</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Both routes give you the cash today. This compares what you are left with on the original
          maturity date.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-need">
              Cash you need now (INR)
            </label>
            <input
              id="pw-need"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={fields.amountNeeded}
              onChange={(event) => setField("amountNeeded", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-loan">
              Rate on a loan against the deposit (%)
            </label>
            <input
              id="pw-loan"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={fields.loanRate}
              onChange={(event) => setField("loanRate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pw-reinvest">
              Rate you would redeposit surplus cash at (%)
            </label>
            <input
              id="pw-reinvest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={fields.reinvestRate}
              onChange={(event) => setField("reinvestRate", event.target.value)}
            />
          </div>
        </div>

        {!hasError && result.shortfall > 0 && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Breaking the deposit raises {money(result.payout)}, which is {money(result.shortfall)}{" "}
            short of what you need, so the two routes are not comparable here.
          </p>
        )}

        {!hasError && result.comparisonPossible && (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Break the deposit
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {money(result.breakValueAtOriginalMaturity)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {money(result.surplusAfterNeed)} left over, redeposited at{" "}
                  {pct(result.redepositRate)} for {result.remainingMonths} months
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Borrow against it
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {money(result.loanValueAtOriginalMaturity)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  deposit matures at {money(result.fullMaturityValue)}, less{" "}
                  {money(result.amountNeeded)} borrowed and {money(result.loanInterest)} interest
                </p>
              </div>
            </div>
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
              {result.betterOption === "loan"
                ? `A loan against the deposit leaves you ${money(result.advantageOfLoan)} better off at the original maturity date.`
                : `Breaking the deposit leaves you ${money(-result.advantageOfLoan)} better off at the original maturity date.`}
            </p>
            {result.loanExceedsLimit && (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
                Banks normally lend up to about {money(result.maxLoanAvailable)} against a deposit
                of this size, so the loan route may not cover the full amount you need.
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Penalty rules, card rates and loan spreads are set by each bank&apos;s
        board-approved policy, and some banks waive the penalty on deposits closed to reinvest for a
        longer term or on the death of the depositor. Check your deposit receipt and the bank&apos;s
        current schedule of charges.
      </p>
    </main>
  );
}
