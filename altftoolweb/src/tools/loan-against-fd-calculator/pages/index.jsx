"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import { MAX_LTV_PERCENT, compareFdBreakVsLoan } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULTS = {
  principal: "500000",
  contractedRatePercent: "7",
  tenureMonths: "60",
  monthsCompleted: "18",
  cardRateForRunPeriodPercent: "6.5",
  penaltyPercent: "1",
  amountNeeded: "300000",
  loanSpreadPercent: "2",
  ltvPercent: "90",
  loanMonths: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const optionalNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return undefined;
  return toNumber(trimmed);
};

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [contractedRatePercent, setContractedRatePercent] = useState(DEFAULTS.contractedRatePercent);
  const [tenureMonths, setTenureMonths] = useState(DEFAULTS.tenureMonths);
  const [monthsCompleted, setMonthsCompleted] = useState(DEFAULTS.monthsCompleted);
  const [cardRate, setCardRate] = useState(DEFAULTS.cardRateForRunPeriodPercent);
  const [penaltyPercent, setPenaltyPercent] = useState(DEFAULTS.penaltyPercent);
  const [amountNeeded, setAmountNeeded] = useState(DEFAULTS.amountNeeded);
  const [loanSpreadPercent, setLoanSpreadPercent] = useState(DEFAULTS.loanSpreadPercent);
  const [ltvPercent, setLtvPercent] = useState(DEFAULTS.ltvPercent);
  const [loanMonths, setLoanMonths] = useState(DEFAULTS.loanMonths);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareFdBreakVsLoan({
        principal: toNumber(principal),
        contractedRatePercent: toNumber(contractedRatePercent),
        tenureMonths: toNumber(tenureMonths),
        monthsCompleted: toNumber(monthsCompleted),
        cardRateForRunPeriodPercent: toNumber(cardRate),
        penaltyPercent: toNumber(penaltyPercent),
        amountNeeded: toNumber(amountNeeded),
        loanSpreadPercent: toNumber(loanSpreadPercent),
        ltvPercent: toNumber(ltvPercent),
        loanMonths: optionalNumber(loanMonths),
      }),
    [
      principal,
      contractedRatePercent,
      tenureMonths,
      monthsCompleted,
      cardRate,
      penaltyPercent,
      amountNeeded,
      loanSpreadPercent,
      ltvPercent,
      loanMonths,
    ],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const verdict = hasError
    ? DASH
    : result.better === "loan"
      ? "Borrowing against the deposit"
      : result.better === "break"
        ? "Breaking the deposit"
        : "Both come out the same";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Break the FD or borrow against it",
      `Deposit: ${money(result.principal)} at ${pct(result.contractedRatePercent)} for ${result.tenureMonths} months, ${result.monthsCompleted} months run`,
      `Cash needed: ${money(result.amountNeeded)}`,
      `Premature closure pays ${pct(result.prematureRate)} — value today ${money(result.breakValue)}`,
      `Overdraft at ${pct(result.loanRate)} on ${money(result.loanDrawn)} for ${result.drawnMonths} months costs ${money(result.loanInterest)}`,
      `Net at original maturity — break ${money(result.breakNetAtMaturity)}, loan ${money(result.loanNetAtMaturity)}`,
      `Better option: ${verdict} by ${money(Math.abs(result.advantage))}`,
    ].join("\n");
  }, [hasError, result, verdict]);

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
    setContractedRatePercent(DEFAULTS.contractedRatePercent);
    setTenureMonths(DEFAULTS.tenureMonths);
    setMonthsCompleted(DEFAULTS.monthsCompleted);
    setCardRate(DEFAULTS.cardRateForRunPeriodPercent);
    setPenaltyPercent(DEFAULTS.penaltyPercent);
    setAmountNeeded(DEFAULTS.amountNeeded);
    setLoanSpreadPercent(DEFAULTS.loanSpreadPercent);
    setLtvPercent(DEFAULTS.ltvPercent);
    setLoanMonths(DEFAULTS.loanMonths);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Deposit-backed borrowing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Loan Against Fixed Deposit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          You need cash and you have a running FD. Compare closing it early, which repriced your
          interest downwards and costs a penalty, against an overdraft at the deposit rate plus a
          spread. Both options are valued at the original maturity date.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-principal">
              Fixed deposit amount (INR)
            </label>
            <input
              id="fd-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-need">
              Cash you need today (INR)
            </label>
            <input
              id="fd-need"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={amountNeeded}
              onChange={(event) => setAmountNeeded(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-rate">
              Contracted FD rate (% a year)
            </label>
            <input
              id="fd-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.05"
              value={contractedRatePercent}
              onChange={(event) => setContractedRatePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-tenure">
              Original tenure (months)
            </label>
            <input
              id="fd-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={tenureMonths}
              onChange={(event) => setTenureMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-completed">
              Months already completed
            </label>
            <input
              id="fd-completed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={monthsCompleted}
              onChange={(event) => setMonthsCompleted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-card-rate">
              Card rate for the period run (% a year)
            </label>
            <input
              id="fd-card-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.05"
              value={cardRate}
              onChange={(event) => setCardRate(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The rate the bank was offering for the tenure your money actually stayed.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-penalty">
              Premature-withdrawal penalty (% a year)
            </label>
            <input
              id="fd-penalty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5"
              step="0.25"
              value={penaltyPercent}
              onChange={(event) => setPenaltyPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-spread">
              Loan spread over the FD rate (% a year)
            </label>
            <input
              id="fd-spread"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.25"
              value={loanSpreadPercent}
              onChange={(event) => setLoanSpreadPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-ltv">
              Loan-to-value allowed (%)
            </label>
            <input
              id="fd-ltv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max={String(MAX_LTV_PERCENT)}
              step="1"
              value={ltvPercent}
              onChange={(event) => setLtvPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-loan-months">
              Months the overdraft stays drawn (optional)
            </label>
            <input
              id="fd-loan-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="Until maturity"
              value={loanMonths}
              onChange={(event) => setLoanMonths(event.target.value)}
            />
            <p className={HINT_CLASS}>Leave blank to keep it drawn until the deposit matures.</p>
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
              Better option
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">{verdict}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : `Ahead by ${money(Math.abs(result.advantage))} at the original maturity date`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the FD break versus loan comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Break the deposit
            </h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Rate after penalty", hasError ? DASH : pct(result.prematureRate)],
                ["Value received today", show(result.breakValue)],
                ["Interest earned", show(result.breakInterest)],
                ["Interest given up", show(result.interestForgone)],
                ["Left over after spending", show(result.surplusAfterSpend)],
                ["Net at original maturity", show(result.breakNetAtMaturity)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-[var(--border)] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Borrow against it
            </h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Overdraft rate", hasError ? DASH : pct(result.loanRate)],
                ["Maximum you can borrow", show(result.maxLoan)],
                ["Amount drawn", show(result.loanDrawn)],
                [
                  "Interest cost",
                  hasError ? DASH : `${money(result.loanInterest)} over ${result.drawnMonths} months`,
                ],
                ["Monthly interest to service", show(result.monthlyLoanInterest)],
                ["Net at original maturity", show(result.loanNetAtMaturity)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {!hasError && !result.canBorrowFullAmount && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            At {pct(result.ltvPercent)} loan-to-value the bank can lend only{" "}
            {money(result.maxLoan)}; the remaining {money(result.loanShortfall)} has to come from
            somewhere else.
          </p>
        )}
        {!hasError && !result.canCoverFromBreak && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Closing the deposit releases only {money(result.breakValue)}, which is{" "}
            {money(result.breakShortfall)} short of what you need.
          </p>
        )}

        {!hasError && (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Deposit value today at the contracted rate", money(result.fdValueToday)],
              ["Deposit value if held to maturity", money(result.fdMaturityValue)],
              ["Months still to run", `${result.remainingMonths}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative comparison. Penalty rules, spreads and loan-to-value are set by each bank's own
        policy, TDS on the deposit interest is not modelled, and processing charges on the overdraft
        are ignored. Check your bank's terms before deciding.
      </p>
    </main>
  );
}
