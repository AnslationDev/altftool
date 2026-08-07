"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shield } from "lucide-react";

import {
  computeEmergencyFund,
  EARNER_OPTIONS,
  EMPLOYMENT_TYPES,
  HEALTH_COVER_OPTIONS,
  MAX_MONTHS,
  MIN_MONTHS,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  essentials: "45000",
  emi: "12000",
  employment: "salariedLarge",
  earners: "single",
  dependants: "2",
  healthCover: "over5L",
  existingFund: "150000",
  contribution: "15000",
  annualReturn: "6",
};

const DASH = "—";

const signed = (months) => `${months > 0 ? "+" : ""}${num(months)}`;

export default function ToolHome() {
  const [essentials, setEssentials] = useState(DEFAULTS.essentials);
  const [emi, setEmi] = useState(DEFAULTS.emi);
  const [employment, setEmployment] = useState(DEFAULTS.employment);
  const [earners, setEarners] = useState(DEFAULTS.earners);
  const [dependants, setDependants] = useState(DEFAULTS.dependants);
  const [healthCover, setHealthCover] = useState(DEFAULTS.healthCover);
  const [existingFund, setExistingFund] = useState(DEFAULTS.existingFund);
  const [contribution, setContribution] = useState(DEFAULTS.contribution);
  const [annualReturn, setAnnualReturn] = useState(DEFAULTS.annualReturn);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeEmergencyFund({
        monthlyEssentials: essentials,
        monthlyEmi: emi,
        employment,
        earners,
        dependants,
        healthCover,
        existingFund,
        monthlyContribution: contribution,
        annualReturn,
      }),
    [
      essentials,
      emi,
      employment,
      earners,
      dependants,
      healthCover,
      existingFund,
      contribution,
      annualReturn,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "India Emergency Fund Calculator",
      `Monthly essential outgo: ${money(result.monthlyOutgo)}`,
      `Recommended cover: ${num(result.recommendedMonths)} months`,
      `Target corpus: ${money(result.targetCorpus)}`,
      `Already saved: ${money(result.existingFund)} (${num(result.coverageMonths)} months of cover)`,
      `Shortfall: ${money(result.gap)}`,
      result.monthsToGoal === null
        ? "Time to goal: add a monthly contribution"
        : `Time to goal: ${result.monthsToGoal} month(s)`,
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
    setEssentials(DEFAULTS.essentials);
    setEmi(DEFAULTS.emi);
    setEmployment(DEFAULTS.employment);
    setEarners(DEFAULTS.earners);
    setDependants(DEFAULTS.dependants);
    setHealthCover(DEFAULTS.healthCover);
    setExistingFund(DEFAULTS.existingFund);
    setContribution(DEFAULTS.contribution);
    setAnnualReturn(DEFAULTS.annualReturn);
    setCopied(false);
  };

  const track = (setter) => (event) => {
    setter(event.target.value);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Shield className="h-4 w-4" aria-hidden="true" />
          Contingency fund
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          India Emergency Fund Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six months of expenses is the usual answer, but a government employee with two incomes
          needs less and a freelancer with three dependants and no health cover needs far more. This
          calculator adjusts the baseline for your actual risks, then shows the corpus and how long
          it takes to build.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Monthly outgo you must keep paying</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-essentials">
              Essential expenses (INR / month)
            </label>
            <input
              id="ef-essentials"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={essentials}
              onChange={track(setEssentials)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Rent, food, utilities, school fees, medicines, transport. Leave out holidays and
              shopping.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-emi">
              Loan EMIs (INR / month)
            </label>
            <input
              id="ef-emi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={emi}
              onChange={track(setEmi)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your risk profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-employment">
              Income type
            </label>
            <select
              id="ef-employment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={employment}
              onChange={track(setEmployment)}
            >
              {EMPLOYMENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-earners">
              Earners in the household
            </label>
            <select
              id="ef-earners"
              className={`mt-2 ${INPUT_CLASS}`}
              value={earners}
              onChange={track(setEarners)}
            >
              {EARNER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-dependants">
              Financially dependent people
            </label>
            <input
              id="ef-dependants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={dependants}
              onChange={track(setDependants)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-cover">
              Health insurance
            </label>
            <select
              id="ef-cover"
              className={`mt-2 ${INPUT_CLASS}`}
              value={healthCover}
              onChange={track(setHealthCover)}
            >
              {HEALTH_COVER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where you are today</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-existing">
              Already set aside and liquid (INR)
            </label>
            <input
              id="ef-existing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={existingFund}
              onChange={track(setExistingFund)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-contribution">
              You can add (INR / month)
            </label>
            <input
              id="ef-contribution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={contribution}
              onChange={track(setContribution)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ef-return">
              Return on the parked money (% per year)
            </label>
            <input
              id="ef-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.25"
              value={annualReturn}
              onChange={track(setAnnualReturn)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Sweep-in fixed deposits and liquid funds are the usual home for this money.
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Emergency fund you should hold
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.targetCorpus)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to size your fund."
                : `${num(result.recommendedMonths)} months of your ${money(result.monthlyOutgo)} monthly outgo`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy emergency fund result"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Recommended cover", hasError ? DASH : `${num(result.recommendedMonths)} months`],
            ["Monthly essential outgo", hasError ? DASH : money(result.monthlyOutgo)],
            [
              "Cover you have today",
              hasError ? DASH : `${money(result.existingFund)} (${num(result.coverageMonths)} months)`,
            ],
            ["Shortfall to close", hasError ? DASH : money(result.gap)],
            [
              "Time to reach the target",
              hasError
                ? DASH
                : result.monthsToGoal === null
                  ? "Add a monthly contribution"
                  : result.monthsToGoal === 0
                    ? "Already there"
                    : `${result.monthsToGoal} month(s)`,
            ],
            ["Progress", hasError ? DASH : `${num(result.progress)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{result.goalNote}</p>
        )}

        {!hasError && (
          <>
            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Emergency fund is ${num(result.progress)}% funded`}
            >
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.progress))}%` }}
              />
            </div>
            {result.clamped && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Your risk factors add up to {num(result.rawMonths)} months. The recommendation is
                capped to the {MIN_MONTHS}-{MAX_MONTHS} month band — beyond a year, idle cash loses
                more to inflation than it buys in safety, so fix the underlying risk (buy health
                cover, clear a loan) instead of hoarding more.
              </p>
            )}
          </>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How the months were built up</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Factor
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Months
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.factors.map((factor) => (
                  <tr key={factor.label} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">{factor.label}</td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        factor.months > 0
                          ? "text-[var(--danger)]"
                          : factor.months < 0
                            ? "text-[var(--success)]"
                            : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {signed(factor.months)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">Recommended</td>
                  <td className="py-2 text-right font-semibold text-[var(--primary)]">
                    {num(result.recommendedMonths)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The month adjustments are planning heuristics, not regulated formulas —
        your notice period, industry hiring cycle and family support all shift the answer. Consult a
        SEBI-registered investment adviser for advice on your own situation.
      </p>
    </main>
  );
}
