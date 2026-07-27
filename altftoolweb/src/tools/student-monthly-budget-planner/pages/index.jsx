"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wallet } from "lucide-react";

import { CATEGORIES, planBudget } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_EXPENSES = {
  mess: "3500",
  rent: "5000",
  travel: "800",
  books: "500",
  phone: "300",
  personal: "1000",
  subscriptions: "200",
  other: "200",
};
const DEFAULT_INCOME = "12000";

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planBudget({
        income: income.trim() === "" ? 0 : Number(income),
        expenses,
      }),
    [income, expenses],
  );

  const hasError = Boolean(result.error);

  const setExpense = (id, value) => {
    setExpenses((prev) => ({ ...prev, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Monthly student budget",
      `Money in: ${money(result.income)}`,
      `Total expenses: ${money(result.totalExpense)}`,
      `${result.isDeficit ? "Deficit" : "Left over"}: ${money(Math.abs(result.surplus))}`,
      "",
    ];
    for (const item of result.items) {
      if (item.amount > 0) lines.push(`- ${item.label}: ${money(item.amount)}`);
    }
    return lines.join("\n");
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
    setIncome(DEFAULT_INCOME);
    setExpenses(DEFAULT_EXPENSES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Student Finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Student Monthly Budget Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what comes in each month and what goes out on mess, rent, travel and the rest —
          see what is left, where the money goes, and how it stacks up against the 50/30/20 rule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="sbp-income">
            Monthly money in — allowance, stipend, part-time (INR)
          </label>
          <input
            id="sbp-income"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="500"
            value={income}
            onChange={(event) => setIncome(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <div key={category.id}>
              <label className={LABEL_CLASS} htmlFor={`sbp-${category.id}`}>
                {category.label} (INR / month)
              </label>
              <input
                id={`sbp-${category.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={expenses[category.id] ?? ""}
                onChange={(event) => setExpense(category.id, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Left over" : result.isDeficit ? "Monthly deficit" : "Left over each month"}
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && result.isDeficit ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : money(Math.abs(result.surplus))}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the budget."
                : result.isDeficit
                  ? "Spending exceeds money in — trim a category or add income."
                  : "Money in minus all listed expenses."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the budget summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Money in", DASH],
                ["Total expenses", DASH],
              ]
            : [
                ["Money in", money(result.income)],
                ["Total expenses", money(result.totalExpense)],
                ["Needs (mess, rent, travel, books, phone)", money(result.needsTotal)],
                ["Wants (personal, subscriptions, other)", money(result.wantsTotal)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.totalExpense > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Amount
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Share of spend
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items
                  .filter((item) => item.amount > 0)
                  .map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{item.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{money(item.amount)}</td>
                      <td className="py-2 text-right">
                        {item.shareOfExpense === null ? DASH : `${PCT.format(item.shareOfExpense)}%`}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {!hasError && result.rule ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">50/30/20 check</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The 50/30/20 rule suggests at most 50% of money-in on needs, 30% on wants, and at
            least 20% kept aside.
          </p>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Needs", result.rule.needsActual, result.rule.needsCap, result.rule.needsOk, "cap"],
              ["Wants", result.rule.wantsActual, result.rule.wantsCap, result.rule.wantsOk, "cap"],
              [
                "Kept aside",
                result.rule.savingsActual,
                result.rule.savingsTarget,
                result.rule.savingsOk,
                "target",
              ],
            ].map(([label, actual, ref, ok, kind]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  {label} ({kind === "cap" ? "cap" : "target"} {money(ref)})
                </dt>
                <dd
                  className={`text-right font-semibold ${ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                >
                  {money(actual)} {ok ? "· on track" : kind === "cap" ? "· over" : "· short"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 50/30/20 split is a rule of thumb, not a rule of law — hostel students often run needs
        well above 50% and that is normal. Use it as a direction, not a verdict.
      </p>
    </main>
  );
}
