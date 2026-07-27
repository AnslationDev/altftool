"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { planEducationCorpus } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  fee: "500000",
  years: "10",
  duration: "4",
  inflation: "8",
  returnPct: "10",
  existing: "0",
  stepUp: "0",
};

export default function ToolHome() {
  const [fee, setFee] = useState(DEFAULTS.fee);
  const [years, setYears] = useState(DEFAULTS.years);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [stepUp, setStepUp] = useState(DEFAULTS.stepUp);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planEducationCorpus({
        currentAnnualFee: fee,
        yearsToStart: years,
        courseYears: duration,
        educationInflation: inflation,
        expectedReturn: returnPct,
        existingCorpus: existing,
        stepUpPct: stepUp,
      }),
    [fee, years, duration, inflation, returnPct, existing, stepUp],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Child Education Corpus Planner",
      `Today's cost of the course: ${money(result.todaysTotalFee)} over ${result.courseYears} year(s)`,
      `Fee in the first course year: ${money(result.firstYearFeeFuture)}`,
      `Nominal fees across the course: ${money(result.nominalTotalFee)} (${num(result.inflationMultiple)}x today)`,
      `Corpus needed on day one of the course: ${money(result.requiredCorpus)}`,
      `Value of existing savings by then: ${money(result.futureValueOfExisting)}`,
      `Shortfall to fund: ${money(result.gap)}`,
      result.funded
        ? "No further monthly saving needed."
        : `Monthly SIP required: ${result.monthlySip === null ? "n/a" : money(result.monthlySip)}${Number(stepUp) > 0 ? `, stepped up ${num(result.stepUpPct)}% a year` : ""}`,
    ].join("\n");
  }, [hasError, result, stepUp]);

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
    setFee(DEFAULTS.fee);
    setYears(DEFAULTS.years);
    setDuration(DEFAULTS.duration);
    setInflation(DEFAULTS.inflation);
    setReturnPct(DEFAULTS.returnPct);
    setExisting(DEFAULTS.existing);
    setStepUp(DEFAULTS.stepUp);
    setCopied(false);
  };

  const fields = [
    { id: "edu-fee", label: "Cost of one year today (₹)", value: fee, set: setFee, step: "10000", min: "0" },
    { id: "edu-years", label: "Years until the course starts", value: years, set: setYears, step: "1", min: "0" },
    { id: "edu-duration", label: "Course duration (years)", value: duration, set: setDuration, step: "1", min: "1" },
    { id: "edu-inflation", label: "Fee inflation (% per year)", value: inflation, set: setInflation, step: "0.5", min: "0" },
    { id: "edu-return", label: "Expected return on savings (% per year)", value: returnPct, set: setReturnPct, step: "0.5", min: "0" },
    { id: "edu-existing", label: "Already saved for this goal (₹)", value: existing, set: setExisting, step: "10000", min: "0" },
    { id: "edu-stepup", label: "Annual SIP step-up (% per year)", value: stepUp, set: setStepUp, step: "1", min: "0" },
  ];

  const rows = hasError
    ? [
        ["Cost of the whole course today", DASH],
        ["Fee in the first course year", DASH],
        ["Nominal fees across the course", DASH],
        ["Corpus needed on day one of the course", DASH],
        ["Existing savings grown to that date", DASH],
        ["Shortfall still to fund", DASH],
        ["Total you will contribute", DASH],
        ["Growth doing the rest", DASH],
      ]
    : [
        ["Cost of the whole course today", money(result.todaysTotalFee)],
        ["Fee in the first course year", money(result.firstYearFeeFuture)],
        [
          "Nominal fees across the course",
          `${money(result.nominalTotalFee)} (${num(result.inflationMultiple)}x today)`,
        ],
        ["Corpus needed on day one of the course", money(result.requiredCorpus)],
        ["Existing savings grown to that date", money(result.futureValueOfExisting)],
        ["Shortfall still to fund", money(result.gap)],
        ["Total you will contribute", money(result.totalInvested)],
        ["Growth doing the rest", money(result.growthEarned)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Education goal
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Child Education Corpus Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Inflate every year of the degree separately, discount it back to the day the course starts,
          subtract what you already hold, and get the monthly SIP that closes the gap.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
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
              {hasError || !result.funded ? "Monthly SIP required" : "Goal already funded"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : result.funded
                  ? money(0)
                  : result.monthlySip === null
                    ? DASH
                    : money(result.monthlySip)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : result.funded
                  ? "Your existing savings already grow past the corpus needed at course start."
                  : `For ${result.months} months${result.stepUpPct > 0 ? `, rising ${num(result.stepUpPct)}% a year to ${money(result.finalYearSip)}` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy education corpus plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fee due in each course year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Course year</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Years from now</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Fee due</th>
                  <th scope="col" className="py-2 text-right font-semibold">Needed at start</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.courseYear} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.courseYear}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{num(row.yearsFromNow)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.fee)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.presentValueAtStart)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            &ldquo;Needed at start&rdquo; discounts each year&rsquo;s fee back to day one of the course at your
            expected return, because the unspent balance keeps earning.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Projections only — actual fees, hostel and living costs and investment returns will differ.
        Returns are assumed to be earned steadily; real markets are not steady. Informational, not
        investment advice.
      </p>
    </main>
  );
}
