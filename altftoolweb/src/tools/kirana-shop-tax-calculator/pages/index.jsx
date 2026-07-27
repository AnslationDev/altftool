"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Store } from "lucide-react";

import { EXPENSE_LINES, computeKiranaTax } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

const AGE_GROUPS = [
  { value: "below60", label: "Under 60" },
  { value: "senior", label: "60 to 79 (senior citizen)" },
  { value: "superSenior", label: "80 and above" },
];

const TRADING_FIELDS = [
  ["sales", "Annual sales (turnover)", "10000"],
  ["openingStock", "Opening stock", "1000"],
  ["purchases", "Purchases during the year", "10000"],
  ["closingStock", "Closing stock", "1000"],
  ["digitalSharePercent", "Collected by UPI / card / bank (%)", "5"],
  ["otherIncome", "Interest and other income", "1000"],
];

const DEDUCTION_FIELDS = [
  ["deduction80C", "Section 80C (max 1,50,000)"],
  ["deduction80D", "Section 80D health insurance"],
];

const DEFAULTS = {
  sales: "6000000",
  openingStock: "400000",
  purchases: "4050000",
  closingStock: "450000",
  digitalSharePercent: "30",
  otherIncome: "0",
  deduction80C: "150000",
  deduction80D: "25000",
};

