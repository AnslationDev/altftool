"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  ANNUAL_PT_CEILING,
  MP_PT_SLABS,
  computeMpProfessionalTax,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = { monthlyGross: "45000", monthsWorked: "12", marginalTaxRate: "30" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const TAX_RATE_OPTIONS = [
  { value: "0", label: "No relief / new regime" },
  { value: "5.2", label: "5% + cess" },
  { value: "20.8", label: "20% + cess" },
  { value: "31.2", label: "30% + cess" },
];

export default function ToolHome() {
  const [monthlyGross, setMonthlyGross] = useState(DEFAULTS.monthlyGross);
  const [monthsWorked, setMonthsWorked] = useState(DEFAULTS.monthsWorked);
  const [marginalTaxRate, setMarginalTaxRate] = useState(DEFAULTS.marginalTaxRate);
  const [payerType, setPayerType] = useState("salaried");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeMpProfessionalTax({
        monthlyGross: toNumber(monthlyGross),
        monthsWorked: toNumber(monthsWorked),
        marginalTaxRate: toNumber(marginalTaxRate),
      }),
    [monthlyGross, monthsWorked, marginalTaxRate],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Madhya Pradesh Professional Tax",
      `Monthly gross salary: ${money(result.monthlyGross)}`,
      `Annual gross salary: ${money(result.annualGross)}`,
      `Slab: ${result.slabLabel}`,
      `Annual professional tax: ${money(result.annualTax)}`,
      `Monthly deduction: ${money(result.regularMonthlyDeduction)} (last month of the year ${money(result.finalMonthDeduction)})`,
      `Payable for ${result.monthsWorked} month(s): ${money(result.payableForPeriod)}`,
      `Income-tax saved via section 16(iii): ${money(result.incomeTaxSaved)}`,
      `Net cost after relief: ${money(result.netCostAfterRelief)}`,
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
    setMonthlyGross(DEFAULTS.monthlyGross);
    setMonthsWorked(DEFAULTS.monthsWorked);
    setMarginalTaxRate(DEFAULTS.marginalTaxRate);
    setPayerType("salaried");
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Annual gross salary", DASH],
        ["Applicable slab", DASH],
        ["Regular monthly deduction", DASH],
        ["Deduction in the last month of the year", DASH],
        ["Payable for the selected period", DASH],
        ["Income-tax saved (section 16(iii))", DASH],
        ["Net cost after tax relief", DASH],
      ]
    : [
        ["Annual gross salary", money(result.annualGross)],
        ["Applicable slab", result.slabLabel],
        ["Regular monthly deduction", money(result.regularMonthlyDeduction)],
        ["Deduction in the last month of the year", money(result.finalMonthDeduction)],
        [`Payable for ${result.monthsWorked} month(s)`, money(result.payableForPeriod)],
        ["Income-tax saved (section 16(iii))", money(result.incomeTaxSaved)],
        ["Net cost after tax relief", money(result.netCostAfterRelief)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Madhya Pradesh
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Professional Tax Calculator Madhya Pradesh
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Madhya Pradesh charges Vritti Kar on annual gross salary in four bands, with a statutory
          ceiling of {money(ANNUAL_PT_CEILING)} a year. Enter your pay to see the slab, the monthly
          payroll deduction and the deposit schedule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-monthly-gross">
              Monthly gross salary (INR)
            </label>
            <input
              id="mp-monthly-gross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyGross}
              onChange={(event) => setMonthlyGross(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-months">
              Months in the financial year (Apr-Mar)
            </label>
            <input
              id="mp-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={monthsWorked}
              onChange={(event) => setMonthsWorked(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-relief">
              Marginal income-tax rate for relief
            </label>
            <select
              id="mp-relief"
              className={`mt-2 ${INPUT_CLASS}`}
              value={marginalTaxRate}
              onChange={(event) => setMarginalTaxRate(event.target.value)}
            >
              {TAX_RATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="30">30% (no cess)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mp-payer">
              Who pays
            </label>
            <select
              id="mp-payer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={payerType}
              onChange={(event) => setPayerType(event.target.value)}
            >
              <option value="salaried">Employer deducts from salary</option>
              <option value="enrolled">Enrolled person pays directly</option>
            </select>
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
              Professional tax for the year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.annualTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your slab."
                : result.isExempt
                  ? "Below the Rs 2,25,000 annual threshold — no professional tax is due."
                  : `${money(result.regularMonthlyDeduction)} a month, ${money(result.finalMonthDeduction)} in the final month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Madhya Pradesh professional tax result"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          {payerType === "enrolled" ? "Annual deposit guidance" : "Month-by-month deduction schedule"}
        </h2>
        {payerType === "enrolled" ? (
          <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <p>
              An enrolled person (professional, trader, consultant or business owner registered
              under enrolment rather than through an employer) pays the whole year&apos;s liability
              of <span className="font-semibold text-[var(--foreground)]">{hasError ? DASH : money(result.annualTax)}</span> in
              a single deposit, not in monthly instalments.
            </p>
            <p>
              Keep the challan with your books: the amount you deposit is what you can claim as a
              deduction, and the enrolment certificate number has to be quoted on the challan.
              Confirm the current due date and payment portal with the MP Commercial Tax Department
              before you pay.
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Month
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Deducted
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Deposit by
                  </th>
                </tr>
              </thead>
              <tbody>
                {(hasError ? [] : result.schedule).map((row) => (
                  <tr key={row.month} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.month}</td>
                    <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{row.depositBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasError && (
              <p className="py-3 text-sm text-[var(--muted-foreground)]">{DASH} No schedule to show.</p>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Madhya Pradesh slab table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Annual gross salary
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Tax per year
                </th>
              </tr>
            </thead>
            <tbody>
              {MP_PT_SLABS.map((slab) => {
                const active = !hasError && slab.label === result.slabLabel;
                return (
                  <tr
                    key={slab.label}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "text-[var(--primary)]" : ""}`}
                  >
                    <td className="py-2 pr-3 font-semibold">{slab.label}</td>
                    <td className="py-2 text-right">
                      {slab.annualTax === 0 ? "Nil" : money(slab.annualTax)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Slabs follow the MP Vritti Kar Adhiniyam, 1995 and the
        Article 276(2) ceiling of {money(ANNUAL_PT_CEILING)} a year; the section 16(iii) deduction
        applies only if you are taxed under the old regime. Verify current rates, due dates and your
        enrolment category with the MP Commercial Tax Department or a tax professional.
      </p>
    </main>
  );
}
