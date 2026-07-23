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
  Sparkles,
  Shield,
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
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6",
  "#3b82f6", "#84cc16",
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
  if (ltvCacRatio >= 3) return { label: "Excellent", tone: "good", message: "Healthy LTV:CAC ratio (≥3x). Acquisition is sustainable and profitable." };
  if (ltvCacRatio >= 2) return { label: "Good", tone: "good", message: "Decent LTV:CAC ratio (2–3x). Room to optimise but acquisition is viable." };
  if (ltvCacRatio >= 1) return { label: "Needs Work", tone: "watch", message: "LTV:CAC is 1–2x. You're barely breaking even on acquisition. Optimise spend." };
  if (ltvCacRatio > 0)  return { label: "Unsustainable", tone: "warn", message: "LTV is below CAC. You lose money on every customer acquired." };
  return { label: "No Data", tone: "default", message: "Enter an LTV value to see your ratio health." };
}

function getChannelEfficiency(cac) {
  if (cac <= 200)  return { label: "Very Efficient", tone: "good" };
  if (cac <= 500)  return { label: "Efficient", tone: "good" };
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

/* ─── Tone Helpers ─── */
const TONE = {
  good:    { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "text-emerald-600", card: "border-emerald-200 bg-emerald-50/50" },
  warn:    { badge: "bg-rose-50 text-rose-700 border-rose-200",          icon: "text-rose-600",    card: "border-rose-200 bg-rose-50/50" },
  watch:   { badge: "bg-amber-50 text-amber-700 border-amber-200",       icon: "text-amber-600",   card: "border-amber-200 bg-amber-50/50" },
  default: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200",    icon: "text-indigo-600",  card: "border-indigo-200 bg-indigo-50/50" },
};

/* ─── Sub-components ─── */
function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const t = TONE[tone] || TONE.default;
  return (
    <div className={`rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-shadow ${t.card}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm`}>
          <Icon className={`h-5 w-5 ${t.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
          {detail && <p className="mt-1 text-xs text-slate-500 font-medium leading-snug">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action, accent = "indigo" }) {
  const accentBar = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }[accent] || "bg-indigo-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`h-1 w-full ${accentBar}`}></div>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="flex items-center gap-2.5 text-base font-extrabold text-slate-800">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-500" />}
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
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xl">
      <p className="font-extrabold text-slate-800 mb-1">{item.name}</p>
      <p className="text-indigo-600 font-bold">CAC: {formatMoney(item.cac)}</p>
      <p className="text-slate-500">Spend: {formatMoney(item.spend, true)}</p>
      <p className="text-slate-500">Customers: {formatNumber(item.customers)}</p>
    </div>
  );
}

function SpendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xl">
      <p className="font-extrabold text-slate-800 mb-1">{item.name}</p>
      <p className="text-indigo-600 font-bold">Spend: {formatMoney(item.value)}</p>
      {Number.isFinite(item.share) && <p className="text-slate-500">{formatNumber(item.share, 1)}% of total</p>}
    </div>
  );
}

/* ─── Main Component ─── */
export default function CacCalculator() {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [ltv, setLtv] = useState(3000);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelSpend, setNewChannelSpend] = useState("");
  const [newChannelCustomers, setNewChannelCustomers] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);

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

    return { totalSpend, totalCustomers, blendedCac, ltvCacRatio, channelData, bestChannel, worstChannel, spendGap };
  }, [channels, ltv]);

  const cacStatus = useMemo(() => getCacStatus(metrics.blendedCac, metrics.ltvCacRatio), [metrics.blendedCac, metrics.ltvCacRatio]);
  const spendPieData = useMemo(
    () => metrics.channelData.filter((ch) => ch.spend > 0).map((ch) => ({ name: ch.name, value: ch.spend, share: ch.share, color: ch.color })),
    [metrics.channelData]
  );

  const updateChannel = (id, key, value) => {
    setChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, [key]: key === "name" ? value : clampNumber(value) } : ch));
  };
  const removeChannel = (id) => setChannels((prev) => prev.filter((ch) => ch.id !== id));

  const addChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    setChannels((prev) => [...prev, { id, name, spend: clampNumber(Number(newChannelSpend)), customers: clampNumber(Number(newChannelCustomers)) }]);
    setNewChannelName(""); setNewChannelSpend(""); setNewChannelCustomers("");
  };

  const handleReset = () => { setChannels(DEFAULT_CHANNELS); setLtv(3000); setNewChannelName(""); setNewChannelSpend(""); setNewChannelCustomers(""); };
  const handleLoadSample = () => { setChannels(SAMPLE_CHANNELS); setLtv(5000); };

  const handleCopySummary = async () => {
    await navigator.clipboard.writeText(buildSummary(metrics, ltv, channels));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto w-full max-w-6xl my-8 px-4 md:px-6">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden relative">
          {/* Top Gradient Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>

          <div className="p-6 md:p-10">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full mb-4 font-bold tracking-widest text-[10px] uppercase border border-emerald-100">
                  <Target className="w-3.5 h-3.5" /> Marketing Analytics
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                  CAC Calculator
                </h1>
                <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed">
                  Calculate Customer Acquisition Cost across every marketing channel. Compare efficiency, track your LTV:CAC ratio, and optimise ad spend in real time.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">100% Private — Browser Only</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLoadSample}
                    className="flex-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl transition-all"
                  >
                    Load Sample Data
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs font-bold bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>
              </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
                tone="default"
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

            {/* ── LTV Input ── */}
            <div className="mb-6">
              <SectionCard title="Customer Lifetime Value (LTV)" icon={DollarSign} accent="emerald">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Your Average LTV (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={ltv}
                      onChange={(e) => setLtv(clampNumber(e.target.value))}
                      className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-lg font-black text-slate-900 outline-none transition focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <p className="mb-1.5 text-xs font-extrabold uppercase tracking-widest text-slate-500">What is LTV?</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The total revenue a customer generates over their entire relationship with your business. A healthy LTV:CAC ratio is <strong>3:1 or higher</strong>.
                    </p>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── Channels ── */}
            <div className="mb-6">
              <SectionCard
                title="Marketing Channels"
                icon={BarChart3}
                accent="indigo"
                action={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummary}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all"
                    >
                      {copiedSummary ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                      {copiedSummary ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => exportCsv(metrics, ltv, channels)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> CSV
                    </button>
                  </div>
                }
              >
                {/* Channel List Header */}
                {channels.length === 0 ? (
                  <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">No channels added. Add one below to start calculating.</p>
                  </div>
                ) : (
                  <div className="mb-6 space-y-2.5">
                    <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] gap-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 sm:grid">
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
                          className={`group grid min-w-0 gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] ${
                            isBest
                              ? "border-emerald-200 bg-emerald-50/50"
                              : isWorst
                              ? "border-rose-200 bg-rose-50/50"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                            <input
                              type="text"
                              value={ch.name}
                              onChange={(e) => updateChannel(ch.id, "name", e.target.value)}
                              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">Spend</span>
                            <input
                              type="number"
                              min="0"
                              value={ch.spend}
                              onChange={(e) => updateChannel(ch.id, "spend", e.target.value)}
                              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 transition-all"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">Customers</span>
                            <input
                              type="number"
                              min="0"
                              value={ch.customers}
                              onChange={(e) => updateChannel(ch.id, "customers", e.target.value)}
                              className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">CAC</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold border ${
                              TONE[efficiency.tone]?.badge || TONE.default.badge
                            }`}>
                              {formatMoney(cac)}
                            </span>
                            {isBest && <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">BEST</span>}
                            {isWorst && <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">HIGH</span>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">Share</span>
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                                <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.min(share, 100)}%` }}></div>
                              </div>
                              <span className="text-sm font-bold text-slate-700">{formatNumber(share, 1)}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeChannel(ch.id)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
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
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 hover:border-indigo-300 transition-colors">
                  <p className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 text-indigo-500" /> Add New Channel
                  </p>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
                    <input
                      type="text"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addChannel()}
                      placeholder="Channel name (e.g. TikTok Ads)"
                      className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      min="0"
                      value={newChannelSpend}
                      onChange={(e) => setNewChannelSpend(e.target.value)}
                      placeholder="Spend (₹)"
                      className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      min="0"
                      value={newChannelCustomers}
                      onChange={(e) => setNewChannelCustomers(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addChannel()}
                      placeholder="Customers"
                      className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500"
                    />
                    <button
                      onClick={addChannel}
                      className="h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 text-sm font-extrabold shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── Charts ── */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <SectionCard title="CAC by Channel" icon={BarChart3} accent="indigo">
                <div className="h-72">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.channelData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={0} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<ChannelTooltip />} />
                      <Bar dataKey="cac" radius={[8, 8, 0, 0]} name="CAC">
                        {metrics.channelData.map((ch, i) => (
                          <Cell key={i} fill={ch.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Spend Allocation" icon={Target} accent="emerald">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="h-56 w-56 shrink-0">
                    <SafeResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={spendPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value">
                          {spendPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<SpendTooltip />} />
                      </PieChart>
                    </SafeResponsiveContainer>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    {metrics.channelData.map((ch) => (
                      <div key={ch.id} className="flex items-center gap-2.5 text-sm">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: ch.color }} />
                        <span className="min-w-0 truncate font-semibold text-slate-700">{ch.name}</span>
                        <div className="ml-auto flex items-center gap-2 shrink-0">
                          <div className="w-14 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(ch.share, 100)}%`, backgroundColor: ch.color }}></div>
                          </div>
                          <span className="font-bold text-slate-600 w-10 text-right">{formatNumber(ch.share, 1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── Efficiency Ranking Table ── */}
            <div className="mb-6">
              <SectionCard title="Channel Efficiency Ranking" icon={BarChart3} accent="amber">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        {["Rank", "Channel", "Spend", "Customers", "CAC", "Efficiency"].map((h, i) => (
                          <th key={h} className={`px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...metrics.channelData]
                        .filter((ch) => ch.cac > 0)
                        .sort((a, b) => a.cac - b.cac)
                        .map((ch, rank) => {
                          const efficiency = getChannelEfficiency(ch.cac);
                          return (
                            <tr key={ch.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3.5">
                                <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-black ${rank === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                  #{rank + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ch.color }}></span>
                                {ch.name}
                              </td>
                              <td className="px-4 py-3.5 text-right font-semibold text-slate-700">{formatMoney(ch.spend)}</td>
                              <td className="px-4 py-3.5 text-right font-semibold text-slate-700">{formatNumber(ch.customers)}</td>
                              <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">{formatMoney(ch.cac)}</td>
                              <td className="px-4 py-3.5 text-right">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold border ${TONE[efficiency.tone]?.badge || TONE.default.badge}`}>
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

            {/* ── Insights ── */}
            <div className="grid gap-6 sm:grid-cols-2">
              <SectionCard title="Quick Insights" icon={CheckCircle2} accent="emerald">
                <div className="space-y-3">
                  {metrics.bestChannel && (
                    <div className="flex items-start gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Most Efficient: {metrics.bestChannel.name}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          CAC of {formatMoney(metrics.bestChannel.cac)} with {formatNumber(metrics.bestChannel.customers)} customers from {formatMoney(metrics.bestChannel.spend)} spend.
                        </p>
                      </div>
                    </div>
                  )}
                  {metrics.worstChannel && metrics.bestChannel && metrics.worstChannel.id !== metrics.bestChannel.id && (
                    <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Needs Optimisation: {metrics.worstChannel.name}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          CAC is {formatMoney(metrics.worstChannel.cac)} — {formatNumber(metrics.spendGap)} higher than the best channel.
                        </p>
                      </div>
                    </div>
                  )}
                  {metrics.ltvCacRatio > 0 && (
                    <div className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${metrics.ltvCacRatio >= 3 ? "border-emerald-200 bg-emerald-50/50" : metrics.ltvCacRatio >= 2 ? "border-amber-200 bg-amber-50/50" : "border-rose-200 bg-rose-50/50"}`}>
                      {metrics.ltvCacRatio >= 3 ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">LTV:CAC is {formatNumber(metrics.ltvCacRatio, 1)}x</p>
                        <p className="text-sm text-slate-500 mt-0.5">{cacStatus.message}</p>
                      </div>
                    </div>
                  )}
                  {metrics.blendedCac > 0 && (
                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
                      <p className="mb-1 text-sm font-extrabold text-slate-800">Blended CAC Breakdown</p>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        You spend {formatMoney(metrics.blendedCac)} on average to acquire one customer across all {channels.length} channels. Total spend: {formatMoney(metrics.totalSpend)} for {formatNumber(metrics.totalCustomers)} customers.
                      </p>
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="How to Improve Your CAC" icon={Calculator} accent="indigo">
                <div className="space-y-3">
                  {[
                    { title: "Double Down on Winners", body: "Increase budget for your lowest-CAC channels first. Shifting ₹10,000 from the worst to the best channel can reduce blended CAC significantly." },
                    { title: "Improve Conversion Rates", body: "A/B test landing pages, simplify sign-up flows, and add social proof. Better conversion means more customers for the same spend." },
                    { title: "Boost LTV, Not Just CAC", body: "Upsell, cross-sell, and improve retention. A higher LTV means you can afford a higher CAC while staying profitable." },
                    { title: "Leverage Organic Channels", body: "Content, SEO, referrals, and community building often have the lowest CAC. Invest in these long-term plays alongside paid ads." },
                  ].map(({ title, body }) => (
                    <div key={title} className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                      <p className="mb-1 text-sm font-extrabold text-slate-800">{title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 font-medium">
              All calculations run in your browser. Your marketing data is never stored or uploaded.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
