"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

const DEFAULTS = {
  instalment: "5000",
  years: "5",
  months: "0",
  rate: "6.7",
  senior: "no",
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "block text-sm font-medium text-[var(--foreground)]";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const btnGhost =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

// Banks compound RD interest quarterly. Each instalment earns interest for the
// number of months it stays on deposit: value = R * (1 + r/400) ^ (months / 3).
function valueAfterMonths(instalment, quarterlyRate, monthsElapsed) {
  let total = 0;
  for (let k = 1; k <= monthsElapsed; k += 1) {
    const monthsOnDeposit = monthsElapsed - k + 1;
    total += instalment * (1 + quarterlyRate) ** (monthsOnDeposit / 3);
  }
  return total;
}

function effectiveMonthlyRate(instalment, tenure, maturity) {
  const invested = instalment * tenure;
  if (maturity <= invested) return 0;
  const futureValue = (i) => {
    let total = 0;
    for (let k = 1; k <= tenure; k += 1) {
      total += instalment * (1 + i) ** (tenure - k + 1);
    }
    return total;
  };
  let low = 0;
  let high = 0.05;
  for (let guard = 0; guard < 40 && futureValue(high) < maturity; guard += 1) {
    high *= 2;
  }
  for (let step = 0; step < 80; step += 1) {
    const mid = (low + high) / 2;
    if (futureValue(mid) < maturity) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setCopied(false);
  };

  const parsed = useMemo(() => {
    const instalment = Number(form.instalment);
    const years = Number(form.years);
    const months = Number(form.months);
    const baseRate = Number(form.rate);

    if (
      !Number.isFinite(instalment) ||
      !Number.isFinite(years) ||
      !Number.isFinite(months) ||
      !Number.isFinite(baseRate)
    )
      return { error: "Please enter numbers in every field." };
    if (instalment < 100)
      return { error: "Most banks need a minimum RD instalment of Rs 100." };
    if (years < 0 || months < 0)
      return { error: "Tenure cannot be negative." };
    if (months > 11)
      return { error: "Use 0 to 11 for the months field and add whole years above." };

    const tenure = Math.round(years * 12 + months);
    if (tenure < 6)
      return { error: "The shortest recurring deposit tenure is 6 months." };
    if (tenure > 120)
      return { error: "Recurring deposits run for a maximum of 10 years (120 months)." };
    if (baseRate <= 0 || baseRate > 15)
      return { error: "Enter an interest rate between 0.1% and 15%." };

    const rate = form.senior === "yes" ? baseRate + 0.5 : baseRate;
    return { values: { instalment, tenure, rate, baseRate, senior: form.senior === "yes" } };
  }, [form]);

  const result = useMemo(() => {
    if (!parsed.values) return null;
    const { instalment, tenure, rate } = parsed.values;
    const quarterlyRate = rate / 400;
    const maturity = valueAfterMonths(instalment, quarterlyRate, tenure);
    const invested = instalment * tenure;
    const interest = maturity - invested;
    const monthlyIrr = effectiveMonthlyRate(instalment, tenure, maturity);
    const effectiveAnnual = ((1 + monthlyIrr) ** 12 - 1) * 100;

    const milestones = [];
    const totalYears = Math.ceil(tenure / 12);
    for (let y = 1; y <= totalYears; y += 1) {
      const monthsElapsed = Math.min(y * 12, tenure);
      milestones.push({
        year: y,
        monthsElapsed,
        deposited: instalment * monthsElapsed,
        value: valueAfterMonths(instalment, quarterlyRate, monthsElapsed),
      });
    }

    return {
      maturity,
      invested,
      interest,
      effectiveAnnual,
      milestones,
      averageYearlyInterest: interest / (tenure / 12),
    };
  }, [parsed]);

  const summary = useMemo(() => {
    if (!result || !parsed.values) return "";
    return [
      "Recurring Deposit Maturity",
      `Monthly instalment: ${inr(parsed.values.instalment)}`,
      `Tenure: ${parsed.values.tenure} months`,
      `Interest rate: ${parsed.values.rate}% p.a., compounded quarterly${
        parsed.values.senior ? " (includes 0.5% senior citizen benefit)" : ""
      }`,
      `Total deposited: ${inr(result.invested)}`,
      `Interest earned: ${inr(result.interest)}`,
      `Maturity value: ${inr(result.maturity)}`,
      `Effective annual yield: ${result.effectiveAnnual.toFixed(2)}%`,
    ].join("\n");
  }, [parsed, result]);

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Savings
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Recurring Deposit Maturity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find the maturity value of a bank RD using the quarterly compounding
          method banks actually apply to each monthly instalment.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Deposit details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="rd-instalment">
              Monthly instalment (INR)
            </label>
            <input
              id="rd-instalment"
              type="number"
              inputMode="numeric"
              min="100"
              step="100"
              value={form.instalment}
              onChange={setField("instalment")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rd-years">
              Tenure - years
            </label>
            <input
              id="rd-years"
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={form.years}
              onChange={setField("years")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rd-months">
              Tenure - extra months
            </label>
            <input
              id="rd-months"
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              step="1"
              value={form.months}
              onChange={setField("months")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rd-rate">
              Interest rate (% p.a.)
            </label>
            <input
              id="rd-rate"
              type="number"
              inputMode="decimal"
              min="0.1"
              max="15"
              step="0.05"
              value={form.rate}
              onChange={setField("rate")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="rd-senior">
              Senior citizen (+0.5%)
            </label>
            <select
              id="rd-senior"
              value={form.senior}
              onChange={setField("senior")}
              className={inputClass}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copySummary}
            disabled={!result}
            aria-label="Copy recurring deposit result"
            className={`${btnPrimary} disabled:opacity-60`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(DEFAULTS);
              setCopied(false);
            }}
            aria-label="Reset all inputs to defaults"
            className={btnGhost}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {parsed.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {parsed.error}
          </p>
        ) : null}
      </section>

      {result ? (
        <>
          <section className="mt-5 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              Maturity value after {parsed.values.tenure} months
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {inr(result.maturity)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {inr(parsed.values.instalment)} a month at {parsed.values.rate}%
              p.a., compounded quarterly
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)]">
              {[
                ["Total deposited", inr(result.invested)],
                ["Interest earned", inr(result.interest)],
                [
                  "Effective annual yield",
                  `${result.effectiveAnnual.toFixed(2)}%`,
                ],
                [
                  "Average interest per year",
                  inr(result.averageYearlyInterest),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                >
                  <dt className="text-sm text-[var(--muted-foreground)]">
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-5 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Balance at each milestone
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      After
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Deposited
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Interest
                    </th>
                    <th scope="col" className="py-2 text-right font-medium">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.milestones.map((row) => (
                    <tr
                      key={row.year}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3">{row.monthsElapsed} months</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {inr(row.deposited)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-[var(--success)]">
                        {inr(row.value - row.deposited)}
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums">
                        {inr(row.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              RD interest is fully taxable at your slab rate. Banks deduct TDS
              at 10% once interest paid on your deposits in a financial year
              crosses Rs 50,000 (Rs 1,00,000 for senior citizens). Figures here
              are estimates and exclude TDS; actual bank rounding may differ
              slightly.
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
