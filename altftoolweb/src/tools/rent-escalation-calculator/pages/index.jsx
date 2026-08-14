"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import {
  MAX_TERM_MONTHS,
  REGISTRATION_FREE_TERM_MONTHS,
  projectRentEscalation,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const DEFAULTS = {
  baseMonthlyRent: "25000",
  escalationPercent: "5",
  escalationEveryMonths: "11",
  termMonths: "33",
};

const PRESETS = [
  { label: "5% every 11 months", escalation: "5", interval: "11" },
  { label: "5% yearly", escalation: "5", interval: "12" },
  { label: "8% yearly", escalation: "8", interval: "12" },
  { label: "10% every 2 years", escalation: "10", interval: "24" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [baseMonthlyRent, setBaseMonthlyRent] = useState(DEFAULTS.baseMonthlyRent);
  const [escalationPercent, setEscalationPercent] = useState(DEFAULTS.escalationPercent);
  const [escalationEveryMonths, setEscalationEveryMonths] = useState(
    DEFAULTS.escalationEveryMonths,
  );
  const [termMonths, setTermMonths] = useState(DEFAULTS.termMonths);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const base = toNumber(baseMonthlyRent);
    const escalation = toNumber(escalationPercent);
    const interval = toNumber(escalationEveryMonths);
    const term = toNumber(termMonths);

    if ([base, escalation, interval, term].some((value) => Number.isNaN(value))) {
      return { error: "Fill in rent, escalation, interval and lease term." };
    }

    return projectRentEscalation({
      baseMonthlyRent: base,
      escalationPercent: escalation,
      escalationEveryMonths: Math.round(interval),
      termMonths: Math.round(term),
    });
  }, [baseMonthlyRent, escalationPercent, escalationEveryMonths, termMonths]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Rent escalation projection",
      `Base rent: ${money(result.baseMonthlyRent)} a month`,
      `Escalation: ${pct(result.escalationPercent)} every ${result.escalationEveryMonths} months`,
      `Lease term: ${result.termMonths} months`,
      `Rent in the final month: ${money(result.finalMonthlyRent)}`,
      `Total rent over the term: ${money(result.totalRent)}`,
      `Average monthly rent: ${money(result.averageMonthlyRent)}`,
      `${result.escalationCost < 0 ? "Saved because of de-escalation" : "Extra paid because of escalation"}: ${money(Math.abs(result.escalationCost))}`,
      `Effective annual escalation: ${pct(result.effectiveAnnualRate)}`,
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
    setBaseMonthlyRent(DEFAULTS.baseMonthlyRent);
    setEscalationPercent(DEFAULTS.escalationPercent);
    setEscalationEveryMonths(DEFAULTS.escalationEveryMonths);
    setTermMonths(DEFAULTS.termMonths);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Lease planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Rent Increase and Escalation Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Escalation compounds. A 5% clause applied three times leaves rent 15.76% above the base,
          not 15%, and a {REGISTRATION_FREE_TERM_MONTHS}-month cycle raises it slightly faster than
          once a year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="re-base">
              Base monthly rent (INR)
            </label>
            <input
              id="re-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              value={baseMonthlyRent}
              onChange={(event) => setBaseMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-escalation">
              Escalation at each step (%)
            </label>
            <input
              id="re-escalation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={escalationPercent}
              onChange={(event) => setEscalationPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-interval">
              Escalate every (months)
            </label>
            <input
              id="re-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={escalationEveryMonths}
              onChange={(event) => setEscalationEveryMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-term">
              Lease term (months)
            </label>
            <input
              id="re-term"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_TERM_MONTHS}
              step="1"
              value={termMonths}
              onChange={(event) => setTermMonths(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setEscalationPercent(preset.escalation);
                setEscalationEveryMonths(preset.interval);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total rent over the lease
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? "—" : money(result.totalRent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs to see the projection"
                : `${result.termMonths} months, ending at ${money(result.finalMonthlyRent)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the rent escalation projection"
              className={GHOST_BTN}
              disabled={hasError}
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
          {[
            ["Rent in the final month", hasError ? "—" : money(result.finalMonthlyRent)],
            [
              !hasError && result.totalIncrease < 0
                ? "Total decrease from the base rent"
                : "Total increase over the base rent",
              hasError
                ? "—"
                : `${money(Math.abs(result.totalIncrease))} (${pct(Math.abs(result.totalIncreasePercent))})`,
            ],
            ["Average monthly rent across the term", hasError ? "—" : money(result.averageMonthlyRent)],
            ["Rent if it never escalated", hasError ? "—" : money(result.flatTotal)],
            [
              !hasError && result.escalationCost < 0
                ? "Saved because of de-escalation"
                : "Extra paid because of escalation",
              hasError
                ? "—"
                : `${money(Math.abs(result.escalationCost))} (${pct(Math.abs(result.escalationCostPercent))})`,
            ],
            ["Number of escalations in the term", hasError ? "—" : String(result.escalationCount)],
            ["Effective annual escalation", hasError ? "—" : pct(result.effectiveAnnualRate)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Step-by-step schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Months</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Monthly rent</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Over base</th>
                  <th scope="col" className="py-2 text-right font-semibold">Paid in step</th>
                </tr>
              </thead>
              <tbody>
                {result.periods.map((period) => (
                  <tr key={period.step} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {period.fromMonth}
                      {period.toMonth > period.fromMonth ? `-${period.toMonth}` : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(period.monthlyRent)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {pct(period.increaseOverBasePercent)}
                    </td>
                    <td className="py-2 text-right">{money(period.stepTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The projection assumes the escalation applies to the previous rent, which is the usual
        drafting. Some agreements escalate on the original base instead, which is simple rather than
        compound and works out cheaper — read the clause before signing. Maintenance, parking and
        society charges are not included here.
      </p>
    </main>
  );
}
