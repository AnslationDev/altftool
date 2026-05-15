"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  CalendarClock,
  Clipboard,
  Download,
  Landmark,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_ASSETS = [
  { id: "cash", name: "Cash & Bank", value: 280000, growth: 3, category: "Liquid" },
  { id: "mutual-funds", name: "Mutual Funds", value: 850000, growth: 12, category: "Investments" },
  { id: "stocks", name: "Stocks", value: 420000, growth: 11, category: "Investments" },
  { id: "property", name: "Home Equity", value: 2200000, growth: 6, category: "Property" },
  { id: "gold", name: "Gold", value: 180000, growth: 7, category: "Other" },
];

const DEFAULT_LIABILITIES = [
  { id: "home-loan", name: "Home Loan", value: 1250000, rate: 8.5, category: "Loan" },
  { id: "personal-loan", name: "Personal Loan", value: 180000, rate: 14, category: "Loan" },
  { id: "credit-card", name: "Credit Card", value: 45000, rate: 36, category: "Credit" },
];

const SAMPLE_PLAN = {
  assets: [
    { id: "cash", name: "Emergency Fund", value: 600000, growth: 4, category: "Liquid" },
    { id: "mf", name: "Index Funds", value: 1800000, growth: 12, category: "Investments" },
    { id: "equity", name: "Direct Equity", value: 950000, growth: 13, category: "Investments" },
    { id: "property", name: "Apartment Equity", value: 4500000, growth: 6, category: "Property" },
    { id: "epf", name: "EPF / Retirement", value: 1300000, growth: 8, category: "Retirement" },
  ],
  liabilities: [
    { id: "home-loan", name: "Home Loan", value: 2400000, rate: 8.4, category: "Loan" },
    { id: "car-loan", name: "Car Loan", value: 380000, rate: 9.5, category: "Loan" },
  ],
  monthlyAssetAddition: 65000,
  monthlyDebtPayment: 48000,
  projectionYears: 12,
};

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

