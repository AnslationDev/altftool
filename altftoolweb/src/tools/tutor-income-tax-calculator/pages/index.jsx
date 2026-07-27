"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { EXPENSE_LINES, computeTutorTax } from "../lib";

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

const AGE_GROUPS = [
  { value: "below60", label: "Under 60" },
  { value: "senior", label: "60 to 79 (senior citizen)" },
  { value: "superSenior", label: "80 and above" },
];

const DEFAULT_EXPENSES = {
  rent: "120000",
  materials: "40000",
  staff: "180000",
  internet: "24000",
  travel: "18000",
  depreciation: "20000",
  other: "30000",
};

const DEFAULTS = {
  grossReceipts: "1200000",
  digitalSharePercent: "80",
  salaryIncome: "0",
  otherIncome: "0",
  deduction80C: "150000",
  deduction80D: "25000",
  deduction80CCD1B: "0",
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
    return computeTutorTax({ ...parsed, expenses: parsedExpenses, ageGroup, usePresumptive });
  }, [form, expenses, ageGroup, usePresumptive]);

  const ok = !result.error;
  const chosen = ok ? (result.better === "new" ? result.newRegime : result.oldRegime) : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Teacher / Tutor Income Tax — FY 2025-26 (AY 2026-27)",
      `Gross tuition receipts: ${money(result.grossReceipts)}`,
      `Allowable expenses: ${money(result.totalExpenses)} (${pct(result.expenseRatioPercent)} of receipts)`,
      `Business income (actual basis): ${money(result.actualBusinessIncome)}`,
      `Section 44AD presumptive income: ${money(result.presumptiveIncome)}${result.presumptiveAvailable ? "" : " (turnover above the 44AD limit)"}`,
      `Income offered to tax: ${money(result.businessIncome)}`,
      "",
      `New regime — taxable ${money(result.newRegime.taxableIncome)}, tax ${money(result.newRegime.totalTax)}`,
      `Old regime — taxable ${money(result.oldRegime.taxableIncome)}, tax ${money(result.oldRegime.totalTax)}`,
      `Better regime: ${result.better === "new" ? "New" : "Old"}, saving ${money(result.saving)}`,
      "",
      `Books of account under 44AA: ${result.booksRequired ? "required" : "not required"}`,
      `GST registration threshold crossed: ${result.gstRegistrationLikely ? "yes" : "no"}`,
      `Advance tax applicable: ${result.advanceTaxDue ? "yes" : "no"}`,
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
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          FY 2025-26 · AY 2026-27
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Teacher and Tutor Income Tax Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tuition and coaching fees are business income, not salary. Deduct classroom rent, study
          material and staff costs, compare the old and new regimes, and check the section 44AD
          presumptive option side by side.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Income</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-receipts">
              Annual tuition / coaching receipts
            </label>
            <input
              id="tt-receipts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.grossReceipts}
              onChange={(event) => setField("grossReceipts", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-digital">
              Received by bank / UPI / card (%)
            </label>
            <input
              id="tt-digital"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={form.digitalSharePercent}
              onChange={(event) => setField("digitalSharePercent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-salary">
              Salary from a school or college
            </label>
            <input
              id="tt-salary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.salaryIncome}
              onChange={(event) => setField("salaryIncome", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-other">
              Interest and other income
            </label>
            <input
              id="tt-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.otherIncome}
              onChange={(event) => setField("otherIncome", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-age">
              Your age category
            </label>
            <select
              id="tt-age"
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
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="tt-presumptive"
            >
              <input
                id="tt-presumptive"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={usePresumptive}
                onChange={(event) => setUsePresumptive(event.target.checked)}
              />
              Declare under section 44AD
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Expenses claimed (actual-income basis)</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Ignored if you opt for the 44AD presumptive route.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EXPENSE_LINES.map((line) => (
            <div key={line.key}>
              <label className={LABEL_CLASS} htmlFor={`tt-exp-${line.key}`}>
                {line.label}
              </label>
              <input
                id={`tt-exp-${line.key}`}
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
        <h2 className="text-base font-semibold">Old-regime deductions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-80c">
              Section 80C (max 1,50,000)
            </label>
            <input
              id="tt-80c"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.deduction80C}
              onChange={(event) => setField("deduction80C", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-80d">
              Section 80D health insurance
            </label>
            <input
              id="tt-80d"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.deduction80D}
              onChange={(event) => setField("deduction80D", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-80ccd">
              Section 80CCD(1B) NPS (max 50,000)
            </label>
            <input
              id="tt-80ccd"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.deduction80CCD1B}
              onChange={(event) => setField("deduction80CCD1B", event.target.value)}
            />
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
              Tax payable ({ok ? (result.better === "new" ? "new regime" : "old regime") : "—"})
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(chosen.totalTax) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Saves ${money(result.saving)} against the other regime · effective rate ${pct(chosen.effectiveRate)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy tuition income tax result"
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
            ["Gross tuition receipts", ok ? money(result.grossReceipts) : "—"],
            [
              "Expenses claimed",
              ok ? `${money(result.totalExpenses)} (${pct(result.expenseRatioPercent)})` : "—",
            ],
            ["Business income on actuals", ok ? money(result.actualBusinessIncome) : "—"],
            [
              "Section 44AD presumptive income",
              ok
                ? result.presumptiveAvailable
                  ? money(result.presumptiveIncome)
                  : "Turnover above the 44AD limit"
                : "—",
            ],
            ["Income offered to tax", ok ? money(result.businessIncome) : "—"],
            ["Standard deduction on salary (new)", ok ? money(result.standardDeductionNew) : "—"],
            ["Chapter VI-A deductions (old only)", ok ? money(result.chapterVIA) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Regime comparison</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">New regime</th>
                <th scope="col" className="py-2 text-right font-semibold">Old regime</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Taxable income", "taxableIncome"],
                ["Tax on slabs", "slabTax"],
                ["Less section 87A rebate", "rebate"],
                ["Surcharge", "surcharge"],
                ["Marginal relief", "marginalRelief"],
                ["Health & education cess (4%)", "cess"],
                ["Total tax", "totalTax"],
              ].map(([label, key]) => (
                <tr key={key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">
                    {ok ? money(result.newRegime[key]) : "—"}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {ok ? money(result.oldRegime[key]) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Compliance flags</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {[
            [
              "Books of account (section 44AA)",
              ok ? (result.booksRequired ? "Required — income above 2,50,000 or receipts above 25,00,000" : "Not required at this level") : "—",
            ],
            [
              "Tax audit (section 44AB)",
              ok ? (result.auditLikely ? "Likely applicable — check with your CA" : "Below the audit threshold") : "—",
            ],
            [
              "GST registration",
              ok ? (result.gstRegistrationLikely ? "Receipts cross the 20,00,000 services threshold" : "Below the 20,00,000 services threshold") : "—",
            ],
            [
              "Advance tax",
              ok ? (result.advanceTaxDue ? "Payable in four instalments — tax exceeds 10,000" : "Not applicable — tax under 10,000") : "—",
            ],
          ].map(([label, value]) => (
            <li key={label} className="flex flex-col gap-1 rounded-md bg-[var(--muted)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="font-semibold">{label}</span>
              <span className="text-[var(--muted-foreground)] sm:text-right">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for FY 2025-26 for a resident individual. It does not cover capital
        gains, house property, business losses, TDS credits or special-rate income. Please have a
        chartered accountant review your return before you file it.
      </p>
    </main>
  );
}
