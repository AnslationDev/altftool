// src/app/tradeon/components/landing/Hero.jsx
// Compact, information-dense "command deck" hero — professional trading-platform
// hierarchy (live markets first), not a SaaS marketing splash. No gradient text,
// modest headings, standard container width.
"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { predict } from "../../lib/ai";
import { formatCompact, formatPct, formatPrice } from "../../lib/format";
import MiniChart from "../chart/MiniChart";
import DeltaPill from "../shared/DeltaPill";
import FearGreedGauge from "../shared/FearGreedGauge";
import LiveValue from "../shared/LiveValue";
import MarketStatusBadge from "../shared/MarketStatusBadge";

const INDEX_SYMBOLS = ["SPX", "NDX", "DJI", "NIFTY", "FTSE", "N225"];

export default function Hero({ data = [], status = "live" }) {
  const featured = data.find((d) => d.symbol === "BTC");
  const indices = INDEX_SYMBOLS.map((s) => data.find((d) => d.symbol === s)).filter(Boolean);

  const advancers = data.filter((d) => d.changePct > 0).length;
  const decliners = data.filter((d) => d.changePct < 0).length;
  const breadthPct = data.length ? Math.round((advancers / data.length) * 100) : 50;
  const fg = data.length ? Math.max(2, Math.min(98, Math.round(28 + breadthPct * 0.6))) : 50;

  const featuredPred = featured ? predict(featured) : null;
  const topPick = data
    .map((d) => ({ d, p: predict(d) }))
    .filter((x) => x.p.signal !== "HOLD")
    .sort((a, b) => b.p.confidence - a.p.confidence)[0];

  return (
    <section className="tdn-container pt-4 pb-3">
      {/* Value proposition + primary actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="max-w-2xl">
          <span className="tdn-chip !py-1 !text-[0.72rem]">
            <span className="tdn-dot" style={{ color: "var(--tdn-up)" }} /> Real-time markets · Explainable predictions
          </span>
          <h1 className="tdn-display text-[1.6rem] sm:text-[2rem] mt-2.5" style={{ color: "var(--tdn-fg-strong)" }}>
The financial intelligence platform
          </h1>
          <p className="mt-1.5 text-sm sm:text-[0.95rem] leading-relaxed" style={{ color: "var(--tdn-muted)" }}>
            Explore public crypto prices and illustrative multi-asset scenarios, run a multi-screen chart workspace, and review explainable
            buy/sell/hold predictions — across stocks, crypto, forex, commodities, ETFs & indices.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/tradeon/dashboard" className="tdn-btn tdn-btn-primary">
            <Zap size={16} /> Dashboard
          </Link>
          <a href="#predictions" className="tdn-btn tdn-btn-ghost">
            <Sparkles size={15} /> Predictions
          </a>
        </div>
      </div>

      {/* Command deck */}
      <div className="grid lg:grid-cols-12 gap-3">
        {/* Featured chart */}
        <div className="tdn-card p-3.5 lg:col-span-7">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}>BTC · Bitcoin</span>
                <MarketStatusBadge status={status} />
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="tdn-mono text-xl font-bold" style={{ color: "var(--tdn-fg-strong)" }}>
                  {featured ? <LiveValue value={featured.price} /> : "—"}
                </span>
                {featured && <DeltaPill value={featured.changePct} />}
              </div>
            </div>
          </div>

          <MiniChart
            symbol="BTC"
            chartType="area"
            defaultTf="1d"
            timeframes={["1h", "1d", "1w", "1M"]}
            height={150}
            prediction={featuredPred}
            className="mt-1"
          />

          {/* OHLC / signal strip */}
          <div className="grid grid-cols-4 gap-2 mt-2 pt-2.5 border-t" style={{ borderColor: "var(--tdn-border)" }}>
            {featured &&
              [
                ["Open", formatPrice(featured.open)],
                ["High", formatPrice(featured.high)],
                ["Low", formatPrice(featured.low)],
                ["24h Vol", `$${formatCompact(featured.volume)}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[0.62rem] uppercase tracking-wide" style={{ color: "var(--tdn-faint)" }}>{k}</div>
                  <div className="tdn-mono text-xs font-semibold" style={{ color: "var(--tdn-fg)" }}>{v}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Right rail: sentiment · breadth · AI pick */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <div className="tdn-card p-3 flex flex-col items-center justify-center">
            <div className="tdn-eyebrow text-[0.58rem] mb-0.5">Fear &amp; Greed</div>
            <FearGreedGauge value={fg} size={132} />
          </div>

          <div className="tdn-card p-3 flex flex-col">
            <div className="tdn-eyebrow text-[0.58rem] mb-2">Market breadth</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="tdn-mono text-2xl font-bold" style={{ color: "var(--tdn-up)" }}>{advancers}</span>
              <span className="text-xs mb-1" style={{ color: "var(--tdn-faint)" }}>adv</span>
              <span className="flex-1" />
              <span className="tdn-mono text-2xl font-bold" style={{ color: "var(--tdn-down)" }}>{decliners}</span>
              <span className="text-xs mb-1" style={{ color: "var(--tdn-faint)" }}>dec</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--tdn-down-soft)" }}>
              <div style={{ width: `${breadthPct}%`, background: "var(--tdn-up)" }} />
            </div>
            <div className="mt-auto pt-2 flex items-center justify-between text-[0.68rem]" style={{ color: "var(--tdn-muted)" }}>
              <span>{breadthPct}% advancing</span>
              <span className={breadthPct >= 50 ? "tdn-up" : "tdn-down"}>{breadthPct >= 50 ? "Risk-on" : "Risk-off"}</span>
            </div>
          </div>

          {/* AI top pick */}
          {topPick && (
            <a href="#predictions" className="tdn-card tdn-card-hover p-3 col-span-2 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
                style={{
                  background: topPick.p.signal === "BUY" ? "var(--tdn-up-soft)" : "var(--tdn-down-soft)",
                  color: topPick.p.signal === "BUY" ? "var(--tdn-up)" : "var(--tdn-down)",
                }}
              >
                {topPick.p.signal === "BUY" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="tdn-chip tdn-chip-brand !py-0.5 !px-2 !text-[0.6rem]">
                    <Sparkles size={10} /> Top signal
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{topPick.d.symbol}</span>
                  <span className="text-xs truncate" style={{ color: "var(--tdn-faint)" }}>{topPick.d.name}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold" style={{ color: topPick.p.signal === "BUY" ? "var(--tdn-up)" : "var(--tdn-down)" }}>
                  {topPick.p.signal}
                </div>
                <div className="text-[0.66rem]" style={{ color: "var(--tdn-faint)" }}>{topPick.p.confidence}% confidence</div>
              </div>
              <ArrowUpRight size={16} style={{ color: "var(--tdn-faint)" }} />
            </a>
          )}
        </div>
      </div>

      {/* Index snapshot strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
        {indices.map((d) => (
          <div key={d.symbol} className="tdn-card p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</span>
              <span className={`tdn-mono text-[0.68rem] font-semibold ${d.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>
                {formatPct(d.changePct)}
              </span>
            </div>
            <div className="tdn-mono text-sm font-semibold mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
              <LiveValue value={d.price} currency="" forceDecimals={0} />
            </div>
            <MiniChart symbol={d.symbol} chartType="area" defaultTf="1d" minimal height={42} className="mt-1" />

          </div>
        ))}
      </div>
    </section>
  );
}
