"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  Clipboard,
  Cpu,
  Database,
  Download,
  Flame,
  Gauge as GaugeIcon,
  Globe,
  HardDrive,
  Layers,
  Lightbulb,
  LineChart as LineChartIcon,
  MemoryStick,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

import Features from "../components/features";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";
import { estimateApiStress, upgradedConfig } from "../utils/estimator";
import { formatNumber, makeReportText } from "../utils/helpers";

/* ---------------------------------------------------------------------------
   Constants
--------------------------------------------------------------------------- */

const initialConfig = {
  endpoint: "https://api.acme.dev/v1/orders",
  method: "GET",
  runtime: "Node.js",
  baseResponseTime: 140,
  concurrentUsers: 850,
  cpuCores: 8,
  ramGb: 16,
  dbType: "Postgres",
  hostingType: "Kubernetes",
  cacheEnabled: true,
};

const METHODS = ["GET", "POST", "PUT", "DELETE"];
const METHOD_STYLES = {
  GET: "data-[on=true]:bg-emerald-500 data-[on=true]:text-white",
  POST: "data-[on=true]:bg-blue-500 data-[on=true]:text-white",
  PUT: "data-[on=true]:bg-amber-500 data-[on=true]:text-white",
  DELETE: "data-[on=true]:bg-red-500 data-[on=true]:text-white",
};

const MODES = [
  { name: "Constant Traffic", icon: Activity, hint: "Steady, predictable load" },
  { name: "Gradual Growth", icon: TrendingUp, hint: "Slowly increasing users" },
  { name: "Sudden Spike", icon: Zap, hint: "Instant surge (launch, viral)" },
  { name: "Random Burst", icon: Flame, hint: "Unpredictable bursts" },
];

const CHART_COLORS = {
  latency: "#3b82f6",
  cpu: "#8b5cf6",
  ram: "#06b6d4",
  error: "#ef4444",
  safe: "#f59e0b",
  grid: "rgba(148,163,184,0.2)",
};

/* ---------------------------------------------------------------------------
   Small presentational pieces
--------------------------------------------------------------------------- */

const card = "rounded-2xl border border-(--border) bg-(--card)";
const inputCls =
  "w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-[13px] text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25";
const labelCls = "mb-1 block text-[12px] font-medium text-(--muted-foreground)";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-(--primary)" : "bg-(--border)"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function SliderRow({ label, value, display, min, max, step = 1, onChange, accent = "accent-(--primary)" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="font-medium text-(--muted-foreground)">{label}</span>
        <span className="font-bold tabular-nums text-(--foreground)">{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`w-full ${accent}`} />
    </div>
  );
}

// Radial health gauge (SVG donut)
function HealthGauge({ score }) {
  const pct = Math.round(score);
  const tone = pct >= 75 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
  const verdict = pct >= 75 ? "Healthy" : pct >= 45 ? "Under Pressure" : "Critical";
  const R = 64;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative grid place-items-center">
      <svg width="168" height="168" viewBox="0 0 168 168">
        <circle cx="84" cy="84" r={R} fill="none" stroke="currentColor" strokeOpacity="0.09" strokeWidth="14" />
        <circle
          cx="84" cy="84" r={R} fill="none"
          stroke={tone} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * C} ${C}`}
          transform="rotate(-90 84 84)"
          style={{ transition: "stroke-dasharray .6s cubic-bezier(.4,0,.2,1), stroke .3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tabular-nums text-(--foreground)">{pct}</span>
        <span className="text-[11px] font-medium text-(--muted-foreground)">/ 100</span>
        <span className="mt-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ color: tone, background: `${tone}1a` }}>
          {verdict}
        </span>
      </div>
    </div>
  );
}

function MeterBar({ label, value, display, tone, icon: Icon }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-(--muted-foreground)">
          <Icon className="h-3.5 w-3.5" style={{ color: tone }} /> {label}
        </span>
        <span className="font-bold tabular-nums text-(--foreground)">{display}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-(--muted)/60">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(value, 100)}%`, background: tone }} />
      </div>
    </div>
  );
}

const chartTooltip = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--foreground)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontWeight: 600 },
};

