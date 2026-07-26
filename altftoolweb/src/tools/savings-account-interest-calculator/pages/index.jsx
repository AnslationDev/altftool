"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  opening: 100000,
  monthly: 0,
  rate: 3.5,
  months: 12,
  startDate: "2026-04-01",
  depositDay: 1,
  senior: "no",
};

const SECTION_80TTA = 10000;
const SECTION_80TTB = 50000;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const isLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
const daysInMonth = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);

/**
 * Day-by-day daily-product simulation, the method RBI mandated from 1 April 2010:
 * interest accrues on each day's closing balance at rate/actual-days-in-year and
 * is credited at the end of every calendar quarter, after which it compounds.
 */
function simulate({ opening, monthly, ratePct, months, startISO, depositDay }) {
  const [y0, m0, d0] = String(startISO).split("-").map(Number);
  if (!Number.isFinite(y0) || !Number.isFinite(m0) || !Number.isFinite(d0)) return null;

  const start = new Date(Date.UTC(y0, m0 - 1, d0));
  const end = new Date(Date.UTC(y0, m0 - 1 + months, d0));
  end.setUTCDate(end.getUTCDate() - 1);
  if (Number.isNaN(start.getTime()) || end.getTime() < start.getTime()) return null;

  const r = ratePct / 100;
  let balance = opening;
  let accrued = 0;
  let totalInterest = 0;
  let totalDeposits = 0;
  let lowestBalance = opening;
  let balanceDays = 0;
  let dayCount = 0;
  const credits = [];
  const cursor = new Date(start.getTime());

  while (cursor.getTime() <= end.getTime()) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    const day = cursor.getUTCDate();

    const target = Math.min(depositDay, daysInMonth(year, month));
    if (day === target && cursor.getTime() > start.getTime()) {
      balance += monthly;
      totalDeposits += monthly;
    }

    if (balance < 0) {
      return { overdrawn: formatDate(cursor) };
    }

    accrued += (balance * r) / (isLeap(year) ? 366 : 365);
    lowestBalance = Math.min(lowestBalance, balance);
    balanceDays += balance;
    dayCount += 1;

    const quarterEnd =
      (month === 2 || month === 5 || month === 8 || month === 11) && day === daysInMonth(year, month);
    const finalDay = cursor.getTime() === end.getTime();

    if (quarterEnd || finalDay) {
      balance += accrued;
      totalInterest += accrued;
      credits.push({
        key: `${year}-${month}-${day}`,
        date: formatDate(cursor),
        interest: accrued,
        balance,
        final: finalDay && !quarterEnd,
      });
      accrued = 0;
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    closingBalance: balance,
    totalInterest,
    totalDeposits,
    lowestBalance,
    averageBalance: dayCount > 0 ? balanceDays / dayCount : 0,
    days: dayCount,
    credits,
    startLabel: formatDate(start),
    endLabel: formatDate(end),
  };
}

