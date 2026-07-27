"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import {
  DAILY_WAGE_EXEMPTION,
  EMPLOYEE_RATE,
  EMPLOYER_RATE,
  MONTHS_IN_CONTRIBUTION_PERIOD,
  PAYMENT_DUE_DAY,
  computeEsiContribution,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const DEFAULTS = {
  wages: "18000",
  payableDays: "26",
  disability: false,
  midPeriod: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [wages, setWages] = useState(DEFAULTS.wages);
  const [payableDays, setPayableDays] = useState(DEFAULTS.payableDays);
  const [disability, setDisability] = useState(DEFAULTS.disability);
  const [midPeriod, setMidPeriod] = useState(DEFAULTS.midPeriod);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeEsiContribution({
        monthlyWages: toNumber(wages),
        payableDays: toNumber(payableDays),
        personWithDisability: disability,
        crossedCeilingMidPeriod: midPeriod,
      }),
    [wages, payableDays, disability, midPeriod],
  );

  const failed = Boolean(result.error);
  const outOfCover = !failed && !result.covered;

  const summary = useMemo(() => {
    if (failed) return "";
    if (outOfCover) return `ESI: not covered. ${result.note}`;
    return [
      "ESI Contribution",
      `Monthly gross wages: ${money(result.monthlyWages)}`,
      `Employee share (0.75%): ${money(result.employeeShare)}`,
      `Employer share (3.25%): ${money(result.employerShare)}`,
      `Total per month: ${money(result.totalMonthly)}`,
      `Total per contribution period (6 months): ${money(result.totalPeriod)}`,
      `Average daily wage: ${money2(result.averageDailyWage)}`,
    ].join("\n");
  }, [failed, outOfCover, result]);

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
    setWages(DEFAULTS.wages);
    setPayableDays(DEFAULTS.payableDays);
    setDisability(DEFAULTS.disability);
    setMidPeriod(DEFAULTS.midPeriod);
    setCopied(false);
  };

  const blank = failed;
  const rows = [
    ["Employee share (0.75% of wages)", blank ? DASH : money(result.employeeShare)],
    ["Employer share (3.25% of wages)", blank ? DASH : money(result.employerShare)],
    ["Total deposited with ESIC each month", blank ? DASH : money(result.totalMonthly)],
    [
      `Contribution period total (${MONTHS_IN_CONTRIBUTION_PERIOD} months)`,
      blank ? DASH : money(result.totalPeriod),
    ],
    ["Twelve-month total", blank ? DASH : money(result.annualTotal)],
    ["Average daily wage (Rule 52 test)", blank ? DASH : money2(result.averageDailyWage)],
    ["Coverage ceiling applied", blank ? DASH : `${money(result.ceiling)} a month`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          ESI &amp; payroll
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">ESI Contribution Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits the monthly ESI liability into the employee&rsquo;s {EMPLOYEE_RATE * 100}% and the
          employer&rsquo;s {EMPLOYER_RATE * 100}% share, checks the coverage ceiling, and applies the
          Rule 52 exemption for workers averaging {money(DAILY_WAGE_EXEMPTION)} a day or less.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="esi-wages">
              Monthly gross wages (INR)
            </label>
            <input
              id="esi-wages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={wages}
              onChange={(event) => setWages(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esi-days">
              Days wages were paid for
            </label>
            <input
              id="esi-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={payableDays}
              onChange={(event) => setPayableDays(event.target.value)}
            />
          </div>
          <label className={`${CHECK_ROW} sm:col-span-1`} htmlFor="esi-disability">
            <input
              id="esi-disability"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={disability}
              onChange={(event) => setDisability(event.target.checked)}
            />
            Person with disability (Rs 25,000 ceiling)
          </label>
          <label className={`${CHECK_ROW} sm:col-span-1`} htmlFor="esi-midperiod">
            <input
              id="esi-midperiod"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={midPeriod}
              onChange={(event) => setMidPeriod(event.target.checked)}
            />
            Crossed the ceiling mid contribution period
          </label>
        </div>
      </section>

      {failed && (
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
              Total ESI payable this month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {blank ? DASH : money(result.totalMonthly)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {blank
                ? "Fix the highlighted input to see a result."
                : outOfCover
                  ? "Outside ESI coverage on these wages."
                  : `${money(result.employeeShare)} from the employee, ${money(result.employerShare)} from the employer`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy ESI contribution result"
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

        {!failed && result.note && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.note}
          </p>
        )}

        {!failed && result.covered && result.employeeExempt && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Average daily wage is at or below {money(DAILY_WAGE_EXEMPTION)}, so under Rule 52 the
            employee pays nothing while the employer still deposits its 3.25% share.
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
        Informational estimate. Each share is rounded up to the next rupee as ESIC requires, and the
        month&rsquo;s contribution is payable by the {PAYMENT_DUE_DAY}th of the following month.
        Wages under the ESI Act exclude the employer&rsquo;s PF and ESI contribution, gratuity and
        annual bonus &mdash; confirm your wage definition with your payroll or compliance team.
      </p>
    </main>
  );
}
