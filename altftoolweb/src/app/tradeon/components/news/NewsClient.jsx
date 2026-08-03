// src/app/tradeon/components/news/NewsClient.jsx
// Full News page — live aggregated market news across every category. Opens
// directly to the latest articles with a search box, auto-refresh, and a
// "load more" grid (no category filter bar, no item counts). Theme-aware: the
// content sits on a tdn-paper surface (white in light, dark in dark).
"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { useNews } from "../../hooks/useNews";
import { useMarketData } from "../../hooks/useMarketData";
import TradeonHeader from "../landing/TradeonHeader";
import TradeonFooter from "../landing/TradeonFooter";
import NewsCard from "./NewsCard";

const PAGE = 24;

export default function NewsClient() {
  const { data, status } = useMarketData();
  const { articles, loading } = useNews({ refreshMs: 120000 });
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.summary.toLowerCase().includes(term) ||
        a.source.toLowerCase().includes(term)
    );
  }, [articles, q]);

  useEffect(() => { setLimit(PAGE); }, [q]);
  const shown = filtered.slice(0, limit);

  return (
    <div className="tradeon-root min-h-screen flex flex-col">
      <TradeonHeader data={data} status={status} />

      {/* Content area only — theme-aware surface (tdn-paper: white in light, dark in dark); header/footer keep the app theme */}
      <main className="tdn-paper flex-1 w-full">
        <div className="tdn-container tdn-section-tight">
          {/* Header — opens directly to the latest news, no category bar or counts */}
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <span className="tdn-eyebrow text-[0.62rem]">Newsroom</span>
              <h1 className="tdn-display text-2xl sm:text-3xl mt-1" style={{ color: "var(--tdn-fg-strong)" }}>Market News</h1>
              <p className="text-sm mt-1.5 inline-flex items-center gap-1.5" style={{ color: "var(--tdn-muted)" }}>
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Live · auto-refreshing
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--tdn-faint)" }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news…" aria-label="Search news"
                className="w-full h-11 pl-10 pr-9 rounded-xl text-sm outline-none border border-[var(--tdn-border)] focus:border-[var(--tdn-iris)] transition-colors"
                style={{ background: "var(--tdn-bg)", color: "var(--tdn-fg-strong)" }} />
              {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear" style={{ color: "var(--tdn-faint)" }}><X size={15} /></button>}
            </div>
          </div>

          {/* Grid */}
          {loading && !shown.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="tdn-skeleton rounded-xl" style={{ aspectRatio: "16 / 11" }} />)}
            </div>
          ) : shown.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {shown.map((a) => <NewsCard key={a.id} article={a} now={now} />)}
              </div>
              {filtered.length > limit && (
                <div className="flex justify-center mt-8">
                  <button onClick={() => setLimit((l) => l + PAGE)} className="tdn-btn" style={{ background: "var(--tdn-fg-strong)", color: "var(--tdn-bg)", minWidth: 160 }}>
                    Load more
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 rounded-xl" style={{ border: "1px dashed var(--tdn-border)" }}>
              <p className="text-sm" style={{ color: "var(--tdn-muted)" }}>No news matches your search.</p>
              <button onClick={() => setQ("")} className="text-xs font-semibold mt-2 hover:underline" style={{ color: "var(--tdn-iris)" }}>Clear search</button>
            </div>
          )}
        </div>
      </main>

      <TradeonFooter status={status} />
    </div>
  );
}
