// src/app/tradeon/components/landing/AIPredictions.jsx
"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { predict } from "../../lib/ai";
import AIPredictionCard from "../shared/AIPredictionCard";

const SIGNAL_COLOR = { BUY: "var(--tdn-up)", SELL: "var(--tdn-down)", HOLD: "var(--tdn-amber)" };

function SignalRow({ d, p, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors"
      style={{ background: active ? "color-mix(in srgb, var(--tdn-iris) 12%, transparent)" : "transparent" }}
    >
      <span className="text-xs font-bold w-16 shrink-0" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</span>
      <span className="flex-1 h-1.5 rounded-full overflow-hidden flex min-w-[60px]" style={{ background: "color-mix(in srgb, var(--tdn-fg) 8%, transparent)" }}>
        <span style={{ width: `${p.probabilities.buy}%`, background: "var(--tdn-up)" }} />
        <span style={{ width: `${p.probabilities.hold}%`, background: "var(--tdn-amber)" }} />
        <span style={{ width: `${p.probabilities.sell}%`, background: "var(--tdn-down)" }} />
      </span>
      <span className="text-[0.72rem] font-bold w-20 text-right shrink-0" style={{ color: SIGNAL_COLOR[p.signal] }}>
        {p.signal} {p.confidence}%
      </span>
    </button>
  );
}

export default function AIPredictions({ data = [] }) {
  const [symbol, setSymbol] = useState("BTC");
  const featured = data.find((d) => d.symbol === symbol) || data[0];

  const rows = useMemo(
    () =>
      data
        .map((d) => ({ d, p: predict(d) }))
        .sort((a, b) => b.p.confidence - a.p.confidence)
        .slice(0, 12),
    [data]
  );

  return (
    <section id="predictions" className="tdn-container tdn-section-tight">
      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="tdn-eyebrow text-[0.62rem]">Prediction Center</span>
          <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
            Explainable <span className="tdn-gradient-text">buy / sell / hold</span> signals
          </h2>
        </div>
        <span className="hidden sm:inline-flex tdn-chip !py-1 !text-[0.68rem]">
          <Sparkles size={12} style={{ color: "var(--tdn-iris-2)" }} /> Updated every tick
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-3 items-start">
        {/* Featured detailed prediction */}
        <div className="lg:col-span-7">
          <AIPredictionCard instrument={featured} />
        </div>

        {/* Market-wide signal leaderboard */}
        <div className="lg:col-span-5 tdn-card p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>Live signals</span>
            <div className="flex items-center gap-2 text-[0.62rem]" style={{ color: "var(--tdn-faint)" }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "var(--tdn-up)" }} /> Buy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "var(--tdn-amber)" }} /> Hold</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "var(--tdn-down)" }} /> Sell</span>
            </div>
          </div>
          <div className="space-y-0.5 max-h-[420px] overflow-y-auto tdn-scroll-thin">
            {rows.map(({ d, p }) => (
              <SignalRow key={d.symbol} d={d} p={p} active={d.symbol === symbol} onClick={() => setSymbol(d.symbol)} />
            ))}
          </div>
          <p className="mt-2 pt-2 text-[0.64rem] border-t" style={{ borderColor: "var(--tdn-border)", color: "var(--tdn-faint)" }}>
            Select any asset to view its full explainable prediction. Analytical signals, not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
