"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Clipboard,
  Download,
  PauseCircle,
  PlayCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  Repeat,
  Target,
  Trash2,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_SUBSCRIPTIONS = [
  { id: "netflix", name: "Netflix", amount: 649, cycle: "monthly", category: "OTT", renewalDate: "2026-06-05", status: "active" },
  { id: "spotify", name: "Spotify", amount: 119, cycle: "monthly", category: "Music", renewalDate: "2026-05-21", status: "active" },
  { id: "google-one", name: "Google One", amount: 1300, cycle: "yearly", category: "Cloud", renewalDate: "2026-12-10", status: "active" },
  { id: "canva", name: "Canva Pro", amount: 3999, cycle: "yearly", category: "Software", renewalDate: "2026-09-14", status: "active" },
  { id: "gym", name: "Gym App", amount: 499, cycle: "monthly", category: "Fitness", renewalDate: "2026-05-29", status: "paused" },
];

const SAMPLE_SUBSCRIPTIONS = [
  { id: "adobe", name: "Adobe Creative Cloud", amount: 4596, cycle: "monthly", category: "Software", renewalDate: "2026-05-18", status: "active" },
  { id: "notion", name: "Notion AI", amount: 800, cycle: "monthly", category: "Productivity", renewalDate: "2026-05-20", status: "active" },
  { id: "aws", name: "AWS", amount: 6500, cycle: "monthly", category: "Cloud", renewalDate: "2026-06-01", status: "active" },
  { id: "prime", name: "Amazon Prime", amount: 1499, cycle: "yearly", category: "OTT", renewalDate: "2026-11-03", status: "active" },
  { id: "linkedin", name: "LinkedIn Premium", amount: 1900, cycle: "monthly", category: "Career", renewalDate: "2026-05-25", status: "paused" },
  { id: "figma", name: "Figma", amount: 1200, cycle: "monthly", category: "Design", renewalDate: "2026-05-28", status: "active" },
];

const CYCLE_OPTIONS = [
  { value: "weekly", label: "Weekly", monthlyFactor: 52 / 12 },
  { value: "monthly", label: "Monthly", monthlyFactor: 1 },
  { value: "quarterly", label: "Quarterly", monthlyFactor: 1 / 3 },
  { value: "yearly", label: "Yearly", monthlyFactor: 1 / 12 },
];

const COLORS = ["#2563eb", "#059669", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"];

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

function getCycleMeta(cycle) {
  return CYCLE_OPTIONS.find((option) => option.value === cycle) || CYCLE_OPTIONS[1];
}

function getMonthlyCost(subscription) {
  return clampNumber(subscription.amount) * getCycleMeta(subscription.cycle).monthlyFactor;
}

function getAnnualCost(subscription) {
  return getMonthlyCost(subscription) * 12;
}

function getDaysUntil(dateValue) {
  if (!dateValue) return null;
  const today = new Date();
  const renewal = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(renewal.getTime())) return null;
  today.setHours(0, 0, 0, 0);
  return Math.ceil((renewal - today) / 86400000);
}

function sanitizeSubscriptions(subscriptions) {
  return subscriptions.map((subscription) => ({
    ...subscription,
    name: String(subscription.name || "Subscription").trim() || "Subscription",
    amount: clampNumber(subscription.amount),
    cycle: getCycleMeta(subscription.cycle).value,
    category: String(subscription.category || "Other").trim() || "Other",
    status: subscription.status === "paused" ? "paused" : "active",
  }));
}

