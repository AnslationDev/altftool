"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import {
  HSA_CATCH_UP_AGE,
  HSA_CATCH_UP_CONTRIBUTION,
  HSA_EXCESS_EXCISE_RATE,
  HSA_YEARS,
  computeHsaPlan,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const USD2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? USD.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? USD2.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  year: String(HSA_YEARS[0]),
  coverage: "family",
  age: "45",
  monthsEligible: "12",
  useLastMonthRule: false,
  employeeContribution: "5000",
  employerContribution: "1000",
  viaPayroll: true,
  wageBand: "below",
  federalMarginalRatePercent: "24",
  stateMarginalRatePercent: "5",
  stateTaxesHsa: false,
  growthYears: "20",
  growthRatePercent: "6",
  investmentTaxRatePercent: "15",
};

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computeHsaPlan({
        year: toNumber(form.year),
        coverage: form.coverage,
        age: toNumber(form.age),
        monthsEligible: toNumber(form.monthsEligible),
        useLastMonthRule: form.useLastMonthRule,
        employeeContribution: toNumber(form.employeeContribution),
        employerContribution: toNumber(form.employerContribution),
        viaPayroll: form.viaPayroll,
        wageBand: form.wageBand,
        federalMarginalRatePercent: toNumber(form.federalMarginalRatePercent),
        stateMarginalRatePercent: toNumber(form.stateMarginalRatePercent),
        stateTaxesHsa: form.stateTaxesHsa,
        growthYears: toNumber(form.growthYears),
        growthRatePercent: toNumber(form.growthRatePercent),
        investmentTaxRatePercent: toNumber(form.investmentTaxRatePercent),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `HSA plan for tax year ${result.year}`,
      `Coverage: ${result.coverage === "family" ? "Family HDHP" : "Self-only HDHP"}`,
      `Contribution limit: ${money2(result.contributionLimit)}`,
      `  base limit: ${money2(result.baseLimit)}`,
      `  age ${HSA_CATCH_UP_AGE}+ catch-up: ${money2(result.catchUpLimit)}`,
      `Contributed so far: ${money2(result.totalContribution)}`,
      `Room left: ${money2(result.remainingRoom)}`,
      result.excessContribution > 0
        ? `Excess: ${money2(result.excessContribution)} (6% excise = ${money2(result.excessExciseTax)})`
        : "",
      `First-year tax saving: ${money2(result.firstYearSaving)}`,
      `Net cost of your own contribution: ${money2(result.netCostOfContribution)}`,
      `Balance after ${result.growthYears} years: ${money2(result.hsaFutureValue)}`,
      `Advantage over a taxable account: ${money2(result.tripleBenefitAdvantage)}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          HSA planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          HSA Contribution and Tax Saving Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Applies the IRS annual limit for your coverage tier, adds the{" "}
          {money(HSA_CATCH_UP_CONTRIBUTION)} catch-up from age {HSA_CATCH_UP_AGE}, prorates for a
          partial year of eligibility, and estimates the triple tax benefit.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Eligibility</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="year">
              Tax year
            </label>
            <select
              id="year"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.year}
              onChange={(event) => setField("year", event.target.value)}
            >
              {HSA_YEARS.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="coverage">
              HDHP coverage
            </label>
            <select
              id="coverage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.coverage}
              onChange={(event) => setField("coverage", event.target.value)}
            >
              <option value="selfOnly">Self-only</option>
              <option value="family">Family</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="age">
              Your age at the end of the year
            </label>
            <input
              id="age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={form.age}
              onChange={(event) => setField("age", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="months-eligible">
              Months eligible (on the 1st of the month)
            </label>
            <input
              id="months-eligible"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="12"
              step="1"
              value={form.monthsEligible}
              onChange={(event) => setField("monthsEligible", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="last-month-rule"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="last-month-rule"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.useLastMonthRule}
                onChange={(event) => setField("useLastMonthRule", event.target.checked)}
              />
              Use the last-month rule (eligible on 1 December, claim the full year)
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Contributions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="employee-contribution">
              Your own contribution ($)
            </label>
            <input
              id="employee-contribution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.employeeContribution}
              onChange={(event) => setField("employeeContribution", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="employer-contribution">
              Employer contribution ($)
            </label>
            <input
              id="employer-contribution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.employerContribution}
              onChange={(event) => setField("employerContribution", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="via-payroll"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="via-payroll"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.viaPayroll}
                onChange={(event) => setField("viaPayroll", event.target.checked)}
              />
              Contributed by payroll deduction (also avoids FICA)
            </label>
          </div>
          {form.viaPayroll && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="wage-band">
                Wages versus the Social Security wage base
              </label>
              <select
                id="wage-band"
                className={`mt-2 ${INPUT_CLASS}`}
                value={form.wageBand}
                onChange={(event) => setField("wageBand", event.target.value)}
              >
                <option value="below">Below the wage base (7.65% FICA)</option>
                <option value="above">Above the wage base (1.45% Medicare only)</option>
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Tax rates and growth</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="federal-rate">
              Federal marginal rate (%)
            </label>
            <input
              id="federal-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="1"
              value={form.federalMarginalRatePercent}
              onChange={(event) => setField("federalMarginalRatePercent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="state-rate">
              State marginal rate (%)
            </label>
            <input
              id="state-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={form.stateMarginalRatePercent}
              onChange={(event) => setField("stateMarginalRatePercent", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="state-taxes-hsa"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="state-taxes-hsa"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.stateTaxesHsa}
                onChange={(event) => setField("stateTaxesHsa", event.target.checked)}
              />
              My state taxes HSA contributions (California, New Jersey)
            </label>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="growth-years">
              Years invested
            </label>
            <input
              id="growth-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={form.growthYears}
              onChange={(event) => setField("growthYears", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="growth-rate">
              Expected return (% a year)
            </label>
            <input
              id="growth-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-20"
              max="25"
              step="0.5"
              value={form.growthRatePercent}
              onChange={(event) => setField("growthRatePercent", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="investment-tax">
              Tax drag on a comparable taxable account (%)
            </label>
            <input
              id="investment-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.investmentTaxRatePercent}
              onChange={(event) => setField("investmentTaxRatePercent", event.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Your contribution limit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.contributionLimit)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.remainingRoom > 0 ? `${money(result.remainingRoom)} of room left` : "Limit reached"} for tax year ${result.year}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy HSA contribution summary to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
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
            [
              "IRS annual limit for this coverage",
              hasError ? DASH : money(result.annualBaseLimit),
            ],
            [
              hasError ? "Prorated base limit" : `Base limit (${result.monthsCounted}/12 months)`,
              hasError ? DASH : money2(result.baseLimit),
            ],
            [
              `Age ${HSA_CATCH_UP_AGE}+ catch-up`,
              hasError ? DASH : result.catchUpEligible ? money2(result.catchUpLimit) : "Not eligible",
            ],
            ["Total contributed (you + employer)", hasError ? DASH : money2(result.totalContribution)],
            ["Room left before the limit", hasError ? DASH : money2(result.remainingRoom)],
            [
              `Excess contribution (${Math.round(HSA_EXCESS_EXCISE_RATE * 100)}% excise if left in)`,
              hasError
                ? DASH
                : result.excessContribution > 0
                  ? `${money2(result.excessContribution)} → ${money2(result.excessExciseTax)} tax`
                  : "None",
            ],
            ["Federal income tax saved", hasError ? DASH : money2(result.federalSaving)],
            ["State income tax saved", hasError ? DASH : money2(result.stateSaving)],
            ["FICA saved via payroll deduction", hasError ? DASH : money2(result.ficaSaving)],
            ["First-year tax saving", hasError ? DASH : money2(result.firstYearSaving)],
            [
              "Net cost of your own contribution",
              hasError ? DASH : money2(result.netCostOfContribution),
            ],
            [
              "Effective combined marginal rate",
              hasError ? DASH : pct(result.combinedMarginalRatePercent),
            ],
            [
              hasError ? "HDHP minimum deductible" : "HDHP minimum deductible required",
              hasError ? DASH : money(result.hdhpMinDeductible),
            ],
            ["HDHP out-of-pocket maximum", hasError ? DASH : money(result.hdhpMaxOutOfPocket)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Triple tax benefit over time</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Same gross pay, contributed every year: inside an HSA versus taxed on the way in and taxed
          on the growth in a regular brokerage account.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Measure
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  HSA
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Taxable account
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">Annual amount invested</td>
                <td className="py-2 pr-3 text-right">
                  {hasError ? DASH : money(result.annualContribution)}
                </td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">
                  {hasError ? DASH : money(result.taxableStake)}
                </td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">
                  Balance after {hasError ? DASH : result.growthYears} years
                </td>
                <td className="py-2 pr-3 text-right">
                  {hasError ? DASH : money(result.hsaFutureValue)}
                </td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">
                  {hasError ? DASH : money(result.taxableFutureValue)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Tax-free earnings inside the HSA</td>
                <td className="py-2 pr-3 text-right">
                  {hasError ? DASH : money(result.taxFreeEarnings)}
                </td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">
                  {hasError ? DASH : `+${money(result.tripleBenefitAdvantage)} advantage`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Limits come from the IRS revenue procedure for each tax year. The last-month rule carries a
        13-month testing period, and losing eligibility during it claws back the extra contribution.
        Informational only, not tax advice.
      </p>
    </main>
  );
}
