"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Absolute (point-to-point) return -> annualised CAGR. */
const toAnnualised = (absolutePct, years) =>
  (Math.pow(1 + absolutePct / 100, 1 / years) - 1) * 100;

/** Annualised CAGR -> absolute (point-to-point) return over the same period. */
const toAbsolute = (annualPct, years) => (Math.pow(1 + annualPct / 100, years) - 1) * 100;

const COMPARE_YEARS = [0.5, 1, 2, 3, 5, 7, 10];

export default function ToolHome() {
  const [mode, setMode] = useState("absolute-to-annual");
  const [absolute, setAbsolute] = useState("60");
  const [annual, setAnnual] = useState("12");
  const [years, setYears] = useState("3");
  const [months, setMonths] = useState("0");
  const [amount, setAmount] = useState("100000");
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const y = toNumber(years);
    const m = toNumber(months);
    const invested = toNumber(amount);
    const abs = toNumber(absolute);
    const ann = toNumber(annual);

    if (Number.isNaN(y) || Number.isNaN(m)) return { error: "Enter a valid holding period." };
    if (y < 0 || m < 0) return { error: "Holding period cannot be negative." };
    if (m >= 12) return { error: "Months should be between 0 and 11 — add whole years to the years box." };
    if (Number.isNaN(invested) || invested <= 0) {
      return { error: "Invested amount must be greater than zero." };
    }

    const totalYears = y + m / 12;
    if (!(totalYears > 0)) return { error: "Holding period must be longer than zero." };
    if (totalYears > 75) return { error: "Holding period should be 75 years or less." };

    let absolutePct;
    let annualPct;

    if (mode === "absolute-to-annual") {
      if (Number.isNaN(abs)) return { error: "Enter a valid absolute return." };
      if (abs <= -100) return { error: "An absolute return of -100% or lower means the value is wiped out." };
      if (abs > 1e7) return { error: "Absolute return is unrealistically large." };
      absolutePct = abs;
      annualPct = toAnnualised(abs, totalYears);
    } else {
      if (Number.isNaN(ann)) return { error: "Enter a valid annualised return." };
      if (ann <= -100) return { error: "An annualised return of -100% or lower wipes out the investment." };
      if (ann > 1000) return { error: "Annualised return should be 1000% or less." };
      annualPct = ann;
      absolutePct = toAbsolute(ann, totalYears);
    }

    if (!Number.isFinite(absolutePct) || !Number.isFinite(annualPct)) {
      return { error: "Those numbers do not produce a usable result — try a smaller return or period." };
    }

    const finalValue = invested * (1 + absolutePct / 100);
    const gain = finalValue - invested;
    const simpleAverage = absolutePct / totalYears;
    const doublingYears =
      annualPct > 0 ? Math.log(2) / Math.log(1 + annualPct / 100) : Infinity;

    return {
      totalYears,
      absolutePct,
      annualPct,
      invested,
      finalValue,
      gain,
      multiple: finalValue / invested,
      simpleAverage,
      doublingYears,
      shortPeriod: totalYears < 1,
    };
  }, [mode, absolute, annual, years, months, amount]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Absolute vs Annualised Return",
      `Holding period: ${NUM4.format(calc.totalYears)} years`,
      `Absolute (total) return: ${pct(calc.absolutePct)}`,
      `Annualised return (CAGR): ${pct(calc.annualPct)}`,
      `Invested: ${money(calc.invested)}`,
      `Final value: ${money(calc.finalValue)} (gain ${money(calc.gain)})`,
      `Value multiple: ${NUM.format(calc.multiple)}x`,
      `Simple average per year (not compounded): ${pct(calc.simpleAverage)}`,
      Number.isFinite(calc.doublingYears)
        ? `Money doubles in about ${NUM.format(calc.doublingYears)} years at this CAGR`
        : "No doubling time — the annualised return is zero or negative",
    ].join("\n");
  }, [calc]);

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
    setMode("absolute-to-annual");
    setAbsolute("60");
    setAnnual("12");
    setYears("3");
    setMonths("0");
    setAmount("100000");
    setCopied(false);
  };

  const compareRows = calc.error
    ? []
    : COMPARE_YEARS.map((y) => ({
        years: y,
        annual: toAnnualised(calc.absolutePct, y),
      }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Returns
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Absolute vs Annualised Return Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A 60% total gain sounds impressive until you learn it took five years. Convert a
          point-to-point (absolute) return into a compounded annual return — or go the other way —
          for any period in years and months.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Choose conversion direction"
        >
          {[
            ["absolute-to-annual", "Absolute → Annualised"],
            ["annual-to-absolute", "Annualised → Absolute"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={
                mode === id
                  ? "min-h-11 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  : "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "absolute-to-annual" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ar-absolute">
                Absolute (total) return over the whole period (%)
              </label>
              <input
                id="ar-absolute"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                value={absolute}
                onChange={(event) => setAbsolute(event.target.value)}
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ar-annual">
                Annualised return / CAGR (% per year)
              </label>
              <input
                id="ar-annual"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                value={annual}
                onChange={(event) => setAnnual(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="ar-years">
              Holding period — years
            </label>
            <input
              id="ar-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="75"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ar-months">
              Holding period — months
            </label>
            <input
              id="ar-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ar-amount">
              Amount invested (INR)
            </label>
            <input
              id="ar-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
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
                  {mode === "absolute-to-annual" ? "Annualised return (CAGR)" : "Absolute (total) return"}
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {mode === "absolute-to-annual" ? pct(calc.annualPct) : pct(calc.absolutePct)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {mode === "absolute-to-annual"
                    ? `${pct(calc.absolutePct)} total, compounded over ${NUM.format(calc.totalYears)} years`
                    : `${pct(calc.annualPct)} a year compounded for ${NUM.format(calc.totalYears)} years`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy return conversion result"
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
                ["Absolute (point-to-point) return", pct(calc.absolutePct)],
                ["Annualised return (CAGR)", pct(calc.annualPct)],
                ["Holding period", `${NUM4.format(calc.totalYears)} years`],
                ["Amount invested", money(calc.invested)],
                ["Value at the end", money(calc.finalValue)],
                ["Absolute gain", money(calc.gain)],
                ["Value multiple", `${NUM.format(calc.multiple)}x`],
                ["Simple average per year (no compounding)", pct(calc.simpleAverage)],
                [
                  "Doubling time at this CAGR",
                  Number.isFinite(calc.doublingYears)
                    ? `${NUM.format(calc.doublingYears)} years`
                    : "Not applicable",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.shortPeriod && (
              <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
                For a holding period under one year, annualising exaggerates the result. Mutual funds
                in India quote absolute returns for periods below 12 months for exactly this reason.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              The same {pct(calc.absolutePct)} total gain, over different periods
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              How long you held it changes the annualised number completely.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Holding period</th>
                    <th scope="col" className="py-2 text-right font-semibold">Annualised return</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.years} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        {row.years === 0.5 ? "6 months" : `${row.years} year${row.years > 1 ? "s" : ""}`}
                      </td>
                      <td className="py-2 text-right font-semibold">{pct(row.annual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. CAGR assumes a single lump sum held for the whole period. For staggered
        investments such as SIPs, XIRR is the correct measure, and taxes, exit loads and expenses are
        not included here.
      </p>
    </main>
  );
}
