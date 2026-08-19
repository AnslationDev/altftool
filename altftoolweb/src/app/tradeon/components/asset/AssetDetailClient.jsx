// src/app/tradeon/components/asset/AssetDetailClient.jsx
// Professional asset / company detail page — a financial-terminal layout. The
// live chart is the primary focal point, followed by a compact key-statistics
// band, an explainable Prediction & Analysis section (factor scorecard + trade
// plan + plain-language reasoning), tabbed data, a news feed and a right sidebar.
// All existing data (live snapshot, prediction, fundamentals) is preserved.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Maximize2, Plus, Gauge, Star, TrendingUp } from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { useNews } from "../../hooks/useNews";
import { predict } from "../../lib/ai";
import { getFundamentals } from "../../lib/fundamentals";
import { INSTRUMENTS, symbolFromSlug } from "../../lib/instruments";
import { assetHref, formatCap, formatCompact, formatPct, formatPrice } from "../../lib/format";
import TradeonHeader from "../landing/TradeonHeader";
import TradeonFooter from "../landing/TradeonFooter";
import MiniChart from "../chart/MiniChart";
import DeltaPill from "../shared/DeltaPill";
import LiveValue from "../shared/LiveValue";
import MarketStatusBadge from "../shared/MarketStatusBadge";
import Ring from "../shared/Ring";
import Sparkline from "../shared/Sparkline";
import { RecentNewsView } from "../news/RecentNews";

const SIGNAL_COLOR = { BUY: "var(--tdn-up)", SELL: "var(--tdn-down)", HOLD: "var(--tdn-amber)" };
const SIG = {
  bullish: { c: "var(--tdn-up)", label: "Bullish" },
  bearish: { c: "var(--tdn-down)", label: "Bearish" },
  neutral: { c: "var(--tdn-amber)", label: "Neutral" },
};
const CHART_TYPES = ["Candlestick", "Line", "Area", "OHLC", "Volume"];
const TIMEFRAMES = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "All"];
const INDICATORS = ["EMA", "SMA", "RSI", "MACD", "Bollinger", "VWAP"];
// Map the detail-page period/type selectors onto the shared candle engine.
const A_TYPE_MAP = { Candlestick: "candlestick", Line: "line", Area: "area", OHLC: "ohlc", Volume: "candlestick" };
const A_TF_MAP = { "1D": "5m", "5D": "30m", "1M": "4h", "3M": "1d", "6M": "1d", "1Y": "1w", "5Y": "1M", All: "1Y" };
const TABS = ["Overview", "Financials", "Technical Analysis", "Predictions", "News", "Historical Data", "Fundamentals", "Holdings", "Earnings", "Dividends", "Related Assets"];

/* ---------- small building blocks ---------- */
function Stat({ label, value, tone }) {
  return (
    <div className="tdn-card px-3 py-2">
      <div className="text-[0.62rem] uppercase tracking-wide" style={{ color: "var(--tdn-faint)" }}>{label}</div>
      <div className="tdn-mono text-[0.9rem] font-bold mt-0.5" style={{ color: tone || "var(--tdn-fg-strong)" }}>{value}</div>
    </div>
  );
}

function OHLCItem({ label, value, tone }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[0.62rem]" style={{ color: "var(--tdn-faint)" }}>{label}</span>
      <span className="tdn-mono text-[0.72rem] font-semibold" style={{ color: tone || "var(--tdn-fg-strong)" }}>{value}</span>
    </span>
  );
}

function Bar({ label, value, color, max = 100, fmt }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span style={{ color: "var(--tdn-muted)" }}>{label}</span>
        <span className="tdn-mono font-semibold" style={{ color: color || "var(--tdn-fg-strong)" }}>{fmt ? fmt(value) : value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--tdn-fg) 8%, transparent)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color || "var(--tdn-iris)" }} />
      </div>
    </div>
  );
}

