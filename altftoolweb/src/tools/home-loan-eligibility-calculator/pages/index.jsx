"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";
import {
  MAX_TENURE_YEARS,
  computeHomeLoanEligibility,
  suggestedFoirPercent,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  netMonthlyIncome: "100000",
  otherMonthlyIncome: "0",
  existingEmi: "10000",
  foirPercent: "60",
  annualRate: "8.5",
  tenureYears: "20",
  age: "32",
  employment: "salaried",
  propertyValue: "10000000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeHomeLoanEligibility({
        netMonthlyIncome: toNumber(form.netMonthlyIncome),
        otherMonthlyIncome: toNumber(form.otherMonthlyIncome),
        existingEmi: toNumber(form.existingEmi),
        foirPercent: toNumber(form.foirPercent),
        annualRate: toNumber(form.annualRate),
        tenureYears: toNumber(form.tenureYears),
        age: toNumber(form.age),
        employment: form.employment,
        propertyValue: toNumber(form.propertyValue),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const applySuggestedFoir = () => {
    const income = toNumber(form.netMonthlyIncome);
    if (!Number.isFinite(income) || income <= 0) return;
    setForm((prev) => ({ ...prev, foirPercent: String(suggestedFoirPercent(income)) }));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Home Loan Eligibility",
      `Assessed monthly income: ${money(result.totalIncome)}`,
      `FOIR applied: ${form.foirPercent}% (allowance ${money(result.foirAllowance)})`,
      `EMI capacity after existing obligations: ${money(result.emiCapacity)}`,
      `Eligible loan amount: ${money(result.eligibleLoan)}`,
      `Limited by: ${result.limitedBy === "income" ? "repayment capacity" : "RBI LTV ceiling on the property"}`,
      `Indicative EMI: ${money(result.emi)} for ${result.months} months`,
      `Own contribution needed: ${money(result.downPayment)} (${pct(result.downPaymentPercent)})`,
      `Total interest over the tenure: ${money(result.totalInterest)}`,
    ].join("\n");
  }, [hasError, result, form.foirPercent]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Eligible on repayment capacity", DASH],
        ["Eligible on RBI LTV ceiling", DASH],
        ["Binding constraint", DASH],
        ["Indicative EMI", DASH],
        ["FOIR used after this loan", DASH],
        ["Own contribution (down payment)", DASH],
        ["Effective loan-to-value", DASH],
        ["Total interest over the tenure", DASH],
      ]
    : [
        ["Eligible on repayment capacity", money(result.eligibleByIncome)],
        ["Eligible on RBI LTV ceiling", money(result.eligibleByLtv)],
        [
          "Binding constraint",
          result.limitedBy === "income" ? "Your income" : "Property value (LTV)",
        ],
        ["Indicative EMI", `${money(result.emi)} x ${result.months} months`],
        ["FOIR used after this loan", pct(result.foirUsedPercent)],
        [
          "Own contribution (down payment)",
          `${money(result.downPayment)} (${pct(result.downPaymentPercent)})`,
        ],
        ["Effective loan-to-value", pct(result.effectiveLtvPercent)],
        ["Total interest over the tenure", money(result.totalInterest)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Property finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Home Loan Eligibility Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out the sanction a lender is likely to offer by applying the FOIR income test and
          the RBI loan-to-value ceiling, then shows which of the two is actually holding you back.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-income">
              Net monthly income (INR)
            </label>
            <input
              id="hle-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.netMonthlyIncome}
              onChange={set("netMonthlyIncome")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-other">
              Other monthly income (rent, co-applicant)
            </label>
            <input
              id="hle-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.otherMonthlyIncome}
              onChange={set("otherMonthlyIncome")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-emi">
              Existing monthly EMIs (INR)
            </label>
            <input
              id="hle-emi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.existingEmi}
              onChange={set("existingEmi")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-foir">
              FOIR allowed by lender (%)
            </label>
            <input
              id="hle-foir"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={form.foirPercent}
              onChange={set("foirPercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-rate">
              Interest rate (% per year)
            </label>
            <input
              id="hle-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={form.annualRate}
              onChange={set("annualRate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-tenure">
              Tenure wanted (years)
            </label>
            <input
              id="hle-tenure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max={MAX_TENURE_YEARS}
              step="1"
              value={form.tenureYears}
              onChange={set("tenureYears")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-age">
              Your age (years)
            </label>
            <input
              id="hle-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="18"
              max="75"
              step="1"
              value={form.age}
              onChange={set("age")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hle-employment">
              Employment type
            </label>
            <select
              id="hle-employment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.employment}
              onChange={set("employment")}
            >
              <option value="salaried">Salaried (loan to close by 60)</option>
              <option value="selfEmployed">Self-employed (loan to close by 65)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hle-property">
              Property agreement value (INR)
            </label>
            <input
              id="hle-property"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={form.propertyValue}
              onChange={set("propertyValue")}
            />
          </div>
        </div>

        <button type="button" onClick={applySuggestedFoir} className={`mt-4 ${GHOST_BTN}`}>
          Use the typical FOIR for this income
        </button>
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
              Estimated eligible loan
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.eligibleLoan)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `Over ${result.allowedTenureYears} years at the rate entered`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy home loan eligibility result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.tenureCapped && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Tenure trimmed to {result.allowedTenureYears} years so the loan closes by age{" "}
            {result.maturityAge}.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Lenders also weigh credit score, job stability, property legal
        and technical checks, and their own FOIR grid, so the sanctioned figure can differ. Confirm
        with the lender before committing to a booking amount.
      </p>
    </main>
  );
}
