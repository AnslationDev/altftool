"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  COMFORTABLE_FOIR_PCT,
  STRESS_RATE_STEP_PCT,
  TYPICAL_FOIR_CEILING_PCT,
  checkAffordability,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULTS = {
  income: "100000",
  existingEmis: "12000",
  loanAmount: "3000000",
  rate: "8.75",
  tenure: "20",
  expenses: "35000",
  ceiling: String(TYPICAL_FOIR_CEILING_PCT),
};

const BAND_TONE = {
  comfortable: "text-[var(--success)]",
  workable: "text-[var(--primary)]",
  stretched: "text-[var(--foreground)]",
  "over-limit": "text-[var(--danger)]",
};

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [existingEmis, setExistingEmis] = useState(DEFAULTS.existingEmis);
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [tenure, setTenure] = useState(DEFAULTS.tenure);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [ceiling, setCeiling] = useState(DEFAULTS.ceiling);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkAffordability({
        netMonthlyIncome: toNumber(income),
        existingEmis: toNumber(existingEmis),
        loanAmount: toNumber(loanAmount),
        annualRatePct: toNumber(rate),
        tenureYears: toNumber(tenure),
        monthlyExpenses: toNumber(expenses),
        foirCeilingPct: toNumber(ceiling),
      }),
    [income, existingEmis, loanAmount, rate, tenure, expenses, ceiling],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "EMI Affordability Check",
      `Proposed EMI: ${money(result.proposedEmi)} for ${result.months} months`,
      `Existing EMIs: ${money(result.existingEmis)}`,
      `Total obligations: ${money(result.totalObligations)}`,
      `FOIR: ${pct(result.foirPct)} against a ${pct(result.foirCeilingPct)} ceiling — ${result.band.label}`,
      `Monthly surplus after EMIs and expenses: ${money(result.surplus)}`,
      `Highest EMI the ceiling allows: ${money(result.maxEmiAtCeiling)}`,
      `Loan that EMI would carry: ${money(result.maxLoanAtCeiling)}`,
      `At ${pct(result.stressRatePct)} the EMI becomes ${money(result.stressEmi)}`,
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
    setIncome(DEFAULTS.income);
    setExistingEmis(DEFAULTS.existingEmis);
    setLoanAmount(DEFAULTS.loanAmount);
    setRate(DEFAULTS.rate);
    setTenure(DEFAULTS.tenure);
    setExpenses(DEFAULTS.expenses);
    setCeiling(DEFAULTS.ceiling);
    setCopied(false);
  };

  const gaugeWidth = hasError ? 0 : Math.max(0, Math.min(100, result.foirPct));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Before you borrow
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">EMI Affordability Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lenders underwrite against FOIR — the share of your net income already committed to EMIs.
          This works out the proposed EMI, where it puts your FOIR, what is left to live on, and what
          happens if the rate rises {STRESS_RATE_STEP_PCT} percentage points.
        </p>
      </header>

      <section className={CARD} aria-labelledby="af-income">
        <h2 id="af-income" className="text-base font-semibold">
          Your monthly position
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="af-income-input">
              Net monthly income (INR)
            </label>
            <input
              id="af-income-input"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Take-home after tax and PF, plus any other reliable monthly income.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-existing">
              EMIs you already pay (INR)
            </label>
            <input
              id="af-existing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={existingEmis}
              onChange={(event) => setExistingEmis(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Include card minimum dues and any loan you have guaranteed.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-expenses">
              Essential monthly expenses (INR)
            </label>
            <input
              id="af-expenses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={expenses}
              onChange={(event) => setExpenses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-ceiling">
              FOIR ceiling to test against (%)
            </label>
            <input
              id="af-ceiling"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={ceiling}
              onChange={(event) => setCeiling(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[COMFORTABLE_FOIR_PCT, 40, TYPICAL_FOIR_CEILING_PCT, 60].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCeiling(String(option))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {option}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="af-loan">
        <h2 id="af-loan" className="text-base font-semibold">
          The loan you are considering
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="af-loan-amount">
              Loan amount (INR)
            </label>
            <input
              id="af-loan-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={loanAmount}
              onChange={(event) => setLoanAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-rate">
              Interest rate (% a year)
            </label>
            <input
              id="af-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="0.05"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-tenure">
              Tenure (years)
            </label>
            <input
              id="af-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="40"
              step="1"
              value={tenure}
              onChange={(event) => setTenure(event.target.value)}
            />
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="af-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="af-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              FOIR after this loan
            </h2>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--primary)]" : BAND_TONE[result.band.id]}`}
            >
              {hasError ? DASH : pct(result.foirPct)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to run the check."
                : `${result.band.label} — ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the affordability result"
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

        {!hasError && (
          <div className="mt-5">
            <div
              className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`FOIR of ${pct(result.foirPct)} against a ceiling of ${pct(result.foirCeilingPct)}`}
            >
              <span
                className={`block h-full ${result.withinCeiling ? "bg-[var(--primary)]" : "bg-[var(--danger)]"}`}
                style={{ width: `${gaugeWidth}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              0% ·{" "}
              {result.withinCeiling
                ? `inside the ${pct(result.foirCeilingPct)} ceiling`
                : `over the ${pct(result.foirCeilingPct)} ceiling`}{" "}
              · 100% of income
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Proposed EMI",
              hasError ? DASH : `${money(result.proposedEmi)} for ${result.months} months`,
            ],
            ["EMIs already running", hasError ? DASH : money(result.existingEmis)],
            ["Total monthly obligations", hasError ? DASH : money(result.totalObligations)],
            ["Left after EMIs and essentials", hasError ? DASH : money(result.surplus)],
            ["That is this much of income", hasError ? DASH : pct(result.surplusPct)],
            ["Highest EMI the ceiling allows", hasError ? DASH : money(result.maxEmiAtCeiling)],
            [
              "Headroom against that ceiling",
              hasError ? DASH : money(result.emiHeadroom),
            ],
            [
              "Loan that maximum EMI would carry",
              hasError ? DASH : money(result.maxLoanAtCeiling),
            ],
            ["Total interest over the tenure", hasError ? DASH : money(result.totalInterest)],
            ["Interest as a share of repayment", hasError ? DASH : pct(result.interestSharePct)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.surplus < 0 && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Even if a lender approves this, your income does not cover the EMIs plus your essential
            expenses — the shortfall is {money(Math.abs(result.surplus))} every month.
          </p>
        )}

        {!hasError && result.surplus >= 0 && result.budgetIsTighterThanLender && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Your own budget binds before the lender&apos;s does: expenses leave room for an EMI of{" "}
            {money(result.maxEmiFromBudget)}, while the {pct(result.foirCeilingPct)} ceiling would
            allow {money(result.maxEmiAtCeiling)}.
          </p>
        )}
      </section>

      {!hasError && result.stressEmi !== null && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="af-stress">
          <h2 id="af-stress" className="text-base font-semibold">
            If the rate rises {STRESS_RATE_STEP_PCT} percentage points
          </h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Stressed rate", pct(result.stressRatePct)],
              ["EMI at that rate", money(result.stressEmi)],
              ["Increase in EMI", money(result.stressEmiIncrease)],
              ["FOIR at that rate", pct(result.stressFoirPct)],
              [
                "Still inside the ceiling?",
                result.stressWithinCeiling ? "Yes" : "No — the loan would breach it",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Floating-rate loans are repriced against an external benchmark. Banks usually stretch the
            tenure rather than raise the EMI, but tenure cannot run past retirement — at which point
            the EMI is what moves.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a loan sanction or financial advice. There is no statutory FOIR limit
        for retail loans in India; lenders set their own, commonly around 50% of net income and
        tighter at lower incomes. Your actual eligibility also depends on credit score, employer
        category, age and the security offered.
      </p>
    </main>
  );
}