export default function ToolHome() {
  const [opening, setOpening] = useState(String(DEFAULTS.opening));
  const [monthly, setMonthly] = useState(String(DEFAULTS.monthly));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [depositDay, setDepositDay] = useState(String(DEFAULTS.depositDay));
  const [senior, setSenior] = useState(DEFAULTS.senior);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const open = toNumber(opening);
    const add = toNumber(monthly);
    const r = toNumber(rate);
    const m = toNumber(months);
    const day = toNumber(depositDay);

    if ([open, add, r, m, day].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (open < 0) return { error: "Opening balance cannot be negative." };
    if (r < 0 || r > 20) return { error: "Savings rate should be between 0% and 20% per year." };
    if (m < 1 || m > 120) return { error: "Choose a period between 1 and 120 months." };
    if (day < 1 || day > 28) return { error: "Pick a monthly deposit day between 1 and 28." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { error: "Choose a valid start date." };

    const result = simulate({
      opening: open,
      monthly: add,
      ratePct: r,
      months: Math.round(m),
      startISO: startDate,
      depositDay: Math.round(day),
    });

    if (!result) return { error: "Choose a valid start date." };
    if (result.overdrawn) {
      return { error: `The balance goes below zero on ${result.overdrawn}. Reduce the monthly withdrawal.` };
    }

    const exemptLimit = senior === "yes" ? SECTION_80TTB : SECTION_80TTA;
    const exempt = Math.min(result.totalInterest, exemptLimit);
    const taxable = Math.max(0, result.totalInterest - exemptLimit);
    const invested = open + Math.max(0, result.totalDeposits);
    const effectiveAnnual =
      result.averageBalance > 0 && result.days > 0
        ? (result.totalInterest / result.averageBalance) * (365 / result.days) * 100
        : 0;

    return {
      ...result,
      exemptLimit,
      exempt,
      taxable,
      invested,
      effectiveAnnual,
    };
  }, [opening, monthly, rate, months, startDate, depositDay, senior]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Savings Account Interest Calculator",
      `Period: ${calc.startLabel} to ${calc.endLabel} (${calc.days} days)`,
      `Opening balance: ${money(toNumber(opening))}`,
      `Monthly deposit: ${money(toNumber(monthly))}`,
      `Rate: ${pct(toNumber(rate))} per year on daily balance`,
      `Interest earned: ${money2(calc.totalInterest)}`,
      `Closing balance: ${money2(calc.closingBalance)}`,
      `Average daily balance: ${money2(calc.averageBalance)}`,
      `Tax free under ${senior === "yes" ? "80TTB" : "80TTA"}: ${money2(calc.exempt)}`,
      `Taxable interest: ${money2(calc.taxable)}`,
    ].join("\n");
  }, [calc, opening, monthly, rate, senior]);

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
    setOpening(String(DEFAULTS.opening));
    setMonthly(String(DEFAULTS.monthly));
    setRate(String(DEFAULTS.rate));
    setMonths(String(DEFAULTS.months));
    setStartDate(DEFAULTS.startDate);
    setDepositDay(String(DEFAULTS.depositDay));
    setSenior(DEFAULTS.senior);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Savings account
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Savings Account Interest Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Interest accrues on your daily closing balance and is credited every quarter. This runs the
          real day-by-day calculation, including monthly deposits, so the compounding matches your
          passbook.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sav-opening">
              Opening balance (INR)
            </label>
            <input
              id="sav-opening"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={opening}
              onChange={(event) => setOpening(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sav-monthly">
              Net monthly deposit (INR)
            </label>
            <input
              id="sav-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="500"
              value={monthly}
              onChange={(event) => setMonthly(event.target.value)}
            />
            <p className={HINT_CLASS}>Use a negative number for a regular monthly withdrawal.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sav-rate">
              Interest rate (% per year)
            </label>
            <input
              id="sav-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sav-months">
              Period (months)
            </label>
            <input
              id="sav-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sav-start">
              Start date
            </label>
            <input
              id="sav-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sav-day">
              Monthly deposit day (1-28)
            </label>
            <input
              id="sav-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="28"
              step="1"
              value={depositDay}
              onChange={(event) => setDepositDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sav-senior">
              Account holder
            </label>
            <select
              id="sav-senior"
              className={`mt-2 ${INPUT_CLASS}`}
              value={senior}
              onChange={(event) => setSenior(event.target.value)}
            >
              <option value="no">Below 60 — Section 80TTA, ₹10,000 exempt</option>
              <option value="yes">Senior citizen — Section 80TTB, ₹50,000 exempt</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[2.7, 3.5, 6, 7].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRate(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value}%
            </button>
          ))}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Interest earned
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money2(calc.totalInterest)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.startLabel} to {calc.endLabel} · {calc.days} days · closing balance{" "}
                  {money2(calc.closingBalance)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy savings account interest result"
                  className={GHOST_BTN}
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
                ["Money you put in (opening + deposits)", money2(calc.invested)],
                ["Average daily balance", money2(calc.averageBalance)],
                ["Lowest balance in the period", money2(calc.lowestBalance)],
                ["Closing balance", money2(calc.closingBalance)],
                ["Effective annual yield on average balance", pct(calc.effectiveAnnual)],
                [
                  `Exempt under Section ${senior === "yes" ? "80TTB" : "80TTA"} (limit ${money(calc.exemptLimit)})`,
                  money2(calc.exempt),
                ],
                ["Taxable interest at your slab", money2(calc.taxable)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Quarterly interest credits</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Credited on
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Interest
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Balance after credit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calc.credits.map((row) => (
                    <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {row.date}
                        {row.final ? (
                          <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">
                            (period end)
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--primary)]">{money2(row.interest)}</td>
                      <td className="py-2 text-right">{money2(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Accrual uses actual days in each calendar year (366 in a leap year), matching the
              actual/365 convention banks apply.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Some banks credit monthly, use slab-wise rates above a balance
        threshold, or vary the rate during the period — check your account terms. Section 80TTA and
        80TTB deductions are available only under the old tax regime.
      </p>
    </main>
  );
}
