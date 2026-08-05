// src/app/tradeon/components/landing/MarketInsights.jsx
"use client";

import { useMemo } from "react";
import {
  LineChart,
  BrainCircuit,
  Clock,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

const SCENARIO_TEMPLATES = [
  { t: "{s} momentum is strengthening in this model snapshot", tag: "Momentum" },
  { t: "{s} volatility compression may precede a wider move", tag: "Volatility" },
  { t: "{s} is testing a model-derived price level", tag: "Levels" },
  { t: "{s} has mixed signals across the selected horizons", tag: "Model" },
  { t: "{s} price action calls for confirmation and risk controls", tag: "Risk" },
  { t: "{s} remains on the illustrative monitoring list", tag: "Watchlist" },
];

const CALENDAR = [
  { time: "13:30", event: "US CPI (YoY)", impact: "High", country: "US" },
  { time: "15:00", event: "Fed Chair Speech", impact: "High", country: "US" },
  { time: "18:00", event: "Crude Oil Inventories", impact: "Med", country: "US" },
  { time: "07:00", event: "UK GDP (QoQ)", impact: "Med", country: "UK" },
  { time: "05:30", event: "RBI Rate Decision", impact: "High", country: "IN" },
];

const IMPACT_COLOR = { High: "var(--tdn-down)", Med: "var(--tdn-amber)", Low: "var(--tdn-muted)" };

export default function MarketInsights({ data = [] }) {
  const news = useMemo(() => {
    const movers = [...data].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6);
    return movers.map((d, i) => {
      const tpl = SCENARIO_TEMPLATES[i % SCENARIO_TEMPLATES.length];
      const isPositive = d.changePct >= 0;
      return {
        title: tpl.t.replace("{s}", d.name),
        tag: tpl.tag,
        sentiment: isPositive ? "Positive" : "Negative",
        isPositive,
        color: isPositive ? "var(--tdn-up)" : "var(--tdn-down)",
      };
    });
  }, [data]);

  const read = useMemo(() => {
    const adv = data.filter((d) => d.changePct > 0).length;
    const pct = data.length ? Math.round((adv / data.length) * 100) : 50;
    const tone = pct >= 60 ? "constructive" : pct >= 45 ? "mixed" : "defensive";
    const leaders = [...data].sort((a, b) => b.changePct - a.changePct).slice(0, 2).map((d) => d.symbol).join(" & ");
    const laggards = [...data].sort((a, b) => a.changePct - b.changePct).slice(0, 2).map((d) => d.symbol).join(" & ");
    return { pct, tone, leaders, laggards };
  }, [data]);

  return (
    <section className="tdn-container tdn-section-tight bg-transparent w-full">
      {/* Section Header */}
      <div className="mb-5">
        <span className="tdn-eyebrow text-[0.62rem] uppercase tracking-widest text-[var(--tdn-iris-2)] font-bold">
          Market Intelligence
        </span>
        <h2 className="tdn-display text-xl sm:text-2xl mt-0.5 font-bold tracking-tight" style={{ color: "var(--tdn-fg-strong)" }}>
          Model scenarios &amp; market breadth
        </h2>
      </div>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">

        {/* Left Column: Scenarios */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[var(--tdn-iris-2)]">
                <LineChart size={16} />
              </div>
              <span className="text-sm font-bold tracking-wide" style={{ color: "var(--tdn-fg-strong)" }}>
                Illustrative Market Scenarios
              </span>
            </div>

            {/* Scenarios List with dynamic icons */}
            <div className="flex flex-col">
              {news.map((n, i) => (
                <article
                  key={i}
                  className="group relative flex items-start gap-3 py-3 px-1.5 border-b border-slate-200 dark:border-white/10 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all rounded-r-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="tdn-chip !py-0.5 !px-2 !text-[0.6rem] font-semibold tracking-wider">
                        {n.tag}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[0.6rem] font-bold px-1.5 py-0.5 rounded tracking-wide"
                        style={{
                          color: n.color,
                          background: `color-mix(in srgb, ${n.color} 12%, transparent)`,
                        }}
                      >
                        {n.isPositive ? <TrendingUp size={10} /> : <AlertTriangle size={10} />}
                        {n.sentiment}
                      </span>
                    </div>
                    <p className="text-[0.84rem] leading-snug font-medium transition-colors group-hover:text-[var(--tdn-iris-2)]" style={{ color: "var(--tdn-fg)" }}>
                      {n.title}
                    </p>
                  </div>
                  <span className="text-[0.62rem] font-mono shrink-0 pt-0.5 uppercase tracking-wider opacity-70" style={{ color: "var(--tdn-faint)" }}>
                    Model
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Read + Calendar Watchlist */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full gap-6">

          {/* Market Summary Panel with BrainCircuit AI Icon */}
          <div className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="relative flex items-center justify-center p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/15 text-[var(--tdn-iris-2)] border border-indigo-500/20 shadow-sm">
                <BrainCircuit size={18} className="animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-wide block" style={{ color: "var(--tdn-fg-strong)" }}>
                  Market Summary
                </span>
              </div>
            </div>

            <p className="text-[0.84rem] leading-relaxed font-normal" style={{ color: "var(--tdn-muted)" }}>
              Breadth is <strong className="font-bold text-[var(--tdn-fg-strong)]">{read.pct}% advancing</strong>, reflecting a{" "}
              <strong className="font-bold text-[var(--tdn-fg-strong)]">{read.tone}</strong> tone. Leadership sits with{" "}
              <strong className="font-bold text-[var(--tdn-up)]">{read.leaders}</strong>, while{" "}
              <strong className="font-bold text-[var(--tdn-down)]">{read.laggards}</strong> lag. The model favours
              patience where signals are mixed.
            </p>
          </div>

          {/* Event Watchlist with Clock Icon */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[var(--tdn-iris-2)]">
                  <Clock size={16} />
                </div>
                <span className="text-sm font-bold tracking-wide" style={{ color: "var(--tdn-fg-strong)" }}>
                  Event Watchlist
                </span>
              </div>
              <span className="text-[0.62rem] font-mono uppercase tracking-wider opacity-60" style={{ color: "var(--tdn-faint)" }}>
                Sample
              </span>
            </div>

            {/* Event List */}
            <div className="flex flex-col justify-between flex-1 mt-1">
              {CALENDAR.map((c) => (
                <div
                  key={c.event}
                  className="flex items-center gap-2.5 py-2.5 px-1 border-b border-slate-200 dark:border-white/10 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span className="tdn-mono text-[0.7rem] w-11 shrink-0 font-bold" style={{ color: "var(--tdn-faint)" }}>
                    {c.time}
                  </span>
                  <span className="text-[0.62rem] font-black w-6 shrink-0 tracking-wider" style={{ color: "var(--tdn-muted)" }}>
                    {c.country}
                  </span>
                  <span className="text-xs flex-1 truncate font-semibold" style={{ color: "var(--tdn-fg)" }}>
                    {c.event}
                  </span>
                  <span
                    className="text-[0.6rem] font-bold px-2 py-0.5 rounded shrink-0 shadow-xs"
                    style={{
                      color: IMPACT_COLOR[c.impact],
                      background: `color-mix(in srgb, ${IMPACT_COLOR[c.impact]} 15%, transparent)`,
                    }}
                  >
                    {c.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
