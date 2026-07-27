"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import { TER_PRESETS, compareDirectVsRegular } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULTS = {
  mode: "lumpsum",
  amount: "1000000",
  years: "10",
  grossReturnPercent: "12",
  directTerPercent: "0.6",
  regularTerPercent: "1.75",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [years, setYears] = useState(DEFAULTS.years);
  const [grossReturnPercent, setGrossReturnPercent] = useState(DEFAULTS.grossReturnPercent);
  const [directTerPercent, setDirectTerPercent] = useState(DEFAULTS.directTerPercent);
  const [regularTerPercent, setRegularTerPercent] = useState(DEFAULTS.regularTerPercent);
  const [showTable, setShowTable] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareDirectVsRegular({
        mode,
        amount: toNumber(amount),
        years: toNumber(years),
        grossReturnPercent: toNumber(grossReturnPercent),
        directTerPercent: toNumber(directTerPercent),
        regularTerPercent: toNumber(regularTerPercent),
      }),
    [mode, amount, years, grossReturnPercent, directTerPercent, regularTerPercent],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Direct vs regular plan cost",
      result.mode === "sip"
        ? `SIP: ${money(result.amount)} a month for ${NUM.format(result.years)} years`
        : `Lumpsum: ${money(result.amount)} for ${NUM.format(result.years)} years`,
      `Gross return: ${pct(result.grossReturnPercent)} a year`,
      `TER — direct ${pct(result.directTerPercent)}, regular ${pct(result.regularTerPercent)} (gap ${pct(result.terGapPercent)})`,
      `Direct plan corpus: ${money(result.directCorpus)}`,
      `Regular plan corpus: ${money(result.regularCorpus)}`,
      `Commission drag: ${money(result.drag)} (${pct(result.dragPercentOfRegularCorpus)} of the regular corpus)`,
      `Commission embedded in the TER: ${money(result.commissionEmbedded)}`,
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
    setMode(DEFAULTS.mode);
    setAmount(DEFAULTS.amount);
    setYears(DEFAULTS.years);
    setGrossReturnPercent(DEFAULTS.grossReturnPercent);
    setDirectTerPercent(DEFAULTS.directTerPercent);
    setRegularTerPercent(DEFAULTS.regularTerPercent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Expense ratio gap
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Direct vs Regular Plan Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A regular plan carries distributor commission inside its expense ratio. Put the two
          expense ratios in and see what the gap costs you in rupees over your holding period.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dvr-mode">
              Investment mode
            </label>
            <select
              id="dvr-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="lumpsum">Lumpsum</option>
              <option value="sip">Monthly SIP</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dvr-amount">
              {mode === "sip" ? "Monthly SIP amount (INR)" : "Lumpsum amount (INR)"}
            </label>
            <input
              id="dvr-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step={mode === "sip" ? "500" : "10000"}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dvr-years">
              Holding period (years)
            </label>
            <input
              id="dvr-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="40"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dvr-gross">
              Gross return before expenses (% a year)
            </label>
            <input
              id="dvr-gross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={grossReturnPercent}
              onChange={(event) => setGrossReturnPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>The portfolio return before the TER is deducted from NAV.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dvr-direct-ter">
              Direct plan TER (%)
            </label>
            <input
              id="dvr-direct-ter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3"
              step="0.05"
              value={directTerPercent}
              onChange={(event) => setDirectTerPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dvr-regular-ter">
              Regular plan TER (%)
            </label>
            <input
              id="dvr-regular-ter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3"
              step="0.05"
              value={regularTerPercent}
              onChange={(event) => setRegularTerPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>Both ratios are on the scheme information document.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TER_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setDirectTerPercent(String(preset.direct));
                setRegularTerPercent(String(preset.regular));
              }}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Commission drag over the period
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{show(result.drag)}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : `${pct(result.dragPercentOfRegularCorpus)} of the regular plan corpus, from a ${pct(result.terGapPercent)} expense ratio gap`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the direct versus regular plan comparison"
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
            ["Total invested", show(result.invested)],
            [
              "Direct plan corpus",
              hasError ? DASH : `${money(result.directCorpus)} at ${pct(result.netDirectPercent)} net`,
            ],
            [
              "Regular plan corpus",
              hasError ? DASH : `${money(result.regularCorpus)} at ${pct(result.netRegularPercent)} net`,
            ],
            ["Distributor commission inside the TER", show(result.commissionEmbedded)],
            ["Compounding lost on that commission", show(result.compoundingLost)],
            ["Expenses paid — direct plan", show(result.directExpenses)],
            ["Expenses paid — regular plan", show(result.regularExpenses)],
            ["Average drag per year", show(result.averageDragPerYear)],
            ["Drag as a share of money invested", hasError ? DASH : pct(result.dragPercentOfInvested)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Gap year by year</h2>
            <button
              type="button"
              onClick={() => setShowTable((value) => !value)}
              aria-expanded={showTable}
              className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {showTable ? "Hide" : "Show"}
            </button>
          </div>
          {showTable && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Direct</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Regular</th>
                    <th scope="col" className="py-2 text-right font-semibold">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-right">{money(row.directBalance)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(row.regularBalance)}
                      </td>
                      <td className="py-2 text-right font-semibold">{money(row.gap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Illustration only. Expense ratios change over time as scheme assets grow, and a regular plan
        may come with advice you value. Returns are assumed constant, which real markets never are.
      </p>
    </main>
  );
}
