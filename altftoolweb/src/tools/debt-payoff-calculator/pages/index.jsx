"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeIndianRupee,
  BarChart3,
  CalendarClock,
  Clipboard,
  CreditCard,
  Download,
  Flame,
  Plus,
  RefreshCw,
  ShieldCheck,
  Snowflake,
  Target,
  Trash2,
  TrendingDown,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_DEBTS = [
  { id: "credit-card", name: "Credit Card", balance: 125000, apr: 36, minPayment: 6500 },
  { id: "personal-loan", name: "Personal Loan", balance: 350000, apr: 14, minPayment: 12000 },
  { id: "education-loan", name: "Education Loan", balance: 280000, apr: 10.5, minPayment: 8000 },
  { id: "bike-loan", name: "Bike Loan", balance: 90000, apr: 12, minPayment: 4200 },
];

const SAMPLE_DEBTS = [
  { id: "card-one", name: "Card 1", balance: 85000, apr: 38, minPayment: 5000 },
  { id: "card-two", name: "Card 2", balance: 145000, apr: 32, minPayment: 7000 },
  { id: "personal-loan", name: "Personal Loan", balance: 420000, apr: 15, minPayment: 14500 },
  { id: "car-loan", name: "Car Loan", balance: 650000, apr: 9.5, minPayment: 18000 },
  { id: "family-loan", name: "Family Loan", balance: 60000, apr: 0, minPayment: 3000 },
];

