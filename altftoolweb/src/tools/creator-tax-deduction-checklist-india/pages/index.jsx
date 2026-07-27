"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import { EXPENSE_CATEGORIES, checkCompliance, computeDeductions } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const starterAmounts = {
  cameraGear: "180000",
  computers: "140000",
  software: "48000",
  internet: "24000",
  marketing: "60000",
};

const makeDefaults = () =>
  Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [
      category.key,
      {
        amount: starterAmounts[category.key] || "",
        businessUsePercent: String(category.defaultBusinessUse),
        usedUnder180Days: false,
      },
    ]),
  );

export default function ToolHome() {
  const [lines, setLines] = useState(makeDefaults);
  const [grossReceipts, setGrossReceipts] = useState("2400000");
  const [cashReceiptsSharePercent, setCashReceiptsSharePercent] = useState("2");
  const [cashPaymentsSharePercent, setCashPaymentsSharePercent] = useState("4");
  const [isSpecifiedProfession, setIsSpecifiedProfession] = useState(false);
  const [specialCategoryState, setSpecialCategoryState] = useState(false);
  const [copied, setCopied] = useState(false);

  const deductionLines = useMemo(
    () =>
      EXPENSE_CATEGORIES.map((category) => {
        const row = lines[category.key] || {};
        return {
          categoryKey: category.key,
          amount: Number(row.amount),
          businessUsePercent: Number(row.businessUsePercent),
          usedUnder180Days: Boolean(row.usedUnder180Days),
        };
      }).filter((row) => Number.isFinite(row.amount) && row.amount > 0),
    [lines],
  );

  const deductions = useMemo(() => computeDeductions(deductionLines), [deductionLines]);
  const compliance = useMemo(
    () =>
      checkCompliance({
        grossReceipts: Number(grossReceipts),
        isSpecifiedProfession,
        cashReceiptsSharePercent: Number(cashReceiptsSharePercent),
        cashPaymentsSharePercent: Number(cashPaymentsSharePercent),
        specialCategoryState,
      }),
    [grossReceipts, isSpecifiedProfession, cashReceiptsSharePercent, cashPaymentsSharePercent, specialCategoryState],
  );

  const updateLine = (key, field, value) => {
    setLines((current) => ({
      ...current,
      [key]: { ...(current[key] || {}), [field]: value },
    }));
  };

  const copySummary = async () => {
    if (deductions.error || compliance.error) return;
    const text = [
      "Creator Tax Deduction Checklist India",
      `Year-one deduction estimate: ${INR.format(deductions.totalYearOne)}`,
      `Revenue deduction: ${INR.format(deductions.revenueTotal)}`,
      `Depreciation: ${INR.format(deductions.depreciationTotal)}`,
      `Capital amount carried in asset block: ${INR.format(deductions.carriedForward)}`,
      `Audit threshold crossed: ${compliance.auditThresholdCrossed ? "Yes" : "No"}`,
      `GST threshold crossed: ${compliance.gstThresholdCrossed ? "Yes" : "No"}`,
      "Informational only — confirm with a CA before filing.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLines(makeDefaults());
    setGrossReceipts("2400000");
    setCashReceiptsSharePercent("2");
    setCashPaymentsSharePercent("4");
    setIsSpecifiedProfession(false);
    setSpecialCategoryState(false);
    setCopied(false);
  };

  const failed = Boolean(deductions.error || compliance.error);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          India creator checklist
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Creator Tax Deduction Checklist India</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate business-use deductions, depreciation and threshold flags for Indian creators. This is
          a planning helper, not tax advice.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="ct-gross">Gross receipts</label>
            <input id="ct-gross" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={grossReceipts} onChange={(event) => setGrossReceipts(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ct-cash-r">Cash receipts %</label>
            <input id="ct-cash-r" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="100" value={cashReceiptsSharePercent} onChange={(event) => setCashReceiptsSharePercent(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ct-cash-p">Cash payments %</label>
            <input id="ct-cash-p" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="100" value={cashPaymentsSharePercent} onChange={(event) => setCashPaymentsSharePercent(event.target.value)} />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isSpecifiedProfession} onChange={(event) => setIsSpecifiedProfession(event.target.checked)} />
              Specified profession
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={specialCategoryState} onChange={(event) => setSpecialCategoryState(event.target.checked)} />
              Special-category state
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-xl bg-[var(--card)] ring-1 ring-[var(--border)]">
        <div className="grid grid-cols-[minmax(180px,1fr)_110px_96px_96px] gap-0 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          <span>Expense</span>
          <span>Amount</span>
          <span>Business %</span>
          <span>Under 180d</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {EXPENSE_CATEGORIES.map((category) => {
            const row = lines[category.key] || {};
            return (
              <div key={category.key} className="grid grid-cols-[minmax(180px,1fr)_110px_96px_96px] gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">{category.label}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{category.section}</p>
                </div>
                <input aria-label={`${category.label} amount`} className={INPUT_CLASS} type="number" min="0" value={row.amount || ""} onChange={(event) => updateLine(category.key, "amount", event.target.value)} />
                <input aria-label={`${category.label} business use percent`} className={INPUT_CLASS} type="number" min="0" max="100" value={row.businessUsePercent || ""} onChange={(event) => updateLine(category.key, "businessUsePercent", event.target.value)} />
                <label className="flex items-center justify-center">
                  <input type="checkbox" checked={Boolean(row.usedUnder180Days)} onChange={(event) => updateLine(category.key, "usedUnder180Days", event.target.checked)} />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {deductions.error || compliance.error}
        </p>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Year-one deduction", INR.format(deductions.totalYearOne)],
              ["Revenue expense", INR.format(deductions.revenueTotal)],
              ["Depreciation", INR.format(deductions.depreciationTotal)],
              ["Carried block", INR.format(deductions.carriedForward)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[var(--surface-soft)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <p className="rounded-lg bg-[var(--surface-soft)] p-3 text-sm">
              Audit threshold: <span className="font-semibold">{compliance.auditThresholdCrossed ? "crossed" : "not crossed"}</span>
            </p>
            <p className="rounded-lg bg-[var(--surface-soft)] p-3 text-sm">
              GST threshold: <span className="font-semibold">{compliance.gstThresholdCrossed ? "crossed" : "not crossed"}</span>
            </p>
            <p className="rounded-lg bg-[var(--surface-soft)] p-3 text-sm">
              Presumptive rate shown: <span className="font-semibold">{pct.format(compliance.presumptiveRate * 100)}%</span>
            </p>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Informational only. It does not account for all filing facts, TDS, GST credits or state-specific
            issues. Confirm with a chartered accountant before filing.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button className={PRIMARY_BTN} type="button" onClick={copySummary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy summary"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
