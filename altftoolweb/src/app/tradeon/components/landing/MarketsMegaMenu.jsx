// src/app/tradeon/components/landing/MarketsMegaMenu.jsx
"use client";

import Link from "next/link";
import { ArrowUpRight, Bitcoin, DollarSign, Gem, Layers, LineChart, Activity } from "lucide-react";
import { ASSET_CLASSES } from "../../lib/instruments";
import { assetHref, formatPrice, formatPct } from "../../lib/format";

const ICONS = { stocks: LineChart, crypto: Bitcoin, forex: DollarSign, indices: Activity, commodities: Gem, etf: Layers };

export default function MarketsMegaMenu({ data = [], onNavigate }) {
  return (
    <div className="tdn-panel p-5 tdn-rise" style={{ width: "min(92vw, 940px)" }}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
        {ASSET_CLASSES.map((cls) => {
          const Icon = ICONS[cls.id] || LineChart;
          const rows = data.filter((d) => d.assetClass === cls.id).slice(0, 4);
          return (
            <div key={cls.id}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--tdn-fg-strong)" }}>
                  <span className="w-6 h-6 rounded-md grid place-items-center" style={{ background: "color-mix(in srgb, var(--tdn-iris) 14%, transparent)", color: "var(--tdn-iris-2)" }}>
                    <Icon size={13} />
                  </span>
                  {cls.label}
                </span>
                <button onClick={onNavigate} className="text-[0.68rem] font-semibold inline-flex items-center gap-0.5 hover:underline" style={{ color: "var(--tdn-iris-2)" }}>
                  All <ArrowUpRight size={11} />
                </button>
              </div>
              <div className="space-y-0.5">
                {rows.map((d) => (
                  <Link
                    key={d.symbol}
                    href={assetHref(d.symbol)}
                    onClick={onNavigate}
                    className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_9%,transparent)]"
                  >
                    <span className="min-w-0">
                      <span className="text-xs font-semibold block" style={{ color: "var(--tdn-fg)" }}>
                        {d.symbol}
                      </span>
                      <span className="text-[0.66rem] truncate block" style={{ color: "var(--tdn-faint)" }}>
                        {d.name}
                      </span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="tdn-mono text-[0.72rem] font-semibold block" style={{ color: "var(--tdn-fg-strong)" }}>
                        {formatPrice(d.price, { currency: d.assetClass === "forex" ? "" : "$" })}
                      </span>
                      <span className={`tdn-mono text-[0.66rem] font-semibold block ${d.changePct >= 0 ? "tdn-up" : "tdn-down"}`}>
                        {formatPct(d.changePct)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: "var(--tdn-border)" }}>
        <span className="text-xs" style={{ color: "var(--tdn-faint)" }}>
          Live crypto via Binance · other classes simulated in this preview
        </span>
        <button onClick={onNavigate} className="tdn-btn tdn-btn-soft !py-1.5 !px-3 text-xs">
          Open full markets
        </button>
      </div>
    </div>
  );
}