const COLORS = ["#2563eb", "#059669", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function clampNumber(value, min = 0, max = 100000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

function sanitizeDebts(debts) {
  return debts
    .map((debt) => ({
      ...debt,
      name: String(debt.name || "Debt").trim() || "Debt",
      balance: clampNumber(debt.balance),
      apr: clampNumber(debt.apr, 0, 99),
      minPayment: clampNumber(debt.minPayment),
    }))
    .filter((debt) => debt.balance > 0);
}

function getOrderedDebtIds(debts, method) {
  return [...debts]
    .sort((a, b) => {
      if (method === "avalanche") {
        if (b.apr !== a.apr) return b.apr - a.apr;
        return a.balance - b.balance;
      }
      if (a.balance !== b.balance) return a.balance - b.balance;
      return b.apr - a.apr;
    })
    .map((debt) => debt.id);
}

function simulatePayoff(rawDebts, extraPayment, method) {
  const debts = sanitizeDebts(rawDebts);
  const minimumPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const totalStartBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const monthlyBudget = minimumPayment + clampNumber(extraPayment);
  const totalMinimumDue = minimumPayment;

  if (!debts.length) {
    return {
      method,
      feasible: false,
      reason: "Add at least one debt to create a payoff plan.",
      debts,
      months: 0,
      totalInterest: 0,
      totalPaid: 0,
      minimumPayment,
      monthlyBudget,
      schedule: [],
      payoffEvents: [],
      order: [],
    };
  }

  if (monthlyBudget <= 0 || totalMinimumDue <= 0) {
    return {
      method,
      feasible: false,
      reason: "Monthly minimum payments must be greater than zero.",
      debts,
      months: 0,
      totalInterest: 0,
      totalPaid: 0,
      minimumPayment,
      monthlyBudget,
      schedule: [],
      payoffEvents: [],
      order: getOrderedDebtIds(debts, method),
    };
  }

  const balances = new Map(debts.map((debt) => [debt.id, debt.balance]));
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const schedule = [];
  const payoffEvents = [];
  const order = getOrderedDebtIds(debts, method);

  while (month < 600) {
    const activeDebts = debts.filter((debt) => (balances.get(debt.id) || 0) > 0.01);
    if (!activeDebts.length) break;
    month += 1;

    let monthInterest = 0;
    activeDebts.forEach((debt) => {
      const balance = balances.get(debt.id) || 0;
      const interest = balance * (debt.apr / 100 / 12);
      balances.set(debt.id, balance + interest);
      monthInterest += interest;
    });

    const currentActive = debts.filter((debt) => (balances.get(debt.id) || 0) > 0.01);
    let cash = monthlyBudget;

    currentActive.forEach((debt) => {
      if (cash <= 0) return;
      const balance = balances.get(debt.id) || 0;
      const payment = Math.min(balance, debt.minPayment, cash);
      balances.set(debt.id, balance - payment);
      cash -= payment;
      totalPaid += payment;
    });

    const targetDebt = order
      .map((id) => debts.find((debt) => debt.id === id))
      .find((debt) => debt && (balances.get(debt.id) || 0) > 0.01);

    if (targetDebt && cash > 0) {
      const balance = balances.get(targetDebt.id) || 0;
      const payment = Math.min(balance, cash);
      balances.set(targetDebt.id, balance - payment);
      cash -= payment;
      totalPaid += payment;
    }

    debts.forEach((debt) => {
      const balance = balances.get(debt.id) || 0;
      if (balance <= 0.01 && !payoffEvents.some((event) => event.id === debt.id)) {
        balances.set(debt.id, 0);
        payoffEvents.push({
          id: debt.id,
          name: debt.name,
          month,
          apr: debt.apr,
          startBalance: debt.balance,
        });
      }
    });

    const remainingBalance = debts.reduce((sum, debt) => sum + (balances.get(debt.id) || 0), 0);
    totalInterest += monthInterest;

    schedule.push({
      month,
      payment: monthlyBudget - cash,
      interest: monthInterest,
      remainingBalance: Math.max(0, remainingBalance),
      paidPrincipal: Math.max(0, totalStartBalance - remainingBalance),
    });

    if (remainingBalance <= 0.01) break;
  }

  const feasible = schedule.at(-1)?.remainingBalance <= 0.01;

  return {
    method,
    feasible,
    reason: feasible
      ? ""
      : "Debt could not be fully paid within 50 years. Increase monthly payments.",
    debts,
    months: feasible ? month : 600,
    totalInterest,
    totalPaid,
    minimumPayment,
    monthlyBudget,
    schedule,
    payoffEvents,
    order,
  };
}

function getDebtFreeDate(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildSummary(activePlan, comparison, extraPayment) {
  const method = activePlan.method === "avalanche" ? "Avalanche" : "Snowball";
  return [
    "Debt Payoff Calculator Summary",
    `Selected method: ${method}`,
    `Extra monthly payment: ${formatMoney(extraPayment)}`,
    `Monthly payoff budget: ${formatMoney(activePlan.monthlyBudget)}`,
    `Debt-free timeline: ${activePlan.months} months (${getDebtFreeDate(activePlan.months)})`,
    `Total interest: ${formatMoney(activePlan.totalInterest)}`,
    `Total paid: ${formatMoney(activePlan.totalPaid)}`,
    `Snowball interest: ${formatMoney(comparison.snowball.totalInterest)}`,
    `Avalanche interest: ${formatMoney(comparison.avalanche.totalInterest)}`,
    `Payoff order: ${activePlan.payoffEvents.map((event) => event.name).join(" > ")}`,
  ].join("\n");
}

function exportCsv(activePlan) {
  const rows = [
    ["Month", "Payment", "Interest", "Principal Paid", "Remaining Balance"],
    ...activePlan.schedule.map((row) => [
      row.month,
      Math.round(row.payment),
      Math.round(row.interest),
      Math.round(row.paidPrincipal),
      Math.round(row.remainingBalance),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "debt-payoff-schedule.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "hot"
          ? "bg-orange-500/10 text-orange-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            {label}
          </p>
          <p className="tool-money-value mt-1 text-[var(--foreground)]">{value}</p>
          {detail && (
            <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">
              {detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PayoffTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">Month {item.month}</p>
      <p className="text-[var(--muted-foreground)]">
        Remaining: {formatMoney(item.remainingBalance)}
      </p>
      <p className="text-[var(--primary)]">Interest: {formatMoney(item.interest)}</p>
    </div>
  );
}

export default function DebtPayoffCalculator() {
  const [debts, setDebts] = useState(DEFAULT_DEBTS);
  const [extraPayment, setExtraPayment] = useState(15000);
  const [method, setMethod] = useState("avalanche");
  const [newDebtName, setNewDebtName] = useState("");
  const [copied, setCopied] = useState(false);

  const comparison = useMemo(
    () => ({
      snowball: simulatePayoff(debts, extraPayment, "snowball"),
      avalanche: simulatePayoff(debts, extraPayment, "avalanche"),
    }),
    [debts, extraPayment],
  );

  const activePlan = method === "avalanche" ? comparison.avalanche : comparison.snowball;
  const otherPlan = method === "avalanche" ? comparison.snowball : comparison.avalanche;
  const interestSaved = Math.max(0, comparison.snowball.totalInterest - comparison.avalanche.totalInterest);
  const timeDifference = Math.abs(comparison.snowball.months - comparison.avalanche.months);
  const totalBalance = sanitizeDebts(debts).reduce((sum, debt) => sum + debt.balance, 0);
  const weightedApr = totalBalance
    ? sanitizeDebts(debts).reduce((sum, debt) => sum + debt.balance * debt.apr, 0) / totalBalance
    : 0;
  const chartData = activePlan.schedule
    .filter((row, index) => index % Math.max(1, Math.ceil(activePlan.schedule.length / 12)) === 0)
    .slice(0, 14);

  const updateDebt = (id, key, value) => {
    setDebts((current) =>
      current.map((debt) =>
        debt.id === id
          ? {
              ...debt,
              [key]: key === "name" ? value : clampNumber(value, 0, key === "apr" ? 99 : 100000000),
            }
          : debt,
      ),
    );
  };

  const addDebt = () => {
    const name = newDebtName.trim() || `Debt ${debts.length + 1}`;
    setDebts((current) => [
      ...current,
      {
        id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name,
        balance: 50000,
        apr: 18,
        minPayment: 2500,
      },
    ]);
    setNewDebtName("");
  };

  const removeDebt = (id) => {
    setDebts((current) => current.filter((debt) => debt.id !== id));
  };

  const resetPlan = () => {
    setDebts(DEFAULT_DEBTS);
    setExtraPayment(15000);
    setMethod("avalanche");
    setNewDebtName("");
  };

  const loadSample = () => {
    setDebts(SAMPLE_DEBTS);
    setExtraPayment(25000);
    setMethod("avalanche");
    setNewDebtName("");
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(activePlan, comparison, extraPayment));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6 2xl:p-8">
          <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] 2xl:items-end">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">Debt payoff planner</span>
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                Debt Payoff Calculator
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Compare snowball and avalanche payoff methods, plan extra payments,
                estimate interest, and see the order to become debt-free.
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Debt-free estimate
              </p>
              <p className="tool-money-value tool-hero-value mt-2 text-[var(--primary)]">
                {activePlan.feasible ? getDebtFreeDate(activePlan.months) : "Needs more payment"}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                {activePlan.feasible
                  ? `${activePlan.months} months with ${formatMoney(activePlan.monthlyBudget)} monthly budget.`
                  : activePlan.reason}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={WalletCards}
            label="Total Debt"
            value={formatMoney(totalBalance)}
            detail={`${debts.length} active balances`}
          />
          <MetricCard
            icon={BadgeIndianRupee}
            label="Monthly Budget"
            value={formatMoney(activePlan.monthlyBudget)}
            detail={`Minimums ${formatMoney(activePlan.minimumPayment)} + extra ${formatMoney(extraPayment)}`}
          />
          <MetricCard
            icon={TrendingDown}
            label="Total Interest"
            value={formatMoney(activePlan.totalInterest)}
            detail={`${method === "avalanche" ? "Avalanche" : "Snowball"} method estimate`}
            tone="hot"
          />
          <MetricCard
            icon={ShieldCheck}
            label="Avalanche Savings"
            value={formatMoney(interestSaved)}
            detail={`${timeDifference} month timeline difference`}
            tone={interestSaved > 0 ? "good" : "default"}
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="space-y-5">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Payoff Strategy</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Snowball targets smallest balance first. Avalanche targets highest APR first.
              </p>

              <div className="tool-tab-grid mt-4">
                {[
                  ["avalanche", "Avalanche", Flame],
                  ["snowball", "Snowball", Snowflake],
                ].map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMethod(value)}
                    className={`min-h-12 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      method === value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <label className="mt-5 block rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Extra Monthly Payment
                </span>
                <input
                  type="number"
                  min="0"
                  value={extraPayment}
                  onChange={(event) => setExtraPayment(clampNumber(event.target.value))}
                  className="mt-2 h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={extraPayment}
                  onChange={(event) => setExtraPayment(Number(event.target.value))}
                  className="mt-3 w-full accent-[var(--primary)]"
                />
                <div className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>₹0</span>
                  <span>₹1L</span>
                </div>
              </label>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={loadSample} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Load Sample
                </button>
                <button type="button" onClick={resetPlan} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={() => exportCsv(activePlan)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Method Comparison</h2>
              <div className="mt-4 space-y-3">
                {[
                  ["Avalanche", comparison.avalanche, Flame, "Highest APR first"],
                  ["Snowball", comparison.snowball, Snowflake, "Smallest balance first"],
                ].map(([label, plan, Icon, helper]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setMethod(label.toLowerCase())}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      method === label.toLowerCase()
                        ? "border-[var(--primary)] bg-[var(--section-highlight)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--card)] text-[var(--primary)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)]">{label}</p>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{helper}</p>
                        <p className="mt-2 break-words text-sm font-semibold text-[var(--foreground)]">
                          {plan.months} months | {formatMoney(plan.totalInterest)} interest
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Debt Balances</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Add every debt with balance, APR, and required monthly minimum.
                </p>
                <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)]">
                  <input
                    type="text"
                    value={newDebtName}
                    onChange={(event) => setNewDebtName(event.target.value)}
                    placeholder="New debt name"
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                  <button type="button" onClick={addDebt} className="btn-primary min-h-11 w-full whitespace-nowrap px-4 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Debt
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {debts.map((debt) => (
                  <div
                    key={debt.id}
                    className="grid min-w-0 gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(event) => updateDebt(debt.id, "name", event.target.value)}
                        className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeDebt(debt.id)}
                        className="btn-secondary min-h-11 px-3"
                        aria-label={`Remove ${debt.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sm:hidden">Remove</span>
                      </button>
                    </div>
                    <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                      <label className="min-w-0">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                          Balance
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={debt.balance}
                          onChange={(event) => updateDebt(debt.id, "balance", event.target.value)}
                          aria-label={`${debt.name} balance`}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                      </label>
                      <label className="min-w-0">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                          APR %
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          step="0.1"
                          value={debt.apr}
                          onChange={(event) => updateDebt(debt.id, "apr", event.target.value)}
                          aria-label={`${debt.name} APR`}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                      </label>
                      <label className="min-w-0">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                          Minimum
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={debt.minPayment}
                          onChange={(event) => updateDebt(debt.id, "minPayment", event.target.value)}
                          aria-label={`${debt.name} minimum payment`}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                      </label>
                    </div>
                    <div className="grid gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-3">
                      <span className="break-words">Balance: {formatMoney(debt.balance)}</span>
                      <span className="break-words">APR: {formatNumber(debt.apr, 1)}%</span>
                      <span className="break-words">Minimum: {formatMoney(debt.minPayment)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-2">
              <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[var(--foreground)]">Payoff Curve</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Remaining balance over time</p>
                  </div>
                </div>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <YAxis
                        width={52}
                        tickFormatter={(value) => formatMoney(value, true)}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      />
                      <Tooltip content={<PayoffTooltip />} />
                      <Bar dataKey="remainingBalance" radius={[8, 8, 0, 0]} fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[var(--foreground)]">Payoff Order</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Debt sequence for selected method</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {(activePlan.payoffEvents.length ? activePlan.payoffEvents : sanitizeDebts(debts)).map((event, index) => (
                    <div
                      key={event.id}
                      className="flex min-w-0 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-[var(--foreground)]">{event.name}</p>
                        <p className="break-words text-sm text-[var(--muted-foreground)]">
                          {activePlan.payoffEvents.length
                            ? `Paid in month ${event.month} | APR ${formatNumber(event.apr, 1)}%`
                            : `${formatMoney(event.balance)} | APR ${formatNumber(event.apr, 1)}%`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--foreground)]">Planner Insights</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Quick read on debt pressure, timeline, and interest behavior.
                  </p>
                </div>
              </div>
              <div className="tool-card-grid">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Weighted APR
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {formatNumber(weightedApr, 1)}%
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Balance-weighted interest pressure.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Total Paid
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {formatMoney(activePlan.totalPaid)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Principal plus estimated interest.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Timeline
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {activePlan.months} mo
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    About {formatNumber(activePlan.months / 12, 1)} years.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Other Method
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {formatMoney(otherPlan.totalInterest)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Interest under the alternate strategy.
                  </p>
                </div>
              </div>
            </section>

            {!activePlan.feasible && (
              <div className="flex min-w-0 items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="min-w-0 break-words text-sm leading-6">
                  This payoff plan is not feasible with current payments. Increase extra payment
                  or minimum payments to avoid long-term interest growth.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
