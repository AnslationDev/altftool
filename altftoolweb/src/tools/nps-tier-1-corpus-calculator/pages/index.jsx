"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

const DEFAULTS = {
  currentAge: "30",
  retirementAge: "60",
  monthly: "10000",
  stepUp: "0",
  returnRate: "10",
  existing: "0",
  annuityShare: "40",
  annuityRate: "6",
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "block text-sm font-medium text-[var(--foreground)]";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const btnGhost =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

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

function computeNps({
  currentAge,
  retirementAge,
  monthly,
  stepUp,
  returnRate,
  existing,
  annuityShare,
  annuityRate,
}) {
  const years = retirementAge - currentAge;
  const months = Math.round(years * 12);
  const monthlyRate = returnRate / 100 / 12;
  const annualStepUp = stepUp / 100;

  let balance = existing;
  let invested = 0;
  let contribution = monthly;

  for (let m = 1; m <= months; m += 1) {
    if (m > 1 && (m - 1) % 12 === 0) {
      contribution *= 1 + annualStepUp;
    }
    // Contribution credited at the start of the month, then the month's growth.
    balance = (balance + contribution) * (1 + monthlyRate);
    invested += contribution;
  }

  const corpus = balance;
  const annuityCorpus = (corpus * annuityShare) / 100;
  const lumpSum = corpus - annuityCorpus;
  const monthlyPension = (annuityCorpus * (annuityRate / 100)) / 12;
  const totalInvested = invested + existing;

  return {
    years,
    months,
    corpus,
    annuityCorpus,
    lumpSum,
    monthlyPension,
    totalInvested,
    gains: corpus - totalInvested,
    finalContribution: contribution,
  };
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setCopied(false);
  };

  const parsed = useMemo(() => {
    const values = {
      currentAge: Number(form.currentAge),
      retirementAge: Number(form.retirementAge),
      monthly: Number(form.monthly),
      stepUp: Number(form.stepUp),
      returnRate: Number(form.returnRate),
      existing: Number(form.existing),
      annuityShare: Number(form.annuityShare),
      annuityRate: Number(form.annuityRate),
    };

    const invalid = Object.entries(values).some(
      ([, value]) => !Number.isFinite(value)
    );
    if (invalid) return { error: "Please enter numbers in every field." };
    if (values.currentAge < 18 || values.currentAge > 69)
      return { error: "NPS Tier 1 entry age is 18 to 70 years." };
    if (values.retirementAge <= values.currentAge)
      return { error: "Retirement age must be greater than your current age." };
    if (values.retirementAge > 75)
      return { error: "NPS Tier 1 can be continued only up to age 75." };
    if (values.monthly < 500)
      return { error: "Minimum NPS Tier 1 contribution is Rs 500 per month." };
    if (values.existing < 0)
      return { error: "Existing corpus cannot be negative." };
    if (values.returnRate < 0 || values.returnRate > 30)
      return { error: "Use an expected return between 0% and 30%." };
    if (values.stepUp < 0 || values.stepUp > 50)
      return { error: "Annual step-up must be between 0% and 50%." };
    // PFRDA exit rules differ sharply either side of 60. A premature exit must
    // annuitise at least 80% (not 40%) and needs 5 years in the scheme — using
    // the superannuation split for an early exit overstates the cash a
    // subscriber can actually take out, by roughly 3×.
    const prematureExit = values.retirementAge < 60;
    if (prematureExit && values.retirementAge - values.currentAge < 5)
      return {
        error:
          "Exit before age 60 needs at least 5 years in NPS. Extend the exit age or start earlier.",
      };
    const minAnnuityShare = prematureExit ? 80 : 40;
    if (values.annuityShare < minAnnuityShare || values.annuityShare > 100)
      return {
        error: prematureExit
          ? "Exit before age 60 requires at least 80% of the corpus to buy an annuity, so use 80% to 100%."
          : "At least 40% of the corpus must buy an annuity, so use 40% to 100%.",
      };
    if (values.annuityRate < 0 || values.annuityRate > 15)
      return { error: "Use an annuity rate between 0% and 15%." };

    return { values };
  }, [form]);

  const result = useMemo(
    () => (parsed.values ? computeNps(parsed.values) : null),
    [parsed]
  );

  const summary = useMemo(() => {
    if (!result || !parsed.values) return "";
    return [
      "NPS Tier 1 Corpus Estimate",
      `Age ${parsed.values.currentAge} to ${parsed.values.retirementAge} (${result.years} years)`,
      `Monthly contribution: ${inr(parsed.values.monthly)}${
        parsed.values.stepUp > 0 ? ` (+${parsed.values.stepUp}% each year)` : ""
      }`,
      `Expected return: ${parsed.values.returnRate}% p.a.`,
      `Total invested: ${inr(result.totalInvested)}`,
      `Estimated corpus at exit: ${inr(result.corpus)}`,
      `Annuity purchase (${parsed.values.annuityShare}%): ${inr(result.annuityCorpus)}`,
      `Tax-free lump sum: ${inr(result.lumpSum)}`,
      `Expected monthly pension @ ${parsed.values.annuityRate}%: ${inr(result.monthlyPension)}`,
    ].join("\n");
  }, [parsed, result]);

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Retirement
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          NPS Tier 1 Corpus Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Project your National Pension System Tier 1 balance at exit, the share
          that must buy an annuity, and the monthly pension it can pay.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Your inputs
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="nps-current-age">
              Current age (years)
            </label>
            <input
              id="nps-current-age"
              type="number"
              inputMode="numeric"
              min="18"
              max="69"
              value={form.currentAge}
              onChange={setField("currentAge")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nps-retirement-age">
              Exit age (years)
            </label>
            <input
              id="nps-retirement-age"
              type="number"
              inputMode="numeric"
              min="19"
              max="75"
              value={form.retirementAge}
              onChange={setField("retirementAge")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nps-monthly">
              Monthly contribution (INR)
            </label>
            <input
              id="nps-monthly"
              type="number"
              inputMode="numeric"
              min="500"
              step="500"
              value={form.monthly}
              onChange={setField("monthly")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nps-step-up">
              Annual step-up (%)
            </label>
            <input
              id="nps-step-up"
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.stepUp}
              onChange={setField("stepUp")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nps-return">
              Expected return (% p.a.)
            </label>
            <input
              id="nps-return"
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.1"
              value={form.returnRate}
              onChange={setField("returnRate")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nps-existing">
              Existing NPS corpus (INR)
            </label>
            <input
              id="nps-existing"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={form.existing}
              onChange={setField("existing")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nps-annuity-share">
              Annuity share (% of corpus, min 40)
            </label>
            <input
              id="nps-annuity-share"
              type="number"
              inputMode="decimal"
              min="40"
              max="100"
              step="1"
              value={form.annuityShare}
              onChange={setField("annuityShare")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="nps-annuity-rate">
              Annuity rate (% p.a.)
            </label>
            <input
              id="nps-annuity-rate"
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.1"
              value={form.annuityRate}
              onChange={setField("annuityRate")}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copySummary}
            disabled={!result}
            aria-label="Copy NPS corpus result"
            className={`${btnPrimary} disabled:opacity-60`}
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
            className={btnGhost}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {parsed.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {parsed.error}
          </p>
        ) : null}
      </section>

      {result ? (
        <>
          <section className="mt-5 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              Estimated corpus at age {parsed.values.retirementAge}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {inr(result.corpus)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Built over {result.years} years ({result.months} monthly
              contributions)
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)]">
              {[
                ["Total amount invested", inr(result.totalInvested)],
                ["Growth on investment", inr(result.gains)],
                [
                  `Annuity purchase (${parsed.values.annuityShare}%)`,
                  inr(result.annuityCorpus),
                ],
                [
                  `Lump sum withdrawal (${num(100 - parsed.values.annuityShare, 0)}%)`,
                  inr(result.lumpSum),
                ],
                [
                  `Expected monthly pension @ ${num(parsed.values.annuityRate)}%`,
                  inr(result.monthlyPension),
                ],
                [
                  "Expected annual pension",
                  inr(result.monthlyPension * 12),
                ],
                [
                  "Last monthly contribution",
                  inr(result.finalContribution),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                >
                  <dt className="text-sm text-[var(--muted-foreground)]">
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-5 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Scheme rules used
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {parsed.values?.retirementAge < 60 ? (
                <>
                  <li>
                    This is a premature exit (before age 60): at least 80% of the
                    Tier 1 corpus must buy an annuity and no more than 20% can be
                    taken as a lump sum. A minimum of 5 years in the scheme is
                    also required.
                  </li>
                  <li>
                    If the total corpus is up to Rs 2.5 lakh on a premature exit
                    you may withdraw the whole amount without buying an annuity.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    At superannuation at least 40% of the Tier 1 corpus must be
                    used to buy an annuity; up to 60% can be withdrawn as a lump
                    sum, which is exempt from tax under Section 10(12A).
                  </li>
                  <li>
                    If the total corpus is up to Rs 5 lakh you may withdraw the
                    whole amount without buying an annuity.
                  </li>
                </>
              )}
              <li>
                Contributions qualify for deduction under Section 80CCD(1)
                within the Rs 1.5 lakh 80C ceiling, plus an extra Rs 50,000
                under 80CCD(1B) in the old tax regime.
              </li>
              <li>
                Returns are market-linked, so this projection is an estimate,
                not a guaranteed outcome. Annuity income is taxed as salary in
                the year received.
              </li>
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
