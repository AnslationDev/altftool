"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { CHOICE_OPTIONS, scoreMoneyHabits } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  monthlyNetIncome: "100000",
  monthlyExpenses: "55000",
  monthlySavings: "20000",
  emergencyFund: "300000",
  monthlyEmi: "20000",
  termCover: "10000000",
  healthCover: "500000",
  tracksSpending: "sometimes",
  retirementSaving: "adhoc",
  revolvesCard: "no",
  goalsWritten: "vague",
  nominations: "nomination",
  reviewsFinances: "reactive",
};

const NUMERIC_FIELDS = [
  ["monthlyNetIncome", "Monthly take-home income (INR)", "5000"],
  ["monthlyExpenses", "Monthly living expenses, excluding EMIs (INR)", "2000"],
  ["monthlySavings", "Saved or invested each month (INR)", "1000"],
  ["emergencyFund", "Liquid emergency fund (INR)", "10000"],
  ["monthlyEmi", "Total loan EMIs each month (INR)", "1000"],
  ["termCover", "Term life sum assured (INR)", "500000"],
  ["healthCover", "Health insurance sum insured (INR)", "100000"],
];

const CHOICE_FIELDS = [
  ["tracksSpending", "Do you review where the money went?"],
  ["retirementSaving", "How is retirement money going in?"],
  ["revolvesCard", "How do you handle the credit card bill?"],
  ["goalsWritten", "Are your financial goals written down?"],
  ["nominations", "Nominations and will"],
  ["reviewsFinances", "How often do you review your finances?"],
];

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const numeric = {};
    for (const [key] of NUMERIC_FIELDS) {
      numeric[key] = toNumber(form[key]);
    }
    if (Object.values(numeric).some((value) => Number.isNaN(value))) {
      return { error: "Every rupee box needs a number — put 0 where something does not apply." };
    }
    return scoreMoneyHabits({
      ...numeric,
      tracksSpending: form.tracksSpending,
      retirementSaving: form.retirementSaving,
      revolvesCard: form.revolvesCard,
      goalsWritten: form.goalsWritten,
      nominations: form.nominations,
      reviewsFinances: form.reviewsFinances,
    });
  }, [form]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Money habit score",
      `Overall: ${result.overall} / 100 — ${result.band}`,
      ...result.pillars.map((row) => `${row.pillar}: ${row.score}`),
      "",
      `Savings rate: ${result.metrics.savingsRatePct}%`,
      `Emergency fund: ${result.metrics.emergencyMonths} months of expenses`,
      `EMI to income: ${result.metrics.foirPct}%`,
      `Life cover: ${result.metrics.termMultiple}x annual income`,
      "",
      result.actions.length ? "What to fix first:" : "No weak spots found.",
      ...result.actions.slice(0, 5).map((action) => `- ${action.label} (${action.score}/100): ${action.tip}`),
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const scoreColour = (score) =>
    score >= 80
      ? "text-[var(--success)]"
      : score >= 50
        ? "text-[var(--primary)]"
        : "text-[var(--danger)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Eleven checks, three pillars
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Money Habit Score Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scored against the benchmarks planners actually use — a 20% savings rate, six months of
          expenses in reserve, EMIs under 40% of income and life cover of ten times pay — with the
          weakest habit named first.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your numbers</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {NUMERIC_FIELDS.map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`mhs-${key}`}>
                {label}
              </label>
              <input
                id={`mhs-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
              />
            </div>
          ))}
        </div>

        <h2 className="mt-6 border-t border-[var(--border)] pt-5 text-base font-semibold">
          Your habits
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CHOICE_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`mhs-${key}`}>
                {label}
              </label>
              <select
                id={`mhs-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
              >
                {CHOICE_OPTIONS[key].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Money habit score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold sm:text-5xl ${
                hasError ? "text-[var(--muted-foreground)]" : scoreColour(result.overall)
              }`}
            >
              {hasError ? "—" : `${result.overall}`}
              <span className="ml-1 text-xl text-[var(--muted-foreground)]">/ 100</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "—" : `${result.band} — ${result.bandSummary}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the money habit score"
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

        {!hasError && result.cashFlowWarning ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.cashFlowWarning}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {(hasError ? [] : result.pillars).map((row) => (
            <div key={row.pillar} className="rounded-lg border border-[var(--border)] p-4">
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {row.pillar}
              </p>
              <p className={`mt-1 text-2xl font-semibold ${scoreColour(row.score)}`}>{row.score}</p>
            </div>
          ))}
          {hasError ? (
            <p className="text-sm text-[var(--muted-foreground)] sm:col-span-3">—</p>
          ) : null}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Savings rate", hasError ? "—" : `${result.metrics.savingsRatePct}% of take-home`],
            [
              "Emergency fund",
              hasError ? "—" : `${result.metrics.emergencyMonths} months of expenses`,
            ],
            ["EMIs to income", hasError ? "—" : `${result.metrics.foirPct}%`],
            ["Life cover", hasError ? "—" : `${result.metrics.termMultiple}x annual income`],
            ["Annual income used", hasError ? "—" : money(result.metrics.annualIncome)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.actions.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Fix these first</h2>
          <ol className="mt-3 space-y-3 text-sm">
            {result.actions.map((action) => (
              <li key={action.id} className="rounded-lg border border-[var(--border)] p-3">
                <p className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                  <span>{action.label}</span>
                  <span className={scoreColour(action.score)}>{action.score} / 100</span>
                </p>
                <p className="mt-1 leading-6 text-[var(--muted-foreground)]">{action.tip}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Every check</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Check
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    You
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Benchmark
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.checks.map((check) => (
                  <tr key={check.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{check.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{check.measured}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{check.target}</td>
                    <td className={`py-2 text-right font-semibold ${scoreColour(check.score)}`}>
                      {check.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only, not financial advice. The benchmarks are general rules of thumb — a
        single earner with dependants needs a larger buffer and more cover than a dual-income
        household with none, and someone close to retirement needs a different mix altogether.
        Nothing you type is sent anywhere; the score is computed in your browser.
      </p>
    </main>
  );
}
