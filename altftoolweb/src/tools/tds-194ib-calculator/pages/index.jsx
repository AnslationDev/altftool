"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";
import {
  LATE_FEE_PER_DAY,
  MONTHLY_THRESHOLD,
  NO_PAN_RATE,
  computeTds194IB,
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

const DEFAULTS = {
  rent: "60000",
  months: "12",
  lastMonthRent: "60000",
  deductionDate: "2026-03-31",
  panFurnished: true,
  daysLate: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [lastMonthRent, setLastMonthRent] = useState(DEFAULTS.lastMonthRent);
  const [deductionDate, setDeductionDate] = useState(DEFAULTS.deductionDate);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [daysLate, setDaysLate] = useState(DEFAULTS.daysLate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTds194IB({
        monthlyRent: toNumber(rent),
        months: toNumber(months),
        lastMonthRent: toNumber(lastMonthRent),
        deductionDate,
        panFurnished,
      }),
    [rent, months, lastMonthRent, deductionDate, panFurnished],
  );

  const hasError = Boolean(result.error);

  const penalty = useMemo(
    () => lateFilingFee(toNumber(daysLate), hasError ? 0 : result.tdsPayable),
    [daysLate, hasError, result.tdsPayable],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Section 194-IB TDS on rent",
      `Monthly rent: ${money(result.monthlyRent)} for ${result.months} month(s)`,
      `Rent for the period: ${money(result.totalRent)}`,
      `Rate applied: ${result.appliedRate}%`,
      `TDS before the cap: ${money(result.tdsBeforeCap)}`,
      `TDS payable: ${money(result.tdsPayable)}`,
      `Pay to the landlord in the last month: ${money(result.netLastMonthPayment)}`,
      `Form 26QC due: ${dateLabel(result.form26qcDue)}`,
      `Form 16C due: ${dateLabel(result.form16cDue)}`,
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
    setRent(DEFAULTS.rent);
    setMonths(DEFAULTS.months);
    setLastMonthRent(DEFAULTS.lastMonthRent);
    setDeductionDate(DEFAULTS.deductionDate);
    setPanFurnished(DEFAULTS.panFurnished);
    setDaysLate(DEFAULTS.daysLate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Section 194-IB
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TDS on Rent by Individuals (Section 194-IB)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          If you are a salaried or self-employed tenant paying more than {money0(MONTHLY_THRESHOLD)}{" "}
          a month and you are not covered by a tax audit, you deduct tax once a year under section
          194-IB. This works out how much, when, and what the cap does to it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ib-rent">
              Monthly rent (INR)
            </label>
            <input
              id="ib-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={rent}
              onChange={(event) => setRent(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Deduction starts only above {money0(MONTHLY_THRESHOLD)} a month.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ib-months">
              Months of tenancy in this financial year
            </label>
            <input
              id="ib-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
            <p className={HINT_CLASS}>Part of a month counts as a full month.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ib-last">
              Rent payable for the last month (INR)
            </label>
            <input
              id="ib-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={lastMonthRent}
              onChange={(event) => setLastMonthRent(event.target.value)}
            />
            <p className={HINT_CLASS}>Section 194-IB(4) caps the whole deduction at this amount.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ib-date">
              Date of deduction
            </label>
            <input
              id="ib-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={deductionDate}
              onChange={(event) => setDeductionDate(event.target.value)}
            />
            <p className={HINT_CLASS}>Last month of the year, or the month you vacate.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={CHECK_ROW} htmlFor="ib-pan">
              <input
                id="ib-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              Landlord has furnished a valid PAN
            </label>
            <p className={HINT_CLASS}>
              Without a PAN, section 206AA raises the rate to {NO_PAN_RATE}% — still capped at the
              last month&rsquo;s rent.
            </p>
          </div>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              TDS to deposit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.tdsPayable)}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the deduction." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy section 194-IB TDS result"
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
            ["Rate applied", hasError ? DASH : `${result.appliedRate}%`],
            ["Statutory rate on the deduction date", hasError ? DASH : `${result.statutoryRate}%`],
            ["Rent for the period", hasError ? DASH : money(result.totalRent)],
            ["TDS before the statutory cap", hasError ? DASH : money(result.tdsBeforeCap)],
            ["Cap: last month's rent", hasError ? DASH : money(result.lastMonthRent)],
            ["Cap bites?", hasError ? DASH : result.capApplied ? "Yes" : "No"],
            ["Pay the landlord in the last month", hasError ? DASH : money(result.netLastMonthPayment)],
            ["Form 26QC due", hasError ? DASH : dateLabel(result.form26qcDue)],
            ["Form 16C to landlord by", hasError ? DASH : dateLabel(result.form16cDue)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.thresholdCrossed ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            Rent can rise by {money(result.headroom)} a month before section 194-IB applies.
          </p>
        ) : null}
      </section>

      {!hasError && result.deductionRequired ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Late Form 26QC fee</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Section 234E charges {money0(LATE_FEE_PER_DAY)} for every day the challan-cum-statement
            is late, never more than the tax deducted.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ib-late">
                Days past the Form 26QC due date
              </label>
              <input
                id="ib-late"
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
              <p className={LABEL_CLASS}>Late fee under section 234E</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--danger)]">
                {penalty.error ? DASH : money(penalty.fee)}
              </p>
              {penalty.error ? (
                <p role="alert" className="mt-1 text-xs font-medium text-[var(--danger)]">
                  {penalty.error}
                </p>
              ) : penalty.capped ? (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Capped at the tax deducted; the raw fee would be {money(penalty.rawFee)}.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How to comply</h2>
        <ol className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {[
            "You do not need a TAN. Your PAN and the landlord's PAN are enough.",
            "Deduct once — from the rent for the last month of the year, or the last month of the tenancy if you move out earlier.",
            "Pay with the challan-cum-statement in Form 26QC within 30 days from the end of the month of deduction.",
            "Download Form 16C from TRACES and give it to the landlord within 15 days of the 26QC due date.",
            "Where there are joint landlords, test the Rs 50,000 limit against each owner's share and file one Form 26QC per landlord.",
          ].map((item, index) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]"
              >
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The 2% rate applies to deductions made on or after
        1 October 2024; earlier deductions were at 5%. Interest under section 201(1A) runs separately
        from the section 234E fee. Confirm your position with a tax professional.
      </p>
    </main>
  );
}
