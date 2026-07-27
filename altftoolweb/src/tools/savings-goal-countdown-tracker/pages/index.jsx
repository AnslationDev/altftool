"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import { trackSavingsGoal } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const prettyDate = (iso) => (iso ? DATE_FMT.format(new Date(`${iso}T00:00:00Z`)) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const todayIso = () => new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  target: "1000000",
  saved: "200000",
  monthly: "15000",
  rate: "7",
  deadline: "",
};

export default function ToolHome() {
  const [target, setTarget] = useState(DEFAULTS.target);
  const [saved, setSaved] = useState(DEFAULTS.saved);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [startDate, setStartDate] = useState(todayIso);
  const [deadline, setDeadline] = useState(DEFAULTS.deadline);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      trackSavingsGoal({
        targetAmount: target,
        savedSoFar: saved,
        monthlyContribution: monthly,
        annualReturn: rate,
        asOfDate: startDate,
        deadlineDate: deadline,
      }),
    [target, saved, monthly, rate, startDate, deadline],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Savings Goal Countdown",
      `Target: ${money(result.target)}`,
      `Saved so far: ${money(result.saved)} (${num(result.progressPct)}% of the goal)`,
      result.alreadyMet
        ? "Target already met."
        : `Still to go: ${money(result.remaining)} — ${result.months} months, hit on ${prettyDate(result.goalDate)}`,
      `Contributions along the way: ${money(result.totalContributed)}, growth: ${money(result.growthTotal)}`,
    ];
    if (result.deadlinePlan) {
      lines.push(
        result.deadlinePlan.onTrack
          ? `On track for the ${prettyDate(result.deadlinePlan.date)} deadline.`
          : `Deadline ${prettyDate(result.deadlinePlan.date)} needs ${money(result.deadlinePlan.requiredMonthly)} a month (${money(result.deadlinePlan.extraMonthly)} more).`,
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
    setTarget(DEFAULTS.target);
    setSaved(DEFAULTS.saved);
    setMonthly(DEFAULTS.monthly);
    setRate(DEFAULTS.rate);
    setStartDate(todayIso());
    setDeadline(DEFAULTS.deadline);
    setCopied(false);
  };

  const numberFields = [
    { id: "sg-target", label: "Savings target (₹)", value: target, set: setTarget, step: "10000", min: "0" },
    { id: "sg-saved", label: "Saved so far (₹)", value: saved, set: setSaved, step: "5000", min: "0" },
    { id: "sg-monthly", label: "Adding each month (₹)", value: monthly, set: setMonthly, step: "1000", min: "0" },
    { id: "sg-rate", label: "Return on the balance (% per year)", value: rate, set: setRate, step: "0.5", min: "0" },
  ];

  const rows = hasError
    ? [
        ["Still to go", DASH],
        ["Months remaining", DASH],
        ["Date you hit the target", DASH],
        ["Contributions between now and then", DASH],
        ["Growth doing the rest", DASH],
      ]
    : [
        ["Still to go", money(result.remaining)],
        [
          "Months remaining",
          result.alreadyMet ? "Target met" : `${result.months} (${num(result.years)} years)`,
        ],
        ["Date you hit the target", result.alreadyMet ? "Today" : prettyDate(result.goalDate)],
        ["Contributions between now and then", money(result.totalContributed)],
        ["Growth doing the rest", money(result.growthTotal)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Goal tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Savings Goal Countdown Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the target, what you have and what you add each month. The countdown solves the
          annuity equation for the number of months, turns it into a calendar date, and marks the
          quarter, half and three-quarter points along the way.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberFields.map((field) => (
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
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-start">
              Counting from
            </label>
            <input
              id="sg-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-deadline">
              Deadline (optional)
            </label>
            <input
              id="sg-deadline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              You hit the target on
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.alreadyMet ? "Done" : prettyDate(result.goalDate)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the countdown."
                : result.alreadyMet
                  ? "The balance already covers the target."
                  : `${result.months} months away · ${result.daysAway} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy savings goal countdown"
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

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-valuenow={Math.round(result.progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress towards the savings goal"
            >
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-[width] motion-reduce:transition-none"
                style={{ width: `${Math.max(1.5, result.progressPct)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>
                {money(result.saved)} saved · {num(result.progressPct)}%
              </span>
              <span>{money(result.target)}</span>
            </div>
          </div>
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

      {!hasError && result.deadlinePlan && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Against your deadline</h2>
          <p
            className={`mt-2 text-sm ${result.deadlinePlan.onTrack ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
          >
            {result.deadlinePlan.onTrack
              ? `On track — you reach the target ${result.deadlinePlan.monthsEarly} month(s) before ${prettyDate(result.deadlinePlan.date)}.`
              : `Short by ${result.deadlinePlan.monthsLate} month(s) against ${prettyDate(result.deadlinePlan.date)}.`}
          </p>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Months to the deadline</dt>
              <dd className="text-right font-semibold">{result.deadlinePlan.months}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Monthly amount that lands on time</dt>
              <dd className="text-right font-semibold">{money(result.deadlinePlan.requiredMonthly)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Extra needed each month</dt>
              <dd className="text-right font-semibold">{money(result.deadlinePlan.extraMonthly)}</dd>
            </div>
          </dl>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Milestone dates</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Milestone</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Balance</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Months</th>
                  <th scope="col" className="py-2 text-right font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {result.milestones.map((milestone) => (
                  <tr key={milestone.pct} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{milestone.pct}%</td>
                    <td className="py-2 pr-3 text-right">{money(milestone.amount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {milestone.reached ? "reached" : milestone.months}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {milestone.reached ? "Passed" : prettyDate(milestone.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Contributions are assumed to arrive at the end of each month and the return is applied
        evenly, which real markets do not do. Informational only, not investment advice.
      </p>
    </main>
  );
}
