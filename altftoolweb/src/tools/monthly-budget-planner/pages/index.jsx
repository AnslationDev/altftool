"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Clipboard,
  Download,
  PiggyBank,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_INCOME = {
  salary: 85000,
  freelance: 15000,
  investment: 4000,
  other: 3000,
};

const DEFAULT_EXPENSES = [
  { id: "rent", name: "Rent / Home", amount: 28000, type: "needs" },
  { id: "food", name: "Food & Groceries", amount: 12000, type: "needs" },
  { id: "transport", name: "Transport", amount: 5000, type: "needs" },
  { id: "utilities", name: "Utilities", amount: 4500, type: "needs" },
  { id: "emi", name: "EMI / Debt", amount: 10000, type: "needs" },
  { id: "shopping", name: "Shopping", amount: 7000, type: "wants" },
  { id: "entertainment", name: "Entertainment", amount: 4500, type: "wants" },
  { id: "health", name: "Health / Insurance", amount: 5000, type: "needs" },
];

const SAMPLE_PLAN = {
  income: {
    salary: 125000,
    freelance: 25000,
    investment: 8000,
    other: 5000,
  },
  expenses: [
    { id: "rent", name: "Rent / Home", amount: 36000, type: "needs" },
    { id: "food", name: "Food & Groceries", amount: 18000, type: "needs" },
    { id: "transport", name: "Transport", amount: 8000, type: "needs" },
    { id: "utilities", name: "Utilities", amount: 6500, type: "needs" },
    { id: "emi", name: "EMI / Debt", amount: 18000, type: "needs" },
    { id: "shopping", name: "Shopping", amount: 12000, type: "wants" },
    { id: "entertainment", name: "Entertainment", amount: 8000, type: "wants" },
    { id: "health", name: "Health / Insurance", amount: 7000, type: "needs" },
    { id: "travel", name: "Travel Fund", amount: 9000, type: "wants" },
  ],
  savingsGoal: 35000,
};

