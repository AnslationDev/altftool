"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  ANNUAL_MAXIMUM,
  DEPOSIT_DAYS_AFTER_MONTH_END,
  EXEMPTION_LIMIT,
  PT_SLABS,
  buildDepositSchedule,
  computeWestBengalPt,
  annualTaxFor,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const DEFAULTS = { salary: "32000", employees: "1", fyStart: "2025" };

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
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [employees, setEmployees] = useState(DEFAULTS.employees);
  const [fyStart, setFyStart] = useState(DEFAULTS.fyStart);
  const [showSchedule, setShowSchedule] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeWestBengalPt({
        monthlySalary: toNumber(salary),
        employees: toNumber(employees),
      }),
    [salary, employees],
  );

  const failed = Boolean(result.error);

  const schedule = useMemo(() => {
    if (failed) return { error: result.error };
    return buildDepositSchedule({
      monthlyDeposit: result.employerMonthlyDeposit,
      financialYearStart: toNumber(fyStart),
    });
  }, [failed, result, fyStart]);

  const scheduleFailed = Boolean(schedule.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "West Bengal Professional Tax",
      `Monthly salary: ${money(result.monthlySalary)}`,
      `Slab: ${result.slabLabel}`,
      `Per employee, per month: ${money(result.monthlyTax)}`,
      `Per employee, per year: ${money(result.annualTax)}`,
      `Head count: ${result.headCount}`,
      `Employer deposit each month: ${money(result.employerMonthlyDeposit)}`,
      `Employer deposit for the year: ${money(result.employerAnnualDeposit)}`,
    ].join("\n");
  }, [failed, result]);

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
    setSalary(DEFAULTS.salary);
    setEmployees(DEFAULTS.employees);
    setFyStart(DEFAULTS.fyStart);
    setCopied(false);
  };

  const rows = [
    ["Applicable slab", failed ? DASH : result.slabLabel],
    ["Per employee, per month", failed ? DASH : money(result.monthlyTax)],
    ["Per employee, per year", failed ? DASH : money(result.annualTax)],
    ["Head count on this salary", failed ? DASH : String(result.headCount)],
    ["Employer deposit each month", failed ? DASH : money(result.employerMonthlyDeposit)],
    ["Employer deposit for the year", failed ? DASH : money(result.employerAnnualDeposit)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          West Bengal PT
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Professional Tax Calculator &mdash; West Bengal
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          West Bengal charges professional tax on a five-band monthly salary scale, from nil up to{" "}
          {money(EXEMPTION_LIMIT)} a month to {money(200)} a month above {money(40000)}. The employer
          deposits each month&rsquo;s deduction within {DEPOSIT_DAYS_AFTER_MONTH_END} days of the
          month ending.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wb-salary">
              Monthly gross salary (INR)
            </label>
            <input
              id="wb-salary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wb-employees">
              Employees on this salary
            </label>
            <input
              id="wb-employees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={employees}
              onChange={(event) => setEmployees(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wb-fy">
              Financial year starting April
            </label>
            <input
              id="wb-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1979"
              max="2100"
              step="1"
              value={fyStart}
              onChange={(event) => setFyStart(event.target.value)}
            />
          </div>
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
              Deduction per employee, per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.monthlyTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a result."
                : result.liable
                  ? `${result.slabLabel} — ${money(result.annualTax)} over a full year`
                  : `At or below ${money(EXEMPTION_LIMIT)} a month, so nothing is deducted.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy West Bengal professional tax result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">West Bengal slab table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Monthly salary
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Per month
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Per year
                </th>
              </tr>
            </thead>
            <tbody>
              {PT_SLABS.map((slab) => {
                const isActive = !failed && slab.label === result.slabLabel;
                return (
                  <tr
                    key={slab.label}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      isActive ? "bg-[var(--muted)] font-semibold" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{slab.label}</td>
                    <td className="py-2 pr-3 text-right">{money(slab.monthlyTax)}</td>
                    <td className="py-2 text-right">{money(annualTaxFor(slab.monthlyTax))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          The top band totals {money(ANNUAL_MAXIMUM)} a year, within the {money(2500)}{" "}
          constitutional ceiling.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            Employer deposit schedule{!scheduleFailed && ` — FY ${schedule.financialYear}`}
          </h2>
          <button
            type="button"
            onClick={() => setShowSchedule((value) => !value)}
            aria-expanded={showSchedule}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showSchedule ? "Hide" : "Show"}
          </button>
        </div>

        {scheduleFailed ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {schedule.error}
          </p>
        ) : (
          showSchedule && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Wage month
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pay by
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.rows.map((row) => (
                    <tr key={row.wageMonth} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{row.wageMonth}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.dueDate}</td>
                      <td className="py-2 text-right font-semibold">{money(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on Schedule Entry 1 of the West Bengal State Tax on Professions,
        Trades, Callings and Employments Act, 1979 as amended from 1 April 2023. Employers must also
        hold a certificate of registration and file the prescribed returns; confirm the current
        slabs and filing calendar with the state directorate or your tax adviser.
      </p>
    </main>
  );
}
