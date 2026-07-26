"use client";

import { useMemo, useState } from "react";
import { Briefcase, Copy, RotateCcw } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tax engine — Finance Act 2025 rates (FY 2025-26 / AY 2026-27)        */
/* ------------------------------------------------------------------ */

const NEW_REGIME_SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.1],
  [1600000, 0.15],
  [2000000, 0.2],
  [2400000, 0.25],
  [Infinity, 0.3],
];

const OLD_REGIME_SLABS = [
  [250000, 0],
  [500000, 0.05],
  [1000000, 0.2],
  [Infinity, 0.3],
];

const SURCHARGE_BANDS_NEW = [
  [5000000, 0.1],
  [10000000, 0.15],
  [20000000, 0.25],
];

const SURCHARGE_BANDS_OLD = [
  [5000000, 0.1],
  [10000000, 0.15],
  [20000000, 0.25],
  [50000000, 0.37],
];

const round2 = (value) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

function slabTax(income, slabs) {
  let tax = 0;
  let last = 0;
  for (const [ceiling, rate] of slabs) {
    if (income <= last) break;
    tax += (Math.min(income, ceiling) - last) * rate;
    last = ceiling;
  }
  return tax;
}

function computeIncomeTax(taxableIncome, regime) {
  const income = Math.max(0, taxableIncome);
  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  const bands = regime === "new" ? SURCHARGE_BANDS_NEW : SURCHARGE_BANDS_OLD;

  const baseTax = slabTax(income, slabs);

  let rebate = 0;
  if (regime === "new") {
    if (income <= 1200000) {
      rebate = Math.min(baseTax, 60000);
    } else {
      const excess = income - 1200000;
      if (baseTax > excess) rebate = baseTax - excess;
    }
  } else if (income <= 500000) {
    rebate = Math.min(baseTax, 12500);
  }

  const afterRebate = Math.max(0, baseTax - rebate);

  let surcharge = 0;
  let bandIndex = -1;
  for (let i = 0; i < bands.length; i += 1) {
    if (income > bands[i][0]) bandIndex = i;
  }
  if (bandIndex >= 0) {
    const [threshold, rate] = bands[bandIndex];
    const prevRate = bandIndex === 0 ? 0 : bands[bandIndex - 1][1];
    surcharge = afterRebate * rate;
    const cap = slabTax(threshold, slabs) * (1 + prevRate) + (income - threshold);
    if (afterRebate + surcharge > cap) surcharge = Math.max(0, cap - afterRebate);
  }

  const cess = (afterRebate + surcharge) * 0.04;
  return {
    baseTax: round2(baseTax),
    rebate: round2(rebate),
    surcharge: round2(surcharge),
    cess: round2(cess),
    total: round2(afterRebate + surcharge + cess),
  };
}

/* ------------------------------------------------------------------ */

