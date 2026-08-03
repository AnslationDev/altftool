// src/app/tradeon/components/outlook/OutlookClient.jsx
// Weekly "Outlook for the Week" page for a symbol — opened from the home Sector
// Outlook grid. Mirrors a typical weekly-outlook report (title + week range,
// logo, summary, weekly candle chart, pivot support/resistance table, previous-
// week OHLC, quick links, related-stock sidebar, screeners). Weekly OHLC is real
// (server-proxied from Yahoo/NSE, see /tradeon/api/quote) with Tradeon's simulated
// candles as a fallback; support/resistance uses standard floor-pivot math. The
// visual design follows a clean editorial broker layout, themed via Tradeon tokens.
// Analytical demo, not financial advice.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, Clock } from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { generateCandles } from "../../lib/candles";
import { INSTRUMENTS } from "../../lib/instruments";
import { OUTLOOK_STOCKS, OUTLOOK_DOMAINS as DOMAINS, outlookStock } from "../../lib/outlookStocks";
import { outlookSlug } from "../../lib/slug";
import TradeonHeader from "../landing/TradeonHeader";
import TradeonFooter from "../landing/TradeonFooter";
import MiniChart from "../chart/MiniChart";

const QUICK_LINKS = ["Quarterly Results", "Profit Loss Statement", "Balance Sheet", "Cash Flow", "MF Holdings", "Technical Analysis"];
const SCREENERS = ["Penny Stocks", "Most Active Stocks Today", "Top Gainers Today", "Top Losers Today", "52 Week High Stocks", "52 Week Low Stocks", "Stocks Below 20 Rs", "Stocks Below 10 Rs"];

const n2 = (v) => Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nLoose = (v) => Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });

function Logo({ symbol, size = 116 }) {
  const [failed, setFailed] = useState(false);
  const d = DOMAINS[symbol];
  if (!d || failed) {
    return (
      <span className="grid place-items-center rounded-2xl font-black" style={{ width: size, height: size, background: "#fff", color: "var(--tdn-iris)", fontSize: size * 0.2 }}>
        {symbol.slice(0, 4)}
      </span>
    );
  }
  return (
    <span className="grid place-items-center rounded-2xl overflow-hidden" style={{ width: size, height: size, background: "#fff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://cdn.brandfetch.io/${d}/w/256/h/256`} alt={`${symbol} logo`} className="object-contain" style={{ maxWidth: "86%", maxHeight: "86%" }} onError={() => setFailed(true)} />
    </span>
  );
}

export default function OutlookClient({ symbol: symbolProp }) {
  const params = useParams();
  const symbol = symbolProp || decodeURIComponent(Array.isArray(params.symbol) ? params.symbol[0] : params.symbol || "ICICIBANK");
  const { data, status } = useMarketData();
  const inst = data.find((d) => d.symbol === symbol) || null;
  const meta = INSTRUMENTS.find((i) => i.symbol === symbol) || null;
  const outlookMeta = outlookStock(symbol);
  const name = inst?.name || meta?.name || outlookMeta?.name || symbol;

  // Related = other stocks in the same sector first, padded with other names.
  const related = useMemo(() => {
    const sec = outlookStock(symbol)?.sector;
    const same = sec ? OUTLOOK_STOCKS.filter((s) => s.sector === sec && s.symbol !== symbol) : [];
    const others = OUTLOOK_STOCKS.filter((s) => s.symbol !== symbol && s.sector !== sec);
    return [...same, ...others].slice(0, 8);
  }, [symbol]);

  // Weekly candles — generated in an effect (avoids Date.now during render);
  // regenerated on symbol change / first quote, not on every live tick.
  const priceRef = useRef(0);
  useEffect(() => { if (inst?.price) priceRef.current = inst.price; }, [inst?.price]);
  const [bars, setBars] = useState([]);
  useEffect(() => {
    const anchor = priceRef.current || meta?.base || outlookMeta?.base || 100;
    setBars(generateCandles(symbol, "1w", anchor, Date.now()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, !!inst]);

  // Real weekly OHLC — free, server-proxied from Yahoo Finance (NSE). Renders the
  // simulated candles above immediately, then upgrades to real data when this
  // resolves; on any failure it silently stays on the simulation.
  const [live, setLive] = useState(null);
  useEffect(() => {
    let cancel = false;
    fetch(`/tradeon/api/quote/${encodeURIComponent(symbol)}?interval=1wk&range=1y`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => { if (!cancel && Array.isArray(j?.bars) && j.bars.length) setLive(j); })
      .catch(() => {});
    return () => { cancel = true; };
  }, [symbol]);

  // Only trust live data belonging to the current symbol — this component stays
  // mounted across /outlook/[symbol] changes, so `live` may still hold a prior stock.
  const liveQ = live && live.symbol === symbol && live.bars?.length ? live : null;

  // Prefer real bars for the pivot math + chart; simulation is the fallback.
  const effBars = liveQ ? liveQ.bars : bars;

  // Week label + timestamp (Mon–Fri of the current week).
  const [dates, setDates] = useState({ range: "", stamp: "" });
  useEffect(() => {
    const now = new Date();
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
    const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    setDates({ range: `${fmt(monday)} – ${fmt(friday)}`, stamp: now.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) });
  }, [symbol]);

  // Previous completed week → standard floor pivot support / resistance.
  const piv = useMemo(() => {
    const prev = effBars.length >= 2 ? effBars[effBars.length - 2] : effBars[effBars.length - 1];
    if (!prev) return null;
    const { open: O, high: H, low: L, close: C } = prev;
    const P = (H + L + C) / 3;
    return {
      O, H, L, C, range: H - L, pivot: P,
      r1: 2 * P - L, s1: 2 * P - H,
      r2: P + (H - L), s2: P - (H - L),
      r3: H + 2 * (P - L), s3: L - 2 * (H - P),
      chg: O ? ((C - O) / O) * 100 : 0,
    };
  }, [effBars]);

  const up = (piv?.chg ?? 0) >= 0;
  const isLive = !!liveQ;
  const sign = up ? "+" : "-";

  return (
    <div className="tradeon-root min-h-screen flex flex-col">
      <TradeonHeader data={data} status={status} />

      {/* Content area only — clean white band (tdn-paper); header/footer keep the app theme */}
      <main className="tdn-paper flex-1 w-full">
        <div className="tdn-container tdn-section-tight">
          <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8">
          {/* MAIN COLUMN */}
          <article className="lg:col-span-9 min-w-0">
            <h1 className="text-2xl sm:text-[1.75rem] font-extrabold tracking-tight leading-tight" style={{ color: "var(--tdn-fg-strong)" }}>
              {symbol} Outlook for the Week{dates.range ? ` (${dates.range})` : ""}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--tdn-faint)" }}>
              <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {dates.stamp || "—"}</span>
              <span
                className="inline-flex items-center gap-1.5"
                style={{ color: isLive ? "var(--tdn-up)" : "var(--tdn-amber)" }}
                title={isLive ? `Real weekly OHLC from ${liveQ.exchange || "NSE"} via Yahoo Finance` : "Simulated candles (live source unavailable)"}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                {isLive ? `Live · ${liveQ.exchange || "NSE"}` : "Simulated"}
              </span>
            </div>

            {!piv ? (
              <div className="h-80 tdn-skeleton mt-8" />
            ) : (
              <>
                <div className="flex justify-center my-8"><Logo symbol={symbol} /></div>

                <p className="text-[0.95rem] leading-relaxed" style={{ color: "var(--tdn-fg)" }}>
                  {name} closed the previous week on a {up ? "positive" : "negative"} note {up ? "gaining" : "losing"} {sign}{n2(Math.abs(piv.chg))}%.
                </p>
                <p className="text-[0.95rem] leading-relaxed mt-4" style={{ color: "var(--tdn-fg)" }}>
                  Technically, {name} share price will see immediate support at {n2(piv.s1)} and immediate resistance would be seen at {n2(piv.r1)}.
                </p>

                {/* Weekly chart */}
                <div className="mt-6 rounded-lg overflow-hidden" style={{ border: "1px solid var(--tdn-border)" }}>
                  <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--tdn-border)" }}>
                    <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{symbol} · Weekly</span>
                    <span className="text-[0.68rem] font-semibold px-2 py-0.5 rounded" style={{ color: "#b8791f", background: "rgba(247,185,85,0.16)" }}>
                      Reversal Level {nLoose(piv.pivot)}
                    </span>
                  </div>
                  <div style={{ height: 340 }}>
                    <MiniChart symbol={symbol} chartType="candlestick" tf="1w" showFullscreen externalBars={liveQ?.bars || null} />
                  </div>
                </div>

                <p className="text-[0.95rem] font-semibold mt-6">
                  <Link href="/tradeon/asset/NIFTY" className="hover:underline" style={{ color: "var(--tdn-iris)" }}>
                    Check Gift Nifty (SGX Nifty) Live Price to predict the market.
                  </Link>
                </p>

                <p className="text-[0.95rem] leading-relaxed mt-5" style={{ color: "var(--tdn-fg)" }}>
                  If {name} share price closes below immediate support of {n2(piv.s1)}, then a sharp breakdown can be seen. {name} share price will see major support at {n2(piv.s2)} for the week.
                </p>
                <p className="text-[0.95rem] leading-relaxed mt-4" style={{ color: "var(--tdn-fg)" }}>
                  On the positive side, immediate resistance will be seen at {n2(piv.r1)}. Closing above {n2(piv.r1)}, {name} share price will see a sharp breakout. Major resistance for {name} share price will be seen at {n2(piv.r2)} for the week.
                </p>

                {/* Quick links */}
                <div className="mt-7">
                  <h3 className="text-[0.95rem] font-bold mb-1.5" style={{ color: "var(--tdn-fg-strong)" }}>{name} Quick Links</h3>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.85rem] font-medium" style={{ color: "var(--tdn-iris)" }}>
                    {QUICK_LINKS.map((q, i) => (
                      <span key={q} className="inline-flex items-center gap-2.5">
                        <Link href={`/tradeon/asset/${encodeURIComponent(symbol)}`} className="hover:underline">{q}</Link>
                        {i < QUICK_LINKS.length - 1 && <span style={{ color: "var(--tdn-border-strong)" }}>|</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[0.95rem] leading-relaxed mt-6" style={{ color: "var(--tdn-fg)" }}>
                  Trading range for {name} share price for this week should be between {n2(piv.s3)} on the down side and {n2(piv.r3)} on the up side.
                </p>

                {/* Previous-week OHLC — inline label rows */}
                <div className="mt-6 space-y-3">
                  {[["Open", nLoose(piv.O)], ["High", nLoose(piv.H)], ["Low", nLoose(piv.L)], ["Close", nLoose(piv.C)], ["Range", `${nLoose(piv.range)} Points`]].map(([k, v]) => (
                    <p key={k} className="text-[0.95rem]" style={{ color: "var(--tdn-fg)" }}>
                      <span className="font-bold" style={{ color: "var(--tdn-fg-strong)" }}>{name} Previous Week {k}:</span> {v}
                    </p>
                  ))}
                </div>

                {/* Support / resistance table */}
                <p className="text-[0.95rem] leading-relaxed mt-7 mb-3" style={{ color: "var(--tdn-fg)" }}>
                  {name} share price support and resistance for the week{dates.range ? ` (${dates.range})` : ""}
                </p>
                <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--tdn-border)" }}>
                  <table className="w-full text-[0.9rem] border-collapse">
                    <thead>
                      <tr style={{ background: "rgba(128,128,128,0.07)" }}>
                        <th className="text-left font-bold px-4 py-3" style={{ color: "var(--tdn-fg-strong)", borderBottom: "1px solid var(--tdn-border)", width: "44%" }}>Level Type</th>
                        <th className="text-left font-bold px-4 py-3" style={{ color: "var(--tdn-fg-strong)", borderBottom: "1px solid var(--tdn-border)" }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[["Resistance 3", piv.r3], ["Resistance 2", piv.r2], ["Resistance 1", piv.r1], ["Support 1", piv.s1], ["Support 2", piv.s2], ["Support 3", piv.s3]].map(([k, v], i, arr) => {
                        const b = i < arr.length - 1 ? "1px solid var(--tdn-border)" : "none";
                        return (
                          <tr key={k}>
                            <td className="px-4 py-3" style={{ color: "var(--tdn-fg)", borderBottom: b }}>{k}</td>
                            <td className="px-4 py-3 tdn-mono" style={{ color: "var(--tdn-fg-strong)", borderBottom: b }}>{n2(v)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-[0.72rem] mt-3" style={{ color: "var(--tdn-faint)" }}>
                  {isLive
                    ? `Weekly OHLC sourced from ${liveQ.exchange || "NSE"} via Yahoo Finance; support & resistance use standard floor-pivot math on the previous week's range. Not investment advice.`
                    : "Levels are derived from the previous week's range using standard floor-pivot math on Tradeon's simulated data. Not investment advice."}
                </p>

                {/* Popular screeners */}
                <div className="mt-12">
                  <div className="text-center text-lg font-bold mb-6">
                    <span style={{ color: "var(--tdn-iris)" }}>Popular</span> <span style={{ color: "var(--tdn-fg-strong)" }}>Screeners</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SCREENERS.map((sc) => (
                      <Link
                        key={sc}
                        href="/tradeon#markets"
                        className="tdn-lift flex items-center justify-between px-5 py-4 rounded-lg text-[0.9rem] font-semibold"
                        style={{ border: "1px solid var(--tdn-border)", color: "var(--tdn-fg-strong)" }}
                      >
                        {sc} <ArrowUpRight size={15} style={{ color: "var(--tdn-iris)" }} />
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </article>

          {/* SIDEBAR — transparent, plain links, blue-underlined heading */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-base font-bold pb-2 mb-4" style={{ color: "var(--tdn-fg-strong)", borderBottom: "2px solid var(--tdn-iris)" }}>
                Share Price &amp; Analysis
              </h2>
              <nav className="flex flex-col gap-3">
                {related.map((s) => (
                  <Link
                    key={s.symbol}
                    href={`/tradeon/weekly-outlook/${outlookSlug(s.symbol)}`}
                    className="text-[0.9rem] transition-colors hover:text-[var(--tdn-iris)] hover:underline"
                    style={{ color: "var(--tdn-fg)" }}
                  >
                    {s.symbol} Share Price
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          </div>
        </div>
      </main>

      <TradeonFooter status={status} />
    </div>
  );
}
