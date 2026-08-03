// src/app/tradeon/components/shared/AIPredictionCard.jsx
"use client";

import { useMemo } from "react";
import {
  Activity,
  Brain,
  ChevronRight,
  Gauge,
  Landmark,
  Newspaper,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { predict } from "../../lib/ai";
import { formatPrice } from "../../lib/format";
import DeltaPill from "./DeltaPill";
import Sparkline from "./Sparkline";

const SIGNAL_STYLES = {
  BUY: { color: "var(--tdn-up)", bg: "var(--tdn-up-soft)", Icon: TrendingUp },
  SELL: { color: "var(--tdn-down)", bg: "var(--tdn-down-soft)", Icon: TrendingDown },
  HOLD: { color: "var(--tdn-amber)", bg: "color-mix(in srgb, var(--tdn-amber) 14%, transparent)", Icon: Activity },
};

function ProbBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span style={{ color: "var(--tdn-muted)" }}>{label}</span>
        <span className="tdn-mono font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--tdn-fg) 8%, transparent)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, suffix = "/100", tone }) {
  const color = tone === "risk" ? (value > 65 ? "var(--tdn-down)" : value > 40 ? "var(--tdn-amber)" : "var(--tdn-up)") : "var(--tdn-fg-strong)";
  return (
    <div className="tdn-inset px-3 py-2.5">
      <div className="text-[0.68rem] font-medium uppercase tracking-wide" style={{ color: "var(--tdn-faint)" }}>
        {label}
      </div>
      <div className="tdn-mono text-lg font-bold mt-0.5" style={{ color }}>
        {value}
        <span className="text-xs font-normal" style={{ color: "var(--tdn-faint)" }}>
          {suffix}
        </span>
      </div>
    </div>
  );
}

function SentimentRow({ Icon, label, value }) {
  const color = value >= 55 ? "var(--tdn-up)" : value >= 45 ? "var(--tdn-amber)" : "var(--tdn-down)";
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={15} style={{ color: "var(--tdn-muted)" }} />
      <span className="text-xs flex-1" style={{ color: "var(--tdn-muted)" }}>
        {label}
      </span>
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--tdn-fg) 8%, transparent)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="tdn-mono text-xs font-semibold w-7 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

