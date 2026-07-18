"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clipboard,
  DollarSign,
  Download,
  Plus,
  RefreshCcw,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const DEFAULT_CHANNELS = [
  { id: "google-ads", name: "Google Ads", spend: 50000, customers: 120 },
  { id: "facebook-ads", name: "Facebook Ads", spend: 35000, customers: 90 },
  { id: "content-seo", name: "Content / SEO", spend: 20000, customers: 150 },
  { id: "referrals", name: "Referral Program", spend: 10000, customers: 80 },
  { id: "email", name: "Email Marketing", spend: 8000, customers: 60 },
];

const SAMPLE_CHANNELS = [
  { id: "google-ads", name: "Google Ads", spend: 120000, customers: 240 },
  { id: "linkedin-ads", name: "LinkedIn Ads", spend: 85000, customers: 95 },
  { id: "youtube-ads", name: "YouTube Ads", spend: 65000, customers: 180 },
  { id: "content-seo", name: "Content / SEO", spend: 40000, customers: 320 },
  { id: "referrals", name: "Referral Program", spend: 25000, customers: 200 },
  { id: "email", name: "Email Marketing", spend: 15000, customers: 150 },
  { id: "influencer", name: "Influencer Marketing", spend: 55000, customers: 110 },
];

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

function formatNumber(value, digits = 0) {
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

function getCacStatus(cac, ltvCacRatio) {
  if (ltvCacRatio >= 3) {
    return { label: "Excellent", tone: "good", message: "Healthy LTV:CAC ratio (≥3x). Acquisition is sustainable and profitable." };
  }
  if (ltvCacRatio >= 2) {
    return { label: "Good", tone: "good", message: "Decent LTV:CAC ratio (2–3x). Room to optimise but acquisition is viable." };
  }
  if (ltvCacRatio >= 1) {
    return { label: "Needs Work", tone: "watch", message: "LTV:CAC is 1–2x. You're barely breaking even on acquisition. Optimise spend." };
  }
  if (ltvCacRatio > 0) {
    return { label: "Unsustainable", tone: "warn", message: "LTV is below CAC. You lose money on every customer acquired." };
  }
  return { label: "No Data", tone: "default", message: "Enter an LTV value to see your ratio health." };
}

function getChannelEfficiency(cac) {
  if (cac <= 200) return { label: "Very Efficient", tone: "good" };
  if (cac <= 500) return { label: "Efficient", tone: "good" };
  if (cac <= 1000) return { label: "Average", tone: "watch" };
  if (cac <= 2000) return { label: "Above Average", tone: "watch" };
  return { label: "High Cost", tone: "warn" };
}

function buildSummary(metrics, ltv, channels) {
  return [
    "CAC Calculator Summary",
    `Blended CAC: ${formatMoney(metrics.blendedCac)}`,
    `Total Marketing Spend: ${formatMoney(metrics.totalSpend)}`,
    `Total Customers Acquired: ${formatNumber(metrics.totalCustomers)}`,
    `LTV (Customer Lifetime Value): ${formatMoney(ltv)}`,
    `LTV:CAC Ratio: ${metrics.ltvCacRatio > 0 ? formatNumber(metrics.ltvCacRatio, 1) + "x" : "—"}`,
    `Best Channel: ${metrics.bestChannel?.name || "—"} (${formatMoney(metrics.bestChannel?.cac || 0)})`,
    `Worst Channel: ${metrics.worstChannel?.name || "—"} (${formatMoney(metrics.worstChannel?.cac || 0)})`,
    `Spend Efficiency Gap: ${formatMoney(metrics.spendGap)}`,
    ...channels.map((ch) => {
      const cac = ch.spend > 0 && ch.customers > 0 ? ch.spend / ch.customers : 0;
      const share = metrics.totalSpend > 0 ? (ch.spend / metrics.totalSpend) * 100 : 0;
      return `${ch.name}: Spend ${formatMoney(ch.spend)} (${formatNumber(share, 1)}%), Customers ${formatNumber(ch.customers)}, CAC ${formatMoney(cac)}`;
    }),
  ].join("\n");
}

function exportCsv(metrics, ltv, channels) {
  const rows = [
    ["Channel", "Spend", "Customers", "CAC", "Spend Share"],
    ...channels.map((ch) => {
      const cac = ch.spend > 0 && ch.customers > 0 ? ch.spend / ch.customers : 0;
      const share = metrics.totalSpend > 0 ? (ch.spend / metrics.totalSpend) * 100 : 0;
      return [ch.name, ch.spend, ch.customers, Math.round(cac), `${formatNumber(share, 1)}%`];
    }),
    ["", "", "", "", ""],
    ["Summary", "", "", "", ""],
    ["Blended CAC", Math.round(metrics.blendedCac), "", "", ""],
    ["Total Spend", metrics.totalSpend, "", "", ""],
    ["Total Customers", metrics.totalCustomers, "", "", ""],
    ["LTV", Math.round(ltv), "", "", ""],
    ["LTV:CAC Ratio", metrics.ltvCacRatio > 0 ? `${formatNumber(metrics.ltvCacRatio, 1)}x` : "—", "", "", ""],
  ];
  const csv = rows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "cac-calculator.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" />}
        <span className="min-w-0 break-words">{label}</span>
      </span>
      {children}
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
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="tool-money-value mt-1 text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ChannelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
      <p className="text-[var(--primary)]">CAC: {formatMoney(item.cac)}</p>
      <p className="text-[var(--muted-foreground)]">Spend: {formatMoney(item.spend, true)}</p>
      <p className="text-[var(--muted-foreground)]">Customers: {formatNumber(item.customers)}</p>
    </div>
  );
}

function SpendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
      <p className="text-[var(--primary)]">Spend: {formatMoney(item.value)}</p>
      {Number.isFinite(item.share) && (
        <p className="text-[var(--muted-foreground)]">{formatNumber(item.share, 1)}% of total</p>
      )}
    </div>
  );
}

export default function CacCalculator() {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [ltv, setLtv] = useState(3000);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelSpend, setNewChannelSpend] = useState("");
  const [newChannelCustomers, setNewChannelCustomers] = useState("");

  const metrics = useMemo(() => {
    const totalSpend = channels.reduce((sum, ch) => sum + clampNumber(ch.spend), 0);
    const totalCustomers = channels.reduce((sum, ch) => sum + clampNumber(ch.customers), 0);
    const blendedCac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
    const ltvCacRatio = blendedCac > 0 ? ltv / blendedCac : 0;

    const channelData = channels.map((ch, i) => {
      const spend = clampNumber(ch.spend);
      const customers = clampNumber(ch.customers);
      const cac = customers > 0 ? spend / customers : 0;
      const share = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
      return { ...ch, spend, customers, cac, share, color: COLORS[i % COLORS.length] };
    });

    const sorted = [...channelData].filter((ch) => ch.cac > 0).sort((a, b) => a.cac - b.cac);
    const bestChannel = sorted[0] || null;
    const worstChannel = sorted[sorted.length - 1] || null;
    const spendGap = worstChannel && bestChannel ? worstChannel.cac - bestChannel.cac : 0;

    return {
      totalSpend,
      totalCustomers,
      blendedCac,
      ltvCacRatio,
      channelData,
      bestChannel,
      worstChannel,
      spendGap,
    };
  }, [channels, ltv]);

  const cacStatus = useMemo(() => getCacStatus(metrics.blendedCac, metrics.ltvCacRatio), [metrics.blendedCac, metrics.ltvCacRatio]);

  const spendPieData = useMemo(
    () => metrics.channelData.filter((ch) => ch.spend > 0).map((ch) => ({ name: ch.name, value: ch.spend, share: ch.share, color: ch.color })),
    [metrics.channelData]
  );

  const updateChannel = (id, key, value) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id ? { ...ch, [key]: key === "name" ? value : clampNumber(value) } : ch
      )
    );
  };

  const removeChannel = (id) => {
    setChannels((prev) => prev.filter((ch) => ch.id !== id));
  };

  const addChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    setChannels((prev) => [
      ...prev,
      { id, name, spend: clampNumber(Number(newChannelSpend)), customers: clampNumber(Number(newChannelCustomers)) },
    ]);
    setNewChannelName("");
    setNewChannelSpend("");
    setNewChannelCustomers("");
  };

  const handleReset = () => {
    setChannels(DEFAULT_CHANNELS);
    setLtv(3000);
    setNewChannelName("");
    setNewChannelSpend("");
    setNewChannelCustomers("");
  };

  const handleLoadSample = () => {
    setChannels(SAMPLE_CHANNELS);
    setLtv(5000);
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Target className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            CAC Calculator
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Calculate Customer Acquisition Cost across every marketing channel. Compare efficiency, track your LTV:CAC ratio, and optimise your ad spend in real time.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Target}
            label="Blended CAC"
            value={formatMoney(metrics.blendedCac)}
            detail={`${cacStatus.label} — ${cacStatus.message.split(".")[0]}`}
            tone={cacStatus.tone}
          />
          <MetricCard
            icon={DollarSign}
            label="Total Spend"
            value={formatMoney(metrics.totalSpend, true)}
            detail={`${formatNumber(metrics.totalCustomers)} customers acquired`}
          />
          <MetricCard
            icon={TrendingUp}
            label="LTV:CAC Ratio"
            value={ltv > 0 ? `${formatNumber(metrics.ltvCacRatio, 1)}x` : "—"}
            detail={ltv > 0 ? `LTV: ${formatMoney(ltv)}` : "Set LTV below"}
            tone={cacStatus.tone}
          />
          <MetricCard
            icon={metrics.bestChannel ? TrendingDown : AlertTriangle}
            label={metrics.bestChannel ? "Best Channel" : "No Data"}
            value={metrics.bestChannel ? metrics.bestChannel.name : "—"}
            detail={metrics.bestChannel ? `CAC: ${formatMoney(metrics.bestChannel.cac)}` : "Add channels to compare"}
            tone={metrics.bestChannel ? "good" : "default"}
          />
        </div>

        {/* LTV Input */}
        <SectionCard title="Customer Lifetime Value" icon={DollarSign} action={
          <button onClick={handleLoadSample} className="rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
            Load Sample
          </button>
        }>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer Lifetime Value (LTV)" icon={DollarSign}>
              <input
                type="number"
                min="0"
                value={ltv}
                onChange={(e) => setLtv(clampNumber(e.target.value))}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </Field>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">What is LTV?</p>
              <p className="text-sm text-[var(--foreground)]">
                The total revenue a customer generates over their entire relationship with your business. A healthy LTV:CAC ratio is 3:1 or higher.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Channels */}
        <div className="mt-6">
          <SectionCard title="Marketing Channels" icon={BarChart3} action={
            <button onClick={() => exportCsv(metrics, ltv, channels)} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          }>
            {/* Channel List */}
            {channels.length === 0 ? (
              <div className="mb-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] py-12 text-center text-sm text-[var(--muted-foreground)]">
                No channels added. Add one below to start calculating.
              </div>
            ) : (
              <div className="mb-6 space-y-3">
                {/* Header */}
                <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] gap-3 px-4 text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:grid">
                  <span>Channel</span>
                  <span>Spend (₹)</span>
                  <span>Customers</span>
                  <span>CAC</span>
                  <span>Spend Share</span>
                  <span className="w-10"></span>
                </div>

                {channels.map((ch, i) => {
                  const cac = ch.spend > 0 && ch.customers > 0 ? ch.spend / ch.customers : 0;
                  const share = metrics.totalSpend > 0 ? (ch.spend / metrics.totalSpend) * 100 : 0;
                  const efficiency = getChannelEfficiency(cac);
                  const isBest = metrics.bestChannel && metrics.bestChannel.id === ch.id;
                  const isWorst = metrics.worstChannel && metrics.worstChannel.id === ch.id && channels.length > 1;

                  return (
                    <div
                      key={ch.id}
                      className={`group grid min-w-0 gap-3 rounded-xl border px-4 py-3 transition-all sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] ${
                        isBest
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : isWorst
                            ? "border-rose-500/30 bg-rose-500/5"
                            : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                    >
                      <label className="min-w-0">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:hidden">Channel</span>
                        <input
                          type="text"
                          value={ch.name}
                          onChange={(e) => updateChannel(ch.id, "name", e.target.value)}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                      </label>
                      <label className="min-w-0">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:hidden">Spend</span>
                        <input
                          type="number"
                          min="0"
                          value={ch.spend}
                          onChange={(e) => updateChannel(ch.id, "spend", e.target.value)}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                      </label>
                      <label className="min-w-0">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:hidden">Customers</span>
                        <input
                          type="number"
                          min="0"
                          value={ch.customers}
                          onChange={(e) => updateChannel(ch.id, "customers", e.target.value)}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:hidden">CAC</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          efficiency.tone === "good" ? "bg-emerald-500/10 text-emerald-600" : efficiency.tone === "warn" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {formatMoney(cac)}
                        </span>
                        {isBest && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">BEST</span>}
                        {isWorst && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600">HIGHEST</span>}
                      </div>
                      <div className="flex items-center">
                        <span className="mb-1 block text-xs font-semibold uppercase text-[var(--muted-foreground)] sm:hidden">Share</span>
                        <span className="text-sm font-semibold text-[var(--foreground)]">{formatNumber(share, 1)}%</span>
                      </div>
                      <button
                        onClick={() => removeChannel(ch.id)}
                        className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                        aria-label={`Remove ${ch.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Channel Form */}
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-3 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Add New Channel</p>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChannel()}
                  placeholder="Channel name"
                  className="h-11 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <input
                  type="number"
                  min="0"
                  value={newChannelSpend}
                  onChange={(e) => setNewChannelSpend(e.target.value)}
                  placeholder="Spend (₹)"
                  className="h-11 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <input
                  type="number"
                  min="0"
                  value={newChannelCustomers}
                  onChange={(e) => setNewChannelCustomers(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChannel()}
                  placeholder="Customers"
                  className="h-11 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <button
                  onClick={addChannel}
                  className="btn-primary flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard title="CAC by Channel" icon={BarChart3}>
            <div className="h-72">
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.channelData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChannelTooltip />} />
                  <Bar dataKey="cac" radius={[6, 6, 0, 0]} name="CAC">
                    {metrics.channelData.map((ch, i) => (
                      <Cell key={i} fill={ch.color} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Spend Allocation" icon={Target}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="h-56 w-56 shrink-0">
                <SafeResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {spendPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<SpendTooltip />} />
                  </PieChart>
                </SafeResponsiveContainer>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {metrics.channelData.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="min-w-0 truncate font-medium text-[var(--foreground)]">{ch.name}</span>
                    <span className="ml-auto shrink-0 font-semibold text-[var(--muted-foreground)]">{formatNumber(ch.share, 1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Channel Efficiency Table */}
        <div className="mt-6">
          <SectionCard title="Channel Efficiency Ranking" icon={BarChart3}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">Channel</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Spend</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Customers</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">CAC</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--muted-foreground)]">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {[...metrics.channelData]
                    .filter((ch) => ch.cac > 0)
                    .sort((a, b) => a.cac - b.cac)
                    .map((ch, rank) => {
                      const efficiency = getChannelEfficiency(ch.cac);
                      return (
                        <tr key={ch.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="px-4 py-3 font-bold text-[var(--foreground)]">#{rank + 1}</td>
                          <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{ch.name}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">{formatMoney(ch.spend)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">{formatNumber(ch.customers)}</td>
                          <td className="px-4 py-3 text-right font-bold text-[var(--foreground)]">{formatMoney(ch.cac)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              efficiency.tone === "good" ? "bg-emerald-500/10 text-emerald-600" : efficiency.tone === "warn" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {efficiency.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Insights */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <SectionCard title="Quick Insights" icon={CheckCircle2} action={
            <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset All
            </button>
          }>
            <div className="space-y-3">
              {metrics.bestChannel && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">Most Efficient: {metrics.bestChannel.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      CAC of {formatMoney(metrics.bestChannel.cac)} with {formatNumber(metrics.bestChannel.customers)} customers from {formatMoney(metrics.bestChannel.spend)} spend.
                    </p>
                  </div>
                </div>
              )}
              {metrics.worstChannel && metrics.bestChannel && metrics.worstChannel.id !== metrics.bestChannel.id && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">Needs Optimisation: {metrics.worstChannel.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      CAC is {formatMoney(metrics.worstChannel.cac)} — {formatNumber(metrics.spendGap)} higher than the best channel. Consider reallocating budget.
                    </p>
                  </div>
                </div>
              )}
              {metrics.ltvCacRatio > 0 && (
                <div className={`flex items-start gap-3 rounded-xl border p-4 ${
                  metrics.ltvCacRatio >= 3 ? "border-emerald-500/30 bg-emerald-500/5" : metrics.ltvCacRatio >= 2 ? "border-amber-500/30 bg-amber-500/5" : "border-rose-500/30 bg-rose-500/5"
                }`}>
                  {metrics.ltvCacRatio >= 3 ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">LTV:CAC is {formatNumber(metrics.ltvCacRatio, 1)}x</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{cacStatus.message}</p>
                  </div>
                </div>
              )}
              {metrics.blendedCac > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Blended CAC Breakdown</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    You spend {formatMoney(metrics.blendedCac)} on average to acquire one customer across all {channels.length} channels. Total spend: {formatMoney(metrics.totalSpend)} for {formatNumber(metrics.totalCustomers)} customers.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="How to Improve Your CAC" icon={Calculator}>
            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Double Down on Winners</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Increase budget for your lowest-CAC channels first. Shifting ₹10,000 from the worst to the best channel can reduce blended CAC significantly.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Improve Conversion Rates</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  A/B test landing pages, simplify sign-up flows, and add social proof. Better conversion means more customers for the same spend.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Boost LTV, Not Just CAC</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Upsell, cross-sell, and improve retention. A higher LTV means you can afford a higher CAC while staying profitable.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Leverage Organic Channels</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Content, SEO, referrals, and community building often have the lowest CAC. Invest in these long-term plays alongside paid ads.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. Your marketing data is never stored or uploaded.
        </p>
      </div>
    </div>
  );
}
