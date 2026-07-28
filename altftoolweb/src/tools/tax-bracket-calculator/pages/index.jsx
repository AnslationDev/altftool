"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import { calculateTaxBrackets, FILING_STATUSES, TAX_YEARS } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const USD2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const PCT = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});
const PCT0 = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? USD.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? USD2.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? PCT.format(v) : DASH);
const rate = (v) => (Number.isFinite(v) ? PCT0.format(v) : DASH);

const DEFAULTS = {
  income: "100000",
  filingStatus: "single",
  year: "2025",
  deductionMode: "standard",
  itemized: "0",
  age65: "0",
  preTax: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/[,$\s]/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [filingStatus, setFilingStatus] = useState(DEFAULTS.filingStatus);
  const [year, setYear] = useState(DEFAULTS.year);
  const [deductionMode, setDeductionMode] = useState(DEFAULTS.deductionMode);
  const [itemized, setItemized] = useState(DEFAULTS.itemized);
  const [age65, setAge65] = useState(DEFAULTS.age65);
  const [preTax, setPreTax] = useState(DEFAULTS.preTax);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateTaxBrackets({
        grossIncome: toNum(income),
        filingStatus,
        year,
        deductionMode,
        itemizedAmount: toNum(itemized) || 0,
        age65Count: toNum(age65) || 0,
        preTaxContributions: toNum(preTax) || 0,
      }),
    [income, filingStatus, year, deductionMode, itemized, age65, preTax],
  );

  const error = result.error ? result.error : null;
  const ok = !error;

  const statusLabel =
    FILING_STATUSES.find((s) => s.value === filingStatus)?.label ?? filingStatus;

  const reset = () => {
    setIncome(DEFAULTS.income);
    setFilingStatus(DEFAULTS.filingStatus);
    setYear(DEFAULTS.year);
    setDeductionMode(DEFAULTS.deductionMode);
    setItemized(DEFAULTS.itemized);
    setAge65(DEFAULTS.age65);
    setPreTax(DEFAULTS.preTax);
    setCopied(false);
  };

  const copy = async () => {
    if (!ok) return;
    const lines = [
      `US federal income tax — tax year ${result.year}`,
      `Filing status: ${statusLabel}`,
      `Total income: ${money2(result.grossIncome)}`,
      `${result.deductionKind} deduction: ${money2(result.deductionUsed)}`,
      `Taxable income: ${money2(result.taxableIncome)}`,
      `Federal income tax: ${money2(result.totalTax)}`,
      `Marginal bracket: ${rate(result.marginalRate)}`,
      `Effective rate on total income: ${pct(result.effectiveRateOnGross)}`,
      "",
      "Bracket breakdown:",
      ...result.slices
        .filter((s) => s.amountTaxed > 0)
        .map(
          (s) =>
            `  ${rate(s.rate)} on ${money2(s.amountTaxed)} = ${money2(s.tax)}`,
        ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <Landmark className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tax Bracket Calculator</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Find your US federal marginal bracket and see exactly how much tax each bracket
            collects. Ordinary income only.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="tbc-income">
            Total income (before deductions)
          </label>
          <input
            id="tbc-income"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
          <p className={HINT_CLASS}>Wages, self-employment profit, interest and other ordinary income.</p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tbc-status">
            Filing status
          </label>
          <select
            id="tbc-status"
            className={`${INPUT_CLASS} mt-1`}
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value)}
          >
            {FILING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tbc-year">
            Tax year
          </label>
          <select
            id="tbc-year"
            className={`${INPUT_CLASS} mt-1`}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {Object.keys(TAX_YEARS).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tbc-pretax">
            Pre-tax contributions
          </label>
          <input
            id="tbc-pretax"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={preTax}
            onChange={(e) => setPreTax(e.target.value)}
          />
          <p className={HINT_CLASS}>Traditional 401(k), HSA and similar amounts that reduce taxable wages.</p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tbc-mode">
            Deduction
          </label>
          <select
            id="tbc-mode"
            className={`${INPUT_CLASS} mt-1`}
            value={deductionMode}
            onChange={(e) => setDeductionMode(e.target.value)}
          >
            <option value="standard">Standard deduction</option>
            <option value="itemized">Itemized deduction</option>
          </select>
        </div>

        {deductionMode === "itemized" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="tbc-itemized">
              Itemized total
            </label>
            <input
              id="tbc-itemized"
              className={`${INPUT_CLASS} mt-1`}
              inputMode="decimal"
              value={itemized}
              onChange={(e) => setItemized(e.target.value)}
            />
            <p className={HINT_CLASS}>Mortgage interest, SALT, charity and other Schedule A items.</p>
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="tbc-age65">
              People aged 65 or older
            </label>
            <select
              id="tbc-age65"
              className={`${INPUT_CLASS} mt-1`}
              value={age65}
              onChange={(e) => setAge65(e.target.value)}
            >
              <option value="0">None</option>
              <option value="1">One</option>
              <option value="2">Two</option>
            </select>
            <p className={HINT_CLASS}>Adds the extra standard deduction for age 65+.</p>
          </div>
        )}
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          Your top marginal bracket
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--primary)]">
          {ok ? rate(result.marginalRate) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok
            ? `${money(result.totalTax)} of federal income tax on ${money(result.grossIncome)} for tax year ${result.year}`
            : "Fix the input above to see a result."}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Adjusted gross income</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? money2(result.adjustedGross) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.deductionKind} deduction` : "Deduction"}
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `− ${money2(result.deductionUsed)}` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Taxable income</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? money2(result.taxableIncome) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Federal income tax</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? money2(result.totalTax) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Effective rate on total income</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? pct(result.effectiveRateOnGross) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Effective rate on taxable income</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? pct(result.effectiveRateOnTaxable) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Room left in this bracket</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok
                ? result.headroomToNextBracket === null
                  ? "Top bracket"
                  : money2(result.headroomToNextBracket)
                : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Income after federal tax</dt>
            <dd className="text-sm font-semibold text-[var(--success)]">
              {ok ? money2(result.afterTaxIncome) : DASH}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the tax bracket result to the clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all inputs to their defaults">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Bracket by bracket</h2>
        <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--card)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-3 py-2 font-semibold">Rate</th>
                <th scope="col" className="px-3 py-2 font-semibold">Taxable income range</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Taxed here</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Tax</th>
              </tr>
            </thead>
            <tbody>
              {ok
                ? result.slices.map((s) => (
                    <tr
                      key={s.rate}
                      className={`border-t border-[var(--border)] ${s.amountTaxed > 0 ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
                    >
                      <td className="px-3 py-2 font-semibold">{rate(s.rate)}</td>
                      <td className="px-3 py-2">
                        {money(s.from)} – {Number.isFinite(s.to) ? money(s.to) : "and above"}
                      </td>
                      <td className="px-3 py-2 text-right">{money2(s.amountTaxed)}</td>
                      <td className="px-3 py-2 text-right">{money2(s.tax)}</td>
                    </tr>
                  ))
                : (
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-3 py-3 text-[var(--muted-foreground)]" colSpan={4}>
                        {DASH}
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {ok ? `Rates from ${result.source}. ` : ""}
          Ordinary income only — long-term capital gains, credits, payroll tax, AMT and state tax
          are not included.
        </p>
      </section>
    </div>
  );
}
