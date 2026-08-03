// src/app/tradeon/components/landing/Hero.jsx
// Premium "command deck" hero — a clear value proposition paired with a live
// featured market panel, then a supporting metrics strip (sentiment · breadth ·
// top signal) and an index snapshot. Professional trading-platform hierarchy
// (live data first), Tradeon branding and design tokens throughout.
"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, Gauge, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { predict } from "../../lib/ai";
import { assetHref, formatCompact, formatPct, formatPrice } from "../../lib/format";
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
  const assetClasses = new Set(data.map((d) => d.assetClass)).size || 6;

  const featuredPred = featured ? predict(featured) : null;
  const topPick = data
    .map((d) => ({ d, p: predict(d) }))
    .filter((x) => x.p.signal !== "HOLD")
    .sort((a, b) => b.p.confidence - a.p.confidence)[0];
  const topGainer = data.length ? [...data].sort((a, b) => b.changePct - a.changePct)[0] : null;

  return (
    <section className="tdn-container pt-5 pb-4">
      {/* ── Hero band: value proposition + live featured panel ── */}
      <div className="grid lg:grid-cols-12 gap-5 lg:gap-8 items-center mb-4">
        {/* Value proposition */}
        <div className="lg:col-span-5">
          <span className="tdn-chip !py-1 !text-[0.72rem]">
            <span className="tdn-dot" style={{ color: "var(--tdn-up)" }} /> Real-time markets · Explainable AI
          </span>
          <h1 className="tdn-display text-[2rem] sm:text-[2.5rem] leading-[1.06] mt-3.5" style={{ color: "var(--tdn-fg-strong)" }}>
            The financial <span className="tdn-gradient-text">intelligence</span> platform
          </h1>
          <p className="mt-3.5 text-sm sm:text-[0.98rem] leading-relaxed max-w-xl" style={{ color: "var(--tdn-muted)" }}>
            Explore public crypto prices and illustrative multi-asset scenarios, run a multi-screen chart
            workspace, and review explainable buy / sell / hold predictions — across stocks, crypto, forex,
            commodities, ETFs &amp; indices.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <Link href="/tradeon/dashboard" className="tdn-btn tdn-btn-primary">
              <Zap size={16} /> Open Dashboard
            </Link>
            <a href="#markets" className="tdn-btn tdn-btn-ghost">
              <BarChart3 size={15} /> Explore Markets
            </a>
          </div>

          {/* Trust / scale strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 pt-5 border-t" style={{ borderColor: "var(--tdn-border)" }}>
            <div>
              <div className="tdn-mono text-lg font-bold leading-none" style={{ color: "var(--tdn-fg-strong)" }}>{data.length || "150"}+</div>
              <div className="text-[0.66rem] mt-1" style={{ color: "var(--tdn-faint)" }}>Instruments</div>
            </div>
            <div>
              <div className="tdn-mono text-lg font-bold leading-none" style={{ color: "var(--tdn-fg-strong)" }}>{assetClasses}</div>
              <div className="text-[0.66rem] mt-1" style={{ color: "var(--tdn-faint)" }}>Asset classes</div>
            </div>
            <div>
              <div className="tdn-mono text-lg font-bold leading-none flex items-baseline gap-1.5">
                <span style={{ color: "var(--tdn-up)" }}>{advancers}</span>
                <span className="text-xs" style={{ color: "var(--tdn-faint)" }}>/</span>
                <span style={{ color: "var(--tdn-down)" }}>{decliners}</span>
              </div>
              <div className="text-[0.66rem] mt-1" style={{ color: "var(--tdn-faint)" }}>Adv / Dec today</div>
            </div>
          </div>
        </div>

        {/* Live featured panel */}
        <div className="lg:col-span-7">
          <div className="tdn-card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}>BTC · Bitcoin</span>
                  <MarketStatusBadge status={status} />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="tdn-mono text-2xl font-bold" style={{ color: "var(--tdn-fg-strong)" }}>
                    {featured ? <LiveValue value={featured.price} /> : "—"}
                  </span>
                  {featured && <DeltaPill value={featured.changePct} />}
                </div>
              </div>
              <Link href={assetHref("BTC")} className="tdn-btn tdn-btn-soft !py-1.5 !px-3 !text-xs gap-1.5 self-start">
                View asset <ArrowUpRight size={14} />
              </Link>
            </div>

            <MiniChart
              symbol="BTC"
              chartType="area"
              defaultTf="1d"
              timeframes={["1h", "1d", "1w", "1M"]}
              height={172}
              prediction={featuredPred}
              className="mt-2"
            />

            {/* OHLC strip */}
            <div className="grid grid-cols-4 gap-2 mt-2.5 pt-3 border-t" style={{ borderColor: "var(--tdn-border)" }}>
              {featured &&
                [
                  ["Open", formatPrice(featured.open)],
                  ["High", formatPrice(featured.high)],
                  ["Low", formatPrice(featured.low)],
                  ["24h Vol", `$${formatCompact(featured.volume)}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[0.62rem] uppercase tracking-wide" style={{ color: "var(--tdn-faint)" }}>{k}</div>
                    <div className="tdn-mono text-xs font-semibold mt-0.5" style={{ color: "var(--tdn-fg)" }}>{v}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Supporting metrics: sentiment · breadth · top signal ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="tdn-card p-3 flex flex-col items-center justify-center">
          <div className="tdn-eyebrow text-[0.58rem] mb-1">Fear &amp; Greed</div>
          <FearGreedGauge value={fg} size={128} />
        </div>

        <div className="tdn-card p-3.5 flex flex-col">
          <div className="tdn-eyebrow text-[0.58rem] mb-2">Market breadth</div>
          <div className="flex items-end gap-1 mb-1.5">
            <span className="tdn-mono text-2xl font-bold" style={{ color: "var(--tdn-up)" }}>{advancers}</span>
            <span className="text-xs mb-1" style={{ color: "var(--tdn-faint)" }}>adv</span>
            <span className="flex-1" />
            <span className="tdn-mono text-2xl font-bold" style={{ color: "var(--tdn-down)" }}>{decliners}</span>
            <span className="text-xs mb-1" style={{ color: "var(--tdn-faint)" }}>dec</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--tdn-down-soft)" }}>
            <div style={{ width: `${breadthPct}%`, background: "var(--tdn-up)" }} />
          </div>
          <div className="mt-auto pt-2.5 flex items-center justify-between text-[0.68rem]" style={{ color: "var(--tdn-muted)" }}>
            <span>{breadthPct}% advancing</span>
            <span className={breadthPct >= 50 ? "tdn-up" : "tdn-down"}>{breadthPct >= 50 ? "Risk-on" : "Risk-off"}</span>
          </div>
        </div>

        {/* Right pair — two stacked cards fill the 2-column area (no empty space) */}
        <div className="sm:col-span-2 grid grid-rows-2 gap-3">
          {/* Top AI signal */}
          {topPick && (
            <Link href={assetHref(topPick.d.symbol)} className="tdn-card tdn-lift p-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                style={{
                  background: topPick.p.signal === "BUY" ? "var(--tdn-up-soft)" : "var(--tdn-down-soft)",
                  color: topPick.p.signal === "BUY" ? "var(--tdn-up)" : "var(--tdn-down)",
                }}
              >
                {topPick.p.signal === "BUY" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="tdn-chip tdn-chip-brand !py-0.5 !px-2 !text-[0.58rem]">
                  <Gauge size={10} /> Top signal
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{topPick.d.symbol}</span>
                  <span className="text-xs truncate" style={{ color: "var(--tdn-faint)" }}>{topPick.d.name}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold" style={{ color: topPick.p.signal === "BUY" ? "var(--tdn-up)" : "var(--tdn-down)" }}>{topPick.p.signal}</div>
                <div className="text-[0.64rem]" style={{ color: "var(--tdn-faint)" }}>{topPick.p.confidence}% conf.</div>
              </div>
              <ArrowUpRight size={15} style={{ color: "var(--tdn-faint)" }} />
            </Link>
          )}

          {/* Top gainer — biggest 24h mover */}
          {topGainer && (
            <Link href={assetHref(topGainer.symbol)} className="tdn-card tdn-lift p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: "var(--tdn-up-soft)", color: "var(--tdn-up)" }}>
                <TrendingUp size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="tdn-eyebrow text-[0.56rem]">Top gainer · 24h</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{topGainer.symbol}</span>
                  <span className="text-xs truncate" style={{ color: "var(--tdn-faint)" }}>{topGainer.name}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="tdn-mono text-sm font-bold tdn-up">{formatPct(topGainer.changePct)}</div>
                <div className="tdn-mono text-[0.64rem]" style={{ color: "var(--tdn-faint)" }}>
                  <LiveValue value={topGainer.price} currency={topGainer.assetClass === "forex" ? "" : "$"} />
                </div>
              </div>
              <ArrowUpRight size={15} style={{ color: "var(--tdn-faint)" }} />
            </Link>
          )}
        </div>
      </div>

      {/* ── Index snapshot strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
        {indices.map((d) => (
          <Link key={d.symbol} href={assetHref(d.symbol)} className="tdn-card tdn-lift p-2.5 block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</span>
              <span className={`tdn-mono text-[0.68rem] font-semibold ${d.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>
                {formatPct(d.changePct)}
              </span>
            </div>
            <div className="tdn-mono text-sm font-semibold mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
              <LiveValue value={d.price} currency="" forceDecimals={0} />
            </div>
            <MiniChart symbol={d.symbol} chartType="area" defaultTf="1d" minimal showFullscreen={false} height={42} className="mt-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
