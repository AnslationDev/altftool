"use client";

import { useMemo, useState } from "react";
import { Copy, RotateCcw, TrendingDown } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (v) => inr.format(Number.isFinite(v) ? v : 0);
const rate = (v) => `${pct.format(Number.isFinite(v) ? v : 0)}%`;

const DEFAULTS = {
  amount: "500000",
  nominal: "12",
  inflation: "6",
  years: "10",
  tax: "0",
};

const PRESETS = [
  { label: "Equity fund vs 6% CPI", nominal: "12", inflation: "6", years: "10", tax: "0" },
  { label: "Bank FD 7% taxed at 30%", nominal: "7", inflation: "6", years: "5", tax: "30" },
  { label: "Savings account 3%", nominal: "3", inflation: "6", years: "10", tax: "30" },
];

const num = (v) => {
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : NaN;
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [nominal, setNominal] = useState(DEFAULTS.nominal);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [years, setYears] = useState(DEFAULTS.years);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [copied, setCopied] = useState(false);

  const state = useMemo(() => {
    const p = num(amount);
    const n = num(nominal);
    const i = num(inflation);
    const y = num(years);
    const t = num(tax);

    if ([p, n, i, y, t].some((v) => Number.isNaN(v))) {
      return { error: "Enter a number in every field." };
    }
    if (p < 0) return { error: "Investment amount cannot be negative." };
    if (n <= -100) return { error: "Nominal return must be greater than -100%." };
    if (i <= -100) return { error: "Inflation must be greater than -100%." };
    if (y <= 0) return { error: "Number of years must be greater than 0." };
    if (y > 100) return { error: "Keep the period at 100 years or less." };
    if (t < 0 || t >= 100) return { error: "Tax on returns must be between 0% and 99.99%." };

    // Post-tax nominal rate (simple annual accrual tax; 0% tax leaves it
    // untouched). Tax only applies to gains — applying it to a negative return
    // shrinks the loss toward zero, i.e. it reports tax as a benefit.
    const postTaxNominal = n > 0 ? n * (1 - t / 100) : n;

    const nom = postTaxNominal / 100;
    const inf = i / 100;

    // Fisher equation: exact real return
    const real = (1 + nom) / (1 + inf) - 1;
    const approx = nom - inf;

    const nominalValue = p * Math.pow(1 + nom, y);
    const realValue = nominalValue / Math.pow(1 + inf, y);
    const purchasingPowerLost = nominalValue - realValue;
    const realGain = realValue - p;
    const totalRealGrowth = p > 0 ? (realValue / p - 1) * 100 : 0;
    // What one unit of today's money is worth after `y` years of inflation
    const rupeeWorth = 1 / Math.pow(1 + inf, y);

    return {
      postTaxNominal,
      realRate: real * 100,
      approxRate: approx * 100,
      nominalValue,
      realValue,
      purchasingPowerLost,
      realGain,
      totalRealGrowth,
      rupeeWorth,
      beatsInflation: real > 0,
      taxed: t > 0,
      principal: p,
      years: y,
      inflation: i,
      nominalInput: n,
    };
  }, [amount, nominal, inflation, years, tax]);

  const report = useMemo(() => {
    if (state.error) return "";
    return [
      "Inflation Adjusted Return Calculator",
      `Investment: ${money(state.principal)}`,
      `Nominal return: ${rate(state.nominalInput)} p.a.`,
      state.taxed ? `Post-tax nominal return: ${rate(state.postTaxNominal)} p.a.` : null,
      `Inflation: ${rate(state.inflation)} p.a.`,
      `Period: ${state.years} years`,
      `Real (inflation-adjusted) return: ${rate(state.realRate)} p.a.`,
      `Quick approximation (return - inflation): ${rate(state.approxRate)} p.a.`,
      `Value after ${state.years} years (nominal): ${money(state.nominalValue)}`,
      `Value in today's money: ${money(state.realValue)}`,
      `Purchasing power lost to inflation: ${money(state.purchasingPowerLost)}`,
      `Real gain over the period: ${money(state.realGain)} (${rate(state.totalRealGrowth)})`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [state]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setAmount(DEFAULTS.amount);
    setNominal(DEFAULTS.nominal);
    setInflation(DEFAULTS.inflation);
    setYears(DEFAULTS.years);
    setTax(DEFAULTS.tax);
  };

  const applyPreset = (preset) => {
    setNominal(preset.nominal);
    setInflation(preset.inflation);
    setYears(preset.years);
    setTax(preset.tax);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <TrendingDown className="h-4 w-4" />
            Real returns
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Inflation Adjusted Return Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Turn a headline (nominal) return into the real return you actually keep after inflation,
            using the exact Fisher equation — plus what your money is worth in today&apos;s rupees.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div>
                <label className={labelClass} htmlFor="iar-amount">
                  Investment amount (₹)
                </label>
                <input
                  id="iar-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="iar-nominal">
                    Nominal return (% p.a.)
                  </label>
                  <input
                    id="iar-nominal"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="iar-inflation">
                    Inflation (% p.a.)
                  </label>
                  <input
                    id="iar-inflation"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={inflation}
                    onChange={(e) => setInflation(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="iar-years">
                    Period (years)
                  </label>
                  <input
                    id="iar-years"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="iar-tax">
                    Tax on returns (%)
                  </label>
                  <input
                    id="iar-tax"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="99"
                    step="1"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Optional. Use 0 for tax-free returns.
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Quick scenarios</p>
                <div className="grid gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs to defaults"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {state.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {state.error}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Real return after inflation
                    </p>
                    <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                      {rate(state.realRate)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      per year, over {state.years} {state.years === 1 ? "year" : "years"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyResult}
                    aria-label="Copy the inflation adjusted return result"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <p
                  className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                    state.beatsInflation
                      ? "bg-[var(--muted)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                >
                  {state.beatsInflation
                    ? "This return beats inflation — your money grows in real terms."
                    : "This return loses to inflation — your money buys less each year."}
                </p>

                <dl className="mt-5 grid gap-3">
                  {[
                    state.taxed
                      ? ["Post-tax nominal return", `${rate(state.postTaxNominal)} p.a.`]
                      : null,
                    ["Quick approximation (return − inflation)", `${rate(state.approxRate)} p.a.`],
                    [`Value after ${state.years} years (nominal)`, money(state.nominalValue)],
                    ["Same value in today's money", money(state.realValue)],
                    ["Purchasing power lost to inflation", money(state.purchasingPowerLost)],
                    ["Real gain over the whole period", `${money(state.realGain)} (${rate(state.totalRealGrowth)})`],
                    [
                      `What ₹100 today is worth in ${state.years} years`,
                      money(100 * state.rupeeWorth),
                    ],
                  ]
                    .filter(Boolean)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                      >
                        <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                        <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
                      </div>
                    ))}
                </dl>

                <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                  Formula: real return = (1 + nominal) ÷ (1 + inflation) − 1. Subtracting inflation
                  from the return is only an approximation and overstates the real return, especially
                  at higher rates.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
