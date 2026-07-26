"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = {
  mode: "sip",
  amount: "10000",
  years: "20",
  grossReturn: "12",
  ratioA: "1.75",
  ratioB: "0.6",
};

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const num = (value, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const labelClass = "text-sm font-medium text-[var(--foreground)]";
const hintClass = "mt-1 text-xs text-[var(--muted-foreground)]";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ghostButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function corpusAfter(mode, amount, annualRate, months) {
  const monthlyRate = annualRate / 1200;
  if (mode === "lumpsum") {
    return amount * Math.pow(1 + monthlyRate, months);
  }
  if (monthlyRate === 0) return amount * months;
  return amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [years, setYears] = useState(DEFAULTS.years);
  const [grossReturn, setGrossReturn] = useState(DEFAULTS.grossReturn);
  const [ratioA, setRatioA] = useState(DEFAULTS.ratioA);
  const [ratioB, setRatioB] = useState(DEFAULTS.ratioB);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(
    () => ({
      amount: Number(amount),
      years: Number(years),
      grossReturn: Number(grossReturn),
      ratioA: Number(ratioA),
      ratioB: Number(ratioB),
    }),
    [amount, years, grossReturn, ratioA, ratioB]
  );

  const error = useMemo(() => {
    const values = [parsed.amount, parsed.years, parsed.grossReturn, parsed.ratioA, parsed.ratioB];
    if (!values.every((value) => Number.isFinite(value))) {
      return "Please enter numbers in every field.";
    }
    if (parsed.amount <= 0) return "Investment amount must be greater than zero.";
    if (parsed.years <= 0 || parsed.years > 50) {
      return "Investment period should be between 1 and 50 years.";
    }
    if (parsed.grossReturn <= 0 || parsed.grossReturn > 30) {
      return "Gross return should be between 0.1% and 30% per year.";
    }
    if (parsed.ratioA < 0 || parsed.ratioA > 3) {
      return "Expense ratio A should be between 0% and 3% (SEBI caps equity schemes at 2.25%).";
    }
    if (parsed.ratioB < 0 || parsed.ratioB > 3) {
      return "Expense ratio B should be between 0% and 3%.";
    }
    if (parsed.ratioA >= parsed.grossReturn || parsed.ratioB >= parsed.grossReturn) {
      return "Expense ratio must be smaller than the gross return.";
    }
    return "";
  }, [parsed]);

  const result = useMemo(() => {
    if (error) return null;

    const months = Math.round(parsed.years * 12);
    const invested = mode === "lumpsum" ? parsed.amount : parsed.amount * months;

    const gross = corpusAfter(mode, parsed.amount, parsed.grossReturn, months);
    const planA = corpusAfter(mode, parsed.amount, parsed.grossReturn - parsed.ratioA, months);
    const planB = corpusAfter(mode, parsed.amount, parsed.grossReturn - parsed.ratioB, months);

    const yearly = [];
    for (let year = 1; year <= Math.min(parsed.years, 30); year += 1) {
      const m = year * 12;
      const a = corpusAfter(mode, parsed.amount, parsed.grossReturn - parsed.ratioA, m);
      const b = corpusAfter(mode, parsed.amount, parsed.grossReturn - parsed.ratioB, m);
      yearly.push({ year, planA: a, planB: b, gap: b - a });
    }

    return {
      months,
      invested,
      gross,
      planA,
      planB,
      costA: gross - planA,
      costB: gross - planB,
      savings: planB - planA,
      costSharePlanA: gross > 0 ? ((gross - planA) / gross) * 100 : 0,
      gainA: planA - invested,
      gainB: planB - invested,
      yearly,
    };
  }, [error, mode, parsed]);

  const summaryText = useMemo(() => {
    if (!result) return "";
    return [
      "Expense Ratio Impact Calculator — ALTFTool",
      mode === "lumpsum"
        ? `Lumpsum: ${inr(parsed.amount)} for ${num(parsed.years)} years`
        : `SIP: ${inr(parsed.amount)}/month for ${num(parsed.years)} years`,
      `Gross return assumed: ${num(parsed.grossReturn)}% p.a.`,
      `Total invested: ${inr(result.invested)}`,
      "",
      `Corpus with 0% cost: ${inr(result.gross)}`,
      `Corpus at ${num(parsed.ratioA)}% expense ratio: ${inr(result.planA)}`,
      `Corpus at ${num(parsed.ratioB)}% expense ratio: ${inr(result.planB)}`,
      "",
      `Cost of the higher expense ratio: ${inr(result.savings)}`,
      `Total drag of ${num(parsed.ratioA)}% vs a zero-cost fund: ${inr(result.costA)} (${num(
        result.costSharePlanA
      )}% of the corpus)`,
    ].join("\n");
  }, [mode, parsed, result]);

  const handleCopy = async () => {
    if (!summaryText) return;
    const ok = await safeCopyText(summaryText);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setMode(DEFAULTS.mode);
    setAmount(DEFAULTS.amount);
    setYears(DEFAULTS.years);
    setGrossReturn(DEFAULTS.grossReturn);
    setRatioA(DEFAULTS.ratioA);
    setRatioB(DEFAULTS.ratioB);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Mutual funds
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Expense Ratio Impact Calculator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          A fund&apos;s expense ratio is deducted from returns every single day. Compare two expense
          ratios — say a regular plan against its direct plan — and see the corpus you keep or lose.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-label="Expense ratio inputs"
        >
          <div
            className="grid grid-cols-2 gap-2"
            role="group"
            aria-label="Choose investment method"
          >
            {[
              { id: "sip", label: "Monthly SIP" },
              { id: "lumpsum", label: "One-time lumpsum" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                aria-pressed={mode === option.id}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === option.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="er-amount">
                {mode === "lumpsum" ? "Lumpsum amount (₹)" : "Monthly SIP (₹)"}
              </label>
              <input
                id="er-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step={mode === "lumpsum" ? "10000" : "500"}
                className={`mt-2 ${inputClass}`}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <p className={hintClass}>
                {inr(parsed.amount)}
                {mode === "lumpsum" ? " invested once" : " every month"}
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="er-years">
                Holding period (years)
              </label>
              <input
                id="er-years"
                type="number"
                inputMode="decimal"
                min="1"
                max="50"
                step="1"
                className={`mt-2 ${inputClass}`}
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
              <p className={hintClass}>Costs compound, so longer horizons hurt more.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="er-gross">
                Gross return (% per year)
              </label>
              <input
                id="er-gross"
                type="number"
                inputMode="decimal"
                min="0"
                max="30"
                step="0.1"
                className={`mt-2 ${inputClass}`}
                value={grossReturn}
                onChange={(event) => setGrossReturn(event.target.value)}
              />
              <p className={hintClass}>Return before the expense ratio is deducted.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="er-ratio-a">
                Expense ratio A (%)
              </label>
              <input
                id="er-ratio-a"
                type="number"
                inputMode="decimal"
                min="0"
                max="3"
                step="0.05"
                className={`mt-2 ${inputClass}`}
                value={ratioA}
                onChange={(event) => setRatioA(event.target.value)}
              />
              <p className={hintClass}>Typical regular equity plan: 1.5% – 2.25%.</p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="er-ratio-b">
                Expense ratio B (%)
              </label>
              <input
                id="er-ratio-b"
                type="number"
                inputMode="decimal"
                min="0"
                max="3"
                step="0.05"
                className={`mt-2 ${inputClass}`}
                value={ratioB}
                onChange={(event) => setRatioB(event.target.value)}
              />
              <p className={hintClass}>
                Direct plans usually run 0.3% – 1.0%; index funds can be under 0.2%.
              </p>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className={primaryButton}
              onClick={handleCopy}
              disabled={!result}
              aria-label="Copy the expense ratio impact summary to clipboard"
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
              className={ghostButton}
              onClick={handleReset}
              aria-label="Reset all inputs to default values"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Corpus lost to the higher expense ratio
          </p>
          <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
            {result ? inr(Math.abs(result.savings)) : "—"}
          </p>
          {result ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Difference between a {num(parsed.ratioA)}% and a {num(parsed.ratioB)}% expense ratio
              over {num(parsed.years)} years.
            </p>
          ) : null}

          {result ? (
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Total invested</dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.invested)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Corpus at {num(parsed.ratioA)}%</dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.planA)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Corpus at {num(parsed.ratioB)}%</dt>
                <dd className="font-semibold text-[var(--success)]">{inr(result.planB)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Corpus with zero cost</dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.gross)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">
                  Total drag of the {num(parsed.ratioA)}% plan
                </dt>
                <dd className="font-semibold text-[var(--danger)]">
                  {inr(result.costA)} ({num(result.costSharePlanA)}%)
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm text-[var(--muted-foreground)]">
              Fix the highlighted input to see the cost of your expense ratio.
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            NAV is already net of the expense ratio, so this drag never shows up as a separate line
            in your statement. SEBI caps total expense ratio by scheme size — currently 2.25% for
            most equity schemes and 2.00% for debt schemes.
          </p>
        </section>
      </div>

      {result ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            How the gap widens each year
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    At {num(parsed.ratioA)}%
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    At {num(parsed.ratioB)}%
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Gap
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.yearly.map((row) => (
                  <tr key={row.year}>
                    <td className="py-2 pr-3 font-medium text-[var(--foreground)]">{row.year}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{inr(row.planA)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{inr(row.planB)}</td>
                    <td className="py-2 font-medium text-[var(--foreground)]">{inr(row.gap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
