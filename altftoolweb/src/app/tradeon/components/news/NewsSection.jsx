// src/app/tradeon/components/news/NewsSection.jsx
// Home-page "Market News" section — live, auto-refreshing latest headlines with a
// View All button to the full News page. Clean card-only layout (no category
// chips or badges). Theme-aware via Tradeon tokens.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNews } from "../../hooks/useNews";
import NewsCard from "./NewsCard";

export default function NewsSection() {
  const { articles, loading } = useNews();
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const list = useMemo(() => articles.slice(0, 8), [articles]);

  return (
    <section id="news" className="tdn-container tdn-section-tight">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <span className="tdn-eyebrow text-[0.62rem]">Newsroom · live</span>
          <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>Market News</h2>
        </div>
        <Link href="/tradeon/news" className="tdn-btn tdn-btn-ghost !py-2 text-sm inline-flex items-center gap-1.5" style={{ color: "var(--tdn-iris-2)" }}>
          View All <ArrowRight size={15} />
        </Link>
      </div>

      {loading && !list.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="tdn-skeleton rounded-xl" style={{ aspectRatio: "16 / 11" }} />)}
        </div>
      ) : list.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((a) => <NewsCard key={a.id} article={a} now={now} />)}
        </div>
      ) : (
        <p className="text-sm py-8 text-center" style={{ color: "var(--tdn-faint)" }}>No market news right now.</p>
      )}
    </section>
  );
}
