// src/app/tradeon/components/landing/MarketInsights.jsx
"use client";

import { useMemo } from "react";
import { CalendarClock, Newspaper, Sparkles } from "lucide-react";

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
      return {
        title: tpl.t.replace("{s}", d.name),
        tag: tpl.tag,
        sentiment: d.changePct >= 0 ? "Positive" : "Negative",
        color: d.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)",
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
    <section className="tdn-container tdn-section-tight">
      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="tdn-eyebrow text-[0.62rem]">Market intelligence</span>
          <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
            Model scenarios &amp; market breadth
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-3 items-start">
        {/* Model-generated scenarios, not a news feed. */}
        <div className="tdn-card p-3.5 lg:col-span-7">
          <div className="flex items-center gap-2 mb-2.5">
            <Newspaper size={15} style={{ color: "var(--tdn-iris-2)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>Illustrative market scenarios</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--tdn-border)" }}>
            {news.map((n, i) => (
              <article key={i} className="flex items-start gap-3 py-2.5 first:pt-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="tdn-chip !py-0.5 !px-2 !text-[0.6rem]">{n.tag}</span>
                    <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded" style={{ color: n.color, background: `color-mix(in srgb, ${n.color} 12%, transparent)` }}>
                      {n.sentiment}
                    </span>
                  </div>
                  <p className="text-[0.84rem] leading-snug" style={{ color: "var(--tdn-fg)" }}>
                    {n.title}
                  </p>
                </div>
                <span className="text-[0.62rem] shrink-0 pt-0.5" style={{ color: "var(--tdn-faint)" }}>Model</span>
              </article>
            ))}
          </div>
        </div>

        {/* Right: AI read + calendar */}
        <div className="lg:col-span-5 space-y-3">
          <div className="tdn-card p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} style={{ color: "var(--tdn-iris-2)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>Market Summary</span>
            </div>
            <p className="text-[0.84rem] leading-relaxed" style={{ color: "var(--tdn-muted)" }}>
              Breadth is <strong style={{ color: "var(--tdn-fg)" }}>{read.pct}% advancing</strong>, a{" "}
              <strong style={{ color: "var(--tdn-fg)" }}>{read.tone}</strong> backdrop. Leadership sits with{" "}
              <strong style={{ color: "var(--tdn-up)" }}>{read.leaders}</strong>, while{" "}
              <strong style={{ color: "var(--tdn-down)" }}>{read.laggards}</strong> lag. The model favours
              patience where signals are mixed and confirmation on breakouts.
            </p>
          </div>

          <div className="tdn-card p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <CalendarClock size={15} style={{ color: "var(--tdn-iris-2)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>Example event watchlist</span>
            </div>
            <p className="mb-2 text-[0.68rem]" style={{ color: "var(--tdn-faint)" }}>Illustrative only; this is not a live calendar.</p>
            <div className="space-y-1.5">
              {CALENDAR.map((c) => (
                <div key={c.event} className="flex items-center gap-2.5">
                  <span className="tdn-mono text-[0.7rem] w-11 shrink-0" style={{ color: "var(--tdn-faint)" }}>{c.time}</span>
                  <span className="text-[0.62rem] font-bold w-6 shrink-0" style={{ color: "var(--tdn-muted)" }}>{c.country}</span>
                  <span className="text-xs flex-1 truncate" style={{ color: "var(--tdn-fg)" }}>{c.event}</span>
                  <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ color: IMPACT_COLOR[c.impact], background: `color-mix(in srgb, ${IMPACT_COLOR[c.impact]} 14%, transparent)` }}>
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