function groupByCategory(subscriptions) {
  return Object.values(
    subscriptions.reduce((acc, subscription) => {
      const key = subscription.category || "Other";
      acc[key] ||= { name: key, monthly: 0, annual: 0, count: 0 };
      acc[key].monthly += getMonthlyCost(subscription);
      acc[key].annual += getAnnualCost(subscription);
      acc[key].count += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.monthly - a.monthly);
}

function buildSummary(metrics) {
  return [
    "Subscription Cost Tracker Summary",
    `Active subscriptions: ${metrics.activeCount}`,
    `Paused subscriptions: ${metrics.pausedCount}`,
    `Monthly active cost: ${formatMoney(metrics.monthlyActiveCost)}`,
    `Yearly active cost: ${formatMoney(metrics.yearlyActiveCost)}`,
    `Paused monthly savings: ${formatMoney(metrics.pausedMonthlySavings)}`,
    `Highest subscription: ${metrics.highestSubscription?.name || "None"} (${formatMoney(metrics.highestSubscription?.monthlyCost || 0)}/mo)`,
    `Upcoming renewal: ${metrics.nextRenewal?.name || "None"}`,
  ].join("\n");
}

function exportCsv(rows) {
  const csvRows = [
    ["Name", "Amount", "Cycle", "Category", "Status", "Renewal Date", "Monthly Cost", "Yearly Cost"],
    ...rows.map((subscription) => [
      subscription.name,
      subscription.amount,
      subscription.cycle,
      subscription.category,
      subscription.status,
      subscription.renewalDate || "",
      Math.round(subscription.monthlyCost),
      Math.round(subscription.yearlyCost),
    ]),
  ];
  const csv = csvRows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "subscription-cost-tracker.csv";
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
        : tone === "violet"
          ? "bg-violet-500/10 text-violet-600"
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

function CostTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
      <p className="text-[var(--primary)]">Monthly: {formatMoney(item.monthly || item.monthlyCost)}</p>
      {Number.isFinite(item.annual) && (
        <p className="text-[var(--muted-foreground)]">Yearly: {formatMoney(item.annual)}</p>
      )}
    </div>
  );
}

function SubscriptionRow({ subscription, onUpdate, onRemove }) {
  const renewalDays = getDaysUntil(subscription.renewalDate);
  const renewalText =
    renewalDays === null
      ? "No renewal date"
      : renewalDays < 0
        ? `${Math.abs(renewalDays)}d overdue`
        : renewalDays === 0
          ? "Renews today"
          : `${renewalDays}d left`;

  return (
    <div className="grid min-w-0 gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Subscription Name
          </span>
          <input
            type="text"
            value={subscription.name}
            onChange={(event) => onUpdate(subscription.id, "name", event.target.value)}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <button
          type="button"
          onClick={() => onRemove(subscription.id)}
          className="btn-secondary min-h-11 px-3 sm:mt-5"
          aria-label={`Remove ${subscription.name}`}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sm:hidden">Remove</span>
        </button>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Amount
          </span>
          <input
            type="number"
            min="0"
            value={subscription.amount}
            onChange={(event) => onUpdate(subscription.id, "amount", event.target.value)}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Billing Cycle
          </span>
          <select
            value={subscription.cycle}
            onChange={(event) => onUpdate(subscription.id, "cycle", event.target.value)}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          >
            {CYCLE_OPTIONS.map((cycle) => (
              <option key={cycle.value} value={cycle.value}>
                {cycle.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Category
          </span>
          <input
            type="text"
            value={subscription.category}
            onChange={(event) => onUpdate(subscription.id, "category", event.target.value)}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Renewal Date
          </span>
          <input
            type="date"
            value={subscription.renewalDate}
            onChange={(event) => onUpdate(subscription.id, "renewalDate", event.target.value)}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="grid gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-3">
          <span className="break-words">Monthly: {formatMoney(subscription.monthlyCost)}</span>
          <span className="break-words">Yearly: {formatMoney(subscription.yearlyCost)}</span>
          <span className="break-words">Renewal: {renewalText}</span>
        </div>
        <button
          type="button"
          onClick={() => onUpdate(subscription.id, "status", subscription.status === "active" ? "paused" : "active")}
          className={`btn-secondary min-h-10 px-3 ${
            subscription.status === "active" ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {subscription.status === "active" ? (
            <PauseCircle className="h-4 w-4" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {subscription.status === "active" ? "Active" : "Paused"}
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionCostTracker() {
  const [subscriptions, setSubscriptions] = useState(DEFAULT_SUBSCRIPTIONS);
  const [newName, setNewName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(2500);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => {
    const rows = sanitizeSubscriptions(subscriptions).map((subscription) => ({
      ...subscription,
      monthlyCost: getMonthlyCost(subscription),
      yearlyCost: getAnnualCost(subscription),
      daysUntilRenewal: getDaysUntil(subscription.renewalDate),
    }));
    const activeRows = rows.filter((subscription) => subscription.status === "active");
    const pausedRows = rows.filter((subscription) => subscription.status === "paused");
    const monthlyActiveCost = activeRows.reduce((sum, subscription) => sum + subscription.monthlyCost, 0);
    const yearlyActiveCost = monthlyActiveCost * 12;
    const pausedMonthlySavings = pausedRows.reduce((sum, subscription) => sum + subscription.monthlyCost, 0);
    const highestSubscription = [...activeRows].sort((a, b) => b.monthlyCost - a.monthlyCost)[0];
    const nextRenewal = [...activeRows]
      .filter((subscription) => subscription.daysUntilRenewal !== null)
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)[0];
    const categoryRows = groupByCategory(activeRows);
    const budgetUsed = monthlyBudget ? (monthlyActiveCost / monthlyBudget) * 100 : 0;

    return {
      rows,
      activeRows,
      pausedRows,
      activeCount: activeRows.length,
      pausedCount: pausedRows.length,
      monthlyActiveCost,
      yearlyActiveCost,
      pausedMonthlySavings,
      highestSubscription,
      nextRenewal,
      categoryRows,
      budgetUsed,
      overBudget: monthlyActiveCost > monthlyBudget,
    };
  }, [subscriptions, monthlyBudget]);

  const updateSubscription = (id, key, value) => {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.id === id
          ? {
              ...subscription,
              [key]: key === "amount" ? clampNumber(value) : value,
            }
          : subscription,
      ),
    );
  };

  const addSubscription = () => {
    const name = newName.trim() || `Subscription ${subscriptions.length + 1}`;
    setSubscriptions((current) => [
      ...current,
      {
        id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name,
        amount: 499,
        cycle: "monthly",
        category: "Other",
        renewalDate: new Date().toISOString().slice(0, 10),
        status: "active",
      },
    ]);
    setNewName("");
  };

  const removeSubscription = (id) => {
    setSubscriptions((current) => current.filter((subscription) => subscription.id !== id));
  };

  const resetPlan = () => {
    setSubscriptions(DEFAULT_SUBSCRIPTIONS);
    setMonthlyBudget(2500);
    setNewName("");
  };

  const loadSample = () => {
    setSubscriptions(SAMPLE_SUBSCRIPTIONS);
    setMonthlyBudget(18000);
    setNewName("");
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(metrics));
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
                <Repeat className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">Recurring cost dashboard</span>
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                Subscription Cost Tracker
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Track every monthly, weekly, quarterly, and yearly subscription in one place
                with renewal dates, category totals, and savings signals.
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Active monthly cost
              </p>
              <p className={`tool-money-value tool-hero-value mt-2 ${metrics.overBudget ? "text-rose-600" : "text-[var(--primary)]"}`}>
                {formatMoney(metrics.monthlyActiveCost)}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                {formatMoney(metrics.yearlyActiveCost)} yearly active subscription spend.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={WalletCards}
            label="Monthly Total"
            value={formatMoney(metrics.monthlyActiveCost)}
            detail={`${metrics.activeCount} active subscriptions`}
            tone={metrics.overBudget ? "warn" : "default"}
          />
          <MetricCard
            icon={CalendarClock}
            label="Yearly Total"
            value={formatMoney(metrics.yearlyActiveCost)}
            detail="Annualized active cost"
            tone="violet"
          />
          <MetricCard
            icon={PauseCircle}
            label="Paused Savings"
            value={formatMoney(metrics.pausedMonthlySavings)}
            detail={`${metrics.pausedCount} paused subscriptions`}
            tone="good"
          />
          <MetricCard
            icon={ReceiptText}
            label="Highest Cost"
            value={metrics.highestSubscription ? formatMoney(metrics.highestSubscription.monthlyCost) : "₹0"}
            detail={metrics.highestSubscription?.name || "No active subscription"}
            tone="warn"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="space-y-5">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Budget Controls</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Set a monthly cap and compare subscriptions against your budget.
              </p>
              <label className="mt-4 block rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  <Target className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                  Monthly Subscription Budget
                </span>
                <input
                  type="number"
                  min="0"
                  value={monthlyBudget}
                  onChange={(event) => setMonthlyBudget(clampNumber(event.target.value))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={monthlyBudget}
                  onChange={(event) => setMonthlyBudget(Number(event.target.value))}
                  className="mt-3 w-full accent-[var(--primary)]"
                />
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className={`h-full rounded-full ${metrics.overBudget ? "bg-rose-600" : "bg-[var(--primary)]"}`}
                    style={{ width: `${Math.min(100, Math.max(0, metrics.budgetUsed))}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {formatNumber(metrics.budgetUsed, 1)}% of monthly budget used.
                </p>
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
                <button type="button" onClick={() => exportCsv(metrics.rows)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </section>

            <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--foreground)]">Category Breakdown</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Monthly active cost by category</p>
                </div>
              </div>
              <div className="h-60 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.categoryRows} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" interval={0} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <YAxis width={46} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<CostTooltip />} />
                    <Bar dataKey="monthly" radius={[8, 8, 0, 0]}>
                      {metrics.categoryRows.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Repeat className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--foreground)]">Cost Split</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Share of active monthly spend</p>
                </div>
              </div>
              <div className="h-60 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.categoryRows}
                      dataKey="monthly"
                      nameKey="name"
                      innerRadius="52%"
                      outerRadius="82%"
                      paddingAngle={2}
                    >
                      {metrics.categoryRows.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CostTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Renewal Signals</h2>
              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3 2xl:grid-cols-1">
                {[
                  ["Next Renewal", metrics.nextRenewal?.name || "None", metrics.nextRenewal?.daysUntilRenewal ?? "-"],
                  ["Active Plans", `${metrics.activeCount}`, "Currently billing"],
                  ["Paused Plans", `${metrics.pausedCount}`, "Not counted in total"],
                ].map(([label, value, detail]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{value}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                      {typeof detail === "number" ? `${detail} days left` : detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Subscriptions</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Add subscriptions and normalize every billing cycle into monthly and yearly cost.
                </p>
                <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,auto)]">
                  <input
                    type="text"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="New subscription name"
                    className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                  <button type="button" onClick={addSubscription} className="btn-primary min-h-11 w-full whitespace-nowrap px-4 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Plan
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {metrics.rows.map((subscription) => (
                  <SubscriptionRow
                    key={subscription.id}
                    subscription={subscription}
                    onUpdate={updateSubscription}
                    onRemove={removeSubscription}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>

        {metrics.overBudget && (
          <div className="mt-6 flex min-w-0 items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="min-w-0 break-words text-sm leading-6">
              Active subscriptions are above your monthly budget. Pause unused plans or switch yearly plans only when
              the annual discount is worth it.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
