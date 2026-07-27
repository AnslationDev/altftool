"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";
import {
  LATE_FEE_PER_DAY,
  PENALTY_271H_MAX,
  PENALTY_271H_MIN,
  STATEMENT_FORMS,
  buildTdsCalendar,
  depositDueDates,
  financialYearLabel,
  lateFilingFee,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : DASH);
const dateLabel = (iso) => (iso ? DATE.format(new Date(`${iso}T00:00:00Z`)) : DASH);

/** Stable server-render defaults; a mount effect swaps in the real date. */
const FALLBACK_TODAY = "2026-04-01";
const FALLBACK_FY = 2026;

const FY_CHOICES = [2023, 2024, 2025, 2026, 2027];

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

const STATUS_STYLES = {
  overdue: "bg-[var(--danger-soft)] text-[var(--danger)]",
  "due-today": "bg-[var(--warning-soft)] text-[var(--warning)]",
  "due-soon": "bg-[var(--warning-soft)] text-[var(--warning)]",
  upcoming: "bg-[var(--success-soft)] text-[var(--success)]",
  unknown: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function statusText(status) {
  if (!status || status.days === null) return "—";
  if (status.status === "overdue") return `${Math.abs(status.days)} days overdue`;
  if (status.status === "due-today") return "Due today";
  return `${status.days} days left`;
}

export default function ToolHome() {
  const [today, setToday] = useState(FALLBACK_TODAY);
  const [fyStartYear, setFyStartYear] = useState(FALLBACK_FY);
  const [daysLate, setDaysLate] = useState("30");
  const [taxAmount, setTaxAmount] = useState("50000");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    setToday(iso);
    // The Indian financial year runs 1 April to 31 March.
    setFyStartYear(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1);
  }, []);

  const calendar = useMemo(() => buildTdsCalendar(fyStartYear, today), [fyStartYear, today]);
  const deposits = useMemo(() => depositDueDates(fyStartYear), [fyStartYear]);
  const penalty = useMemo(
    () => lateFilingFee(toNumber(daysLate), toNumber(taxAmount)),
    [daysLate, taxAmount],
  );

  const hasError = Boolean(calendar.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [`TDS and TCS due dates — ${calendar.fyLabel}`];
    calendar.quarters.forEach((quarter) => {
      lines.push(
        `${quarter.label}: 24Q/26Q/27Q ${dateLabel(quarter.tdsStatementDue)}, 27EQ ${dateLabel(
          quarter.tcsStatementDue,
        )}, Form 16A ${dateLabel(quarter.form16aDue)}, Form 27D ${dateLabel(quarter.form27dDue)}`,
      );
    });
    lines.push(`Form 16 for the year: ${dateLabel(calendar.form16Due)}`);
    return lines.join("\n");
  }, [hasError, calendar]);

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
    const now = new Date();
    setToday(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate(),
      ).padStart(2, "0")}`,
    );
    setFyStartYear(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1);
    setDaysLate("30");
    setTaxAmount("50000");
    setCopied(false);
  };

  const headline = hasError
    ? DASH
    : calendar.nextDeadline
      ? `${calendar.nextDeadline.days} days`
      : "All filed for this year";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Rule 31A &amp; 31AA
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TDS Return Due Date Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every quarterly deadline for Forms 24Q, 26Q, 27Q and 27EQ, plus the Form 16, 16A and 27D
          certificate dates and the monthly deposit calendar, laid out for the financial year you
          pick.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="d-fy">
              Financial year
            </label>
            <select
              id="d-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyStartYear}
              onChange={(event) => setFyStartYear(Number(event.target.value))}
            >
              {FY_CHOICES.map((year) => (
                <option key={year} value={year}>
                  {financialYearLabel(year)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="d-today">
              Count days from
            </label>
            <input
              id="d-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calendar.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next statement deadline
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the calendar."
                : calendar.nextDeadline
                  ? `${calendar.nextDeadline.quarter} statements are due on ${dateLabel(calendar.nextDeadline.due)}.`
                  : `Every quarterly statement deadline for ${calendar.fyLabel} has passed.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the TDS due date calendar"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy calendar"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the current financial year"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Financial year", hasError ? DASH : calendar.fyLabel],
            ["Form 16 for salaried staff", hasError ? DASH : dateLabel(calendar.form16Due)],
            [
              "Form 16 status",
              hasError ? DASH : statusText(calendar.form16Status),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 space-y-4">
          {calendar.quarters.map((quarter) => (
            <article
              key={quarter.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{quarter.label}</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {dateLabel(quarter.periodStart)} to {dateLabel(quarter.periodEnd)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[quarter.tdsStatus.status] || STATUS_STYLES.unknown
                  }`}
                >
                  {statusText(quarter.tdsStatus)}
                </span>
              </div>
              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Forms 24Q, 26Q and 27Q", quarter.tdsStatementDue],
                  ["Form 27EQ (TCS)", quarter.tcsStatementDue],
                  ["Form 16A to deductees", quarter.form16aDue],
                  ["Form 27D to collectees", quarter.form27dDue],
                ].map(([label, due]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{dateLabel(due)}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which form do I file?</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {STATEMENT_FORMS.map((form) => (
            <div key={form.id} className="py-2.5">
              <dt className="font-semibold">{form.label}</dt>
              <dd className="text-[var(--muted-foreground)]">{form.what}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Monthly deposit due dates</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Rule 30 — the 7th of the following month, with March the exception at 30 April.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Deduction month
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Deposit by
                </th>
              </tr>
            </thead>
            <tbody>
              {(deposits.rows || []).map((row) => (
                <tr key={row.month} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.month}</td>
                  <td className="py-2 text-right font-semibold">{dateLabel(row.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deposits.error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-[var(--danger)]">
            {deposits.error}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cost of filing late</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Section 234E charges {money0(LATE_FEE_PER_DAY)} a day, capped at the tax in the statement.
          Section 271H adds a penalty of {money0(PENALTY_271H_MIN)} to {money0(PENALTY_271H_MAX)},
          which is not levied if the statement is filed within a year of the due date and the tax,
          interest and fee are paid.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="d-late">
              Days past the due date
            </label>
            <input
              id="d-late"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={daysLate}
              onChange={(event) => setDaysLate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="d-tax">
              Tax in the statement (INR)
            </label>
            <input
              id="d-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={taxAmount}
              onChange={(event) => setTaxAmount(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Late fee under section 234E:{" "}
          <span className="text-lg font-semibold text-[var(--danger)]">
            {penalty.error ? DASH : money(penalty.fee)}
          </span>
        </p>
        {penalty.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {penalty.error}
          </p>
        ) : penalty.capped ? (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Capped at the tax deducted; the uncapped fee would be {money(penalty.rawFee)}.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Where a due date falls on a public holiday the portal
        may accept filing on the next working day, and the CBDT occasionally extends dates by
        circular — check the income tax e-filing portal before relying on a deadline. Interest under
        section 201(1A) runs separately from the section 234E fee.
      </p>
    </main>
  );
}
