"use client";

import { useMemo, useState } from "react";
import {
  CalendarPlus,
  Copy,
  HandCoins,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MIN_DEPOSIT = 500;
const MAX_DEPOSIT = 150000;
const BASE_YEARS = 15;

const durationOptions = [
  { years: 15, label: "15 years", hint: "Base term" },
  { years: 20, label: "20 years", hint: "+5 extension" },
  { years: 25, label: "25 years", hint: "+10 extension" },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function StatTile({ label, value }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function GrowthBars({ rows }) {
  const max = rows.length ? rows[rows.length - 1].closing : 1;
  const labelled = new Set([1, 5, 10, 15, 20, 25]);
  return (
    <div aria-hidden="true" className="mt-6">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
        Closing balance, year by year
      </p>
      <div className="mt-3 flex h-40 items-end gap-1">
        {rows.map((row) => (
          <div key={row.year} className="flex h-full flex-1 flex-col justify-end">
            <div
              title={`Year ${row.year}: ${formatINR(row.closing)}`}
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${Math.max((row.closing / max) * 100, 2)}%`,
                background: row.year > BASE_YEARS ? "var(--anslation-ds-success)" : "var(--primary)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {rows.map((row) => (
          <div key={row.year} className="flex-1 text-center text-[10px] text-[var(--muted-foreground)]">
            {labelled.has(row.year) ? row.year : ""}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--primary)" }} />
          Base 15-year term
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--anslation-ds-success)" }} />
          Extension years
        </span>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [deposit, setDeposit] = useState(50000);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(BASE_YEARS);
  const [copied, setCopied] = useState(false);

  const safeDeposit = clamp(Number(deposit) || 0, MIN_DEPOSIT, MAX_DEPOSIT);
  const safeRate = clamp(Number(rate) || 0, 0.1, 20);

  const result = useMemo(() => {
    const r = safeRate / 100;
    const rows = [];
    let balance = 0;
    for (let year = 1; year <= years; year += 1) {
      const opening = balance;
      balance = (balance + safeDeposit) * (1 + r);
      rows.push({
        year,
        deposit: safeDeposit,
        interest: balance - opening - safeDeposit,
        closing: balance,
      });
    }
    const invested = safeDeposit * years;
    const maturity = balance;
    return {
      rows,
      invested,
      maturity,
      interest: maturity - invested,
      multiple: invested > 0 ? maturity / invested : 0,
    };
  }, [safeDeposit, safeRate, years]);

  const loanExample = result.rows.length >= 1 ? result.rows[0].closing * 0.25 : 0;
  const withdrawalExample = result.rows.length >= 3 ? result.rows[2].closing * 0.5 : 0;

  const summary = useMemo(
    () =>
      [
        "PPF Calculator Summary",
        `Yearly investment: ${formatINR(safeDeposit)}`,
        `Interest rate: ${safeRate}% p.a. (compounded yearly)`,
        `Duration: ${years} years${years > BASE_YEARS ? ` (15 + ${years - BASE_YEARS} extension)` : ""}`,
        `Maturity amount: ${formatINR(result.maturity)}`,
        `Total invested: ${formatINR(result.invested)}`,
        `Total interest earned: ${formatINR(result.interest)}`,
        `Effective multiple: ${result.multiple.toFixed(2)}x`,
        "Tax status: EEE (invest, earn, withdraw - all tax-free)",
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [result, safeDeposit, safeRate, years]
  );

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const infoCards = [
    {
      icon: ShieldCheck,
      title: "EEE tax status",
      body: "PPF sits in the exempt-exempt-exempt bucket: deposits qualify for Section 80C, the yearly interest is tax-free, and the entire maturity amount is tax-free too.",
    },
    {
      icon: HandCoins,
      title: "Loan facility (years 3-6)",
      body: `Between the 3rd and 6th financial year you can borrow up to 25% of the balance held 2 years prior. At your inputs, the year-3 loan limit would be about ${formatINR(loanExample)}.`,
    },
    {
      icon: Wallet,
      title: "Partial withdrawal (year 7+)",
      body: `From the 7th year you may withdraw up to 50% of the balance held 4 years prior. At your inputs, the year-7 limit would be about ${formatINR(withdrawalExample)}.`,
    },
    {
      icon: CalendarPlus,
      title: "Extension rules",
      body: "After the 15-year term, extend in 5-year blocks any number of times, with or without fresh deposits. Use the 20 and 25 year options above to model one or two extensions.",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <PiggyBank className="h-4 w-4" />
            Government-backed savings
          </div>
          <h1 className="text-4xl font-semibold leading-tight">PPF Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            See exactly how your Public Provident Fund grows year by year, what it matures to, and how
            the loan, withdrawal, and extension rules work along the way.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold">Yearly investment (₹)</span>
                <input
                  type="number"
                  min={MIN_DEPOSIT}
                  max={MAX_DEPOSIT}
                  step={500}
                  value={deposit}
                  onChange={(event) => setDeposit(Number(event.target.value))}
                  onBlur={() => setDeposit(safeDeposit)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <input
                  type="range"
                  min={MIN_DEPOSIT}
                  max={MAX_DEPOSIT}
                  step={500}
                  value={safeDeposit}
                  onChange={(event) => setDeposit(Number(event.target.value))}
                  aria-label="Yearly investment slider"
                  className="mt-3 w-full"
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>₹500 min</span>
                  <span>₹1,50,000 max / year</span>
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Interest rate (% p.a.)</span>
                <input
                  type="number"
                  min={0.1}
                  max={20}
                  step={0.1}
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Current notified rate is 7.1%. The government reviews it every quarter.
                </span>
              </label>

              <div>
                <span className="text-sm font-semibold">Duration</span>
                <div className="mt-2 grid gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option.years}
                      type="button"
                      onClick={() => setYears(option.years)}
                      className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                        years === option.years
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        {option.label}
                        <span className={`text-xs font-medium ${years === option.years ? "" : "text-[var(--muted-foreground)]"}`}>
                          {option.hint}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeposit(50000);
                  setRate(7.1);
                  setYears(BASE_YEARS);
                }}
                className="inline-flex items-center gap-1 justify-self-start text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Maturity after {years} years
              </p>
              <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy summary"}
              </button>
            </div>

            <div aria-live="polite" className="mt-4">
              <div className="inline-block rounded-lg bg-[var(--muted)] p-5">
                <p className="text-4xl font-semibold text-[var(--primary)]">{formatINR(result.maturity)}</p>
              </div>

              <div className="tool-compact-grid mt-6">
                <StatTile label="Total invested" value={formatINR(result.invested)} />
                <StatTile label="Total interest" value={formatINR(result.interest)} />
                <StatTile label="Effective multiple" value={`${result.multiple.toFixed(2)}x of what you put in`} />
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
              Formula: each year, balance = (balance + deposit) × (1 + {safeRate}%). Deposits are assumed
              at the start of the year, and interest compounds yearly on the cumulative balance.
            </p>

            <GrowthBars rows={result.rows} />
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">Year-wise growth</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Every deposit, every interest credit, and the closing balance for all {years} years.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Deposit</th>
                  <th className="px-3 py-2">Interest earned</th>
                  <th className="px-3 py-2">Closing balance</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="px-3 py-2 font-semibold">
                      {row.year}
                      {row.year > BASE_YEARS && (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--primary)]">
                          Ext
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{formatINR(row.deposit)}</td>
                    <td className="px-3 py-2 text-[var(--anslation-ds-success)]">{formatINR(row.interest)}</td>
                    <td className="px-3 py-2 font-semibold">{formatINR(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          {infoCards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]"
            >
              <div className="flex items-center gap-2">
                <card.icon className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-semibold">{card.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{card.body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
