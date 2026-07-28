"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import { ESCALATION_TYPES, buildRentSchedule } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULTS = {
  baseMonthlyRent: "50000",
  escalationType: "percentage",
  escalationValue: "5",
  escalationEveryYears: "1",
  termMonths: "36",
  rentFreeMonths: "0",
  securityDepositMonths: "2",
  monthlyMaintenance: "0",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [baseMonthlyRent, setBaseMonthlyRent] = useState(DEFAULTS.baseMonthlyRent);
  const [escalationType, setEscalationType] = useState(DEFAULTS.escalationType);
  const [escalationValue, setEscalationValue] = useState(DEFAULTS.escalationValue);
  const [escalationEveryYears, setEscalationEveryYears] = useState(DEFAULTS.escalationEveryYears);
  const [termMonths, setTermMonths] = useState(DEFAULTS.termMonths);
  const [rentFreeMonths, setRentFreeMonths] = useState(DEFAULTS.rentFreeMonths);
  const [securityDepositMonths, setSecurityDepositMonths] = useState(DEFAULTS.securityDepositMonths);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(DEFAULTS.monthlyMaintenance);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRentSchedule({
        baseMonthlyRent: toNumber(baseMonthlyRent),
        escalationType,
        escalationValue: toNumber(escalationValue),
        escalationEveryYears: toNumber(escalationEveryYears),
        termMonths: toNumber(termMonths),
        rentFreeMonths: toNumber(rentFreeMonths),
        securityDepositMonths: toNumber(securityDepositMonths),
        monthlyMaintenance: toNumber(monthlyMaintenance),
      }),
    [
      baseMonthlyRent,
      escalationType,
      escalationValue,
      escalationEveryYears,
      termMonths,
      rentFreeMonths,
      securityDepositMonths,
      monthlyMaintenance,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Rent Escalation Schedule",
      `Base monthly rent: ${money(result.baseMonthlyRent)}`,
      `Term: ${result.termMonths} months`,
      `Final monthly rent: ${money(result.finalMonthlyRent)}`,
      `Total rent over the term: ${money(result.totalRent)}`,
      `Total outgo incl. maintenance: ${money(result.totalOutgo)}`,
      `Average monthly rent: ${money(result.averageMonthlyRent)}`,
      `Rise from base to final: ${pct(result.totalIncreasePercent)}`,
      `Effective compound annual rise: ${pct(result.effectiveAnnualPercent)}`,
      `Security deposit: ${money(result.securityDeposit)}`,
      "",
      ...result.rows.map(
        (row) =>
          `Year ${row.year}: ${money(row.monthlyRent)}/month x ${row.months} month(s) = ${money(row.rentPaid)}`,
      ),
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
    setBaseMonthlyRent(DEFAULTS.baseMonthlyRent);
    setEscalationType(DEFAULTS.escalationType);
    setEscalationValue(DEFAULTS.escalationValue);
    setEscalationEveryYears(DEFAULTS.escalationEveryYears);
    setTermMonths(DEFAULTS.termMonths);
    setRentFreeMonths(DEFAULTS.rentFreeMonths);
    setSecurityDepositMonths(DEFAULTS.securityDepositMonths);
    setMonthlyMaintenance(DEFAULTS.monthlyMaintenance);
    setCopied(false);
  };

  const numberFields = [
    ["rent-base", "Base monthly rent (INR)", baseMonthlyRent, setBaseMonthlyRent, "500"],
    [
      "rent-step",
      escalationType === "percentage" ? "Escalation per step (%)" : "Escalation per step (INR)",
      escalationValue,
      setEscalationValue,
      escalationType === "percentage" ? "0.5" : "500",
    ],
    ["rent-interval", "Escalate every (years)", escalationEveryYears, setEscalationEveryYears, "1"],
    ["rent-term", "Lease term (months)", termMonths, setTermMonths, "1"],
    ["rent-free", "Rent-free months at the start", rentFreeMonths, setRentFreeMonths, "1"],
    [
      "rent-deposit",
      "Security deposit (months of base rent)",
      securityDepositMonths,
      setSecurityDepositMonths,
      "1",
    ],
    ["rent-maint", "Monthly maintenance / CAM (INR)", monthlyMaintenance, setMonthlyMaintenance, "500"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Rental calculators
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Rent Escalation Schedule Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a base rent and an escalation clause into the year-by-year rent, the total over the
          term, and the effective compound annual rise you are actually agreeing to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rent-type">
              Escalation clause
            </label>
            <select
              id="rent-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={escalationType}
              onChange={(event) => setEscalationType(event.target.value)}
            >
              {ESCALATION_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {numberFields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[11, 24, 36, 60, 108].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTermMonths(String(months))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {months} months
            </button>
          ))}
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
              Total rent over the term
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalRent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the schedule."
                : `${result.termMonths} months, rising from ${money(result.baseMonthlyRent)} to ${money(result.finalMonthlyRent)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the rent escalation schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Final monthly rent", hasError ? DASH : money(result.finalMonthlyRent)],
            ["Average monthly rent over the term", hasError ? DASH : money(result.averageMonthlyRent)],
            ["Rise from base to final rent", hasError ? DASH : pct(result.totalIncreasePercent)],
            ["Effective compound annual rise", hasError ? DASH : pct(result.effectiveAnnualPercent)],
            ["Number of escalation steps", hasError ? DASH : String(result.stepCount)],
            ["Value of the rent-free period", hasError ? DASH : money(result.rentFreeValue)],
            ["Maintenance over the term", hasError ? DASH : money(result.totalMaintenance)],
            ["Total outgo including maintenance", hasError ? DASH : money(result.totalOutgo)],
            ["Security deposit at signing", hasError ? DASH : money(result.securityDeposit)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Year-by-year schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Monthly rent</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Months</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rent paid</th>
                  <th scope="col" className="py-2 text-right font-semibold">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.year}</td>
                    <td className="py-2 pr-3 text-right">{money(row.monthlyRent)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.months}
                      {row.freeMonths > 0 ? ` (${row.freeMonths} free)` : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.rentPaid)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimate only. The lease deed governs: check whether escalation runs from the commencement
        date or from each renewal, whether maintenance and property tax escalate separately, and
        whether any rent control legislation applies to the premises.
      </p>
    </main>
  );
}
