// src/app/tradeon/components/landing/SearchOverlay.jsx
// Professional search panel opened from the header search icon. The panel uses a
// SOLID background (white in light, dark in dark theme) — never blurred or
// transparent — for maximum readability. Default view shows categorized market
// groups; typing filters across everything.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import { ASSET_CLASSES } from "../../lib/instruments";
import { assetHref, formatPrice } from "../../lib/format";
import DeltaPill from "../shared/DeltaPill";

const RECENTS = ["BTC", "NVDA", "EUR/USD", "XAU", "SPX"];

// Category groups shown when there is no query.
const GROUPS = [
  { key: "trending", label: "Trending Assets" },
  { key: "stocks", label: "Popular Stocks" },
  { key: "forex", label: "Forex Pairs" },
  { key: "crypto", label: "Cryptocurrencies" },
  { key: "etf", label: "ETFs" },
  { key: "commodities", label: "Commodities" },
  { key: "indices", label: "Indices" },
];

function AssetRow({ d, onClose }) {
  const cls = ASSET_CLASSES.find((c) => c.id === d.assetClass);
  return (
    <Link
      href={assetHref(d.symbol)}
      onClick={onClose}
      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_10%,transparent)]"
    >
      <span
        className="w-8 h-8 rounded-lg grid place-items-center text-[0.66rem] font-bold shrink-0"
        style={{ background: "color-mix(in srgb, var(--tdn-iris) 13%, transparent)", color: "var(--tdn-iris-2)" }}
      >
        {d.symbol.slice(0, 3)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--tdn-fg-strong)" }}>
          {d.symbol}
          <span className="text-[0.6rem] font-medium px-1.5 py-0.5 rounded" style={{ background: "color-mix(in srgb, var(--tdn-fg) 7%, transparent)", color: "var(--tdn-faint)" }}>
            {cls?.label}
          </span>
        </span>
        <span className="text-xs truncate block" style={{ color: "var(--tdn-faint)" }}>{d.name}</span>
      </span>
      <span className="text-right shrink-0">
        <span className="tdn-mono text-sm font-semibold block" style={{ color: "var(--tdn-fg-strong)" }}>
          {formatPrice(d.price, { currency: d.assetClass === "forex" ? "" : "$" })}
        </span>
        <DeltaPill value={d.changePct} showIcon={false} className="!text-[0.62rem] !py-0 !px-1" />
      </span>
    </Link>
  );
}

export default function SearchOverlay({ open, onClose, data = [] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return data.filter((d) => d.symbol.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)).slice(0, 10);
  }, [data, query]);

  const trending = useMemo(
    () => [...data].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 5),
    [data]
  );

  const groupData = (key) =>
    key === "trending" ? trending : data.filter((d) => d.assetClass === (key === "stocks" ? "stocks" : key)).slice(0, key === "stocks" ? 6 : 5);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[8vh]"
      style={{ background: "rgba(2, 4, 10, 0.55)" }}
      onMouseDown={onClose}
    >
      {/* SOLID panel — no blur, no transparency */}
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden tdn-rise shadow-[var(--tdn-shadow-lg)]"
        style={{ background: "var(--tdn-surface-solid)", border: "1px solid var(--tdn-border-strong)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: "var(--tdn-border)" }}>
          <Search size={18} style={{ color: "var(--tdn-muted)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks, forex, crypto, ETFs, commodities, indices…"
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: "var(--tdn-fg)" }}
          />
          <button onClick={onClose} className="tdn-btn tdn-btn-icon !w-8 !h-8" aria-label="Close search">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[64vh] overflow-y-auto tdn-scroll-thin p-2" style={{ background: "var(--tdn-surface-solid)" }}>
          {results ? (
            <>
              <div className="tdn-eyebrow text-[0.6rem] px-2 my-1.5">Results</div>
              {results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm" style={{ color: "var(--tdn-faint)" }}>
                  No matches for “{query}”. Try a symbol like BTC or AAPL.
                </div>
              ) : (
                results.map((d) => <AssetRow key={d.symbol} d={d} onClose={onClose} />)
              )}
            </>
          ) : (
            <>
              {/* Recent searches */}
              <div className="px-2 pt-1 pb-2">
                <div className="tdn-eyebrow text-[0.6rem] mb-1.5 flex items-center gap-1.5">
                  <Clock size={11} /> Recent Searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RECENTS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(r)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: "color-mix(in srgb, var(--tdn-fg) 6%, transparent)", color: "var(--tdn-fg)" }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category groups */}
              {GROUPS.map((g) => {
                const rows = groupData(g.key);
                if (!rows.length) return null;
                return (
                  <div key={g.key} className="pt-1">
                    <div className="tdn-eyebrow text-[0.6rem] px-2 mb-0.5 flex items-center gap-1.5">
                      {g.key === "trending" && <TrendingUp size={11} />} {g.label}
                    </div>
                    {rows.map((d) => <AssetRow key={`${g.key}-${d.symbol}`} d={d} onClose={onClose} />)}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t text-[0.68rem]" style={{ borderColor: "var(--tdn-border)", color: "var(--tdn-faint)", background: "var(--tdn-surface-solid)" }}>
          <span className="flex items-center gap-2">
            <kbd className="tdn-mono px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--tdn-border)" }}>↵</kbd> open
            <kbd className="tdn-mono px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--tdn-border)" }}>esc</kbd> close
          </span>
          <span>Search across every market</span>
        </div>
      </div>
    </div>
  );
}
