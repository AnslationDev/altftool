"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

const DEFAULTS = {
  amount: "150000",
  frequency: "yearly",
  rate: "7.1",
  extension: "0",
  extensionMode: "with",
};

const EXTENSIONS = [
  { value: "0", label: "No extension (15 years)" },
  { value: "5", label: "+5 years (20 years)" },
  { value: "10", label: "+10 years (25 years)" },
  { value: "15", label: "+15 years (30 years)" },
];

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

function buildSchedule({ amount, frequency, rate, extension, extensionMode }) {
  const r = rate / 100;
  const totalYears = 15 + extension;
  const rows = [];
  let balance = 0;
  let deposited = 0;
  let interestTotal = 0;

  for (let year = 1; year <= totalYears; year += 1) {
    const contributing = year <= 15 || extensionMode === "with";
    const yearDeposit = contributing ? amount : 0;
    let interest = 0;

    if (frequency === "monthly") {
      // Deposits before the 5th of each month earn interest for that month;
      // interest is credited to the balance at the end of the financial year.
      const monthly = yearDeposit / 12;
      let running = balance;
      for (let month = 0; month < 12; month += 1) {
        running += monthly;
        interest += (running * r) / 12;
      }
      balance = running + interest;
    } else {
      // A single deposit made before 5 April earns interest for all 12 months.
      const opening = balance + yearDeposit;
      interest = opening * r;
      balance = opening + interest;
    }

    deposited += yearDeposit;
    interestTotal += interest;
    rows.push({
      year,
      deposit: yearDeposit,
      interest,
      balance,
      phase: year <= 15 ? "Base term" : "Extension",
    });
  }

  return { rows, maturity: balance, deposited, interestTotal, totalYears };
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setCopied(false);
  };

  const parsed = useMemo(() => {
    const amount = Number(form.amount);
    const rate = Number(form.rate);
    const extension = Number(form.extension);

    if (!Number.isFinite(amount) || !Number.isFinite(rate))
      return { error: "Please enter a valid deposit amount and interest rate." };
    if (amount < 500)
      return { error: "PPF needs a minimum deposit of Rs 500 per financial year." };
    if (amount > 150000)
      return {
        error: "The PPF ceiling is Rs 1,50,000 per financial year across all your accounts.",
      };
    if (rate <= 0 || rate > 15)
      return { error: "Enter an interest rate between 0.1% and 15%." };

    return {
      values: {
        amount,
        rate,
        extension,
        frequency: form.frequency,
        extensionMode: form.extensionMode,
      },
    };
  }, [form]);

  const result = useMemo(
    () => (parsed.values ? buildSchedule(parsed.values) : null),
    [parsed]
  );

  const summary = useMemo(() => {
    if (!result || !parsed.values) return "";
    return [
      "PPF Maturity Estimate",
      `Deposit: ${inr(parsed.values.amount)} per year (${
        parsed.values.frequency === "monthly"
          ? "spread monthly"
          : "lump sum before 5 April"
      })`,
      `Interest rate: ${parsed.values.rate}% p.a., compounded yearly`,
      `Term: ${result.totalYears} years${
        parsed.values.extension > 0
          ? ` (15 + ${parsed.values.extension} extension, ${
              parsed.values.extensionMode === "with"
                ? "with fresh deposits"
                : "without fresh deposits"
            })`
          : ""
      }`,
      `Total deposited: ${inr(result.deposited)}`,
      `Total interest earned: ${inr(result.interestTotal)}`,
      `Maturity value: ${inr(result.maturity)}`,
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
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Savings
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          PPF Maturity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See what your Public Provident Fund account matures to after 15 years,
          and how much more it grows if you extend it in 5-year blocks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Your deposits
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="ppf-amount">
              Yearly deposit (INR)
            </label>
            <input
              id="ppf-amount"
              type="number"
              inputMode="numeric"
              min="500"
              max="150000"
              step="500"
              value={form.amount}
              onChange={setField("amount")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ppf-frequency">
              Deposit pattern
            </label>
            <select
              id="ppf-frequency"
              value={form.frequency}
              onChange={setField("frequency")}
              className={inputClass}
            >
              <option value="yearly">Lump sum before 5 April</option>
              <option value="monthly">Spread evenly across 12 months</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ppf-rate">
              Interest rate (% p.a.)
            </label>
            <input
              id="ppf-rate"
              type="number"
              inputMode="decimal"
              min="0.1"
              max="15"
              step="0.1"
              value={form.rate}
              onChange={setField("rate")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ppf-extension">
              Extension after 15 years
            </label>
            <select
              id="ppf-extension"
              value={form.extension}
              onChange={setField("extension")}
              className={inputClass}
            >
              {EXTENSIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.extension !== "0" ? (
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="ppf-extension-mode">
                Extension type
              </label>
              <select
                id="ppf-extension-mode"
                value={form.extensionMode}
                onChange={setField("extensionMode")}
                className={inputClass}
              >
                <option value="with">Keep depositing every year</option>
                <option value="without">
                  Stop depositing, let the balance earn interest
                </option>
              </select>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copySummary}
            disabled={!result}
            aria-label="Copy PPF maturity result"
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
              Maturity value after {result.totalYears} years
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {inr(result.maturity)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Entirely tax-free on maturity under the EEE status of PPF.
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)]">
              {[
                ["Total deposited", inr(result.deposited)],
                ["Total interest earned", inr(result.interestTotal)],
                [
                  "Interest as a share of maturity",
                  `${((result.interestTotal / (result.maturity || 1)) * 100).toFixed(1)}%`,
                ],
                [
                  "Balance at end of year 15",
                  inr(result.rows[14] ? result.rows[14].balance : result.maturity),
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
              Year-by-year growth
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Year
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Deposit
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Interest
                    </th>
                    <th scope="col" className="py-2 text-right font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr
                      key={row.year}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3">
                        {row.year}
                        {row.phase === "Extension" ? (
                          <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                            ext
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {inr(row.deposit)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums text-[var(--success)]">
                        {inr(row.interest)}
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums">
                        {inr(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              PPF interest is calculated on the lowest balance between the 5th
              and the last day of each month and credited at the end of the
              financial year, so depositing before 5 April earns the most.
              Figures are estimates at a constant rate; the government revises
              the PPF rate every quarter.
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