const COLORS = [
  "#2563eb",
  "#059669",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#84cc16",
];

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0)}%`;
}

function clampMoney(value, max = 100000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(0, number), max);
}

function getPlanStatus(savingsRate, balance) {
  if (balance < 0) {
    return {
      label: "Over Budget",
      tone: "warn",
      message: "Expenses are higher than income. Reduce flexible spending first.",
    };
  }
  if (savingsRate >= 30) {
    return {
      label: "Excellent",
      tone: "good",
      message: "Strong savings rate. You have room for investing or emergency fund goals.",
    };
  }
  if (savingsRate >= 20) {
    return {
      label: "On Track",
      tone: "good",
      message: "Balanced budget. You are close to a healthy 50/30/20 style plan.",
    };
  }
  if (savingsRate >= 10) {
    return {
      label: "Needs Review",
      tone: "watch",
      message: "Savings are positive but thin. Check wants and subscriptions.",
    };
  }
  return {
    label: "Low Savings",
    tone: "warn",
    message: "Savings buffer is low. Try trimming non-essential categories this month.",
  };
}

function buildSummary(metrics, income, expenses, savingsGoal) {
  const topExpense = metrics.topExpense?.name || "No expense";
  return [
    "Monthly Budget Planner Summary",
    `Total income: ${formatMoney(metrics.totalIncome)}`,
    `Total expenses: ${formatMoney(metrics.totalExpenses)}`,
    `Monthly savings: ${formatMoney(metrics.savings)}`,
    `Savings rate: ${formatPercent(metrics.savingsRate)}`,
    `Savings goal: ${formatMoney(savingsGoal)}`,
    `Goal gap: ${formatMoney(metrics.goalGap)}`,
    `Top expense: ${topExpense}`,
    `Daily spend limit: ${formatMoney(metrics.dailySpendLimit)}`,
    `Income sources: Salary ${formatMoney(income.salary)}, Freelance ${formatMoney(income.freelance)}, Investment ${formatMoney(income.investment)}, Other ${formatMoney(income.other)}`,
    `Expense categories: ${expenses
      .map((expense) => `${expense.name} ${formatMoney(expense.amount)}`)
      .join(", ")}`,
  ].join("\n");
}

function exportCsv(metrics, income, expenses, savingsGoal) {
  const rows = [
    ["Section", "Name", "Amount", "Share"],
    ["Income", "Salary", income.salary, ""],
    ["Income", "Freelance", income.freelance, ""],
    ["Income", "Investment", income.investment, ""],
    ["Income", "Other", income.other, ""],
    ["Summary", "Total Income", metrics.totalIncome, ""],
    ["Summary", "Total Expenses", metrics.totalExpenses, ""],
    ["Summary", "Savings", metrics.savings, `${formatPercent(metrics.savingsRate)}`],
    ["Summary", "Savings Goal", savingsGoal, ""],
    ...expenses.map((expense) => [
      "Expense",
      expense.name,
      expense.amount,
      `${formatPercent(expense.share)}`,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "monthly-budget-planner.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function NumberField({ label, value, onChange, icon: Icon }) {
  return (
    <label className="block min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" />}
        <span className="min-w-0 break-words">{label}</span>
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(clampMoney(event.target.value))}
        className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
      />
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "watch"
          ? "bg-amber-500/10 text-amber-600"
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

function BudgetTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
      <p className="text-[var(--muted-foreground)]">{formatMoney(item.amount || item.value)}</p>
      {Number.isFinite(item.share) && (
        <p className="text-[var(--primary)]">{formatPercent(item.share)} of expenses</p>
      )}
    </div>
  );
}

export default function MonthlyBudgetPlanner() {
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [savingsGoal, setSavingsGoal] = useState(25000);
  const [newCategory, setNewCategory] = useState("");
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => {
    const totalIncome = Object.values(income).reduce((sum, value) => sum + clampMoney(value), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + clampMoney(expense.amount), 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome ? (savings / totalIncome) * 100 : 0;
    const expenseShare = expenses.map((expense) => ({
      ...expense,
      amount: clampMoney(expense.amount),
      share: totalExpenses ? (clampMoney(expense.amount) / totalExpenses) * 100 : 0,
    }));
    const topExpense = [...expenseShare].sort((a, b) => b.amount - a.amount)[0];
    const needs = expenseShare
      .filter((expense) => expense.type === "needs")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const wants = expenseShare
      .filter((expense) => expense.type === "wants")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const goalGap = savings - savingsGoal;
    const dailySpendLimit = Math.max(0, savings >= savingsGoal ? (totalIncome - savingsGoal) / 30 : savings / 30);
    const status = getPlanStatus(savingsRate, savings);

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsRate,
      expenseShare,
      topExpense,
      needs,
      wants,
      needsShare: totalIncome ? (needs / totalIncome) * 100 : 0,
      wantsShare: totalIncome ? (wants / totalIncome) * 100 : 0,
      goalGap,
      dailySpendLimit,
      status,
    };
  }, [income, expenses, savingsGoal]);

  const overviewData = useMemo(
    () => [
      { name: "Income", value: metrics.totalIncome },
      { name: "Expenses", value: metrics.totalExpenses },
      { name: "Savings", value: Math.max(0, metrics.savings) },
    ],
    [metrics.totalIncome, metrics.totalExpenses, metrics.savings],
  );

  const updateIncome = (key, value) => {
    setIncome((current) => ({ ...current, [key]: value }));
  };

  const updateExpense = (id, key, value) => {
    setExpenses((current) =>
      current.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              [key]: key === "amount" ? clampMoney(value) : value,
            }
          : expense,
      ),
    );
  };

  const removeExpense = (id) => {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  };

  const addExpense = () => {
    const name = newCategory.trim();
    if (!name) return;
    setExpenses((current) => [
      ...current,
      {
        id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name,
        amount: 0,
        type: "wants",
      },
    ]);
    setNewCategory("");
  };

  const resetPlan = () => {
    setIncome(DEFAULT_INCOME);
    setExpenses(DEFAULT_EXPENSES);
    setSavingsGoal(25000);
    setNewCategory("");
  };

  const loadSample = () => {
    setIncome(SAMPLE_PLAN.income);
    setExpenses(SAMPLE_PLAN.expenses);
    setSavingsGoal(SAMPLE_PLAN.savingsGoal);
    setNewCategory("");
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(metrics, income, expenses, savingsGoal));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const savingsProgress = savingsGoal ? Math.min(100, Math.max(0, (metrics.savings / savingsGoal) * 100)) : 100;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6 2xl:p-8">
          <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] 2xl:items-end">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <Wallet className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">Finance planner</span>
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                Monthly Budget Planner
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Build a monthly budget with income, category-wise expenses, savings goal, visual breakdown,
                and exportable planning summary.
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Budget health
              </p>
              <p
                className={`tool-money-value tool-hero-value mt-2 ${
                  metrics.status.tone === "warn"
                    ? "text-rose-600"
                    : metrics.status.tone === "watch"
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {metrics.status.label}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                {metrics.status.message}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={ArrowUpCircle}
            label="Monthly Income"
            value={formatMoney(metrics.totalIncome)}
            detail="All active income sources"
          />
          <MetricCard
            icon={ArrowDownCircle}
            label="Monthly Expenses"
            value={formatMoney(metrics.totalExpenses)}
            detail={metrics.topExpense ? `Top: ${metrics.topExpense.name}` : "No expenses added"}
            tone={metrics.totalExpenses > metrics.totalIncome ? "warn" : "default"}
          />
          <MetricCard
            icon={PiggyBank}
            label="Monthly Savings"
            value={formatMoney(metrics.savings)}
            detail={`${formatPercent(metrics.savingsRate)} savings rate`}
            tone={metrics.savings >= savingsGoal ? "good" : metrics.savings > 0 ? "watch" : "warn"}
          />
          <MetricCard
            icon={Target}
            label="Goal Gap"
            value={formatMoney(metrics.goalGap)}
            detail={metrics.goalGap >= 0 ? "Savings goal covered" : "More savings needed"}
            tone={metrics.goalGap >= 0 ? "good" : "warn"}
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">Income Sources</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Add monthly expected income before planning expenses.
                  </p>
                </div>
              </div>
              <div className="tool-form-grid">
                <NumberField
                  label="Salary"
                  value={income.salary}
                  icon={Wallet}
                  onChange={(value) => updateIncome("salary", value)}
                />
                <NumberField
                  label="Freelance / Side Income"
                  value={income.freelance}
                  icon={Plus}
                  onChange={(value) => updateIncome("freelance", value)}
                />
                <NumberField
                  label="Investment Income"
                  value={income.investment}
                  icon={BarChart3}
                  onChange={(value) => updateIncome("investment", value)}
                />
                <NumberField
                  label="Other Income"
                  value={income.other}
                  icon={ArrowUpCircle}
                  onChange={(value) => updateIncome("other", value)}
                />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Savings Goal</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Set the amount you want to save this month.
              </p>
              <div className="mt-4">
                <NumberField
                  label="Target Monthly Savings"
                  value={savingsGoal}
                  icon={Target}
                  onChange={setSavingsGoal}
                />
              </div>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className={`h-full rounded-full ${
                    metrics.savings >= savingsGoal ? "bg-emerald-600" : "bg-[var(--primary)]"
                  }`}
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Goal progress:{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {formatPercent(savingsProgress)}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Actions</h2>
              <div className="tool-action-grid mt-4">
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
                <button
                  type="button"
                  onClick={() => exportCsv(metrics, income, expenses, savingsGoal)}
                  className="btn-primary"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-5">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">Expense Categories</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Track needs and wants separately for cleaner monthly control.
                  </p>
                </div>
                <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)]">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    placeholder="New category"
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                  <button type="button" onClick={addExpense} className="btn-primary min-h-11 w-full whitespace-nowrap px-4 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {metrics.expenseShare.map((expense) => (
                  <div
                    key={expense.id}
                    className="grid min-w-0 gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(9rem,0.55fr)_minmax(7rem,0.45fr)_auto] sm:items-center"
                  >
                    <input
                      type="text"
                      value={expense.name}
                      onChange={(event) => updateExpense(expense.id, "name", event.target.value)}
                      className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                    <input
                      type="number"
                      min="0"
                      value={expense.amount}
                      onChange={(event) => updateExpense(expense.id, "amount", event.target.value)}
                      className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                    <select
                      value={expense.type}
                      onChange={(event) => updateExpense(expense.id, "type", event.target.value)}
                      className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="needs">Needs</option>
                      <option value="wants">Wants</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeExpense(expense.id)}
                      className="btn-secondary min-h-11 px-3"
                      aria-label={`Remove ${expense.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sm:hidden">Remove</span>
                    </button>
                    <div className="sm:col-span-4">
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                        <span className="min-w-0 break-words">{formatPercent(expense.share)} of expenses</span>
                        <span className="shrink-0 font-semibold text-[var(--foreground)]">
                          {formatMoney(expense.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
                          style={{ width: `${Math.min(100, expense.share)}%` }}
                        />
                      </div>
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
                    <h2 className="font-semibold text-[var(--foreground)]">Income vs Expense</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Monthly flow overview</p>
                  </div>
                </div>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <YAxis
                        width={52}
                        tickFormatter={(value) => formatMoney(value, true)}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      />
                      <Tooltip content={<BudgetTooltip />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {overviewData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                    <PieChartIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[var(--foreground)]">Expense Split</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Category-wise visual share</p>
                  </div>
                </div>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={metrics.expenseShare.filter((item) => item.amount > 0)}
                        dataKey="amount"
                        nameKey="name"
                        innerRadius="52%"
                        outerRadius="82%"
                        paddingAngle={2}
                      >
                        {metrics.expenseShare.map((entry, index) => (
                          <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<BudgetTooltip />} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--foreground)]">Budget Insights</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Quick signals for savings, needs, wants, and daily spend control.
                  </p>
                </div>
              </div>
              <div className="tool-card-grid">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Needs Share
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {formatPercent(metrics.needsShare)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Ideal needs target is around 50% of income.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Wants Share
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {formatPercent(metrics.wantsShare)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Keep flexible spending near 30% when possible.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Daily Spend Limit
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {formatMoney(metrics.dailySpendLimit)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Approx daily cap after protecting your savings goal.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Top Expense
                  </p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">
                    {metrics.topExpense ? metrics.topExpense.name : "None"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {metrics.topExpense
                      ? `${formatMoney(metrics.topExpense.amount)} this month`
                      : "Add expense categories to find the biggest spend."}
                  </p>
                </div>
              </div>
            </section>

            {metrics.savings < 0 && (
              <div className="flex min-w-0 items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="min-w-0 break-words text-sm leading-6">
                  Your expenses are above income. Try reducing wants, delaying non-essential purchases,
                  or moving a category into next month before committing to savings.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
