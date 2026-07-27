"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gift, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEBT_PRESETS,
  DEFAULT_EMERGENCY_MONTHS,
  DEFAULT_HIGH_INTEREST_THRESHOLD_PCT,
  nextAction,
  planWindfall,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_DEBTS = [
  { id: 1, label: "Credit card revolving balance", balance: "80000", ratePct: "42" },
  { id: 2, label: "Car loan", balance: "300000", ratePct: "9.5" },
];

const DEFAULTS = {
  amount: "500000",
  taxRatePct: "30",
  monthlyExpenses: "50000",
  currentEmergencyFund: "100000",
  emergencyMonths: String(DEFAULT_EMERGENCY_MONTHS),
  threshold: String(DEFAULT_HIGH_INTEREST_THRESHOLD_PCT),
  investPct: "60",
  goalPct: "25",
  spendPct: "15",
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [taxRatePct, setTaxRatePct] = useState(DEFAULTS.taxRatePct);
  const [monthlyExpenses, setMonthlyExpenses] = useState(DEFAULTS.monthlyExpenses);
  const [currentEmergencyFund, setCurrentEmergencyFund] = useState(DEFAULTS.currentEmergencyFund);
  const [emergencyMonths, setEmergencyMonths] = useState(DEFAULTS.emergencyMonths);
  const [threshold, setThreshold] = useState(DEFAULTS.threshold);
  const [investPct, setInvestPct] = useState(DEFAULTS.investPct);
  const [goalPct, setGoalPct] = useState(DEFAULTS.goalPct);
  const [spendPct, setSpendPct] = useState(DEFAULTS.spendPct);
  const [debts, setDebts] = useState(DEFAULT_DEBTS);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planWindfall({
        amount: toNumber(amount),
        taxRatePct: toNumber(taxRatePct),
        monthlyExpenses: toNumber(monthlyExpenses),
        currentEmergencyFund: toNumber(currentEmergencyFund),
        emergencyMonths: toNumber(emergencyMonths),
        highInterestThresholdPct: toNumber(threshold),
        investPct: toNumber(investPct),
        goalPct: toNumber(goalPct),
        spendPct: toNumber(spendPct),
        debts: debts.map((debt) => ({
          id: String(debt.id),
          label: debt.label,
          balance: toNumber(debt.balance),
          ratePct: toNumber(debt.ratePct),
        })),
      }),
    [
      amount,
      taxRatePct,
      monthlyExpenses,
      currentEmergencyFund,
      emergencyMonths,
      threshold,
      investPct,
      goalPct,
      spendPct,
      debts,
    ],
  );

  const hasError = Boolean(plan.error);
  const advice = hasError ? null : nextAction(plan);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Windfall Allocation Plan",
      `Gross windfall: ${money(plan.grossAmount)}`,
      `Tax set aside: ${money(plan.taxSetAside)}`,
      `Net to allocate: ${money(plan.netAmount)}`,
      `Emergency fund top-up: ${money(plan.emergencyTopUp)}`,
      `High-interest debt cleared: ${money(plan.debtPaid)}`,
      `Interest avoided each year: ${money(plan.annualInterestSaved)}`,
      `Invest: ${money(plan.invest)}`,
      `Goal: ${money(plan.goal)}`,
      `Guilt-free spending: ${money(plan.spend)}`,
    ].join("\n");
  }, [hasError, plan]);

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
    setAmount(DEFAULTS.amount);
    setTaxRatePct(DEFAULTS.taxRatePct);
    setMonthlyExpenses(DEFAULTS.monthlyExpenses);
    setCurrentEmergencyFund(DEFAULTS.currentEmergencyFund);
    setEmergencyMonths(DEFAULTS.emergencyMonths);
    setThreshold(DEFAULTS.threshold);
    setInvestPct(DEFAULTS.investPct);
    setGoalPct(DEFAULTS.goalPct);
    setSpendPct(DEFAULTS.spendPct);
    setDebts(DEFAULT_DEBTS);
    setCopied(false);
  };

  const updateDebt = (id, patch) => {
    setDebts((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addDebt = () => {
    setDebts((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, label: "New loan", balance: "0", ratePct: "12" }];
    });
  };

  const removeDebt = (id) => setDebts((rows) => rows.filter((row) => row.id !== id));

  const bars = hasError
    ? []
    : [
        ["Emergency", plan.shares.emergency, "var(--primary)"],
        ["Debt", plan.shares.debt, "var(--danger)"],
        ["Invest", plan.shares.invest, "var(--success)"],
        ["Goal", plan.shares.goal, "var(--muted-foreground)"],
        ["Spend", plan.shares.spend, "var(--border)"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Windfall
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Windfall Allocation Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Run a bonus, inheritance or sale proceeds through a priority waterfall — tax first, then
          emergency cover, then high-interest debt in avalanche order — and see what is genuinely
          free to invest or spend.
        </p>
      </header>

      <section className={CARD} aria-labelledby="windfall-inputs">
        <h2 id="windfall-inputs" className="sr-only">
          Windfall inputs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-amount">
              Windfall amount, before tax (INR)
            </label>
            <input
              id="wf-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-tax">
              Marginal tax rate on it (%)
            </label>
            <input
              id="wf-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="0.5"
              value={taxRatePct}
              onChange={(event) => setTaxRatePct(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Set 0 for money already taxed, such as an inheritance.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-expenses">
              Monthly essential expenses (INR)
            </label>
            <input
              id="wf-expenses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={monthlyExpenses}
              onChange={(event) => setMonthlyExpenses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-ef">
              Emergency fund you already hold (INR)
            </label>
            <input
              id="wf-ef"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={currentEmergencyFund}
              onChange={(event) => setCurrentEmergencyFund(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-months">
              Months of cover to target
            </label>
            <input
              id="wf-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="1"
              value={emergencyMonths}
              onChange={(event) => setEmergencyMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-threshold">
              Clear debt above this rate (% a year)
            </label>
            <input
              id="wf-threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="windfall-debts">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="windfall-debts" className="text-base font-semibold">
            Debts you owe
          </h2>
          <button type="button" onClick={addDebt} className={GHOST_BTN} aria-label="Add a debt row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add debt
          </button>
        </div>

        {debts.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No debts listed — the whole net windfall moves past the debt step.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {debts.map((debt, index) => (
              <li key={debt.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS} htmlFor={`wf-debt-label-${debt.id}`}>
                      Debt {index + 1} name
                    </label>
                    <input
                      id={`wf-debt-label-${debt.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      value={debt.label}
                      onChange={(event) => updateDebt(debt.id, { label: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`wf-debt-balance-${debt.id}`}>
                      Outstanding balance (INR)
                    </label>
                    <input
                      id={`wf-debt-balance-${debt.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1000"
                      value={debt.balance}
                      onChange={(event) => updateDebt(debt.id, { balance: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`wf-debt-rate-${debt.id}`}>
                      Interest rate (% a year)
                    </label>
                    <input
                      id={`wf-debt-rate-${debt.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      step="0.25"
                      value={debt.ratePct}
                      onChange={(event) => updateDebt(debt.id, { ratePct: event.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {DEBT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        updateDebt(debt.id, {
                          label: preset.label,
                          ratePct: String(preset.ratePct),
                        })
                      }
                      className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {preset.label} {preset.ratePct}%
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => removeDebt(debt.id)}
                    aria-label={`Remove debt ${index + 1}`}
                    className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="windfall-split">
        <h2 id="windfall-split" className="text-base font-semibold">
          Split the remainder
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-invest">
              Invest (%)
            </label>
            <input
              id="wf-invest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={investPct}
              onChange={(event) => setInvestPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-goal">
              Named goal (%)
            </label>
            <input
              id="wf-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={goalPct}
              onChange={(event) => setGoalPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wf-spend">
              Guilt-free spending (%)
            </label>
            <input
              id="wf-spend"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={spendPct}
              onChange={(event) => setSpendPct(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="windfall-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="windfall-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              Free to invest, allocate or spend
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(plan.leftover)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the allocation."
                : `after ${money(plan.taxSetAside)} tax, ${money(plan.emergencyTopUp)} emergency top-up and ${money(plan.debtPaid)} of debt`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the windfall allocation plan"
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
            ["1 · Tax set aside", hasError ? DASH : money(plan.taxSetAside)],
            ["Net windfall to allocate", hasError ? DASH : money(plan.netAmount)],
            ["2 · Emergency fund top-up", hasError ? DASH : money(plan.emergencyTopUp)],
            [
              "Emergency fund after this",
              hasError
                ? DASH
                : `${money(plan.newEmergencyFund)}${
                    plan.monthsCovered === null
                      ? ""
                      : ` (${NUM.format(plan.monthsCovered)} months of cover)`
                  }`,
            ],
            ["3 · High-interest debt cleared", hasError ? DASH : money(plan.debtPaid)],
            ["Interest avoided every year", hasError ? DASH : money(plan.annualInterestSaved)],
            ["Debt still outstanding", hasError ? DASH : money(plan.totalDebtAfter)],
            ["4 · Invest", hasError ? DASH : money(plan.invest)],
            ["4 · Named goal", hasError ? DASH : money(plan.goal)],
            ["4 · Guilt-free spending", hasError ? DASH : money(plan.spend)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div
              className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={bars.map(([name, share]) => `${name} ${pct(share)}`).join(", ")}
            >
              {bars.map(([name, share, colour]) => (
                <span
                  key={name}
                  className="block h-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, share))}%`,
                    backgroundColor: colour,
                  }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {bars.map(([name, share]) => `${name} ${pct(share)}`).join(" · ")} of the net windfall
            </p>
          </>
        )}

        {advice && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            {advice}
          </p>
        )}
      </section>

      {!hasError && plan.debtPlan.length > 0 && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="windfall-avalanche">
          <h2 id="windfall-avalanche" className="text-base font-semibold">
            Payoff order (highest rate first)
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Debt
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Rate
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Paid now
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Left owing
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.debtPlan.map((debt) => (
                  <tr key={debt.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {debt.label}
                      {!debt.eligible && (
                        <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                          below cut-off
                        </span>
                      )}
                      {debt.clearedFully && (
                        <span className="ml-2 text-xs font-normal text-[var(--success)]">
                          cleared
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{pct(debt.ratePct)}</td>
                    <td className="py-2 pr-3 text-right">{money(debt.payment)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {money(debt.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning only, not investment or tax advice. The tax figure is a set-aside at
        the rate you enter, not a computed liability — check your actual slab, surcharge and cess,
        and speak to a qualified adviser before acting on a large inheritance or sale.
      </p>
    </main>
  );
}