const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export const App = () => {
  const [config, setConfig] = useState(initialConfig);
  const [traffic, setTraffic] = useState(1800);
  const [mode, setMode] = useState("Constant Traffic");
  const [blackFridayMode, setBlackFridayMode] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => estimateApiStress(config, traffic, mode, blackFridayMode), [config, traffic, mode, blackFridayMode]);
  const compareMetrics = useMemo(
    () => (compareEnabled ? estimateApiStress(upgradedConfig(config), traffic, mode, blackFridayMode) : null),
    [compareEnabled, config, traffic, mode, blackFridayMode],
  );
  const reportText = useMemo(
    () => makeReportText({ config, traffic, mode, blackFridayMode, metrics }),
    [config, traffic, mode, blackFridayMode, metrics],
  );

  const set = (patch) => setConfig((c) => ({ ...c, ...patch }));

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: "api-stress-report.txt" });
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  };

  const overLimit = traffic > metrics.safeTrafficLimit;
  const headroom = Math.max(0, Math.round(metrics.safeTrafficLimit - traffic));

  // Plain-language summary for non-experts
  const summary = overLimit
    ? `At ${formatNumber(traffic)} requests/sec your API is past its safe limit of ${formatNumber(metrics.safeTrafficLimit)} req/s. Expect ~${formatNumber(metrics.responseTime, 0)} ms responses, ${formatNumber(metrics.errorRate, 1)}% errors, and the main problem will be ${metrics.bottleneckCause.toLowerCase()}.`
    : `At ${formatNumber(traffic)} requests/sec your API responds in ~${formatNumber(metrics.responseTime, 0)} ms and stays ${metrics.healthScore >= 75 ? "comfortably healthy" : "workable but stressed"}. You still have room for about ${formatNumber(headroom)} more req/s before hitting the safe limit.`;

  const KPI_TILES = [
    { label: "Estimated Response Time", value: `${formatNumber(metrics.responseTime, 0)} ms`, pct: Math.min((metrics.responseTime / 2000) * 100, 100), tone: "#3b82f6", icon: Timer, hint: "How long one request takes" },
    { label: "CPU Usage", value: `${formatNumber(metrics.cpuUsage, 1)}%`, pct: metrics.cpuUsage, tone: metrics.cpuUsage > 85 ? "#ef4444" : "#8b5cf6", icon: Cpu, hint: "Processor load at this traffic" },
    { label: "RAM Usage", value: `${formatNumber(metrics.ramUsagePercent, 1)}%`, pct: metrics.ramUsagePercent, tone: metrics.ramUsagePercent > 85 ? "#ef4444" : "#06b6d4", icon: MemoryStick, hint: "Memory pressure" },
    { label: "Error Rate", value: `${formatNumber(metrics.errorRate, 2)}%`, pct: metrics.errorRate, tone: "#ef4444", icon: AlertTriangle, hint: "Requests likely to fail" },
    { label: "Timeout Risk", value: metrics.timeoutRisk, pct: metrics.timeoutRiskScore, tone: "#f59e0b", icon: GaugeIcon, hint: "Chance of slow/never responses" },
    { label: "Crash Probability", value: `${formatNumber(metrics.crashProbability, 1)}%`, pct: metrics.crashProbability, tone: "#f43f5e", icon: Flame, hint: "Risk of full outage" },
  ];

  return (
    <div className="min-h-screen bg-(--background) px-3 py-6 text-(--foreground) antialiased sm:px-5 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* ================================================= header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <GaugeIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">API Stress Estimator</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--card) px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Instant · no real traffic sent
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-(--muted-foreground)">Predict how your API behaves before real traffic hits it.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3.5 py-2 text-[13px] font-medium hover:bg-(--muted)/60 transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy Report"}
            </button>
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2 text-[13px] font-semibold text-white hover:bg-(--primary)/90 transition-colors">
              <Download className="h-4 w-4" /> Download Report
            </button>
          </div>
        </header>

        {/* ================================================= summary strip */}
        <div className={`${card} flex flex-col gap-3 p-4 sm:flex-row sm:items-center`}>
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${overLimit ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
            {overLimit ? <AlertTriangle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </span>
          <p className="text-[13px] leading-relaxed text-(--foreground)">{summary}</p>
        </div>

        {/* ================================================= main grid */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* -------- left: configuration -------- */}
          <aside className="space-y-5 xl:col-span-4">
            {/* API config */}
            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-(--muted-foreground)" />
                <h2 className="text-[14px] font-bold">Your API Setup</h2>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelCls}>Endpoint URL</label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--muted-foreground)" />
                    <input value={config.endpoint} onChange={(e) => set({ endpoint: e.target.value })} className={`${inputCls} pl-9 font-mono text-[12px]`} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>HTTP Method</label>
                  <div className="grid grid-cols-4 gap-1 rounded-xl border border-(--border) bg-(--muted)/40 p-1">
                    {METHODS.map((m) => (
                      <button key={m} type="button" data-on={config.method === m} onClick={() => set({ method: m })}
                        className={`rounded-lg py-1.5 font-mono text-[11px] font-bold text-(--muted-foreground) transition-colors ${METHOD_STYLES[m]}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Runtime</label>
                    <select value={config.runtime} onChange={(e) => set({ runtime: e.target.value })} className={inputCls}>
                      {["Node.js", "Python", "Go", "Java"].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Database</label>
                    <select value={config.dbType} onChange={(e) => set({ dbType: e.target.value })} className={inputCls}>
                      {["Postgres", "MySQL", "MongoDB", "Redis"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Hosting</label>
                    <select value={config.hostingType} onChange={(e) => set({ hostingType: e.target.value })} className={inputCls}>
                      {["VPS", "Serverless", "Kubernetes", "Dedicated"].map((h) => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Base response (ms)</label>
                    <input type="number" min="10" max="5000" value={config.baseResponseTime} onChange={(e) => set({ baseResponseTime: Number(e.target.value) || 10 })} className={inputCls} />
                  </div>
                </div>

                <SliderRow label="CPU Cores" value={config.cpuCores} display={`${config.cpuCores} cores`} min={1} max={64} onChange={(v) => set({ cpuCores: v })} />
                <SliderRow label="RAM" value={config.ramGb} display={`${config.ramGb} GB`} min={1} max={256} onChange={(v) => set({ ramGb: v })} />
                <SliderRow label="Concurrent Users" value={config.concurrentUsers} display={formatNumber(config.concurrentUsers)} min={50} max={20000} step={50} onChange={(v) => set({ concurrentUsers: v })} />

                <div className="flex items-center justify-between rounded-xl border border-(--border) bg-(--muted)/30 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-(--primary)" />
                    <div>
                      <p className="text-[13px] font-semibold">Cache (Redis)</p>
                      <p className="text-[11px] text-(--muted-foreground)">Cuts repeated compute & DB load</p>
                    </div>
                  </div>
                  <Toggle checked={config.cacheEnabled} onChange={() => set({ cacheEnabled: !config.cacheEnabled })} />
                </div>
              </div>
            </section>

            {/* Traffic */}
            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-(--muted-foreground)" />
                <h2 className="text-[14px] font-bold">Traffic Scenario</h2>
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-(--border) bg-(--muted)/30 p-3 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Incoming traffic</p>
                  <p className="mt-0.5 text-3xl font-extrabold tabular-nums text-(--primary)">{formatNumber(traffic)}</p>
                  <p className="text-[11px] text-(--muted-foreground)">requests / second</p>
                  <input type="range" min={100} max={12000} step={100} value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} className="mt-2 w-full accent-(--primary)" />
                  <div className="flex justify-between text-[10px] text-(--muted-foreground)"><span>100</span><span>12,000</span></div>
                </div>

                <div>
                  <label className={labelCls}>Traffic pattern</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MODES.map(({ name, icon: Icon, hint }) => {
                      const on = mode === name;
                      return (
                        <button key={name} type="button" onClick={() => setMode(name)}
                          className={`rounded-xl border p-2.5 text-left transition-colors ${on ? "border-(--primary) bg-(--primary)/10" : "border-(--border) hover:bg-(--muted)/40"}`}>
                          <Icon className={`h-4 w-4 ${on ? "text-(--primary)" : "text-(--muted-foreground)"}`} />
                          <p className={`mt-1 text-[12px] font-semibold ${on ? "text-(--primary)" : "text-(--foreground)"}`}>{name}</p>
                          <p className="text-[10px] leading-tight text-(--muted-foreground)">{hint}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-(--border) bg-(--muted)/30 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-[13px] font-semibold">Black Friday mode</p>
                      <p className="text-[11px] text-(--muted-foreground)">+42% peak-sale traffic surge</p>
                    </div>
                  </div>
                  <Toggle checked={blackFridayMode} onChange={() => setBlackFridayMode((v) => !v)} />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-(--border) bg-(--muted)/30 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-violet-500" />
                    <div>
                      <p className="text-[13px] font-semibold">Compare upgraded setup</p>
                      <p className="text-[11px] text-(--muted-foreground)">+2 cores, +8 GB, cache & better hosting</p>
                    </div>
                  </div>
                  <Toggle checked={compareEnabled} onChange={() => setCompareEnabled((v) => !v)} />
                </div>
              </div>
            </section>
          </aside>

          {/* -------- right: results -------- */}
          <div className="space-y-5 xl:col-span-8">
            {/* health + key numbers */}
            <section className={`${card} p-5`}>
              <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[auto_1fr]">
                <HealthGauge score={metrics.healthScore} />
                <div className="min-w-0">
                  <h2 className="text-[15px] font-bold">API Health Score</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-(--muted-foreground)">
                    One number for how your API copes with this traffic — combining speed, resource pressure, and failure risk.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-(--border) p-3">
                      <p className="text-[11px] text-(--muted-foreground)">Safe Traffic Limit</p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{formatNumber(metrics.safeTrafficLimit)} <span className="text-[11px] font-medium text-(--muted-foreground)">req/s</span></p>
                    </div>
                    <div className="rounded-xl border border-(--border) p-3">
                      <p className="text-[11px] text-(--muted-foreground)">Headroom left</p>
                      <p className={`mt-0.5 text-lg font-bold tabular-nums ${overLimit ? "text-red-500" : "text-(--foreground)"}`}>
                        {overLimit ? `−${formatNumber(traffic - metrics.safeTrafficLimit)}` : `+${formatNumber(headroom)}`} <span className="text-[11px] font-medium text-(--muted-foreground)">req/s</span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-(--border) p-3">
                      <p className="text-[11px] text-(--muted-foreground)">Likely bottleneck</p>
                      <p className="mt-0.5 truncate text-[13px] font-bold text-(--foreground)">{metrics.bottleneckCause}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* KPI tiles */}
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {KPI_TILES.map((k) => (
                <div key={k.label} className={`${card} p-3.5`} title={k.hint}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-(--muted-foreground)">{k.label}</span>
                    <k.icon className="h-3.5 w-3.5" style={{ color: k.tone }} />
                  </div>
                  <p className="mt-1.5 text-lg font-bold tabular-nums leading-none">{k.value}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--muted)/60">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(k.pct, 100)}%`, background: k.tone }} />
                  </div>
                  <p className="mt-1.5 text-[10px] leading-tight text-(--muted-foreground)">{k.hint}</p>
                </div>
              ))}
            </section>

            {/* compare */}
            {compareMetrics && (
              <section className={`${card} p-4`}>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-violet-500" />
                  <h2 className="text-[14px] font-bold">Current vs Upgraded Setup</h2>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Response time", cur: `${formatNumber(metrics.responseTime, 0)} ms`, up: `${formatNumber(compareMetrics.responseTime, 0)} ms`, better: compareMetrics.responseTime < metrics.responseTime },
                    { label: "CPU usage", cur: `${formatNumber(metrics.cpuUsage, 1)}%`, up: `${formatNumber(compareMetrics.cpuUsage, 1)}%`, better: compareMetrics.cpuUsage < metrics.cpuUsage },
                    { label: "Health score", cur: `${formatNumber(metrics.healthScore, 0)}`, up: `${formatNumber(compareMetrics.healthScore, 0)}`, better: compareMetrics.healthScore > metrics.healthScore },
                  ].map((row) => (
                    <div key={row.label} className="rounded-xl border border-(--border) p-3">
                      <p className="text-[11px] text-(--muted-foreground)">{row.label}</p>
                      <div className="mt-1 flex items-center gap-2 text-[14px] font-bold">
                        <span className="text-(--muted-foreground)">{row.cur}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-(--muted-foreground)" />
                        <span className={row.better ? "text-emerald-600 dark:text-emerald-400" : "text-(--foreground)"}>{row.up}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* charts */}
            <section className={`${card} p-4`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4 text-(--muted-foreground)" />
                  <h2 className="text-[14px] font-bold">Response Time vs Traffic</h2>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-(--muted-foreground)">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.latency }} /> Latency</span>
                  <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3" style={{ background: CHART_COLORS.safe }} /> Safe limit</span>
                  <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-(--primary)" /> You are here</span>
                </div>
              </div>
              <p className="mt-1 text-[12px] text-(--muted-foreground)">Watch how response time curves upward as traffic grows — the bend past the orange line is where users start feeling it.</p>
              <div className="mt-3 h-56 w-full">
                <SafeResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="aseLat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.latency} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={CHART_COLORS.latency} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="rps" {...axisProps} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <YAxis {...axisProps} width={44} tickFormatter={(v) => `${v}ms`} />
                    <Tooltip {...chartTooltip} formatter={(v) => [`${formatNumber(v)} ms`, "Latency"]} labelFormatter={(v) => `${formatNumber(v)} req/s`} />
                    <ReferenceLine x={metrics.safeTrafficLimit} stroke={CHART_COLORS.safe} strokeDasharray="5 4" strokeWidth={1.5} />
                    <ReferenceLine x={traffic} stroke="var(--primary)" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="latency" stroke={CHART_COLORS.latency} strokeWidth={2.5} fill="url(#aseLat)" />
                  </AreaChart>
                </SafeResponsiveContainer>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <section className={`${card} p-4`}>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-(--muted-foreground)" />
                  <h2 className="text-[14px] font-bold">CPU & RAM vs Traffic</h2>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-(--muted-foreground)">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.cpu }} /> CPU</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS.ram }} /> RAM</span>
                  <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3" style={{ background: CHART_COLORS.error }} /> Danger 85%</span>
                </div>
                <div className="mt-3 h-48 w-full">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.chartData} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                      <XAxis dataKey="rps" {...axisProps} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                      <YAxis {...axisProps} width={38} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip {...chartTooltip} formatter={(v, name) => [`${formatNumber(v, 1)}%`, name === "cpu" ? "CPU" : "RAM"]} labelFormatter={(v) => `${formatNumber(v)} req/s`} />
                      <ReferenceLine y={85} stroke={CHART_COLORS.error} strokeDasharray="5 4" />
                      <Line type="monotone" dataKey="cpu" stroke={CHART_COLORS.cpu} strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="ram" stroke={CHART_COLORS.ram} strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </SafeResponsiveContainer>
                </div>
              </section>

              <section className={`${card} p-4`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-(--muted-foreground)" />
                  <h2 className="text-[14px] font-bold">Error Rate vs Traffic</h2>
                </div>
                <p className="mt-1 text-[12px] text-(--muted-foreground)">Errors stay near zero until resources saturate — then they climb fast.</p>
                <div className="mt-3 h-48 w-full">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.chartData} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="aseErr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.error} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={CHART_COLORS.error} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                      <XAxis dataKey="rps" {...axisProps} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                      <YAxis {...axisProps} width={38} tickFormatter={(v) => `${v}%`} />
                      <Tooltip {...chartTooltip} formatter={(v) => [`${formatNumber(v, 2)}%`, "Error rate"]} labelFormatter={(v) => `${formatNumber(v)} req/s`} />
                      <ReferenceLine x={traffic} stroke="var(--primary)" strokeWidth={1.5} />
                      <Area type="monotone" dataKey="error" stroke={CHART_COLORS.error} strokeWidth={2.5} fill="url(#aseErr)" />
                    </AreaChart>
                  </SafeResponsiveContainer>
                </div>
              </section>
            </div>

            {/* risk meters + suggestions */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <section className={`${card} p-4`}>
                <div className="flex items-center gap-2">
                  <GaugeIcon className="h-4 w-4 text-(--muted-foreground)" />
                  <h2 className="text-[14px] font-bold">Risk Meters</h2>
                </div>
                <div className="mt-4 space-y-4">
                  <MeterBar label="CPU pressure" value={metrics.cpuUsage} display={`${formatNumber(metrics.cpuUsage, 1)}%`} tone={metrics.cpuUsage > 85 ? "#ef4444" : "#8b5cf6"} icon={Cpu} />
                  <MeterBar label="Memory pressure" value={metrics.ramUsagePercent} display={`${formatNumber(metrics.ramUsagePercent, 1)}%`} tone={metrics.ramUsagePercent > 85 ? "#ef4444" : "#06b6d4"} icon={MemoryStick} />
                  <MeterBar label="Timeout risk" value={metrics.timeoutRiskScore} display={metrics.timeoutRisk} tone="#f59e0b" icon={Timer} />
                  <MeterBar label="Crash probability" value={metrics.crashProbability} display={`${formatNumber(metrics.crashProbability, 1)}%`} tone="#f43f5e" icon={Flame} />
                </div>
              </section>

              <section className={`${card} p-4`}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <h2 className="text-[14px] font-bold">How to improve</h2>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {metrics.suggestions.map((s) => (
                    <li key={s} className="flex gap-2 rounded-xl border border-(--border) bg-(--muted)/30 p-3 text-[12px] leading-relaxed text-(--foreground)">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary)" />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Features />
    </div>
  );
};

export default App;