const DEFAULT_EXPENSES = {
  rent: "180000",
  electricity: "60000",
  staff: "240000",
  transport: "45000",
  packing: "20000",
  other: "55000",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [ageGroup, setAgeGroup] = useState("below60");
  const [usePresumptive, setUsePresumptive] = useState(false);
  const [compositionScheme, setCompositionScheme] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setExpense = (key, value) => setExpenses((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const parsed = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = toNumber(form[key]);
      if (Number.isNaN(value)) return { error: "Fill every amount with a valid number." };
      parsed[key] = value;
    }
    const parsedExpenses = {};
    for (const line of EXPENSE_LINES) {
      const value = toNumber(expenses[line.key]);
      if (Number.isNaN(value)) return { error: "Fill every expense with a valid number." };
      parsedExpenses[line.key] = value;
    }
    return computeKiranaTax({
      ...parsed,
      expenses: parsedExpenses,
      ageGroup,
      usePresumptive,
      compositionScheme,
    });
  }, [form, expenses, ageGroup, usePresumptive, compositionScheme]);

  const ok = !result.error;
  const chosen = ok ? (result.better === "new" ? result.newRegime : result.oldRegime) : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Kirana Shop Profit and Tax — FY 2025-26 (AY 2026-27)",
      `Sales: ${money(result.sales)}`,
      `Cost of goods sold: ${money(result.cogs)}`,
      `Gross profit: ${money(result.grossProfit)} (${pct(result.grossMarginPercent)} margin, ${pct(result.markupOnCostPercent)} markup on cost)`,
      `Operating expenses: ${money(result.operatingExpenses)}`,
      `Net profit: ${money(result.netProfit)} (${pct(result.netMarginPercent)})`,
      `Section 44AD presumptive income: ${money(result.presumptiveIncome)}`,
      `Income offered to tax: ${money(result.businessIncome)}`,
      `New regime tax: ${money(result.newRegime.totalTax)}`,
      `Old regime tax: ${money(result.oldRegime.totalTax)}`,
      `Better regime: ${result.better === "new" ? "New" : "Old"}`,
      `GST composition levy at 1%: ${money(result.compositionLevy)}`,
      `Cash left after tax: ${money(result.takeHome)}`,
    ].join("\n");
  }, [ok, result]);

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
    setForm(DEFAULTS);
    setExpenses(DEFAULT_EXPENSES);
    setAgeGroup("below60");
    setUsePresumptive(false);
    setCompositionScheme(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Store className="h-4 w-4" aria-hidden="true" />
          FY 2025-26 · AY 2026-27
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kirana Shop Profit and Tax Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the trading account from stock and purchases, get gross and net margin, then compare
          tax on real profit against the section 44AD presumptive figure — plus the 1% GST
          composition levy for traders.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Trading account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {TRADING_FIELDS.map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`ks-${key}`}>
                {label}
              </label>
              <input
                id={`ks-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max={key === "digitalSharePercent" ? "100" : undefined}
                step={step}
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Running costs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EXPENSE_LINES.map((line) => (
            <div key={line.key}>
              <label className={LABEL_CLASS} htmlFor={`ks-exp-${line.key}`}>
                {line.label}
              </label>
              <input
                id={`ks-exp-${line.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={expenses[line.key]}
                onChange={(event) => setExpense(line.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Owner and scheme options</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ks-age">
              Age category
            </label>
            <select
              id="ks-age"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ageGroup}
              onChange={(event) => setAgeGroup(event.target.value)}
            >
              {AGE_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          {DEDUCTION_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`ks-${key}`}>
                {label}
              </label>
              <input
                id={`ks-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={form[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
          <div className="flex items-end">
            <label className={TOGGLE_CLASS} htmlFor="ks-44ad">
              <input
                id="ks-44ad"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={usePresumptive}
                onChange={(event) => setUsePresumptive(event.target.checked)}
              />
              Declare under section 44AD
            </label>
          </div>
          <div className="flex items-end">
            <label className={TOGGLE_CLASS} htmlFor="ks-comp">
              <input
                id="ks-comp"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={compositionScheme}
                onChange={(event) => setCompositionScheme(event.target.checked)}
              />
              GST composition scheme
            </label>
          </div>
        </div>
      </section>

      {result.error && (
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
              Income tax payable ({ok ? (result.better === "new" ? "new regime" : "old regime") : "—"})
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(chosen.totalTax) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `On ${money(result.businessIncome)} of business income · effective rate ${pct(chosen.effectiveRate)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy shop profit and tax result"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            ["Cost of goods sold", ok ? money(result.cogs) : "—"],
            ["Gross profit", ok ? `${money(result.grossProfit)} (${pct(result.grossMarginPercent)})` : "—"],
            ["Markup on cost", ok ? pct(result.markupOnCostPercent) : "—"],
            ["Operating expenses", ok ? money(result.operatingExpenses) : "—"],
            ["Net profit", ok ? `${money(result.netProfit)} (${pct(result.netMarginPercent)})` : "—"],
            [
              "Section 44AD presumptive income",
              ok
                ? result.presumptiveAvailable
                  ? money(result.presumptiveIncome)
                  : "Turnover above the 44AD limit"
                : "—",
            ],
            ["Income offered to tax", ok ? money(result.businessIncome) : "—"],
            ["New regime tax", ok ? money(result.newRegime.totalTax) : "—"],
            ["Old regime tax", ok ? money(result.oldRegime.totalTax) : "—"],
            ["Difference between regimes", ok ? money(result.saving) : "—"],
            [
              "GST composition levy (1%)",
              ok ? (compositionScheme ? money(result.compositionLevy) : "Not opted") : "—",
            ],
            ["Cash left after tax and levy", ok ? money(result.takeHome) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.belowPresumptive && !result.onPresumptive && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Your real profit is below the 44AD presumptive figure. Declaring the lower amount means
            maintaining books under section 44AA and getting an audit under section 44AB(e).
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Compliance flags</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {[
            [
              "GST registration",
              ok
                ? result.gstRegistrationRequired
                  ? "Turnover crosses the 40,00,000 goods threshold"
                  : "Below the 40,00,000 goods threshold"
                : "—",
            ],
            [
              "Composition scheme eligibility",
              ok
                ? result.compositionEligible
                  ? "Eligible — turnover within 1,50,00,000"
                  : "Not eligible — turnover above 1,50,00,000"
                : "—",
            ],
            [
              "Books of account (section 44AA)",
              ok ? (result.booksRequired ? "Required" : "Not required at this level") : "—",
            ],
            [
              "Tax audit (section 44AB)",
              ok ? (result.auditLikely ? "Likely applicable — check with your CA" : "Below the audit threshold") : "—",
            ],
            [
              "Advance tax",
              ok ? (result.advanceTaxDue ? "Payable in four instalments" : "Not applicable — tax under 10,000") : "—",
            ],
          ].map(([label, value]) => (
            <li
              key={label}
              className="flex flex-col gap-1 rounded-md bg-[var(--muted)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="font-semibold">{label}</span>
              <span className="text-[var(--muted-foreground)] sm:text-right">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for a resident individual proprietor for FY 2025-26. Special category
        states have lower GST thresholds, and partnership or company shops are taxed differently.
        Have a chartered accountant review the figures before filing.
      </p>
    </main>
  );
}