const LIMIT_WITH_LOW_CASH = 7500000;
const LIMIT_STANDARD = 5000000;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? Math.round(value) : 0);
const pct = (value) => `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;

const DEFAULTS = {
  receipts: "4200000",
  cashReceipts: "60000",
  actualExpenses: "900000",
  declaredPct: "50",
  otherIncome: "0",
  deductions: "150000",
  regime: "new",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (value) => {
  const parsed = Number(String(value).trim() === "" ? 0 : value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [receipts, setReceipts] = useState(DEFAULTS.receipts);
  const [cashReceipts, setCashReceipts] = useState(DEFAULTS.cashReceipts);
  const [actualExpenses, setActualExpenses] = useState(DEFAULTS.actualExpenses);
  const [declaredPct, setDeclaredPct] = useState(DEFAULTS.declaredPct);
  const [otherIncome, setOtherIncome] = useState(DEFAULTS.otherIncome);
  const [deductions, setDeductions] = useState(DEFAULTS.deductions);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => {
    const fields = [
      ["gross receipts", receipts],
      ["cash receipts", cashReceipts],
      ["actual expenses", actualExpenses],
      ["other income", otherIncome],
      ["deductions", deductions],
    ];
    for (const [label, value] of fields) {
      const parsed = num(value);
      if (!Number.isFinite(parsed)) return `Enter a valid number for ${label}.`;
      if (parsed < 0) return `${label.charAt(0).toUpperCase()}${label.slice(1)} cannot be negative.`;
      if (parsed > 1e11) return `${label.charAt(0).toUpperCase()}${label.slice(1)} is unrealistically large.`;
    }
    if (num(receipts) <= 0) return "Enter your gross professional receipts for the year.";
    if (num(cashReceipts) > num(receipts)) return "Cash receipts cannot exceed total gross receipts.";
    if (num(actualExpenses) > num(receipts)) return "Actual expenses cannot exceed gross receipts.";
    const dp = num(declaredPct);
    if (!Number.isFinite(dp)) return "Enter a valid declared profit percentage.";
    if (dp < 50) return "Section 44ADA requires you to declare at least 50% of gross receipts as income.";
    if (dp > 100) return "Declared profit cannot exceed 100% of gross receipts.";
    return "";
  }, [receipts, cashReceipts, actualExpenses, otherIncome, deductions, declaredPct]);

  const result = useMemo(() => {
    if (validation) return null;
    const gross = num(receipts);
    const cash = num(cashReceipts);
    const cashShare = gross > 0 ? (cash / gross) * 100 : 0;
    const limit = cashShare <= 5 ? LIMIT_WITH_LOW_CASH : LIMIT_STANDARD;
    const eligible = gross <= limit;

    const presumptiveIncome = gross * (num(declaredPct) / 100);
    const actualProfit = Math.max(0, gross - num(actualExpenses));

    const allowedDeductions = regime === "old" ? num(deductions) : 0;

    const buildScenario = (businessIncome) => {
      const gti = businessIncome + num(otherIncome);
      const applied = Math.min(allowedDeductions, gti);
      const taxable = Math.max(0, gti - applied);
      return {
        businessIncome: round2(businessIncome),
        gti: round2(gti),
        deductions: round2(applied),
        taxable: round2(taxable),
        tax: computeIncomeTax(taxable, regime),
      };
    };

    const presumptive = buildScenario(presumptiveIncome);
    const regular = buildScenario(actualProfit);

    return {
      gross,
      cashShare,
      limit,
      eligible,
      presumptive,
      regular,
      difference: round2(regular.tax.total - presumptive.tax.total),
      effectiveRate: gross > 0 ? (presumptive.tax.total / gross) * 100 : 0,
    };
  }, [validation, receipts, cashReceipts, actualExpenses, declaredPct, otherIncome, deductions, regime]);

  const report = useMemo(() => {
    if (!result) return "";
    return [
      "Section 44ADA Presumptive Computation",
      `Gross professional receipts: ${money(result.gross)}`,
      `Cash receipts: ${pct(result.cashShare)} of turnover — applicable limit ${money(result.limit)}`,
      result.eligible ? "Eligible for 44ADA." : "NOT eligible — receipts exceed the limit.",
      `Presumptive income (${declaredPct}%): ${money(result.presumptive.businessIncome)}`,
      `Taxable income: ${money(result.presumptive.taxable)}`,
      `Total tax incl. cess (${regime === "new" ? "new" : "old"} regime): ${money(result.presumptive.tax.total)}`,
      `Tax if you maintained books and declared actual profit: ${money(result.regular.tax.total)}`,
      `Difference: ${money(Math.abs(result.difference))} ${result.difference >= 0 ? "saved with 44ADA" : "extra under 44ADA"}`,
    ].join("\n");
  }, [result, declaredPct, regime]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setReceipts(DEFAULTS.receipts);
    setCashReceipts(DEFAULTS.cashReceipts);
    setActualExpenses(DEFAULTS.actualExpenses);
    setDeclaredPct(DEFAULTS.declaredPct);
    setOtherIncome(DEFAULTS.otherIncome);
    setDeductions(DEFAULTS.deductions);
    setRegime(DEFAULTS.regime);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            Tax
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Section 44ADA Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Check whether your professional receipts stay inside the 44ADA limit, see the presumptive
            income at 50% (or more), and compare the tax against maintaining regular books.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div>
                <span id="ada-regime-label" className="block text-sm font-semibold">
                  Tax regime
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="ada-regime-label">
                  {[
                    { id: "new", label: "New regime" },
                    { id: "old", label: "Old regime" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={regime === option.id}
                      onClick={() => setRegime(option.id)}
                      className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        regime === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ada-receipts" className="block text-sm font-semibold">
                    Gross professional receipts (₹)
                  </label>
                  <input
                    id="ada-receipts"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={receipts}
                    onChange={(event) => setReceipts(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="ada-cash" className="block text-sm font-semibold">
                    Of which received in cash (₹)
                  </label>
                  <input
                    id="ada-cash"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={cashReceipts}
                    onChange={(event) => setCashReceipts(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="ada-declared" className="block text-sm font-semibold">
                    Profit declared (% of receipts)
                  </label>
                  <input
                    id="ada-declared"
                    type="number"
                    inputMode="decimal"
                    min="50"
                    max="100"
                    step="1"
                    value={declaredPct}
                    onChange={(event) => setDeclaredPct(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="ada-expenses" className="block text-sm font-semibold">
                    Actual expenses (for comparison, ₹)
                  </label>
                  <input
                    id="ada-expenses"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={actualExpenses}
                    onChange={(event) => setActualExpenses(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="ada-other" className="block text-sm font-semibold">
                    Other income (₹)
                  </label>
                  <input
                    id="ada-other"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={otherIncome}
                    onChange={(event) => setOtherIncome(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label htmlFor="ada-deductions" className="block text-sm font-semibold">
                    Chapter VI-A deductions (₹)
                  </label>
                  <input
                    id="ada-deductions"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={deductions}
                    onChange={(event) => setDeductions(event.target.value)}
                    disabled={regime === "new"}
                    className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  disabled={!result}
                  aria-label="Copy 44ADA computation to clipboard"
                  className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              {validation ? (
                <p
                  role="alert"
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {validation}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Presumptive income under Section 44ADA
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                    {money(result.presumptive.businessIncome)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {declaredPct}% of {money(result.gross)} gross receipts
                  </p>

                  {!result.eligible && (
                    <p
                      role="alert"
                      className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                    >
                      Receipts of {money(result.gross)} exceed the {money(result.limit)} limit that
                      applies to you, so Section 44ADA cannot be used this year. You must maintain
                      books under Section 44AA and get them audited if 44AB applies.
                    </p>
                  )}

                  <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Cash share of receipts</dt>
                      <dd className="text-sm font-semibold">{pct(result.cashShare)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Turnover limit that applies</dt>
                      <dd className="text-sm font-semibold">{money(result.limit)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Gross total income</dt>
                      <dd className="text-sm font-semibold">{money(result.presumptive.gti)}</dd>
                    </div>
                    {regime === "old" && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Chapter VI-A deductions</dt>
                        <dd className="text-sm font-semibold">- {money(result.presumptive.deductions)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Taxable income</dt>
                      <dd className="text-sm font-semibold">{money(result.presumptive.taxable)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Tax on slab rates</dt>
                      <dd className="text-sm font-semibold">{money(result.presumptive.tax.baseTax)}</dd>
                    </div>
                    {result.presumptive.tax.rebate > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Section 87A rebate</dt>
                        <dd className="text-sm font-semibold text-[var(--success)]">
                          - {money(result.presumptive.tax.rebate)}
                        </dd>
                      </div>
                    )}
                    {result.presumptive.tax.surcharge > 0 && (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">Surcharge</dt>
                        <dd className="text-sm font-semibold">{money(result.presumptive.tax.surcharge)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Health &amp; education cess (4%)</dt>
                      <dd className="text-sm font-semibold">{money(result.presumptive.tax.cess)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm font-semibold">Total tax payable</dt>
                      <dd className="text-sm font-semibold">{money(result.presumptive.tax.total)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Tax as % of gross receipts</dt>
                      <dd className="text-sm font-semibold">{pct(result.effectiveRate)}</dd>
                    </div>
                  </dl>
                </>
              )}
            </div>

            {result && (
              <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-sm font-semibold">44ADA vs regular books</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Presumptive ({declaredPct}% deemed profit)
                    </p>
                    <p className="mt-1 text-lg font-semibold">{money(result.presumptive.tax.total)}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      On {money(result.presumptive.taxable)} taxable income
                    </p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">Regular books (actual expenses)</p>
                    <p className="mt-1 text-lg font-semibold">{money(result.regular.tax.total)}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      On {money(result.regular.taxable)} taxable income
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm">
                  {result.difference > 0 ? (
                    <span className="font-semibold text-[var(--success)]">
                      44ADA saves {money(result.difference)} in tax
                    </span>
                  ) : result.difference < 0 ? (
                    <span className="font-semibold text-[var(--danger)]">
                      44ADA costs {money(Math.abs(result.difference))} more — your real expenses are
                      above 50% of receipts
                    </span>
                  ) : (
                    <span className="font-semibold">Both routes give the same tax.</span>
                  )}
                </p>
                <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                  Under 44ADA no further deduction for business expenses or depreciation is allowed, and
                  the entire advance tax is due by 15 March. Informational only — check eligibility of
                  your profession under Section 44AA(1) with a tax adviser.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
