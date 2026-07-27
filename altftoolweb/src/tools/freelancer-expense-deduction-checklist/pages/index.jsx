"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import {
  CASH_PAYMENT_LIMIT,
  DEPRECIATION_BLOCKS,
  EXPENSE_HEADS,
  HALF_DEPRECIATION_DAYS,
  PRESUMPTIVE_PROFIT_PCT,
  PROFESSION_AUDIT_LIMIT,
  SPECIFIED_PROFESSIONS,
  TDS_DISALLOWANCE_PCT,
  compareTaxationMethods,
  computeDeductibleExpenses,
  computeDepreciation,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const DASH = "—";

const DEFAULT_EXPENSES = {
  rent: { amount: "240000", cash: "0", tdsDeducted: true },
  utilities: { amount: "18000", cash: "0", tdsDeducted: false },
  internet: { amount: "24000", cash: "0", tdsDeducted: false },
  software: { amount: "60000", cash: "0", tdsDeducted: false },
  contractors: { amount: "180000", cash: "0", tdsDeducted: true },
  salaries: { amount: "0", cash: "0", tdsDeducted: true },
  travel: { amount: "45000", cash: "0", tdsDeducted: false },
  marketing: { amount: "36000", cash: "0", tdsDeducted: false },
  bank: { amount: "12000", cash: "0", tdsDeducted: false },
  learning: { amount: "20000", cash: "0", tdsDeducted: false },
  insurance: { amount: "8000", cash: "0", tdsDeducted: false },
  interest: { amount: "0", cash: "0", tdsDeducted: false },
  repairs: { amount: "10000", cash: "0", tdsDeducted: false },
};

const DEFAULT_ASSETS = {
  computers: { cost: "120000", days: "300" },
  plant: { cost: "0", days: "365" },
  vehicles: { cost: "0", days: "365" },
  furniture: { cost: "40000", days: "365" },
};

