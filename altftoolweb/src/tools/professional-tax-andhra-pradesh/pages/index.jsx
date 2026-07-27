"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  ANNUAL_MAXIMUM,
  EXEMPTION_LIMIT,
  MONTHLY_DUE_DAY,
  PT_SLABS,
  REGISTRATION_WINDOW_DAYS,
  computeAndhraPradeshPt,
  computeEmployerLiability,
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

const DEFAULT_SALARY = "24000";
const DEFAULT_MONTHS = "12";
const DEFAULT_COUNTS = ["10", "5", "20"];

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
  const [salary, setSalary] = useState(DEFAULT_SALARY);
  const [months, setMonths] = useState(DEFAULT_MONTHS);
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAndhraPradeshPt({
        monthlySalary: toNumber(salary),
        monthsEmployed: toNumber(months),
      }),
    [salary, months],
  );

  const employer = useMemo(
    () => computeEmployerLiability({ bandCounts: counts.map(toNumber) }),
    [counts],
  );

  const failed = Boolean(result.error);
  const employerFailed = Boolean(employer.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Andhra Pradesh Professional Tax",
      `Monthly salary: ${money(result.monthlySalary)}`,
      `Slab: ${result.slabLabel}`,
      `Monthly deduction: ${money(result.monthlyTax)}`,
      `Months counted: ${result.months}`,
      `Total professional tax: ${money(result.annualTax)}`,
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
    setSalary(DEFAULT_SALARY);
    setMonths(DEFAULT_MONTHS);
    setCounts(DEFAULT_COUNTS);
    setCopied(false);
  };

  const updateCount = (index, value) => {
    setCounts((previous) => previous.map((item, i) => (i === index ? value : item)));
  };

  const rows = [
    ["Applicable slab", failed ? DASH : result.slabLabel],
    ["Monthly deduction", failed ? DASH : money(result.monthlyTax)],
    ["Months counted", failed ? DASH : String(result.months)],
    ["Total professional tax", failed ? DASH : money(result.annualTax)],
    ["Full twelve-month liability", failed ? DASH : money(result.fullYearTax)],
    ["Andhra Pradesh annual maximum", money(ANNUAL_MAXIMUM)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Andhra Pradesh PT
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Professional Tax Calculator &mdash; Andhra Pradesh
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Andhra Pradesh deducts professional tax monthly on a three-band salary scale that starts
          above {money(EXEMPTION_LIMIT)} a month. Work out one employee&rsquo;s deduction, then size
          the whole payroll&rsquo;s monthly deposit from a head count per band.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">One employee</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ap-salary">
              Monthly salary or wage (INR)
            </label>
            <input
              id="ap-salary"
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
            <label className={LABEL_CLASS} htmlFor="ap-months">
              Months employed in Andhra Pradesh this year
            </label>
            <input
              id="ap-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
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
              Professional tax payable
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.annualTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a result."
                : result.liable
                  ? `${money(result.monthlyTax)} a month for ${result.months} month${result.months === 1 ? "" : "s"}`
                  : `At or below ${money(EXEMPTION_LIMIT)} a month, so nothing is deducted.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy Andhra Pradesh professional tax result"
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
        <h2 className="text-base font-semibold">Whole payroll &mdash; head count per band</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PT_SLABS.map((slab, index) => (
            <div key={slab.label}>
              <label className={LABEL_CLASS} htmlFor={`ap-count-${index}`}>
                {slab.label} ({money(slab.monthlyTax)}/mo)
              </label>
              <input
                id={`ap-count-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={counts[index]}
                onChange={(event) => updateCount(index, event.target.value)}
              />
            </div>
          ))}
        </div>

        {employerFailed ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {employer.error}
          </p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Band
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Staff
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Monthly
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employer.lines.map((line) => (
                    <tr key={line.label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{line.label}</td>
                      <td className="py-2 pr-3 text-right">{line.headCount}</td>
                      <td className="py-2 text-right font-semibold">{money(line.monthlyAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Employees counted", String(employer.totalHeadCount)],
                ["Employees actually paying PT", String(employer.payingHeadCount)],
                ["Employer deposit each month", money(employer.monthlyTotal)],
                ["Employer deposit for the year", money(employer.annualTotal)],
                ["Average per employee, per month", money2(employer.averagePerEmployee)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Registration and payment</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            An employer must apply for a certificate of registration within{" "}
            {REGISTRATION_WINDOW_DAYS} days of becoming liable to deduct professional tax.
          </li>
          <li>
            A person carrying on a profession or trade on their own account must apply for a
            certificate of enrolment within the same {REGISTRATION_WINDOW_DAYS} days.
          </li>
          <li>
            Tax deducted for a month is payable by the {MONTHLY_DUE_DAY}th of the following month,
            with the prescribed return.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the Schedule to the Andhra Pradesh Tax on Professions, Trades,
        Callings and Employments Act, 1987. Entries for traders, contractors, companies and
        self-employed professionals carry their own enrolment amounts. Confirm the current
        notification with the commercial taxes department or your tax adviser before using this for
        payroll.
      </p>
    </main>
  );
}
