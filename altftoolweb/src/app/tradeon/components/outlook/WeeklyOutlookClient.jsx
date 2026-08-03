// src/app/tradeon/components/outlook/WeeklyOutlookClient.jsx
// "Weekly Outlook" directory — one combined, searchable list of every stock's
// weekly outlook (NO category grouping, headings or filters). Each card matches a
// classic weekly-outlook layout — logo on the left, "<Name> Outlook for the Week
// (<week range>)" on the right — and is fully clickable to /tradeon/outlook/<symbol>.
// The week range is derived from REAL-TIME data (the live quote API's latest weekly
// bar, seeded from the clock) — never hardcoded. Themed via Tradeon tokens.
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMarketData } from "../../hooks/useMarketData";
import { OUTLOOK_STOCKS } from "../../lib/outlookStocks";
import { outlookSlug } from "../../lib/slug";
import TradeonHeader from "../landing/TradeonHeader";
import TradeonFooter from "../landing/TradeonFooter";

// The trading week (Mon–Fri) that contains `unixSec`, resolved in IST (NSE tz),
// formatted like "July 27, 2026 – July 31, 2026".
function weekLabel(unixSec) {
  const d = new Date(unixSec * 1000);
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const y = +p.find((x) => x.type === "year").value;
  const m = +p.find((x) => x.type === "month").value;
  const day = +p.find((x) => x.type === "day").value;
  const base = new Date(Date.UTC(y, m - 1, day));
  const monday = new Date(base); monday.setUTCDate(base.getUTCDate() - ((base.getUTCDay() + 6) % 7));
  const friday = new Date(monday); friday.setUTCDate(monday.getUTCDate() + 4);
  const fmt = (x) => x.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  return `${fmt(monday)} – ${fmt(friday)}`;
}

// Official logo on a light tile (readable in any theme); coloured monogram fallback.
function StockLogo({ symbol, domain, size = 56 }) {
  const [failed, setFailed] = useState(false);
  if (!domain || failed) {
    return (
      <span className="grid place-items-center rounded-xl font-black shrink-0" style={{ width: size, height: size, background: "#fff", color: "var(--tdn-iris)", border: "1px solid var(--tdn-border)", fontSize: size * 0.26 }}>
        {symbol.slice(0, 2)}
      </span>
    );
  }
  return (
    <span className="grid place-items-center rounded-xl overflow-hidden shrink-0" style={{ width: size, height: size, background: "#fff", border: "1px solid var(--tdn-border)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://cdn.brandfetch.io/${domain}/w/160/h/160`} alt={`${symbol} logo`} loading="lazy" className="object-contain" style={{ maxWidth: "80%", maxHeight: "80%" }} onError={() => setFailed(true)} />
    </span>
  );
}

export default function WeeklyOutlookClient() {
  const { data, status } = useMarketData();
  const [q, setQ] = useState("");
  const [range, setRange] = useState("");

  // Week/date range from real-time data: seed instantly from the clock, then
  // confirm from the live quote API (latest weekly bar). Never hardcoded/mock.
  useEffect(() => {
    setRange(weekLabel(Math.floor(Date.now() / 1000)));
    let cancel = false;
    fetch("/tradeon/api/quote/RELIANCE?interval=1wk&range=1mo")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        const bars = j?.bars;
        if (!cancel && Array.isArray(bars) && bars.length) setRange(weekLabel(bars[bars.length - 1].time));
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return OUTLOOK_STOCKS;
    return OUTLOOK_STOCKS.filter((s) => s.symbol.toLowerCase().includes(term) || s.name.toLowerCase().includes(term));
  }, [q]);

  return (
    <div className="tradeon-root min-h-screen flex flex-col">
      <TradeonHeader data={data} status={status} />

      {/* Content area only — theme-aware surface (tdn-paper); header/footer keep the app theme */}
      <main className="tdn-paper flex-1 w-full">
        <div className="tdn-container tdn-section-tight">
        {/* Search only — directly followed by the combined list (no heading, no
            filters, no category sections, no count). */}
        <div className="relative w-full lg:max-w-xl">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--tdn-faint)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stocks by name or symbol…"
            aria-label="Search weekly outlooks"
            className="w-full h-12 pl-12 pr-10 rounded-xl text-sm outline-none border border-[var(--tdn-border)] focus:border-[var(--tdn-iris)] transition-colors"
            style={{ background: "var(--tdn-bg)", color: "var(--tdn-fg-strong)" }}
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Clear search" style={{ color: "var(--tdn-faint)" }}>
              <X size={17} />
            </button>
          )}
        </div>

        {/* One combined list of weekly-outlook cards — no category grouping. */}
        {filtered.length ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10">
            {filtered.map((s) => (
              <Link
                key={s.symbol}
                href={`/tradeon/weekly-outlook/${outlookSlug(s.symbol)}`}
                className="group flex items-center gap-4 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_4%,transparent)]"
                style={{ borderBottom: "1px solid var(--tdn-border)" }}
              >
                <StockLogo symbol={s.symbol} domain={s.domain} />
                <p className="text-sm leading-snug" style={{ color: "var(--tdn-fg)" }}>
                  <span className="font-bold transition-colors group-hover:text-[var(--tdn-iris-2)]" style={{ color: "var(--tdn-fg-strong)" }}>{s.name}</span>{" "}
                  Outlook for the Week{range ? ` (${range})` : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 mt-8 rounded-xl" style={{ border: "1px dashed var(--tdn-border)" }}>
            <p className="text-sm" style={{ color: "var(--tdn-muted)" }}>No stocks match &ldquo;{q}&rdquo;.</p>
            <button onClick={() => setQ("")} className="text-xs font-semibold mt-2 hover:underline" style={{ color: "var(--tdn-iris)" }}>
              Clear search
            </button>
          </div>
        )}
        </div>
      </main>

      <TradeonFooter status={status} />
    </div>
  );
}
