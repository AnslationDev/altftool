// src/app/tradeon/components/landing/GlobalMarkets.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { predict } from "../../lib/ai";
import { ASSET_CLASSES } from "../../lib/instruments";
import { assetHref, formatCompact, formatPrice } from "../../lib/format";
import DeltaPill from "../shared/DeltaPill";
import LiveValue from "../shared/LiveValue";
import Sparkline from "../shared/Sparkline";

const SIGNAL_COLOR = { BUY: "var(--tdn-up)", SELL: "var(--tdn-down)", HOLD: "var(--tdn-amber)" };

export default function GlobalMarkets({ data = [] }) {
  const [tab, setTab] = useState("crypto");
  const rows = data.filter((d) => d.assetClass === tab);

  return (
    <section id="markets" className="tdn-container tdn-section-tight">
      <div>
        <div className="flex items-end justify-between gap-4 mb-3">
          <div className="max-w-xl">
            <span className="tdn-eyebrow text-[0.62rem]">Global markets</span>
            <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
              One tape for every market
            </h2>
          </div>
          <p className="text-xs max-w-xs text-right hidden md:block" style={{ color: "var(--tdn-faint)" }}>
            Crypto streamed live via Binance · other classes simulated in this preview.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ASSET_CLASSES.map((c) => (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              className="px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: tab === c.id ? "var(--tdn-brand-gradient)" : "var(--tdn-surface)",
                color: tab === c.id ? "#fff" : "var(--tdn-muted)",
                border: "1px solid var(--tdn-border)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="tdn-panel overflow-hidden">
          <div className="overflow-x-auto tdn-scroll-thin">
            <table className="tdn-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="tdn-sticky-col">Asset</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">24h</th>
                  <th className="text-right hidden sm:table-cell">Volume</th>
                  <th className="text-center hidden md:table-cell">7d trend</th>
                  <th className="text-right">Signal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const p = predict(d);
                  return (
                    <tr key={d.symbol}>
                      <td className="tdn-sticky-col">
                        <Link href={assetHref(d.symbol)} className="flex flex-col group">
                          <span className="font-bold group-hover:text-[var(--tdn-iris-2)] transition-colors" style={{ color: "var(--tdn-fg-strong)" }}>
                            {d.symbol}
                          </span>
                          <span className="text-xs" style={{ color: "var(--tdn-faint)" }}>
                            {d.name}
                          </span>
                        </Link>
                      </td>
                      <td className="text-right font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
                        <LiveValue value={d.price} currency={d.assetClass === "forex" ? "" : "$"} />
                      </td>
                      <td className="text-right">
                        <DeltaPill value={d.changePct} showIcon={false} />
                      </td>
                      <td className="text-right hidden sm:table-cell tdn-mono" style={{ color: "var(--tdn-muted)" }}>
                        {d.volume ? `$${formatCompact(d.volume)}` : "—"}
                      </td>
                      <td className="hidden md:table-cell">
                        <div className="flex justify-center">
                          <Sparkline data={d.spark} width={110} height={30} color={d.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"} />
                        </div>
                      </td>
                      <td className="text-right">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-md"
                          style={{ color: SIGNAL_COLOR[p.signal], background: `color-mix(in srgb, ${SIGNAL_COLOR[p.signal]} 14%, transparent)` }}
                        >
                          {p.signal} · {p.confidence}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
