"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import { METHODS, compareMethods, computeProRataRent } from "../lib";

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

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money0 = (value) => INR0.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULTS = {
  monthlyRent: "30000",
  monthlyMaintenance: "0",
  startDate: "2026-02-10",
  endDate: "2026-03-31",
  method: "actual-days",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(DEFAULTS.monthlyMaintenance);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [copied, setCopied] = useState(false);

  const payload = useMemo(
    () => ({
      monthlyRent: toNumber(monthlyRent),
      monthlyMaintenance: toNumber(monthlyMaintenance),
      startDate,
      endDate,
    }),
    [monthlyRent, monthlyMaintenance, startDate, endDate],
  );

  const result = useMemo(() => computeProRataRent({ ...payload, method }), [payload, method]);
  const comparison = useMemo(() => compareMethods(payload), [payload]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Proportionate Rent",
      `Method: ${result.methodLabel} (${result.methodFormula})`,
      `Period: ${startDate} to ${endDate} (${result.totalDays} days)`,
      `Total rent payable: ${money(result.totalRent)}`,
      result.totalMaintenance > 0 ? `Maintenance: ${money(result.totalMaintenance)}` : "",
      `Total payable: ${money(result.totalPayable)}`,
      "",
      ...result.rows.map(
        (row) =>
          `${row.label}: days ${row.firstDay}-${row.lastDay} of ${row.monthDays} = ${money(row.total)}`,
      ),
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, startDate, endDate]);

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
    setMonthlyRent(DEFAULTS.monthlyRent);
    setMonthlyMaintenance(DEFAULTS.monthlyMaintenance);
    setStartDate(DEFAULTS.startDate);
    setEndDate(DEFAULTS.endDate);
    setMethod(DEFAULTS.method);
    setCopied(false);
  };

  const activeMethod = METHODS.find((item) => item.id === method);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Rental calculators
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Proportionate Rent Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Apportion rent for a part month on move-in or move-out. Whole months bill in full; only
          the part months at each end are pro-rated, using whichever convention your lease specifies.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pro-rent">
              Monthly rent (INR)
            </label>
            <input
              id="pro-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pro-maint">
              Monthly maintenance (INR)
            </label>
            <input
              id="pro-maint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={monthlyMaintenance}
              onChange={(event) => setMonthlyMaintenance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pro-start">
              First day of occupation
            </label>
            <input
              id="pro-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pro-end">
              Last day of occupation
            </label>
            <input
              id="pro-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pro-method">
              Apportionment method in the lease
            </label>
            <select
              id="pro-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {METHODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeMethod ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {activeMethod.formula}. {activeMethod.note}
              </p>
            ) : null}
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
              Total payable
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalPayable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a figure."
                : `${result.totalDays} days of occupation across ${result.rows.length} calendar month${result.rows.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the proportionate rent calculation"
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
          {[
            ["Rent for the period", hasError ? DASH : money(result.totalRent)],
            ["Maintenance for the period", hasError ? DASH : money(result.totalMaintenance)],
            ["Full months billed in full", hasError ? DASH : String(result.fullMonthCount)],
            ["Part months apportioned", hasError ? DASH : String(result.partMonthCount)],
            ["Average daily rent", hasError ? DASH : money(result.averageDailyRate)],
            [
              "First part month",
              hasError || !result.firstPartMonth
                ? DASH
                : `${result.firstPartMonth.label}: ${result.firstPartMonth.occupiedDays} of ${result.firstPartMonth.monthDays} days`,
            ],
            [
              "Last part month",
              hasError || !result.lastPartMonth
                ? DASH
                : `${result.lastPartMonth.label}: ${result.lastPartMonth.occupiedDays} of ${result.lastPartMonth.monthDays} days`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Month-by-month breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Month</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Days</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Daily rate</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rent</th>
                  <th scope="col" className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.label}
                      {row.isFullMonth ? (
                        <span className="block text-xs font-normal text-[var(--success)]">
                          Full month
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.firstDay}&ndash;{row.lastDay} of {row.monthDays}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.dailyRate)}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.rentAmount)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The same dates by each convention</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Whole months are identical in all three; the gap comes entirely from the part months.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Method</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Rent</th>
                <th scope="col" className="py-2 text-right font-semibold">Total payable</th>
              </tr>
            </thead>
            <tbody>
              {hasError || comparison.error
                ? METHODS.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{item.label}</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 text-right">{DASH}</td>
                    </tr>
                  ))
                : comparison.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money0(row.totalRent)}
                      </td>
                      <td className="py-2 text-right font-semibold">{money(row.totalPayable)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimate only. Which dates apply is a matter for the tenancy agreement &mdash; many leases
        require notice ending on a rent day, so rent may run past the move-out date. Check the
        agreement and any applicable rent control legislation before settling a disputed amount.
      </p>
    </main>
  );
}
