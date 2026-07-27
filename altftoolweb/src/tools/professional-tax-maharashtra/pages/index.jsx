"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  ANNUAL_PT_CEILING,
  PT_SLABS,
  WOMEN_EXEMPTION_LIMIT,
  computeMaharashtraPt,
  februaryTaxFor,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const DEFAULTS = { salary: "35000", gender: "male", exempt: false };

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
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [exempt, setExempt] = useState(DEFAULTS.exempt);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => computeMaharashtraPt({ monthlySalary: toNumber(salary), gender, exempt }),
    [salary, gender, exempt],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Maharashtra Professional Tax",
      `Monthly salary: ${money(result.monthlySalary)}`,
      `Slab: ${result.slabLabel}`,
      `Monthly deduction: ${money(result.regularMonthlyTax)}`,
      `February deduction: ${money(result.februaryTax)}`,
      `Total for the year: ${money(result.annualTax)}`,
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
    setGender(DEFAULTS.gender);
    setExempt(DEFAULTS.exempt);
    setCopied(false);
  };

  const activeLabel = failed ? null : result.slabLabel;

  const rows = [
    ["Applicable slab", failed ? DASH : result.slabLabel],
    ["Deduction in a normal month", failed ? DASH : money(result.regularMonthlyTax)],
    ["Deduction in February", failed ? DASH : money(result.februaryTax)],
    ["Total professional tax for the year", failed ? DASH : money(result.annualTax)],
    [
      "Deductible from salary under Section 16(iii)",
      failed ? DASH : money(result.annualTax),
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Maharashtra PT
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Professional Tax Calculator &mdash; Maharashtra
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Maharashtra deducts professional tax on a monthly salary slab, with a higher February
          deduction that brings the year to the {money(ANNUAL_PT_CEILING)} constitutional ceiling.
          Women earning up to {money(WOMEN_EXEMPTION_LIMIT)} a month are exempt.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mh-salary">
              Monthly salary or wage (INR)
            </label>
            <input
              id="mh-salary"
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
            <label className={LABEL_CLASS} htmlFor="mh-gender">
              Employee
            </label>
            <select
              id="mh-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)] sm:col-span-2"
            htmlFor="mh-exempt"
          >
            <input
              id="mh-exempt"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={exempt}
              onChange={(event) => setExempt(event.target.checked)}
            />
            Notified exemption &mdash; 40%+ disability, parent of a child with disability,
            ex-serviceman or senior citizen above 65
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
              Professional tax for the year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.annualTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a result."
                : result.annualTax === 0
                  ? "No professional tax is deductible on these details."
                  : `${money(result.regularMonthlyTax)} a month, ${money(result.februaryTax)} in February`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy Maharashtra professional tax result"
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

        {!failed && result.exemptReason && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.exemptReason}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Maharashtra slab table</h2>
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
                  February
                </th>
              </tr>
            </thead>
            <tbody>
              {PT_SLABS.map((slab) => {
                const isActive = slab.label === activeLabel;
                return (
                  <tr
                    key={slab.label}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      isActive ? "bg-[var(--muted)] font-semibold" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{slab.label}</td>
                    <td className="py-2 pr-3 text-right">{money(slab.monthlyTax)}</td>
                    <td className="py-2 text-right">{money(februaryTaxFor(slab.monthlyTax))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on Schedule I of the Maharashtra State Tax on Professions, Trades,
        Callings and Employments Act, 1975 as amended from 1 April 2023. Employers deduct and deposit
        the tax; filing frequency depends on the previous year&rsquo;s liability. Check current
        notifications or your tax adviser before relying on this for payroll.
      </p>
    </main>
  );
}
