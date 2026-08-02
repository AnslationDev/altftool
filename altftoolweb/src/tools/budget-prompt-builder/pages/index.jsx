"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wallet } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { BUDGET_STYLES, LIMITS, buildBudgetPrompt, planBudget } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  monthlyIncome: "80000",
  essentialExpenses: "38000",
  householdSize: "3",
  goalName: "Emergency fund top-up",
  goalAmount: "200000",
  goalMonths: "18",
  focusCategories: "groceries, rent, school fees, transport",
  styleId: BUDGET_STYLES[0].id,
  notes: "",
};

const DASH = "—";

export default function ToolHome() {
  const [monthlyIncome, setMonthlyIncome] = useState(DEFAULTS.monthlyIncome);
  const [essentialExpenses, setEssentialExpenses] = useState(DEFAULTS.essentialExpenses);
  const [householdSize, setHouseholdSize] = useState(DEFAULTS.householdSize);
  const [goalName, setGoalName] = useState(DEFAULTS.goalName);
  const [goalAmount, setGoalAmount] = useState(DEFAULTS.goalAmount);
  const [goalMonths, setGoalMonths] = useState(DEFAULTS.goalMonths);
  const [focusCategories, setFocusCategories] = useState(DEFAULTS.focusCategories);
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(() => {
    const plan = planBudget({
      monthlyIncome,
      essentialExpenses,
      goalAmount,
      goalMonths,
    });
    if (plan.error) return plan;
    return buildBudgetPrompt({
      plan,
      householdSize,
      goalName,
      focusCategories,
      styleId,
      notes,
    });
  }, [
    monthlyIncome,
    essentialExpenses,
    goalAmount,
    goalMonths,
    householdSize,
    goalName,
    focusCategories,
    styleId,
    notes,
  ]);

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result.plan;

  const copyResult = () => {
    if (hasError) return;
    copy("prompt", result.text, { label: "Budgeting prompt" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your income, goal and any notes you typed with the default example values and cannot be undone.",
      )
    ) {
      return;
    }
    setMonthlyIncome(DEFAULTS.monthlyIncome);
    setEssentialExpenses(DEFAULTS.essentialExpenses);
    setHouseholdSize(DEFAULTS.householdSize);
    setGoalName(DEFAULTS.goalName);
    setGoalAmount(DEFAULTS.goalAmount);
    setGoalMonths(DEFAULTS.goalMonths);
    setFocusCategories(DEFAULTS.focusCategories);
    setStyleId(DEFAULTS.styleId);
    setNotes(DEFAULTS.notes);
  };

  const rows = hasError
    ? [
        ["Needs cap (50%)", DASH],
        ["Wants cap (30%)", DASH],
        ["Savings and debt (20%)", DASH],
        ["Emergency fund target", DASH],
        ["Goal needs per month", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Needs cap (50%)", money(plan.needsBudget)],
        ["Wants cap (30%)", money(plan.wantsBudget)],
        ["Savings and debt (20%)", money(plan.savingsBudget)],
        [
          "Emergency fund target (3–6 months of needs)",
          `${money(plan.emergencyFundMin)} – ${money(plan.emergencyFundMax)}`,
        ],
        [
          "Current essentials as share of income",
          `${NUM.format(Math.round(plan.essentialsShare * 100))}%`,
        ],
        [
          "Goal needs per month",
          plan.goal > 0
            ? `${money(plan.requiredMonthlySaving)} for ${NUM.format(plan.months)} months`
            : "No goal set",
        ],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          Household money
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Budget Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits your take-home pay by the 50/30/20 rule, sizes an emergency fund and works out
          what a named goal costs per month — then writes the budgeting prompt with those figures
          baked in so the model cannot invent numbers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bpb-income">
              Monthly take-home income (INR)
            </label>
            <input
              id="bpb-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={LIMITS.monthlyIncome.min}
              max={LIMITS.monthlyIncome.max}
              step="1000"
              value={monthlyIncome}
              onChange={(event) => setMonthlyIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpb-essentials">
              Current essential spending per month (INR)
            </label>
            <input
              id="bpb-essentials"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={essentialExpenses}
              onChange={(event) => setEssentialExpenses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpb-household">
              Household size (people)
            </label>
            <input
              id="bpb-household"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.householdSize.min}
              max={LIMITS.householdSize.max}
              step="1"
              value={householdSize}
              onChange={(event) => setHouseholdSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpb-style">
              Budgeting style
            </label>
            <select
              id="bpb-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {BUDGET_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpb-goal-amount">
              Savings goal amount (INR, 0 for none)
            </label>
            <input
              id="bpb-goal-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={goalAmount}
              onChange={(event) => setGoalAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpb-goal-months">
              Months to reach the goal
            </label>
            <input
              id="bpb-goal-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={LIMITS.goalMonths.max}
              step="1"
              value={goalMonths}
              onChange={(event) => setGoalMonths(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bpb-goal-name">
              What the goal is for
            </label>
            <input
              id="bpb-goal-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
              placeholder="e.g. car down payment"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bpb-focus">
              Categories to detail first (optional)
            </label>
            <input
              id="bpb-focus"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={focusCategories}
              onChange={(event) => setFocusCategories(event.target.value)}
              placeholder="e.g. groceries, rent, fuel"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bpb-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="bpb-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. we have one EMI of Rs 12,000 that cannot move"
            />
          </div>
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

      {!hasError && plan.warnings.length > 0 ? (
        <ul className="mt-6 space-y-2" role="status" aria-live="polite">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monthly savings and debt allocation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(plan.savingsBudget)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : plan.goal > 0 && !plan.goalFitsSavingsShare
                  ? "The goal needs more than this share each month, so the prompt asks for a longer deadline or specific cuts from wants."
                  : "The 20% share of take-home pay the 50/30/20 rule assigns to savings and debt repayment."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={isCopied("prompt") ? "Copied the generated budgeting prompt" : "Copy the generated budgeting prompt"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {isCopied("prompt") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("prompt") ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 50/30/20 split and the 3-to-6-month emergency fund are planning rules of thumb, not
        rules of law, and this page gives information rather than financial advice. Talk to a
        registered financial adviser before acting on a plan that involves debt or investments.
      </p>
    </main>
  );
}
