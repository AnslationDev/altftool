// src/app/tradeon/components/landing/MarketMovers.jsx
"use client";

import Link from "next/link";
import { Activity, Flame, Snowflake } from "lucide-react";
import { assetHref, formatPct } from "../../lib/format";
import LiveValue from "../shared/LiveValue";
import Sparkline from "../shared/Sparkline";

function Row({ d }) {
  return (
    <Link href={assetHref(d.symbol)} className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-[color-mix(in_srgb,var(--tdn-iris)_6%,transparent)] transition-colors">
      <div className="min-w-0 w-20">
        <div className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</div>
        <div className="text-[0.62rem] truncate" style={{ color: "var(--tdn-faint)" }}>{d.name}</div>
      </div>
      <Sparkline data={d.spark} width={54} height={20} color={d.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"} />
      <div className="ml-auto text-right">
        <div className="tdn-mono text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
          <LiveValue value={d.price} currency={d.assetClass === "forex" ? "" : "$"} />
        </div>
        <div className={`tdn-mono text-[0.66rem] font-semibold ${d.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>
          {formatPct(d.changePct)}
        </div>
      </div>
    </Link>
  );
}

function Panel({ title, icon: Icon, color, rows, footer }) {
  return (
    <div className="tdn-card p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
          <Icon size={15} style={{ color }} /> {title}
        </span>
        <span className="text-[0.66rem]" style={{ color: "var(--tdn-faint)" }}>{footer}</span>
      </div>
      <div className="space-y-0.5">
        {rows.map((d) => <Row key={d.symbol} d={d} />)}
      </div>
    </div>
  );
}

export default function MarketMovers({ data = [] }) {
  const byChange = [...data].sort((a, b) => b.changePct - a.changePct);
  const gainers = byChange.slice(0, 5);
  const losers = byChange.slice(-5).reverse();
  const active = [...data].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 5);

  return (
    <section className="tdn-container tdn-section-tight">
      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="tdn-eyebrow text-[0.62rem]">Market movers</span>
          <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
            What&apos;s moving right now
          </h2>
        </div>
        <span className="tdn-badge-live !text-[0.66rem]">
          <span className="tdn-dot" /> Live
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Panel title="Top Gainers" icon={Flame} color="var(--tdn-up)" rows={gainers} footer="24h" />
        <Panel title="Top Losers" icon={Snowflake} color="var(--tdn-down)" rows={losers} footer="24h" />
        <Panel
          title="Most Active"
          icon={Activity}
          color="var(--tdn-iris-2)"
          rows={active}
          footer="by volume"
        />
      </div>
    </section>
  );
}
