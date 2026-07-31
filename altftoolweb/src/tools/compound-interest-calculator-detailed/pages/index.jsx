"use client";

import { useMemo, useState } from "react";
import { Copy, RotateCcw, TrendingUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const FREQUENCIES = [
  { id: "1", label: "Annually", perYear: 1, each: "year" },
  { id: "2", label: "Half-yearly", perYear: 2, each: "half-year" },
  { id: "4", label: "Quarterly", perYear: 4, each: "quarter" },
  { id: "12", label: "Monthly", perYear: 12, each: "month" },
  { id: "26", label: "Fortnightly", perYear: 26, each: "fortnight" },
  { id: "52", label: "Weekly", perYear: 52, each: "week" },
  { id: "365", label: "Daily", perYear: 365, each: "day" },
  { id: "continuous", label: "Continuously", perYear: 0, each: "instant" },
];

const DEFAULTS = {
  principal: "100000",
  rate: "8",
  years: "10",
  frequency: "4",
  deposit: "0",
};

const MAX_YEARS = 100;

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const moneyExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const fmtMoney = (value) => (Number.isFinite(value) ? money.format(value) : "—");
const fmtMoneyExact = (value) => (Number.isFinite(value) ? moneyExact.format(value) : "—");
const fmtPct = (value) => (Number.isFinite(value) ? `${pct.format(value)}%` : "—");

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const frequency = FREQUENCIES.find((item) => item.id === form.frequency) || FREQUENCIES[0];
  const isContinuous = frequency.id === "continuous";

  const result = useMemo(() => {
    const principal = Number(form.principal);
    const ratePct = Number(form.rate);
    const years = Number(form.years);
    const deposit = isContinuous ? 0 : Number(form.deposit || 0);

    if (form.principal.trim() === "" || !Number.isFinite(principal) || principal < 0) {
      return { error: "Enter a starting amount of 0 or more." };
    }
    if (form.rate.trim() === "" || !Number.isFinite(ratePct)) {
      return { error: "Enter a valid annual interest rate." };
    }
    if (ratePct < -100 || ratePct > 1000) {
      return { error: "Annual rate must be between -100% and 1000%." };
    }
    if (form.years.trim() === "" || !Number.isFinite(years) || years <= 0) {
      return { error: "Enter a time period greater than 0 years." };
    }
    if (years > MAX_YEARS) {
      return { error: `Keep the time period at ${MAX_YEARS} years or less.` };
    }
    if (!isContinuous && (!Number.isFinite(deposit) || deposit < 0)) {
      return { error: "Regular deposit must be 0 or a positive amount." };
    }

    const r = ratePct / 100;

    if (isContinuous) {
      const rows = [];
      let previous = principal;
      const wholeYears = Math.ceil(years);
      for (let y = 1; y <= wholeYears; y += 1) {
        const t = Math.min(y, years);
        const balance = principal * Math.exp(r * t);
        rows.push({
          year: y,
          opening: previous,
          deposits: 0,
          interest: balance - previous,
          closing: balance,
        });
        previous = balance;
      }
      const finalBalance = principal * Math.exp(r * years);
      return {
        finalBalance,
        totalDeposits: 0,
        totalContributed: principal,
        totalInterest: finalBalance - principal,
        effectiveRate: (Math.exp(r) - 1) * 100,
        periods: null,
        rows,
        formula: "A = P × e^(r × t)",
      };
    }

    const n = frequency.perYear;
    // Rounding n×years to a whole period silently adds or drops a full
    // compounding period whenever the term is not an exact multiple of it
    // (e.g. 2.5 years compounded annually). Run the whole periods, then grow
    // the leftover fraction of a period at the end.
    const exactPeriods = n * years;
    const totalPeriods = Math.floor(exactPeriods + 1e-9);
    const partialPeriod = Math.max(0, exactPeriods - totalPeriods);
    const periodRate = r / n;

    const rows = [];
    let balance = principal;
    let totalDeposits = 0;
    let yearOpening = principal;
    let yearDeposits = 0;
    let yearInterest = 0;

    for (let period = 1; period <= totalPeriods; period += 1) {
      const interest = balance * periodRate;
      balance += interest;
      balance += deposit;
      yearInterest += interest;
      yearDeposits += deposit;
      totalDeposits += deposit;

      const yearOfPeriod = Math.ceil(period / n);
      const isLastPeriodOfYear =
        period === totalPeriods || Math.ceil((period + 1) / n) !== yearOfPeriod;

      if (isLastPeriodOfYear) {
        rows.push({
          year: yearOfPeriod,
          opening: yearOpening,
          deposits: yearDeposits,
          interest: yearInterest,
          closing: balance,
        });
        yearOpening = balance;
        yearDeposits = 0;
        yearInterest = 0;
      }
    }

    // Fractional tail of a compounding period — growth only, no fresh deposit.
    if (partialPeriod > 1e-9) {
      const openingForTail = balance;
      const tailInterest =
        balance * (Math.pow(1 + periodRate, partialPeriod) - 1);
      balance += tailInterest;

      // The tail belongs to the calendar year it falls in (same convention
      // as the continuous-compounding branch above: a partial final year is
      // labelled with Math.ceil(years)). Only fold it into the previous row
      // when that row is itself still mid-way through that same year —
      // otherwise the previous row is a *complete* prior year and merging
      // would mislabel this year's growth as belonging to the last one.
      const tailYear = Math.ceil(years);
      const last = rows[rows.length - 1];
      if (last && last.year === tailYear) {
        last.interest += tailInterest;
        last.closing = balance;
      } else {
        rows.push({
          year: tailYear,
          opening: openingForTail,
          deposits: 0,
          interest: tailInterest,
          closing: balance,
        });
      }
    }

    const totalContributed = principal + totalDeposits;

    return {
      finalBalance: balance,
      totalDeposits,
      totalContributed,
      totalInterest: balance - totalContributed,
      effectiveRate: (Math.pow(1 + periodRate, n) - 1) * 100,
      periods: totalPeriods,
      rows,
      formula: deposit > 0 ? "A = P(1 + r/n)^(nt) + deposits compounded each period" : "A = P × (1 + r/n)^(n × t)",
    };
  }, [form, frequency, isContinuous]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Compound Interest — detailed",
      `Starting amount: ${fmtMoneyExact(Number(form.principal))}`,
      `Annual rate: ${form.rate}%`,
      `Compounding: ${frequency.label}`,
      isContinuous ? "" : `Deposit each ${frequency.each}: ${fmtMoneyExact(Number(form.deposit || 0))}`,
      `Period: ${form.years} years`,
      "",
      `Final balance: ${fmtMoneyExact(result.finalBalance)}`,
      `Total contributed: ${fmtMoneyExact(result.totalContributed)}`,
      `Total interest earned: ${fmtMoneyExact(result.totalInterest)}`,
      `Effective annual rate: ${fmtPct(result.effectiveRate)}`,
      `Formula: ${result.formula}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [form, frequency, isContinuous, result]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            Growth calculator
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Compound Interest Calculator (Detailed)
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Compound at any frequency from daily to annually — or continuously — add a recurring deposit,
            and read the year-by-year table showing exactly how much of the balance is interest.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label htmlFor="ci-principal" className="mb-1.5 block text-sm font-semibold">
                  Starting amount (₹)
                </label>
                <input
                  id="ci-principal"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.principal}
                  onChange={(event) => setField("principal", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="ci-rate" className="mb-1.5 block text-sm font-semibold">
                  Annual interest rate (%)
                </label>
                <input
                  id="ci-rate"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={form.rate}
                  onChange={(event) => setField("rate", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="ci-years" className="mb-1.5 block text-sm font-semibold">
                  Time period (years)
                </label>
                <input
                  id="ci-years"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.years}
                  onChange={(event) => setField("years", event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="ci-frequency" className="mb-1.5 block text-sm font-semibold">
                  Compounding frequency
                </label>
                <select
                  id="ci-frequency"
                  value={form.frequency}
                  onChange={(event) => setField("frequency", event.target.value)}
                  className={inputClass}
                >
                  {FREQUENCIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                      {item.perYear ? ` (${item.perYear}×/year)` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ci-deposit" className="mb-1.5 block text-sm font-semibold">
                  Deposit each {isContinuous ? "period" : frequency.each} (₹)
                </label>
                <input
                  id="ci-deposit"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  disabled={isContinuous}
                  value={isContinuous ? "" : form.deposit}
                  onChange={(event) => setField("deposit", event.target.value)}
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                  {isContinuous
                    ? "Recurring deposits are not modelled with continuous compounding."
                    : `Added at the end of every ${frequency.each}. Leave at 0 for a lump sum only.`}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                disabled={Boolean(result.error)}
                aria-label="Copy compound interest summary"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={() => setForm(DEFAULTS)}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section
            aria-live="polite"
            aria-atomic="true"
            className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            {result.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {result.error}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Balance after {form.years} years
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {fmtMoney(result.finalBalance)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {fmtMoneyExact(result.finalBalance)} · {result.formula}
                </p>

                <dl className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Total contributed</dt>
                    <dd className="text-sm font-semibold">{fmtMoney(result.totalContributed)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">
                      Interest earned
                    </dt>
                    <dd className="text-sm font-semibold text-[var(--success)]">
                      {fmtMoney(result.totalInterest)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Interest share of balance</dt>
                    <dd className="text-sm font-semibold">
                      {result.finalBalance === 0
                        ? "—"
                        : fmtPct((result.totalInterest / result.finalBalance) * 100)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">
                      Effective annual rate (APY)
                    </dt>
                    <dd className="text-sm font-semibold">{fmtPct(result.effectiveRate)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Compounding periods</dt>
                    <dd className="text-sm font-semibold">
                      {result.periods === null ? "Continuous" : result.periods.toLocaleString("en-IN")}
                    </dd>
                  </div>
                </dl>

                <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Year-by-year growth
                </h2>
                <div className="mt-2 -mx-1 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="px-2 py-2 font-semibold">Year</th>
                        <th scope="col" className="px-2 py-2 text-right font-semibold">Opening</th>
                        <th scope="col" className="px-2 py-2 text-right font-semibold">Deposits</th>
                        <th scope="col" className="px-2 py-2 text-right font-semibold">Interest</th>
                        <th scope="col" className="px-2 py-2 text-right font-semibold">Closing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row) => (
                        <tr key={row.year} className="border-b border-[var(--border)]">
                          <td className="px-2 py-2 font-semibold">{row.year}</td>
                          <td className="px-2 py-2 text-right text-[var(--muted-foreground)]">
                            {fmtMoney(row.opening)}
                          </td>
                          <td className="px-2 py-2 text-right text-[var(--muted-foreground)]">
                            {fmtMoney(row.deposits)}
                          </td>
                          <td className="px-2 py-2 text-right text-[var(--success)]">
                            {fmtMoney(row.interest)}
                          </td>
                          <td className="px-2 py-2 text-right font-semibold">{fmtMoney(row.closing)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Figures are informational estimates. Real deposits may apply TDS, fees or a different
                  day-count convention.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