export default function AIPredictionCard({ instrument, expanded = true, className = "" }) {
  const p = useMemo(() => (instrument ? predict(instrument) : null), [instrument]);

  if (!instrument || !p) {
    return <div className={`tdn-card p-5 ${className}`} style={{ minHeight: 320 }}><div className="tdn-skeleton h-full w-full" /></div>;
  }

  const sig = SIGNAL_STYLES[p.signal];
  const { Icon } = sig;

  return (
    <div className={`tdn-card p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="tdn-chip tdn-chip-brand !py-1 !px-2.5">
              <Gauge size={12} /> Prediction
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-xl font-bold tracking-tight" style={{ color: "var(--tdn-fg-strong)" }}>
              {instrument.symbol}
            </h3>
            <span className="text-sm truncate" style={{ color: "var(--tdn-muted)" }}>
              {instrument.name}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="tdn-mono text-lg font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
              {formatPrice(instrument.price)}
            </span>
            <DeltaPill value={instrument.changePct} />
          </div>
        </div>
        <div
          className="shrink-0 flex flex-col items-center rounded-2xl px-4 py-3"
          style={{ background: sig.bg, border: `1px solid ${sig.color}` }}
        >
          <Icon size={22} style={{ color: sig.color }} />
          <span className="mt-1 text-sm font-bold tracking-wide" style={{ color: sig.color }}>
            {p.signal}
          </span>
          <span className="text-[0.62rem]" style={{ color: "var(--tdn-muted)" }}>
            {p.confidence}% conf.
          </span>
        </div>
      </div>

      <Sparkline data={instrument.spark} width={520} height={40} className="w-full mt-3" color={instrument.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"} />

      {/* Probabilities */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <ProbBar label="Buy" value={p.probabilities.buy} color="var(--tdn-up)" />
        <ProbBar label="Hold" value={p.probabilities.hold} color="var(--tdn-amber)" />
        <ProbBar label="Sell" value={p.probabilities.sell} color="var(--tdn-down)" />
      </div>

      {expanded && (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <Stat label="Confidence" value={p.confidence} suffix="%" />
            <Stat label="Risk" value={p.risk} tone="risk" />
            <Stat label="Technical" value={p.technical} />
            <Stat label="Trend" value={p.trendStrength} />
          </div>

          {/* Sentiments */}
          <div className="mt-4 space-y-2">
            <div className="tdn-eyebrow text-[0.62rem] mb-1">Synthetic context proxies</div>
            <SentimentRow Icon={Landmark} label="Flow proxy" value={p.sentiments.institutional} />
            <SentimentRow Icon={Users} label="Attention proxy" value={p.sentiments.retail} />
            <SentimentRow Icon={Newspaper} label="Headline proxy" value={p.sentiments.news} />
            <SentimentRow Icon={Activity} label="Momentum proxy" value={p.sentiments.social} />
          </div>

          {/* Levels */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {[
              ["Entry", p.levels.entry, "var(--tdn-fg-strong)"],
              ["Target", p.levels.target, "var(--tdn-up)"],
              ["Stop-loss", p.levels.stop, "var(--tdn-down)"],
              ["Support", p.levels.support, "var(--tdn-muted)"],
              ["Resistance", p.levels.resistance, "var(--tdn-muted)"],
              ["Risk / Reward", `${p.levels.rr}:1`, "var(--tdn-iris-2)"],
            ].map(([k, v, c]) => (
              <div key={k} className="flex items-center justify-between tdn-inset px-2.5 py-1.5">
                <span style={{ color: "var(--tdn-faint)" }}>{k}</span>
                <span className="tdn-mono font-semibold" style={{ color: c }}>
                  {typeof v === "number" ? formatPrice(v) : v}
                </span>
              </div>
            ))}
          </div>

          {/* Natural-language explanation */}
          <div className="mt-4 tdn-inset p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={15} style={{ color: "var(--tdn-iris-2)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
                Prediction Explanation
              </span>
            </div>
            <p className="text-[0.82rem] leading-relaxed" style={{ color: "var(--tdn-muted)" }}>
              {p.explanation.summary.replace(/\*\*/g, "")}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-[0.68rem] font-semibold mb-1" style={{ color: "var(--tdn-up)" }}>
                  Bull case
                </div>
                <ul className="space-y-1">
                  {p.explanation.bullCase.slice(0, 3).map((b) => (
                    <li key={b} className="flex gap-1 text-[0.74rem]" style={{ color: "var(--tdn-muted)" }}>
                      <ChevronRight size={12} className="mt-0.5 shrink-0" style={{ color: "var(--tdn-up)" }} /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[0.68rem] font-semibold mb-1" style={{ color: "var(--tdn-down)" }}>
                  Bear case
                </div>
                <ul className="space-y-1">
                  {p.explanation.bearCase.slice(0, 3).map((b) => (
                    <li key={b} className="flex gap-1 text-[0.74rem]" style={{ color: "var(--tdn-muted)" }}>
                      <ChevronRight size={12} className="mt-0.5 shrink-0" style={{ color: "var(--tdn-down)" }} /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer meta */}
          <div className="mt-3 flex items-center justify-between text-[0.7rem]" style={{ color: "var(--tdn-faint)" }}>
            <span className="flex items-center gap-1.5">
              <Gauge size={12} /> Model confidence {p.confidence}%
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert size={12} /> {p.outlook.short} · {p.outlook.long}
            </span>
          </div>
          <p className="mt-2 text-[0.64rem] leading-snug" style={{ color: "var(--tdn-faint)" }}>
            <Target size={10} className="inline mr-1" />
            Analytical signal for demonstration — not financial advice.
          </p>
        </>
      )}
    </div>
  );
}
