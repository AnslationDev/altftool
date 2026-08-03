// src/app/tradeon/components/dashboard/widgets.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Flame,
  Gauge,
  Grid3x3,
  Newspaper,
  Snowflake,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { predict } from "../../lib/ai";
import { clamp, formatCompact, formatPrice } from "../../lib/format";
import { useNews } from "../../hooks/useNews";
import MiniChart from "../chart/MiniChart";
import NewsCard from "../news/NewsCard";
import DeltaPill from "../shared/DeltaPill";
import FearGreedGauge from "../shared/FearGreedGauge";
import LiveValue from "../shared/LiveValue";
import Sparkline from "../shared/Sparkline";

export function WidgetCard({ title, icon: Icon, children, className = "", right }) {
  return (
    <section className={`tdn-card p-4 flex flex-col ${className}`}>
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={15} style={{ color: "var(--tdn-iris-2)" }} />}
          <h3 className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
            {title}
          </h3>
        </div>
        {right}
      </header>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

export function StatTiles({ data }) {
  const picks = ["SPX", "NDX", "BTC", "XAU"].map((s) => data.find((d) => d.symbol === s)).filter(Boolean);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {picks.map((d) => (
        <div key={d.symbol} className="tdn-card p-3.5 tdn-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: "var(--tdn-muted)" }}>
              {d.symbol}
            </span>
            <DeltaPill value={d.changePct} showIcon={false} className="!text-[0.66rem] !py-0.5 !px-1.5" />
          </div>
          <div className="tdn-mono text-xl font-bold mt-1.5" style={{ color: "var(--tdn-fg-strong)" }}>
            <LiveValue value={d.price} currency={d.assetClass === "forex" ? "" : "$"} />
          </div>
          <Sparkline data={d.spark} width={160} height={30} className="w-full mt-1" color={d.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"} />
        </div>
      ))}
    </div>
  );
}

export function ChartWidget({ instrument }) {
  if (!instrument) return null;
  return (
    <WidgetCard
      title={`${instrument.symbol} · ${instrument.name}`}
      icon={TrendingUp}
      right={
        <div className="flex items-center gap-2 mr-auto ml-3">
          <span className="tdn-mono text-lg font-bold" style={{ color: "var(--tdn-fg-strong)" }}>
            <LiveValue value={instrument.price} currency={instrument.assetClass === "forex" ? "" : "$"} />
          </span>
          <DeltaPill value={instrument.changePct} />
        </div>
      }
    >
      <MiniChart symbol={instrument.symbol} chartType="candlestick" defaultTf="1d" timeframes={["1h", "1d", "1w", "1M"]} height={244} />
    </WidgetCard>
  );
}

export function WatchlistWidget({ data, symbols }) {
  const rows = symbols.map((s) => data.find((d) => d.symbol === s)).filter(Boolean);
  return (
    <WidgetCard title="Watchlist" icon={Sparkles}>
      <div className="space-y-1">
        {rows.map((d) => (
          <div key={d.symbol} className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-[color-mix(in_srgb,var(--tdn-iris)_6%,transparent)] transition-colors">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
                {d.symbol}
              </div>
              <div className="text-[0.7rem] truncate" style={{ color: "var(--tdn-faint)" }}>
                {d.name}
              </div>
            </div>
            <Sparkline data={d.spark} width={64} height={24} color={d.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"} />
            <div className="text-right w-24">
              <div className="tdn-mono text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
                <LiveValue value={d.price} currency={d.assetClass === "forex" ? "" : "$"} />
              </div>
              <DeltaPill value={d.changePct} showIcon={false} className="!text-[0.64rem] !py-0 !px-1" />
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function MoverColumn({ label, rows, icon: Icon, color }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color }}>
        <Icon size={13} /> {label}
      </div>
      <div className="space-y-1.5">
        {rows.map((d) => (
          <div key={d.symbol} className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
              {d.symbol}
            </span>
            <DeltaPill value={d.changePct} showIcon={false} className="!text-[0.66rem] !py-0.5 !px-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MoversWidget({ data }) {
  const sorted = [...data].sort((a, b) => b.changePct - a.changePct);
  const gainers = sorted.slice(0, 4);
  const losers = sorted.slice(-4).reverse();
  return (
    <WidgetCard title="Top Movers" icon={Flame}>
      <div className="grid grid-cols-2 gap-4">
        <MoverColumn label="Gainers" rows={gainers} icon={Flame} color="var(--tdn-up)" />
        <MoverColumn label="Losers" rows={losers} icon={Snowflake} color="var(--tdn-down)" />
      </div>
    </WidgetCard>
  );
}

export function FearGreedWidget({ data }) {
  const value = useMemo(() => {
    if (!data.length) return 50;
    const adv = data.filter((d) => d.changePct > 0).length;
    return clamp(Math.round(28 + (adv / data.length) * 58), 2, 98);
  }, [data]);
  return (
    <WidgetCard title="Fear & Greed" icon={Sparkles}>
      <div className="grid place-items-center h-full py-2">
        <FearGreedGauge value={value} size={190} />
      </div>
    </WidgetCard>
  );
}

export function HeatmapWidget({ data }) {
  const color = (pct) => {
    const c = clamp(pct, -4, 4);
    return c >= 0
      ? `color-mix(in srgb, var(--tdn-up) ${clamp(18 + c * 18, 12, 90)}%, var(--tdn-surface-solid))`
      : `color-mix(in srgb, var(--tdn-down) ${clamp(18 + -c * 18, 12, 90)}%, var(--tdn-surface-solid))`;
  };
  return (
    <WidgetCard title="Market Heatmap" icon={Grid3x3}>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
        {data.slice(0, 24).map((d) => (
          <div key={d.symbol} className="tdn-heat aspect-[4/3]" style={{ background: color(d.changePct) }} title={`${d.name} ${d.changePct.toFixed(2)}%`}>
            <span className="text-[0.66rem] font-bold" style={{ color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              {d.symbol}
            </span>
            <span className="tdn-mono text-[0.6rem] font-semibold" style={{ color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              {d.changePct >= 0 ? "+" : ""}
              {d.changePct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

export function NewsWidget() {
  const { articles, loading } = useNews();
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const items = articles.slice(0, 6);
  return (
    <WidgetCard
      title="Market News"
      icon={Newspaper}
      actions={false}
      right={<Link href="/tradeon/news" className="text-[0.68rem] font-semibold hover:underline" style={{ color: "var(--tdn-iris-2)" }}>View all →</Link>}
    >
      {loading && !items.length ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="tdn-skeleton rounded-lg h-16" />)}</div>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--tdn-border)" }}>
          {items.map((a) => (
            <div key={a.id} style={{ borderColor: "var(--tdn-border)" }}>
              <NewsCard article={a} now={now} variant="row" />
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

export function AIPredictionsWidget({ data }) {
  const rows = useMemo(() => data.slice(0, 6).map((d) => ({ d, p: predict(d) })), [data]);
  const color = { BUY: "var(--tdn-up)", SELL: "var(--tdn-down)", HOLD: "var(--tdn-amber)" };
  return (
    <WidgetCard title="Predictions" icon={Gauge}>
      <div className="space-y-1.5">
        {rows.map(({ d, p }) => (
          <div key={d.symbol} className="flex items-center gap-3 py-1">
            <span className="text-sm font-semibold w-16" style={{ color: "var(--tdn-fg-strong)" }}>
              {d.symbol}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden flex" style={{ background: "color-mix(in srgb, var(--tdn-fg) 8%, transparent)" }}>
              <div style={{ width: `${p.probabilities.buy}%`, background: "var(--tdn-up)" }} />
              <div style={{ width: `${p.probabilities.hold}%`, background: "var(--tdn-amber)" }} />
              <div style={{ width: `${p.probabilities.sell}%`, background: "var(--tdn-down)" }} />
            </div>
            <span className="text-xs font-bold w-20 text-right" style={{ color: color[p.signal] }}>
              {p.signal} {p.confidence}%
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
