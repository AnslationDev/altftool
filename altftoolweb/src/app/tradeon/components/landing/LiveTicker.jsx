// src/app/tradeon/components/landing/LiveTicker.jsx
"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPrice, formatPct } from "../../lib/format";

function Item({ d }) {
  const up = d.changePct >= 0;
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 border-r" style={{ borderColor: "var(--tdn-border)" }}>
      <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
        {d.symbol}
      </span>
      <span className="tdn-mono text-xs" style={{ color: "var(--tdn-muted)" }}>
        {formatPrice(d.price, { currency: d.assetClass === "forex" ? "" : "$" })}
      </span>
      <span className={`tdn-mono text-xs font-semibold inline-flex items-center gap-0.5 ${up ? "tdn-up" : "tdn-down"}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {formatPct(d.changePct)}
      </span>
    </span>
  );
}

export default function LiveTicker({ data = [] }) {
  if (!data.length) return <div className="h-8 tdn-skeleton rounded-none" />;
  const loop = [...data, ...data];
  return (
    <div
      className="tdn-marquee border-b"
      style={{ borderColor: "var(--tdn-border)", background: "var(--tdn-bg-2)" }}
    >
      <div className="tdn-marquee-track py-1">
        {loop.map((d, i) => (
          <Item key={`${d.symbol}-${i}`} d={d} />
        ))}
      </div>
    </div>
  );
}