const DEFAULTS = {
  grossReceipts: "2000000",
  cashReceiptsPct: "0",
  isSpecified: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [grossReceipts, setGrossReceipts] = useState(DEFAULTS.grossReceipts);
  const [cashReceiptsPct, setCashReceiptsPct] = useState(DEFAULTS.cashReceiptsPct);
  const [isSpecified, setIsSpecified] = useState(DEFAULTS.isSpecified);
  const [copied, setCopied] = useState(false);

  const expenseResult = useMemo(
    () =>
      computeDeductibleExpenses(
        EXPENSE_HEADS.map((head) => ({
          id: head.id,
          amount: toNumber(expenses[head.id]?.amount),
          cashPaidAboveLimit: toNumber(expenses[head.id]?.cash),
          tdsRequired: head.tdsCommon,
          tdsDeducted: expenses[head.id]?.tdsDeducted ?? true,
        })),
      ),
    [expenses],
  );

  const depreciationResult = useMemo(
    () =>
      computeDepreciation(
        DEPRECIATION_BLOCKS.map((block) => ({
          blockId: block.id,
          cost: toNumber(assets[block.id]?.cost),
          daysUsed: toNumber(assets[block.id]?.days),
        })),
      ),
    [assets],
  );

  const comparison = useMemo(() => {
    if (expenseResult.error) return { error: expenseResult.error };
    if (depreciationResult.error) return { error: depreciationResult.error };
    return compareTaxationMethods({
      grossReceipts: toNumber(grossReceipts),
      allowedExpenses: expenseResult.totalAllowed,
      depreciation: depreciationResult.totalDepreciation,
      cashReceiptsPct: toNumber(cashReceiptsPct),
      isSpecifiedProfession: isSpecified,
    });
  }, [expenseResult, depreciationResult, grossReceipts, cashReceiptsPct, isSpecified]);

  const ok = !comparison.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Freelance expense and profit summary",
      `Gross receipts: ${money(comparison.grossReceipts)}`,
      `Expenses claimed: ${money(expenseResult.totalClaimed)}`,
      `Disallowed under Section 40A(3) (cash): ${money(expenseResult.cashDisallowed)}`,
      `Disallowed under Section 40(a)(ia) (TDS): ${money(expenseResult.tdsDisallowed)}`,
      `Allowable expenses: ${money(comparison.allowedExpenses)}`,
      `Depreciation under Section 32: ${money(comparison.depreciation)}`,
      `Profit on actual expenses: ${money(comparison.actualProfit)}`,
      comparison.presumptiveEligible
        ? `Profit under Section 44ADA at ${PRESUMPTIVE_PROFIT_PCT}%: ${money(comparison.presumptiveProfit)}`
        : "Section 44ADA is not available on these figures.",
      comparison.recommendation,
    ].join("\n");
  }, [ok, comparison, expenseResult]);

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
    setExpenses(DEFAULT_EXPENSES);
    setAssets(DEFAULT_ASSETS);
    setGrossReceipts(DEFAULTS.grossReceipts);
    setCashReceiptsPct(DEFAULTS.cashReceiptsPct);
    setIsSpecified(DEFAULTS.isSpecified);
    setCopied(false);
  };

  const updateExpense = (id, field, value) => {
    setExpenses((previous) => ({
      ...previous,
      [id]: { ...previous[id], [field]: value },
    }));
  };

  const updateAsset = (id, field, value) => {
    setAssets((previous) => ({
      ...previous,
      [id]: { ...previous[id], [field]: value },
    }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Freelance tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Freelancer Expense Deduction Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work through the expense heads a freelancer can claim, see where the cash-payment and TDS
          rules cut a deduction down, and compare the result against declaring{" "}
          {PRESUMPTIVE_PROFIT_PCT}% of receipts under Section 44ADA.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Receipts</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-gross">
              Gross professional receipts (INR)
            </label>
            <input
              id="fx-gross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={grossReceipts}
              onChange={(event) => setGrossReceipts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fx-cash-pct">
              Receipts taken in cash (%)
            </label>
            <input
              id="fx-cash-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={cashReceiptsPct}
              onChange={(event) => setCashReceiptsPct(event.target.value)}
            />
          </div>
        </div>
        <label className={`mt-4 ${CHECKBOX_ROW}`} htmlFor="fx-specified">
          <input
            id="fx-specified"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={isSpecified}
            onChange={(event) => setIsSpecified(event.target.checked)}
          />
          My work is a specified profession under Section 44AA(1)
        </label>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          The list: {SPECIFIED_PROFESSIONS.join(", ")}.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Revenue expenses</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A payment above {money(CASH_PAYMENT_LIMIT)} to one person in one day, made otherwise than
          through a bank, is disallowed in full. Where TDS was due and not deducted,{" "}
          {TDS_DISALLOWANCE_PCT}% of the payment is disallowed.
        </p>
        <div className="mt-4 space-y-4">
          {EXPENSE_HEADS.map((head) => (
            <div key={head.id} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">
                {head.label}{" "}
                <span className="font-normal text-[var(--muted-foreground)]">· {head.section}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{head.note}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fx-amt-${head.id}`}>
                    Spent in the year (INR)
                  </label>
                  <input
                    id={`fx-amt-${head.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={expenses[head.id]?.amount ?? "0"}
                    onChange={(event) => updateExpense(head.id, "amount", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fx-cash-${head.id}`}>
                    Of which paid in cash above {money(CASH_PAYMENT_LIMIT)} in a day
                  </label>
                  <input
                    id={`fx-cash-${head.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={expenses[head.id]?.cash ?? "0"}
                    onChange={(event) => updateExpense(head.id, "cash", event.target.value)}
                  />
                </div>
              </div>
              {head.tdsCommon ? (
                <label className={`mt-3 ${CHECKBOX_ROW}`} htmlFor={`fx-tds-${head.id}`}>
                  <input
                    id={`fx-tds-${head.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={expenses[head.id]?.tdsDeducted ?? true}
                    onChange={(event) => updateExpense(head.id, "tdsDeducted", event.target.checked)}
                  />
                  TDS was deducted and paid on this head
                </label>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Capital assets — depreciation</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A laptop or camera is not a straight expense. It goes into a block of assets and is
          written down each year. Under {HALF_DEPRECIATION_DAYS} days of use in the year of purchase
          means half the rate.
        </p>
        <div className="mt-4 space-y-4">
          {DEPRECIATION_BLOCKS.map((block) => (
            <div key={block.id} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">
                {block.label}{" "}
                <span className="font-normal text-[var(--muted-foreground)]">
                  · {block.rate}% on written down value
                </span>
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fx-cost-${block.id}`}>
                    Written down value or cost (INR)
                  </label>
                  <input
                    id={`fx-cost-${block.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={assets[block.id]?.cost ?? "0"}
                    onChange={(event) => updateAsset(block.id, "cost", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`fx-days-${block.id}`}>
                    Days used in the year
                  </label>
                  <input
                    id={`fx-days-${block.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="366"
                    step="1"
                    value={assets[block.id]?.days ?? "365"}
                    onChange={(event) => updateAsset(block.id, "days", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {depreciationResult.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {depreciationResult.error}
          </p>
        ) : (
          <p className="mt-4 text-sm font-semibold">
            Depreciation for the year:{" "}
            <span className="text-[var(--primary)]">
              {money(depreciationResult.totalDepreciation)}
            </span>
          </p>
        )}
      </section>

      {comparison.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {comparison.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Taxable profit on actual expenses
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(comparison.actualProfit) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? comparison.isLoss
                  ? "Deductions exceed receipts, so the year shows a loss"
                  : `A margin of ${NUM.format(comparison.actualMarginPct)}% on gross receipts`
                : "Fix the inputs above to see the profit"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the freelance deduction summary"
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
            ["Gross receipts", ok ? money(comparison.grossReceipts) : DASH],
            ["Expenses entered", ok ? money(expenseResult.totalClaimed) : DASH],
            [
              "Disallowed — cash payments, Section 40A(3)",
              ok ? money(expenseResult.cashDisallowed) : DASH,
            ],
            [
              `Disallowed — TDS not deducted, Section 40(a)(ia)`,
              ok ? money(expenseResult.tdsDisallowed) : DASH,
            ],
            ["Allowable expenses", ok ? money(comparison.allowedExpenses) : DASH],
            ["Depreciation, Section 32", ok ? money(comparison.depreciation) : DASH],
            [
              `Profit under Section 44ADA (${PRESUMPTIVE_PROFIT_PCT}% of receipts)`,
              ok
                ? comparison.presumptiveEligible
                  ? money(comparison.presumptiveProfit)
                  : "Not available"
                : DASH,
            ],
            [
              "Lower of the two routes",
              ok ? money(comparison.lowerProfit) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {comparison.recommendation}
          </p>
        ) : null}

        {ok && comparison.auditLikely ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            Gross receipts are above {money(PROFESSION_AUDIT_LIMIT)}, so a tax audit under Section
            44AB is likely to apply to the profession.
          </p>
        ) : null}
      </section>

      {!expenseResult.error ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Head by head</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <caption className="sr-only">Expense heads with disallowances and allowable amounts</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Head
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Spent
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Cash cut
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    TDS cut
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Allowable
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenseResult.lines
                  .filter((line) => line.amount > 0)
                  .map((line) => (
                    <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                      <th scope="row" className="py-2.5 pr-3 text-left font-semibold">
                        {line.label}
                      </th>
                      <td className="py-2.5 pr-3 text-right">{money(line.amount)}</td>
                      <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(line.cashDisallowed)}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(line.tdsDisallowed)}
                      </td>
                      <td className="py-2.5 text-right font-semibold">{money(line.allowed)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Whether a particular expense is wholly and exclusively
        for your profession is a question of fact, and choosing between actual expenses and Section
        44ADA has consequences for books of account, audit and future years. Talk to a chartered
        accountant before filing.
      </p>
    </main>
  );
}