function FactorRow({ f }) {
  const s = SIG[f.signal] || SIG.neutral;
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.c }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{f.label}</span>
          <span className="text-[0.62rem] font-bold shrink-0" style={{ color: s.c }}>{s.label}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-16 h-1 rounded-full overflow-hidden shrink-0" style={{ background: "color-mix(in srgb, var(--tdn-fg) 9%, transparent)" }}>
            <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: s.c }} />
          </div>
          <span className="text-[0.64rem] truncate" style={{ color: "var(--tdn-faint)" }}>{f.note}</span>
        </div>
      </div>
    </div>
  );
}

function SidebarCard({ title, icon: Icon, children }) {
  return (
    <section className="tdn-card p-3">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={13} style={{ color: "var(--tdn-iris-2)" }} />}
        <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{title}</span>
      </div>
      {children}
    </section>
  );
}

function MiniList({ rows }) {
  return (
    <div className="space-y-0.5">
      {rows.map((d) => (
        <Link key={d.symbol} href={assetHref(d.symbol)} className="flex items-center gap-2 py-1 px-1 rounded-md hover:bg-[color-mix(in_srgb,var(--tdn-iris)_7%,transparent)]">
          <span className="text-xs font-semibold w-14 shrink-0" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</span>
          <Sparkline data={d.spark} width={44} height={16} color={d.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"} />
          <span className="ml-auto tdn-mono text-[0.7rem] font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{formatPrice(d.price, { currency: d.assetClass === "forex" ? "" : "$" })}</span>
          <span className={`tdn-mono text-[0.64rem] font-semibold w-12 text-right ${d.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>{formatPct(d.changePct)}</span>
        </Link>
      ))}
    </div>
  );
}

function Row2({ k, v, c }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "var(--tdn-border)" }}>
      <span className="text-xs" style={{ color: "var(--tdn-muted)" }}>{k}</span>
      <span className="tdn-mono text-xs font-semibold" style={{ color: c || "var(--tdn-fg-strong)" }}>{v}</span>
    </div>
  );
}

/* ---------- page ---------- */
export default function AssetDetailClient({ symbol: symbolProp, defaultTab }) {
  const params = useParams();
  const symbol = symbolProp || symbolFromSlug(Array.isArray(params.symbol) ? params.symbol[0] : params.symbol || "BTC");
  const { data, status } = useMarketData();
  const inst = data.find((d) => d.symbol === symbol) || null;

  // Live news for the Recent News blocks (fetched once, shared by both spots).
  const { articles: liveNews, loading: newsLoading } = useNews();
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const [tab, setTab] = useState(defaultTab || "Overview");
  const [chartType, setChartType] = useState("Candlestick");
  const [timeframe, setTimeframe] = useState("1D");
  const [indicators, setIndicators] = useState(["EMA"]);
  const [watching, setWatching] = useState(false);

  const p = useMemo(() => (inst ? predict(inst) : null), [inst]);
  const f = useMemo(() => (inst ? getFundamentals(inst) : null), [inst]);
  const cur = inst && inst.assetClass === "forex" ? "" : "$";

  const trending = useMemo(() => [...data].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 5), [data]);
  const similar = useMemo(() => data.filter((d) => d.assetClass === inst?.assetClass && d.symbol !== symbol).slice(0, 5), [data, inst, symbol]);
  const indices = useMemo(() => data.filter((d) => d.assetClass === "indices").slice(0, 4), [data]);

  const toggleInd = (i) => setIndicators((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  const zone = (v) => `${formatPrice(v * 0.9975, { currency: cur })} – ${formatPrice(v * 1.0025, { currency: cur })}`;

  if (!inst || !p || !f) {
    return (
      <div className="tradeon-root min-h-screen flex flex-col">
        <TradeonHeader data={data} status={status} />
        <main className="tdn-paper flex-1">
          <div className="tdn-container py-6 space-y-3">
            <div className="tdn-skeleton rounded-xl h-11 w-1/2" />
            <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
              <div className="space-y-3">
                <div className="tdn-skeleton rounded-xl" style={{ height: 420 }} />
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => <div key={i} className="tdn-skeleton rounded-lg h-14" />)}
                </div>
                <div className="tdn-skeleton rounded-xl h-64" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="tdn-skeleton rounded-xl h-28" />)}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const price = formatPrice(inst.price, { currency: cur });

  return (
    <div className="tradeon-root min-h-screen flex flex-col">
      <TradeonHeader data={data} status={status} />

      {/* Sticky market header — responsive: secondary text collapses on small screens */}
      <div className="sticky top-[94px] z-40 tdn-topbar">
        <div className="tdn-container py-2 flex items-center gap-x-3 gap-y-1.5 flex-wrap">
          <Link href="/tradeon#markets" className="tdn-btn tdn-btn-icon !w-8 !h-8 shrink-0" aria-label="Back to markets"><ChevronLeft size={16} /></Link>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-bold leading-none shrink-0" style={{ color: "var(--tdn-fg-strong)" }}>{inst.symbol}</h1>
            <span className="text-xs truncate hidden md:inline" style={{ color: "var(--tdn-muted)" }}>{inst.name}</span>
            <span className="tdn-chip !py-0.5 !px-2 !text-[0.6rem] shrink-0 hidden sm:inline-flex">{f.exchange}</span>
            <MarketStatusBadge status={status} />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 shrink-0">
            <span className="tdn-mono text-base sm:text-xl font-bold" style={{ color: "var(--tdn-fg-strong)" }}><LiveValue value={inst.price} currency={cur} /></span>
            <DeltaPill value={inst.changePct} />
          </div>
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <button onClick={() => setWatching((w) => !w)} className="tdn-btn tdn-btn-ghost !py-1.5 !px-2.5 text-xs" style={watching ? { color: "var(--tdn-amber)", borderColor: "color-mix(in srgb, var(--tdn-amber) 40%, transparent)" } : undefined} aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}>
              <Star size={14} fill={watching ? "var(--tdn-amber)" : "none"} /> <span className="hidden sm:inline">{watching ? "Watching" : "Watchlist"}</span>
            </button>
            <a href="#predictions" className="tdn-btn tdn-btn-soft !py-1.5 !px-2.5 text-xs"><Gauge size={14} /> <span className="hidden sm:inline">Signal model</span></a>
          </div>
        </div>
      </div>

      {/* Educational-data disclaimer (compliance, from main) */}
      <div className="tdn-container pt-2">
        <p className="tdn-inset px-3 py-2 text-[0.68rem]" style={{ color: "var(--tdn-muted)" }}>
          Crypto quotes use a public market feed when available. Non-crypto prices, fundamentals, scenarios and model signals are illustrative educational data.
        </p>
      </div>

      {/* Content area only — theme-aware surface (tdn-paper: white in light, dark in dark); header/topbar/footer keep the app theme */}
      <main className="tdn-paper flex-1">
        <div className="tdn-container py-3 grid lg:grid-cols-[1fr_320px] gap-4 items-start">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-3">
          {/* PRIMARY CHART — focal point */}
          <section className="tdn-card p-3">
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <div className="flex items-center gap-0.5 tdn-inset p-0.5">
                {CHART_TYPES.map((t) => (
                  <button key={t} onClick={() => setChartType(t)} className="px-2 py-1 rounded text-[0.7rem] font-semibold"
                    style={{ background: chartType === t ? "var(--tdn-iris)" : "transparent", color: chartType === t ? "#fff" : "var(--tdn-muted)" }}>{t}</button>
                ))}
              </div>
              <div className="flex items-center gap-0.5 ml-auto">
                <Link href={`/tradeon/chart/${encodeURIComponent(inst.symbol)}`} className="tdn-btn tdn-btn-soft !py-1 !px-2.5 !text-xs gap-1 ml-1" title="Open full-screen chart">
                  <Maximize2 size={13} /> Full Chart
                </Link>
              </div>
            </div>

            {/* OHLC readout above the chart (terminal-style) */}
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <OHLCItem label="O" value={formatPrice(inst.open, { currency: cur })} />
              <OHLCItem label="H" value={formatPrice(inst.high, { currency: cur })} tone="var(--tdn-up)" />
              <OHLCItem label="L" value={formatPrice(inst.low, { currency: cur })} tone="var(--tdn-down)" />
              <OHLCItem label="C" value={price} />
              <OHLCItem label="Vol" value={inst.volume ? formatCompact(inst.volume) : "—"} />
              <span className={`tdn-mono text-[0.72rem] font-semibold ${inst.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>{formatPct(inst.changePct)}</span>
            </div>

            <div className="flex items-center gap-1 flex-wrap mb-2">
              {TIMEFRAMES.map((tf) => (
                <button key={tf} onClick={() => setTimeframe(tf)} className="px-2 py-0.5 rounded text-[0.7rem] font-semibold tdn-mono"
                  style={{ background: timeframe === tf ? "color-mix(in srgb, var(--tdn-iris) 16%, transparent)" : "transparent", color: timeframe === tf ? "var(--tdn-iris-2)" : "var(--tdn-faint)" }}>{tf}</button>
              ))}
              <span className="w-px h-4 mx-1" style={{ background: "var(--tdn-border)" }} />
              <span className="text-[0.62rem] flex items-center gap-1" style={{ color: "var(--tdn-faint)" }}><Plus size={11} /> Indicators</span>
              {INDICATORS.map((i) => (
                <button key={i} onClick={() => toggleInd(i)} className="px-1.5 py-0.5 rounded text-[0.62rem] font-semibold"
                  style={{ background: indicators.includes(i) ? "var(--tdn-iris)" : "color-mix(in srgb, var(--tdn-fg) 5%, transparent)", color: indicators.includes(i) ? "#fff" : "var(--tdn-faint)" }}>{i}</button>
              ))}
            </div>

            <MiniChart
              symbol={inst.symbol}
              chartType={A_TYPE_MAP[chartType] || "candlestick"}
              tf={A_TF_MAP[timeframe] || "1d"}
              indicators={[...indicators.map((i) => (i === "Bollinger" ? "BB" : i)), "Volume"]}
              height={420}
              showFullscreen={false}
            />
          </section>

          {/* KEY STATISTICS band */}
          <section className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <Stat label="Market Cap" value={f.stats.marketCap ? formatCap(f.stats.marketCap, cur) : "—"} />
            <Stat label="P/E" value={f.stats.pe.toFixed(2)} />
            <Stat label="EPS" value={formatPrice(f.stats.eps, { currency: cur })} />
            <Stat label="Beta" value={f.stats.beta.toFixed(2)} />
            <Stat label="ROE" value={`${f.stats.roe.toFixed(1)}%`} />
            <Stat label="Div Yield" value={f.stats.dividendYield ? `${f.stats.dividendYield.toFixed(2)}%` : "—"} />
            <Stat label="Avg Vol" value={formatCompact(f.stats.avgVolume)} />
            <Stat label="Open" value={formatPrice(f.stats.open, { currency: cur })} />
            <Stat label="Prev Close" value={formatPrice(f.stats.prevClose, { currency: cur })} />
            <Stat label="Day High" value={formatPrice(f.stats.dayHigh, { currency: cur })} tone="var(--tdn-up)" />
            <Stat label="Day Low" value={formatPrice(f.stats.dayLow, { currency: cur })} tone="var(--tdn-down)" />
            <Stat label="52W High" value={formatPrice(f.stats.week52High, { currency: cur })} tone="var(--tdn-up)" />
            <Stat label="52W Low" value={formatPrice(f.stats.week52Low, { currency: cur })} tone="var(--tdn-down)" />
            <Stat label="Volume" value={f.stats.volume ? formatCompact(f.stats.volume) : "—"} />
          </section>

          {/* PREDICTION & ANALYSIS */}
          <section id="predictions" className="tdn-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}><Gauge size={15} style={{ color: "var(--tdn-iris-2)" }} /> Prediction &amp; Analysis</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: SIGNAL_COLOR[p.signal], background: `color-mix(in srgb, ${SIGNAL_COLOR[p.signal]} 14%, transparent)` }}>{p.signal} · {p.confidence}% confidence</span>
            </div>

            {/* Rings + Buy/Hold/Sell */}
            <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
              <div className="flex items-center gap-3 justify-center">
                <Ring value={p.confidence} size={92} color={SIGNAL_COLOR[p.signal]} label="Confidence" />
                <Ring value={p.risk} size={76} color={p.risk > 65 ? "var(--tdn-down)" : p.risk > 40 ? "var(--tdn-amber)" : "var(--tdn-up)"} label="Risk" suffix="" />
                <Ring value={p.trendStrength} size={76} color="var(--tdn-cyan)" label="Trend" suffix="" />
              </div>
              <div className="space-y-2">
                <Bar label="Buy" value={p.probabilities.buy} color="var(--tdn-up)" fmt={(v) => `${v}%`} />
                <Bar label="Hold" value={p.probabilities.hold} color="var(--tdn-amber)" fmt={(v) => `${v}%`} />
                <Bar label="Sell" value={p.probabilities.sell} color="var(--tdn-down)" fmt={(v) => `${v}%`} />
                <div className="flex items-center gap-2 pt-0.5 text-[0.68rem]" style={{ color: "var(--tdn-muted)" }}>
                  <span>Short-term: <strong style={{ color: "var(--tdn-fg-strong)" }}>{p.outlook.short}</strong></span>
                  <span>·</span>
                  <span>Long-term: <strong style={{ color: "var(--tdn-fg-strong)" }}>{p.outlook.long}</strong></span>
                </div>
              </div>
            </div>

            {/* Factor scorecard — the "why" */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="tdn-eyebrow text-[0.6rem]">Why this outlook</span>
                <span className="flex items-center gap-2 text-[0.64rem] font-semibold">
                  <span style={{ color: "var(--tdn-up)" }}>{p.factorTally.bullish} bullish</span>
                  <span style={{ color: "var(--tdn-amber)" }}>{p.factorTally.neutral} neutral</span>
                  <span style={{ color: "var(--tdn-down)" }}>{p.factorTally.bearish} bearish</span>
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-5 tdn-inset px-3 py-1">
                {p.factors.map((fac) => <FactorRow key={fac.label} f={fac} />)}
              </div>
            </div>

            {/* Trade plan */}
            <div className="mt-4">
              <span className="tdn-eyebrow text-[0.6rem]">Trade plan</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                {[
                  ["Entry Zone", zone(p.levels.entry), "var(--tdn-fg-strong)"],
                  ["Target Zone", zone(p.levels.target), "var(--tdn-up)"],
                  ["Stop Loss", formatPrice(p.levels.stop, { currency: cur }), "var(--tdn-down)"],
                  ["Support", formatPrice(p.levels.support, { currency: cur }), "var(--tdn-muted)"],
                  ["Resistance", formatPrice(p.levels.resistance, { currency: cur }), "var(--tdn-muted)"],
                  ["Risk / Reward", `${p.levels.rr}:1`, "var(--tdn-iris-2)"],
                ].map(([k, v, c]) => (
                  <div key={k} className="tdn-inset px-2.5 py-1.5">
                    <div className="text-[0.6rem] uppercase tracking-wide" style={{ color: "var(--tdn-faint)" }}>{k}</div>
                    <div className="tdn-mono text-[0.78rem] font-bold" style={{ color: c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                <Stat label="Risk level" value={p.risk > 65 ? "High" : p.risk > 40 ? "Moderate" : "Low"} tone={p.risk > 65 ? "var(--tdn-down)" : p.risk > 40 ? "var(--tdn-amber)" : "var(--tdn-up)"} />
                <Stat label="Technical rating" value={`${p.technical}/100`} />
                <Stat label="Fundamental rating" value={`${p.fundamental}/100`} />
              </div>
            </div>

            {/* Plain-language explanation */}
            <div className="mt-3 tdn-inset p-3">
              <div className="text-xs font-semibold mb-1" style={{ color: "var(--tdn-fg-strong)" }}>Prediction Explanation</div>
              <p className="text-[0.82rem] leading-relaxed" style={{ color: "var(--tdn-muted)" }}>{p.explanation.summary.replace(/\*\*/g, "")} {p.explanation.confidenceNote}</p>
              <p className="text-[0.66rem] mt-2" style={{ color: "var(--tdn-faint)" }}>Analytical signal for information only — not financial advice.</p>
            </div>
          </section>

          {/* Information tabs */}
          <section className="tdn-card overflow-hidden">
            <div className="flex items-center gap-0.5 px-2 pt-2 overflow-x-auto tdn-scroll-hide border-b" style={{ borderColor: "var(--tdn-border)" }}>
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap"
                  style={{ color: tab === t ? "var(--tdn-fg-strong)" : "var(--tdn-muted)", borderBottom: tab === t ? "2px solid var(--tdn-iris)" : "2px solid transparent" }}>{t}</button>
              ))}
            </div>
            <div className="p-4">
              <TabContent tab={tab} inst={inst} p={p} f={f} cur={cur} similar={similar} liveNews={liveNews} newsLoading={newsLoading} now={now} />
            </div>
          </section>

          {/* Recent News — real, live, fully clickable (→ News Detail) with images */}
          <RecentNewsView articles={liveNews} loading={newsLoading} now={now} title="Recent News" limit={4} columns={2} />
        </div>

        {/* ---------- Right sidebar ---------- */}
        <aside className="space-y-3 lg:sticky lg:top-[161px]">
          <SidebarCard title="Illustrative signal summary" icon={Gauge}>
            <div className="flex items-center gap-3">
              <Ring value={p.confidence} size={62} stroke={6} color={SIGNAL_COLOR[p.signal]} suffix="%" />
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: SIGNAL_COLOR[p.signal] }}>{p.signal}</div>
                <div className="text-[0.66rem]" style={{ color: "var(--tdn-faint)" }}>{p.outlook.short} · {p.outlook.long}</div>
                <div className="text-[0.66rem] mt-1" style={{ color: "var(--tdn-muted)" }}>{p.factorTally.bullish}/{p.factors.length} bullish factors · educational model</div>
              </div>
            </div>
          </SidebarCard>

          <SidebarCard title="Market Summary" icon={TrendingUp}>
            <p className="text-[0.76rem] leading-relaxed" style={{ color: "var(--tdn-muted)" }}>
              {inst.name} is trading {inst.changePct >= 0 ? "up" : "down"} {Math.abs(inst.changePct).toFixed(2)}% on the session. Technical rating {p.technical}/100, fundamentals {p.fundamental}/100. Sector: {f.sector}.
            </p>
          </SidebarCard>

          <SidebarCard title="Trending Assets" icon={TrendingUp}><MiniList rows={trending} /></SidebarCard>
          <SidebarCard title={inst.assetClass === "stocks" ? "Similar Stocks" : "Similar Assets"}><MiniList rows={similar} /></SidebarCard>
          <SidebarCard title="Watchlist" icon={Star}><MiniList rows={data.filter((d) => ["BTC", "ETH", "AAPL", "NVDA"].includes(d.symbol))} /></SidebarCard>

          <SidebarCard title="Recent News">
            <RecentNewsView articles={liveNews} loading={newsLoading} now={now} variant="list" limit={4} showHeader={false} />
          </SidebarCard>

          <SidebarCard title="Related Markets"><MiniList rows={indices} /></SidebarCard>
        </aside>
        </div>
      </main>

      <TradeonFooter status={status} />
    </div>
  );
}

/* ---------- tab content ---------- */
function TabContent({ tab, inst, p, f, cur, similar, liveNews, newsLoading, now }) {
  if (tab === "Overview") {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-semibold mb-2" style={{ color: "var(--tdn-fg-strong)" }}>About {inst.name}</div>
          <p className="text-[0.84rem] leading-relaxed" style={{ color: "var(--tdn-muted)" }}>
            {inst.name} ({inst.symbol}) trades on {f.exchange} in the {f.sector} space. It carries a market cap of {f.stats.marketCap ? formatCap(f.stats.marketCap, cur) : "n/a"}, a P/E of {f.stats.pe.toFixed(1)} and a beta of {f.stats.beta.toFixed(2)}. Tradeon's model currently rates it {p.ratingLabel.toLowerCase()}.
          </p>
        </div>
        <div>
          <Row2 k="Signal" v={`${p.signal} · ${p.confidence}%`} c={SIGNAL_COLOR[p.signal]} />
          <Row2 k="Technical rating" v={`${p.technical}/100`} />
          <Row2 k="RSI (14)" v={p.metrics.rsi} />
          <Row2 k="Volatility" v={`${p.metrics.volatility}%`} />
          <Row2 k="52-week range" v={`${formatPrice(f.stats.week52Low, { currency: cur })} – ${formatPrice(f.stats.week52High, { currency: cur })}`} />
        </div>
      </div>
    );
  }
  if (tab === "Financials") {
    const fn = f.financials;
    return (
      <div className="grid md:grid-cols-3 gap-4">
        <div><div className="tdn-eyebrow text-[0.58rem] mb-1">Income</div><Row2 k="Revenue" v={formatCap(fn.revenue, cur)} /><Row2 k="Net income" v={formatCap(fn.netIncome, cur)} c="var(--tdn-up)" /><Row2 k="Net margin" v={`${(fn.netMargin * 100).toFixed(1)}%`} /><Row2 k="Gross margin" v={`${(fn.grossMargin * 100).toFixed(1)}%`} /></div>
        <div><div className="tdn-eyebrow text-[0.58rem] mb-1">Balance sheet</div><Row2 k="Total assets" v={formatCap(fn.totalAssets, cur)} /><Row2 k="Total liabilities" v={formatCap(fn.totalLiabilities, cur)} /><Row2 k="Debt / equity" v={fn.debtToEquity.toFixed(2)} /></div>
        <div><div className="tdn-eyebrow text-[0.58rem] mb-1">Cash flow</div><Row2 k="Operating CF" v={formatCap(fn.cashFlow, cur)} c="var(--tdn-up)" /><Row2 k="EPS" v={formatPrice(f.stats.eps, { currency: cur })} /><Row2 k="ROE" v={`${f.stats.roe.toFixed(1)}%`} /></div>
      </div>
    );
  }
  if (tab === "Technical Analysis") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Bar label="Technical rating" value={p.technical} color="var(--tdn-iris)" fmt={(v) => `${v}/100`} />
          <Bar label="Trend strength" value={p.trendStrength} color="var(--tdn-cyan)" fmt={(v) => `${v}/100`} />
          <Bar label="RSI (14)" value={p.metrics.rsi} color={p.metrics.rsi > 70 ? "var(--tdn-down)" : p.metrics.rsi < 30 ? "var(--tdn-up)" : "var(--tdn-amber)"} fmt={(v) => v} />
        </div>
        <div>
          <Row2 k="MACD" v={p.metrics.trend >= 0 ? "Bullish" : "Bearish"} c={p.metrics.trend >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"} />
          <Row2 k="Moving averages" v={p.signal === "BUY" ? "Buy" : p.signal === "SELL" ? "Sell" : "Neutral"} c={SIGNAL_COLOR[p.signal]} />
          <Row2 k="Support" v={formatPrice(p.levels.support, { currency: cur })} />
          <Row2 k="Resistance" v={formatPrice(p.levels.resistance, { currency: cur })} />
          <Row2 k="Pivot" v={formatPrice((p.levels.support + p.levels.resistance) / 2, { currency: cur })} />
        </div>
      </div>
    );
  }
  if (tab === "Predictions") {
    return (
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="flex flex-col items-center"><Ring value={p.probabilities.buy} size={92} color="var(--tdn-up)" label="Buy" /></div>
        <div className="flex flex-col items-center"><Ring value={p.probabilities.hold} size={92} color="var(--tdn-amber)" label="Hold" /></div>
        <div className="flex flex-col items-center"><Ring value={p.probabilities.sell} size={92} color="var(--tdn-down)" label="Sell" /></div>
        <div className="sm:col-span-3 tdn-inset p-3 text-[0.82rem] leading-relaxed" style={{ color: "var(--tdn-muted)" }}>{p.explanation.summary.replace(/\*\*/g, "")}</div>
      </div>
    );
  }
  if (tab === "News") {
    return <RecentNewsView articles={liveNews} loading={newsLoading} now={now} variant="list" limit={8} showHeader={false} />;
  }
  if (tab === "Historical Data") {
    const rows = inst.spark.slice(-10).reverse().map((v, i) => ({ day: `T-${i}`, close: v, open: v * (1 - 0.004), high: v * 1.006, low: v * 0.994 }));
    return (
      <div className="overflow-x-auto"><table className="tdn-table min-w-[420px]">
        <thead><tr><th>Period</th><th className="text-right">Open</th><th className="text-right">High</th><th className="text-right">Low</th><th className="text-right">Close</th></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.day}><td>{r.day}</td><td className="text-right tdn-mono">{formatPrice(r.open, { currency: cur })}</td><td className="text-right tdn-mono">{formatPrice(r.high, { currency: cur })}</td><td className="text-right tdn-mono">{formatPrice(r.low, { currency: cur })}</td><td className="text-right tdn-mono font-semibold">{formatPrice(r.close, { currency: cur })}</td></tr>))}</tbody>
      </table></div>
    );
  }
  if (tab === "Fundamentals") {
    return (
      <div className="grid sm:grid-cols-2 gap-x-6">
        <div><Row2 k="P/E ratio" v={f.stats.pe.toFixed(2)} /><Row2 k="EPS" v={formatPrice(f.stats.eps, { currency: cur })} /><Row2 k="Beta" v={f.stats.beta.toFixed(2)} /><Row2 k="ROE" v={`${f.stats.roe.toFixed(1)}%`} /></div>
        <div><Row2 k="Dividend yield" v={f.stats.dividendYield ? `${f.stats.dividendYield.toFixed(2)}%` : "—"} /><Row2 k="Net margin" v={`${(f.financials.netMargin * 100).toFixed(1)}%`} /><Row2 k="Debt / equity" v={f.financials.debtToEquity.toFixed(2)} /><Row2 k="Market cap" v={f.stats.marketCap ? formatCap(f.stats.marketCap, cur) : "—"} /></div>
      </div>
    );
  }
  if (tab === "Holdings") {
    return (
      <div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="Institutional" value={`${f.ownership.institutional.toFixed(1)}%`} />
          <Stat label="Insider" value={`${f.ownership.insider.toFixed(1)}%`} />
          <Stat label="Top 5 holders" value={`${f.ownership.holders.reduce((a, b) => a + b.pct, 0).toFixed(1)}%`} />
        </div>
        {f.ownership.holders.map((h) => (<Row2 key={h.name} k={h.name} v={`${h.pct.toFixed(2)}%`} />))}
      </div>
    );
  }
  if (tab === "Earnings") {
    return (
      <div className="overflow-x-auto"><table className="tdn-table min-w-[420px]">
        <thead><tr><th>Quarter</th><th className="text-right">Estimate EPS</th><th className="text-right">Actual EPS</th><th className="text-right">Result</th></tr></thead>
        <tbody>{f.earnings.map((e) => (<tr key={e.q}><td>{e.q}</td><td className="text-right tdn-mono">{formatPrice(e.estimate, { currency: cur })}</td><td className="text-right tdn-mono font-semibold">{formatPrice(e.actual, { currency: cur })}</td><td className="text-right"><span className="text-[0.66rem] font-bold" style={{ color: e.beat ? "var(--tdn-up)" : "var(--tdn-down)" }}>{e.beat ? "Beat" : "Miss"}</span></td></tr>))}</tbody>
      </table></div>
    );
  }
  if (tab === "Dividends") {
    if (!f.dividends.length) return <p className="text-sm" style={{ color: "var(--tdn-faint)" }}>This asset does not pay a dividend.</p>;
    return (
      <div className="overflow-x-auto"><table className="tdn-table min-w-[380px]">
        <thead><tr><th>Period</th><th className="text-right">Amount</th><th className="text-right">Yield</th><th className="text-right">Status</th></tr></thead>
        <tbody>{f.dividends.map((d) => (<tr key={d.month}><td>{d.month}</td><td className="text-right tdn-mono">{formatPrice(d.amount, { currency: cur })}</td><td className="text-right tdn-mono">{d.yield.toFixed(2)}%</td><td className="text-right"><span className="text-[0.66rem] font-semibold" style={{ color: d.status === "Paid" ? "var(--tdn-up)" : "var(--tdn-amber)" }}>{d.status}</span></td></tr>))}</tbody>
      </table></div>
    );
  }
  if (tab === "Related Assets") return <MiniList rows={similar} />;
  return null;
}
