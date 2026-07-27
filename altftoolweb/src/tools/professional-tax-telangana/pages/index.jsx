"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import {
  ENROLMENT_STANDING_YEARS,
  ENROLMENT_TAX,
  MONTHLY_DUE_DAY,
  PT_SLABS,
  SALARY_EXEMPTION_LIMIT,
  computeSalariedPt,
  annualTaxFor,
  computeSelfEmployedPt,
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

const DEFAULTS = { mode: "salaried", salary: "28000", months: "12", years: "7" };

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
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [years, setYears] = useState(DEFAULTS.years);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "selfEmployed") {
      return computeSelfEmployedPt({ yearsOfStanding: toNumber(years) });
    }
    return computeSalariedPt({
      monthlySalary: toNumber(salary),
      monthsEmployed: toNumber(months),
    });
  }, [mode, salary, months, years]);

  const failed = Boolean(result.error);
  const isSalaried = mode === "salaried";

  const summary = useMemo(() => {
    if (failed) return "";
    if (isSalaried) {
      return [
        "Telangana Professional Tax — salaried",
        `Monthly salary: ${money(result.monthlySalary)}`,
        `Slab: ${result.slabLabel}`,
        `Monthly deduction: ${money(result.monthlyTax)}`,
        `Months counted: ${result.months}`,
        `Total: ${money(result.annualTax)}`,
      ].join("\n");
    }
    return [
      "Telangana Professional Tax — self-employed enrolment",
      `Years in the profession: ${result.yearsOfStanding}`,
      `Status: ${result.slabLabel}`,
      `Annual enrolment tax: ${money(result.annualTax)}`,
    ].join("\n");
  }, [failed, isSalaried, result]);

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
    setMode(DEFAULTS.mode);
    setSalary(DEFAULTS.salary);
    setMonths(DEFAULTS.months);
    setYears(DEFAULTS.years);
    setCopied(false);
  };

  const rows = isSalaried
    ? [
        ["Applicable slab", failed ? DASH : result.slabLabel],
        ["Monthly deduction", failed ? DASH : money(result.monthlyTax)],
        ["Months counted", failed ? DASH : String(result.months)],
        ["Total professional tax", failed ? DASH : money(result.annualTax)],
        ["Full twelve-month liability", failed ? DASH : money(result.fullYearTax)],
        ["Deductible under Section 16(iii)", failed ? DASH : money(result.annualTax)],
      ]
    : [
        ["Enrolment status", failed ? DASH : result.slabLabel],
        ["Annual enrolment tax", failed ? DASH : money(result.annualTax)],
        ["Works out to, per month", failed ? DASH : money2(result.monthlyEquivalent)],
        [
          "Years until the tax starts",
          failed ? DASH : result.yearsToLiability > 0 ? String(result.yearsToLiability) : "Already payable",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Telangana PT
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Professional Tax Calculator &mdash; Telangana
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Salaried employees are deducted monthly on a three-band scale starting above{" "}
          {money(SALARY_EXEMPTION_LIMIT)} a month. Self-employed professionals enrol instead and pay{" "}
          {money(ENROLMENT_TAX)} a year once they have {ENROLMENT_STANDING_YEARS} years&rsquo;
          standing.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tg-mode">
              You are
            </label>
            <select
              id="tg-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="salaried">A salaried employee (employer deducts PT)</option>
              <option value="selfEmployed">
                A self-employed professional (enrolled under the Act)
              </option>
            </select>
          </div>

          {isSalaried ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="tg-salary">
                  Monthly salary or wage (INR)
                </label>
                <input
                  id="tg-salary"
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
                <label className={LABEL_CLASS} htmlFor="tg-months">
                  Months employed in Telangana this year
                </label>
                <input
                  id="tg-months"
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
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="tg-years">
                Completed years in the profession
              </label>
              <input
                id="tg-years"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="80"
                step="1"
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
            </div>
          )}
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
              {isSalaried ? "Professional tax payable" : "Annual enrolment tax"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.annualTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a result."
                : isSalaried
                  ? result.liable
                    ? `${money(result.monthlyTax)} a month for ${result.months} month${result.months === 1 ? "" : "s"}`
                    : `At or below ${money(SALARY_EXEMPTION_LIMIT)} a month, so nothing is deducted.`
                  : result.liable
                    ? `Payable once ${ENROLMENT_STANDING_YEARS} years of standing are complete.`
                    : `No enrolment tax until ${ENROLMENT_STANDING_YEARS} years of standing.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy Telangana professional tax result"
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
        <h2 className="text-base font-semibold">Salary slab table</h2>
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
                const isActive = !failed && isSalaried && slab.label === result.slabLabel;
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
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the Schedule to the Telangana Tax on Professions, Trades,
        Callings and Employments Act, 1987. Employers deposit the month&rsquo;s deduction by the{" "}
        {MONTHLY_DUE_DAY}th of the following month. Entries for traders, contractors and companies
        carry their own enrolment amounts &mdash; check the Schedule or ask a tax professional for
        your category.
      </p>
    </main>
  );
}
