"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPin, RotateCcw } from "lucide-react";

import {
  ANNUAL_MAXIMUM,
  EXEMPTION_LIMIT_HALF_YEARLY,
  HALF_YEARS,
  MONTHS_IN_HALF_YEAR,
  PT_SLABS,
  computeTamilNaduPt,
  annualTaxFor,
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

const DEFAULTS = { income: "35000", basis: "monthly" };

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
  const [income, setIncome] = useState(DEFAULTS.income);
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => computeTamilNaduPt({ income: toNumber(income), basis }),
    [income, basis],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Tamil Nadu Professional Tax",
      `Monthly salary: ${money(result.monthlySalary)}`,
      `Half-yearly income: ${money(result.halfYearlyIncome)}`,
      `Slab: ${result.slabLabel}`,
      `Tax per half-year: ${money(result.halfYearlyTax)}`,
      `Tax for the year: ${money(result.annualTax)}`,
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
    setIncome(DEFAULTS.income);
    setBasis(DEFAULTS.basis);
    setCopied(false);
  };

  const rows = [
    ["Half-yearly income assessed", failed ? DASH : money(result.halfYearlyIncome)],
    ["Applicable slab", failed ? DASH : result.slabLabel],
    ["Tax for each half-year", failed ? DASH : money(result.halfYearlyTax)],
    ["Tax for the full year", failed ? DASH : money(result.annualTax)],
    ["Spread across the six months", failed ? DASH : money2(result.effectiveMonthly)],
    ["Tamil Nadu annual maximum", money(ANNUAL_MAXIMUM)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Tamil Nadu PT
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Professional Tax Calculator &mdash; Tamil Nadu
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tamil Nadu charges professional tax half-yearly through the local body, on{" "}
          {MONTHS_IN_HALF_YEAR} months of income rather than a monthly salary. These are the Greater
          Chennai Corporation slabs, running from nil up to{" "}
          {money(EXEMPTION_LIMIT_HALF_YEARLY)} half-yearly to {money(1250)} above {money(75000)}.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tn-income">
              Income (INR)
            </label>
            <input
              id="tn-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tn-basis">
              The figure above is
            </label>
            <select
              id="tn-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={basis}
              onChange={(event) => setBasis(event.target.value)}
            >
              <option value="monthly">Monthly salary</option>
              <option value="halfYearly">Half-yearly income</option>
            </select>
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
              Professional tax per half-year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.halfYearlyTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a result."
                : result.liable
                  ? `${money(result.annualTax)} across both half-years`
                  : `Half-yearly income is at or below ${money(EXEMPTION_LIMIT_HALF_YEARLY)}, so nothing is payable.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy Tamil Nadu professional tax result"
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {HALF_YEARS.map((half) => (
            <div key={half.key} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {half.label}
              </p>
              <p className="mt-1 text-xl font-semibold">
                {failed ? DASH : money(result.halfYearlyTax)}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Pay by {half.payBy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Half-yearly slab table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Half-yearly income
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Per half-year
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
                    <td className="py-2 pr-3 text-right">{money(slab.halfYearlyTax)}</td>
                    <td className="py-2 text-right">{money(annualTaxFor(slab.halfYearlyTax))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Professional tax in Tamil Nadu is levied by the local body under the
        Tamil Nadu Municipal Laws (Second Amendment) Act 1998, so a municipality or town panchayat
        may notify slightly different amounts from the Greater Chennai Corporation schedule used
        here. Confirm with your local body or tax adviser before relying on this for payroll.
      </p>
    </main>
  );
}
