// src/app/tradeon/components/news/RecentNews.jsx
// Reusable "Recent News" section — real, live, auto-refreshing headlines shared
// across Tradeon pages (asset / prediction detail, dashboard, chart, etc.) so the
// small news blocks look and behave identically everywhere. Every card is fully
// clickable → its SEO News Detail page and shows a featured image. Two layouts:
//   variant="grid"  → image-on-top cards (default)
//   variant="list"  → compact horizontal rows (sidebars / narrow rails)
//
// Use <RecentNews/> for a self-contained drop-in (fetches its own live news), or
// <RecentNewsView/> when a page already has the articles (avoids a second fetch).
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNews } from "../../hooks/useNews";
import NewsCard from "./NewsCard";

// Presentational — render a Recent News block from already-loaded articles.
export function RecentNewsView({
  articles = [],
  loading = false,
  now = null,
  title = "Recent News",
  limit = 4,
  variant = "grid",
  columns = 2,
  showHeader = true,
  showViewAll = true,
  className = "",
}) {
  const list = articles.slice(0, limit);
  const cols =
    columns === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : columns === 1 ? "grid-cols-1"
    : "grid-cols-1 sm:grid-cols-2";

  return (
    <section className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold tracking-tight" style={{ color: "var(--tdn-fg-strong)" }}>{title}</h2>
          {showViewAll && (
            <Link href="/tradeon/news" className="group inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-[var(--tdn-iris)]" style={{ color: "var(--tdn-iris-2)" }}>
              View all
              <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
      )}

      {variant === "list" ? (
        loading && !list.length ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: limit }).map((_, i) => <div key={i} className="tdn-skeleton rounded-lg h-16" />)}
          </div>
        ) : list.length ? (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--tdn-border)" }}>
            {list.map((a) => (
              <div key={a.id} style={{ borderColor: "var(--tdn-border)" }}>
                <NewsCard article={a} now={now} variant="row" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--tdn-faint)" }}>No market news right now.</p>
        )
      ) : loading && !list.length ? (
        <div className={`grid ${cols} gap-3`}>
          {Array.from({ length: limit }).map((_, i) => <div key={i} className="tdn-skeleton rounded-xl" style={{ aspectRatio: "16 / 11" }} />)}
        </div>
      ) : list.length ? (
        <div className={`grid ${cols} gap-3`}>
          {list.map((a) => <NewsCard key={a.id} article={a} now={now} />)}
        </div>
      ) : (
        <p className="text-sm py-6 text-center" style={{ color: "var(--tdn-faint)" }}>No market news right now.</p>
      )}
    </section>
  );
}

// Self-contained — fetches live news itself. Drop in anywhere.
export default function RecentNews(props) {
  const { articles, loading } = useNews();
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  return <RecentNewsView {...props} articles={articles} loading={loading} now={now} />;
}
