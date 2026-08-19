"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, RotateCcw } from "lucide-react";

import {
  ANNUAL_MAXIMUM,
  ANNUAL_PT_CEILING,
  EXEMPTION_LIMIT,
  MARGINAL_RATES,
  MONTHLY_DUE_DAY,
  MONTHLY_TAX,
  PT_SLABS,
  computeGujaratPt,
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

const DEFAULTS = { salary: "30000", months: "12", rate: "0.2", exempt: false };

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
  const [months, setMonths] = useState(DEFAULTS.months);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [exempt, setExempt] = useState(DEFAULTS.exempt);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeGujaratPt({
        monthlySalary: toNumber(salary),
        monthsEmployed: toNumber(months),
        marginalRate: toNumber(rate),
        exempt,
      }),
    [salary, months, rate, exempt],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Gujarat Professional Tax",
      `Monthly salary: ${money(result.monthlySalary)}`,
      `Slab: ${result.slabLabel}`,
      `Monthly deduction: ${money(result.monthlyTax)}`,
      `Months counted: ${result.months}`,
      `Total professional tax: ${money(result.annualTax)}`,
      `Old-regime tax saving under Section 16(iii): ${money2(result.taxSaving)}`,
      `Net cost after that saving: ${money2(result.netCost)}`,
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
    setMonths(DEFAULTS.months);
    setRate(DEFAULTS.rate);
    setExempt(DEFAULTS.exempt);
    setCopied(false);
  };

  const rows = [
    ["Applicable slab", failed ? DASH : result.slabLabel],
    ["Monthly deduction", failed ? DASH : money(result.monthlyTax)],
    ["Months counted", failed ? DASH : String(result.months)],
    ["Total professional tax", failed ? DASH : money(result.annualTax)],
    ["Full twelve-month liability", failed ? DASH : money(result.fullYearTax)],
    ["Income tax saved under Section 16(iii)", failed ? DASH : money2(result.taxSaving)],
    ["Net cost after that saving", failed ? DASH : money2(result.netCost)],
    ["Gujarat annual maximum", money(ANNUAL_MAXIMUM)],
    ["Constitutional annual ceiling (Article 276(2))", money(ANNUAL_PT_CEILING)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Gujarat PT
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Professional Tax Calculator &mdash; Gujarat
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Since 1 April 2022 Gujarat has run a two-band schedule: nothing up to{" "}
          {money(EXEMPTION_LIMIT)} a month and a flat {money(MONTHLY_TAX)} a month above it. The tool
          also shows the income tax the payment saves you if you are on the old regime.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gj-salary">
              Monthly salary or wage (INR)
            </label>
            <input
              id="gj-salary"
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
            <label className={LABEL_CLASS} htmlFor="gj-months">
              Months employed in Gujarat this year
            </label>
            <input
              id="gj-months"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="gj-rate">
              Your old-regime slab rate
            </label>
            <select
              id="gj-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            >
              {MARGINAL_RATES.map((value) => (
                <option key={value} value={String(value)}>
                  {value === 0 ? "No tax / new regime" : `${Math.round(value * 100)}%`}
                </option>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]"
            htmlFor="gj-exempt"
          >
            <input
              id="gj-exempt"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={exempt}
              onChange={(event) => setExempt(event.target.checked)}
            />
            Notified exemption applies
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
                  : result.exemptReason
                    ? result.exemptReason
                    : `At or below ${money(EXEMPTION_LIMIT)} a month, so nothing is deducted.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy Gujarat professional tax result"
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

        {!failed && !result.liable && !result.exemptReason && result.shortfallToLimit > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            A rise of {money(result.shortfallToLimit)} a month would cross the{" "}
            {money(EXEMPTION_LIMIT)} limit and start the {money(MONTHLY_TAX)} deduction.
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
        <h2 className="text-base font-semibold">Gujarat slab table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
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
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the Gujarat Panchayats, Municipal Corporations and State Tax on
        Professions, Trades, Callings and Employments Act, 1976 as notified from 1 April 2022.
        Employers deposit the month&rsquo;s deduction by the {MONTHLY_DUE_DAY}th of the following
        month. The Section 16(iii) saving shown applies only on the old regime &mdash; ask a tax
        professional which regime suits your return.
      </p>
    </main>
  );
}