function clampNumber(value, min = 0, max = 1000000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

function sanitizeAssets(assets) {
  return assets.map((asset) => ({
    ...asset,
    name: String(asset.name || "Asset").trim() || "Asset",
    category: String(asset.category || "Other").trim() || "Other",
    value: clampNumber(asset.value),
    growth: clampNumber(asset.growth, -50, 100),
  }));
}

function sanitizeLiabilities(liabilities) {
  return liabilities.map((liability) => ({
    ...liability,
    name: String(liability.name || "Liability").trim() || "Liability",
    category: String(liability.category || "Debt").trim() || "Debt",
    value: clampNumber(liability.value),
    rate: clampNumber(liability.rate, 0, 99),
  }));
}

function groupByCategory(items) {
  return Object.values(
    items.reduce((acc, item) => {
      const key = item.category || "Other";
      acc[key] ||= { name: key, value: 0 };
      acc[key].value += item.value;
      return acc;
    }, {}),
  ).sort((a, b) => b.value - a.value);
}

function projectNetWorth(assets, liabilities, monthlyAssetAddition, monthlyDebtPayment, projectionYears) {
  const activeAssets = sanitizeAssets(assets).map((asset) => ({ ...asset }));
  const activeLiabilities = sanitizeLiabilities(liabilities).map((liability) => ({ ...liability }));
  const months = Math.max(1, Math.round(projectionYears * 12));
  const rows = [];

  for (let month = 0; month <= months; month += 1) {
    const totalAssets = activeAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = activeLiabilities.reduce((sum, liability) => sum + liability.value, 0);
    rows.push({
      month,
      label: month === 0 ? "Now" : `${month}m`,
      year: month / 12,
      assets: totalAssets,
      liabilities: totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    });

    if (month === months) break;

    const totalAssetValue = activeAssets.reduce((sum, asset) => sum + asset.value, 0);
    activeAssets.forEach((asset) => {
      const monthlyGrowth = Math.pow(1 + asset.growth / 100, 1 / 12) - 1;
      const contributionShare = totalAssetValue ? asset.value / totalAssetValue : 1 / activeAssets.length;
      asset.value = Math.max(0, asset.value * (1 + monthlyGrowth) + monthlyAssetAddition * contributionShare);
    });

    const activeDebt = activeLiabilities.filter((liability) => liability.value > 0);
    const minimumDebtPayment = activeDebt.length ? monthlyDebtPayment / activeDebt.length : 0;
    activeLiabilities.forEach((liability) => {
      if (liability.value <= 0) return;
      const monthlyRate = liability.rate / 100 / 12;
      liability.value = Math.max(0, liability.value * (1 + monthlyRate) - minimumDebtPayment);
    });
  }

  return rows;
}

function buildSummary(metrics, projectionYears, monthlyAssetAddition, monthlyDebtPayment) {
  return [
    "Net Worth Tracker Summary",
    `Total assets: ${formatMoney(metrics.totalAssets)}`,
    `Total liabilities: ${formatMoney(metrics.totalLiabilities)}`,
    `Current net worth: ${formatMoney(metrics.netWorth)}`,
    `Debt ratio: ${formatNumber(metrics.debtRatio, 1)}%`,
    `Projection period: ${projectionYears} years`,
    `Monthly asset addition: ${formatMoney(monthlyAssetAddition)}`,
    `Monthly debt payment: ${formatMoney(monthlyDebtPayment)}`,
    `Projected net worth: ${formatMoney(metrics.projectedNetWorth)}`,
    `Projected change: ${formatMoney(metrics.projectedGain)}`,
  ].join("\n");
}

function exportCsv(projectionRows) {
  const rows = [
    ["Month", "Assets", "Liabilities", "Net Worth"],
    ...projectionRows.map((row) => [
      row.month,
      Math.round(row.assets),
      Math.round(row.liabilities),
      Math.round(row.netWorth),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "net-worth-tracker.csv";
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
        : tone === "gold"
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

function NetWorthTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{item.label}</p>
      <p className="text-[var(--primary)]">Net worth: {formatMoney(item.netWorth)}</p>
      <p className="text-[var(--muted-foreground)]">Assets: {formatMoney(item.assets)}</p>
      <p className="text-[var(--muted-foreground)]">Liabilities: {formatMoney(item.liabilities)}</p>
    </div>
  );
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
      <p className="text-[var(--primary)]">{formatMoney(item.value)}</p>
    </div>
  );
}

function RowEditor({ item, kind, onUpdate, onRemove }) {
  const isAsset = kind === "asset";
  return (
    <div className="grid min-w-0 gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            {isAsset ? "Asset Name" : "Liability Name"}
          </span>
          <input
            type="text"
            value={item.name}
            onChange={(event) => onUpdate(item.id, "name", event.target.value)}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="btn-secondary min-h-11 px-3 sm:mt-5"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sm:hidden">Remove</span>
        </button>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Value
          </span>
          <input
            type="number"
            min="0"
            value={item.value}
            onChange={(event) => onUpdate(item.id, "value", event.target.value)}
            aria-label={`${item.name} value`}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            {isAsset ? "Growth %" : "Rate %"}
          </span>
          <input
            type="number"
            step="0.1"
            value={isAsset ? item.growth : item.rate}
            onChange={(event) => onUpdate(item.id, isAsset ? "growth" : "rate", event.target.value)}
            aria-label={isAsset ? `${item.name} annual growth` : `${item.name} interest rate`}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Category
          </span>
          <input
            type="text"
            value={item.category}
            onChange={(event) => onUpdate(item.id, "category", event.target.value)}
            aria-label={`${item.name} category`}
            className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          />
        </label>
      </div>
      <div className="grid gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-3">
        <span className="break-words">{isAsset ? "Asset" : "Liability"}: {formatMoney(item.value)}</span>
        <span className="break-words">{isAsset ? "Growth" : "Rate"}: {formatNumber(isAsset ? item.growth : item.rate, 1)}%</span>
        <span className="break-words">Category: {item.category}</span>
      </div>
    </div>
  );
}

export default function NetWorthTracker() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState(DEFAULT_LIABILITIES);
  const [monthlyAssetAddition, setMonthlyAssetAddition] = useState(35000);
  const [monthlyDebtPayment, setMonthlyDebtPayment] = useState(25000);
  const [projectionYears, setProjectionYears] = useState(10);
  const [newAssetName, setNewAssetName] = useState("");
  const [newLiabilityName, setNewLiabilityName] = useState("");
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => {
    const activeAssets = sanitizeAssets(assets);
    const activeLiabilities = sanitizeLiabilities(liabilities);
    const totalAssets = activeAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = activeLiabilities.reduce((sum, liability) => sum + liability.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    const projectionRows = projectNetWorth(
      activeAssets,
      activeLiabilities,
      monthlyAssetAddition,
      monthlyDebtPayment,
      projectionYears,
    );
    const projectedNetWorth = projectionRows.at(-1)?.netWorth || netWorth;
    const debtRatio = totalAssets ? (totalLiabilities / totalAssets) * 100 : 0;
    const assetCategories = groupByCategory(activeAssets);
    const liabilityCategories = groupByCategory(activeLiabilities);

    return {
      activeAssets,
      activeLiabilities,
      totalAssets,
      totalLiabilities,
      netWorth,
      projectionRows,
      projectedNetWorth,
      projectedGain: projectedNetWorth - netWorth,
      debtRatio,
      assetCategories,
      liabilityCategories,
      liquidityRatio: totalLiabilities ? ((activeAssets.find((asset) => asset.category.toLowerCase().includes("liquid"))?.value || 0) / totalLiabilities) * 100 : 100,
    };
  }, [assets, liabilities, monthlyAssetAddition, monthlyDebtPayment, projectionYears]);

  const chartData = metrics.projectionRows
    .filter((row, index) => index % Math.max(1, Math.ceil(metrics.projectionRows.length / 14)) === 0)
    .slice(0, 16);

  const categoryData = [...metrics.assetCategories.slice(0, 5), ...metrics.liabilityCategories.slice(0, 5).map((item) => ({ ...item, value: -item.value }))];

  const updateAsset = (id, key, value) => {
    setAssets((current) =>
      current.map((asset) =>
        asset.id === id
          ? {
              ...asset,
              [key]: key === "name" || key === "category" ? value : clampNumber(value, key === "growth" ? -50 : 0, key === "growth" ? 100 : 1000000000),
            }
          : asset,
      ),
    );
  };

  const updateLiability = (id, key, value) => {
    setLiabilities((current) =>
      current.map((liability) =>
        liability.id === id
          ? {
              ...liability,
              [key]: key === "name" || key === "category" ? value : clampNumber(value, 0, key === "rate" ? 99 : 1000000000),
            }
          : liability,
      ),
    );
  };

  const addAsset = () => {
    const name = newAssetName.trim() || `Asset ${assets.length + 1}`;
    setAssets((current) => [
      ...current,
      {
        id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name,
        value: 100000,
        growth: 8,
        category: "Investments",
      },
    ]);
    setNewAssetName("");
  };

  const addLiability = () => {
    const name = newLiabilityName.trim() || `Liability ${liabilities.length + 1}`;
    setLiabilities((current) => [
      ...current,
      {
        id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name,
        value: 50000,
        rate: 12,
        category: "Loan",
      },
    ]);
    setNewLiabilityName("");
  };

  const resetPlan = () => {
    setAssets(DEFAULT_ASSETS);
    setLiabilities(DEFAULT_LIABILITIES);
    setMonthlyAssetAddition(35000);
    setMonthlyDebtPayment(25000);
    setProjectionYears(10);
    setNewAssetName("");
    setNewLiabilityName("");
  };

  const loadSample = () => {
    setAssets(SAMPLE_PLAN.assets);
    setLiabilities(SAMPLE_PLAN.liabilities);
    setMonthlyAssetAddition(SAMPLE_PLAN.monthlyAssetAddition);
    setMonthlyDebtPayment(SAMPLE_PLAN.monthlyDebtPayment);
    setProjectionYears(SAMPLE_PLAN.projectionYears);
    setNewAssetName("");
    setNewLiabilityName("");
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(
      buildSummary(metrics, projectionYears, monthlyAssetAddition, monthlyDebtPayment),
    );
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
                <Landmark className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">Wealth dashboard</span>
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                Net Worth Tracker
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                Track assets minus liabilities, update monthly additions, and project
                your net worth trend across time.
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Current net worth
              </p>
              <p className={`tool-money-value tool-hero-value mt-2 ${metrics.netWorth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatMoney(metrics.netWorth)}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                Assets {formatMoney(metrics.totalAssets)} minus liabilities {formatMoney(metrics.totalLiabilities)}.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={ArrowUpCircle}
            label="Total Assets"
            value={formatMoney(metrics.totalAssets)}
            detail={`${metrics.activeAssets.length} asset entries`}
            tone="good"
          />
          <MetricCard
            icon={ArrowDownCircle}
            label="Total Liabilities"
            value={formatMoney(metrics.totalLiabilities)}
            detail={`${metrics.activeLiabilities.length} liability entries`}
            tone={metrics.totalLiabilities > metrics.totalAssets ? "warn" : "default"}
          />
          <MetricCard
            icon={TrendingUp}
            label="Projected Net Worth"
            value={formatMoney(metrics.projectedNetWorth)}
            detail={`${projectionYears} year projection`}
            tone="gold"
          />
          <MetricCard
            icon={ShieldCheck}
            label="Projected Change"
            value={formatMoney(metrics.projectedGain)}
            detail={`${formatNumber(metrics.debtRatio, 1)}% debt-to-assets ratio`}
            tone={metrics.projectedGain >= 0 ? "good" : "warn"}
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="space-y-5">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Projection Controls</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Tune monthly additions and debt reduction to forecast net worth.
              </p>
              <div className="mt-4 space-y-4">
                {[
                  ["Monthly Asset Addition", monthlyAssetAddition, setMonthlyAssetAddition, 0, 250000, Wallet],
                  ["Monthly Debt Payment", monthlyDebtPayment, setMonthlyDebtPayment, 0, 250000, Target],
                  ["Projection Years", projectionYears, setProjectionYears, 1, 40, CalendarClock],
                ].map(([label, value, setter, min, max, Icon]) => (
                  <label key={label} className="block rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                      <span className="min-w-0 break-words">{label}</span>
                    </span>
                    <input
                      type="number"
                      min={min}
                      max={max}
                      value={value}
                      onChange={(event) => setter(clampNumber(event.target.value, min, max))}
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={label === "Projection Years" ? 1 : 1000}
                      value={value}
                      onChange={(event) => setter(Number(event.target.value))}
                      className="mt-3 w-full accent-[var(--primary)]"
                    />
                  </label>
                ))}
              </div>

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
                <button type="button" onClick={() => exportCsv(metrics.projectionRows)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </section>

          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--foreground)]">Net Worth Over Time</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Assets minus liabilities projection</p>
                </div>
              </div>
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <YAxis
                      width={56}
                      tickFormatter={(value) => formatMoney(value, true)}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <Tooltip content={<NetWorthTooltip />} />
                    <Area type="monotone" dataKey="netWorth" stroke="#2563eb" fill="#2563eb" fillOpacity={0.18} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Wealth Signals</h2>
              <div className="tool-card-grid mt-4">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Debt Ratio</p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">{formatNumber(metrics.debtRatio, 1)}%</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">Liabilities as a share of assets.</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Liquidity Cover</p>
                  <p className="tool-money-value mt-2 text-[var(--foreground)]">{formatNumber(metrics.liquidityRatio, 1)}%</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">Liquid assets versus liabilities.</p>
                </div>
              </div>
            </section>

          </div>
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-2">
              <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <h2 className="font-semibold text-[var(--foreground)]">Category Breakdown</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Assets are positive, liabilities are negative.</p>
                <div className="mt-4 h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={56} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <Tooltip content={<CategoryTooltip />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {categoryData.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={entry.value >= 0 ? COLORS[index % COLORS.length] : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <h2 className="font-semibold text-[var(--foreground)]">Snapshot</h2>
                <div className="mt-4 space-y-3">
                  {[
                    ["Assets", metrics.totalAssets, "text-emerald-600"],
                    ["Liabilities", metrics.totalLiabilities, "text-rose-600"],
                    ["Net Worth", metrics.netWorth, metrics.netWorth >= 0 ? "text-emerald-600" : "text-rose-600"],
                    ["Projected", metrics.projectedNetWorth, "text-[var(--primary)]"],
                  ].map(([label, value, color]) => (
                    <div key={label} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                      <span className="min-w-0 break-words text-sm font-semibold text-[var(--muted-foreground)]">{label}</span>
                      <span className={`min-w-0 break-words text-right text-sm font-bold ${color}`}>{formatMoney(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">Assets</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Track bank balance, investments, property, retirement funds, and other assets.</p>
                  <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)]">
                    <input
                      type="text"
                      value={newAssetName}
                      onChange={(event) => setNewAssetName(event.target.value)}
                      placeholder="New asset name"
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                    <button type="button" onClick={addAsset} className="btn-primary min-h-11 w-full whitespace-nowrap px-4 sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Add Asset
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <RowEditor
                      key={asset.id}
                      item={asset}
                      kind="asset"
                      onUpdate={updateAsset}
                      onRemove={(id) => setAssets((current) => current.filter((item) => item.id !== id))}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">Liabilities</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Track loans, credit card balances, EMIs, and other obligations.</p>
                  <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)]">
                    <input
                      type="text"
                      value={newLiabilityName}
                      onChange={(event) => setNewLiabilityName(event.target.value)}
                      placeholder="New liability name"
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                    <button type="button" onClick={addLiability} className="btn-primary min-h-11 w-full whitespace-nowrap px-4 sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Add Liability
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {liabilities.map((liability) => (
                    <RowEditor
                      key={liability.id}
                      item={liability}
                      kind="liability"
                      onUpdate={updateLiability}
                      onRemove={(id) => setLiabilities((current) => current.filter((item) => item.id !== id))}
                    />
                  ))}
                </div>
              </div>
        </section>
      </div>
    </main>
  );
}
