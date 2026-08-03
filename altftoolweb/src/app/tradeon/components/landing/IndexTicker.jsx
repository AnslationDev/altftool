// src/app/tradeon/components/landing/IndexTicker.jsx
// Dedicated index ticker bar that sits directly below the sticky header (and
// scrolls away with the page — it is NOT sticky). Shows the six headline indices
// with live price + % change. Static horizontal row (no auto-scrolling marquee);
// spreads across the width on desktop and swipes on mobile.
"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { assetHref, formatPct } from "../../lib/format";
import LiveValue from "../shared/LiveValue";

const INDEX_SYMBOLS = ["SPX", "NDX", "DJI", "NIFTY", "FTSE", "N225"];

export default function IndexTicker({ data = [] }) {
  const items = INDEX_SYMBOLS.map((s) => data.find((d) => d.symbol === s)).filter(Boolean);

  return (
    <div className="border-b" style={{ borderColor: "var(--tdn-border)", background: "var(--tdn-bg-2)" }}>
      <div className="tdn-container">
        <div className="flex items-center gap-1 md:gap-2 md:justify-between h-9 overflow-x-auto tdn-scroll-hide">
          {items.length
            ? items.map((d) => {
                const up = d.changePct >= 0;
                return (
                  <Link
                    key={d.symbol}
                    href={assetHref(d.symbol)}
                    className="group flex items-center gap-1.5 px-2.5 h-7 rounded-md shrink-0 transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_9%,transparent)]"
                  >
                    <span className="text-[0.72rem] font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{d.symbol}</span>
                    <span className="tdn-mono text-[0.72rem]" style={{ color: "var(--tdn-muted)" }}>
                      <LiveValue value={d.price} currency="" forceDecimals={0} />
                    </span>
                    <span className={`tdn-mono text-[0.7rem] font-semibold inline-flex items-center gap-0.5 ${up ? "tdn-up" : "tdn-down"}`}>
                      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {formatPct(d.changePct)}
                    </span>
                  </Link>
                );
              })
            : INDEX_SYMBOLS.map((s) => (
                <div key={s} className="flex items-center px-2.5 h-7 shrink-0">
                  <div className="tdn-skeleton h-3.5 w-24 rounded" />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
