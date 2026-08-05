// src/app/tradeon/components/news/NewsSection.jsx
// Home-page "Market News" section — live, auto-refreshing headlines in an editorial
// layout: one large featured story (image + headline + summary) above a horizontal
// carousel of secondary stories, with a "Show more news" link. Same data/logic as
// before (useNews); every card is fully clickable → its News Detail page.
// Theme-aware via Tradeon tokens; fully responsive.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNews } from "../../hooks/useNews";
import NewsCard, { CAT_COLOR, NewsThumb, timeAgo } from "./NewsCard";

const hrefOf = (a) => `/tradeon/news/${a.slug || a.id}`;
const colorOf = (a) => CAT_COLOR[a.category] || "#0d9488";

export default function NewsSection() {
  const { articles, loading } = useNews();
  const [now, setNow] = useState(null);
  const scroller = useRef(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const list = useMemo(() => articles.slice(0, 9), [articles]);
  const featured = list[0];
  const rest = list.slice(1);

  const scroll = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section id="news" className="w-full">
      {/* Section heading (kept for consistency with sibling home sections) */}
      <div className="mb-4">
        <span className="tdn-eyebrow text-[0.62rem]">Newsroom · live</span>
        <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>Market News</h2>
      </div>

      {loading && !featured ? (
        /* Loading skeleton */
        <div className="space-y-6">
          <div className="grid md:grid-cols-[minmax(0,2fr)_3fr] gap-4 sm:gap-6 items-center">
            <div className="tdn-skeleton rounded-xl w-full" style={{ aspectRatio: "4 / 3" }} />
            <div className="space-y-3">
              <div className="tdn-skeleton rounded-lg h-7 w-11/12" />
              <div className="tdn-skeleton rounded-lg h-4 w-full" />
              <div className="tdn-skeleton rounded-lg h-4 w-10/12" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="tdn-skeleton rounded-xl" style={{ aspectRatio: "16 / 11" }} />)}
          </div>
        </div>
      ) : featured ? (
        <>
          {/* ── Featured story: image left, headline + summary right ── */}
          <Link href={hrefOf(featured)} className="group grid md:grid-cols-[minmax(0,2fr)_3fr] gap-4 sm:gap-6 items-center">
            <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 3", border: "1px solid var(--tdn-border)" }}>
              <NewsThumb src={featured.image} color={colorOf(featured)} alt={featured.title} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="min-w-0">
              <h3 className="tdn-display text-xl sm:text-2xl lg:text-[1.85rem] leading-tight font-extrabold line-clamp-3 transition-colors group-hover:text-[var(--tdn-iris-2)]" style={{ color: "var(--tdn-fg-strong)" }}>
                {featured.title}
              </h3>
              {featured.summary && (
                <p className="mt-2.5 text-sm sm:text-[0.95rem] leading-relaxed line-clamp-3 lg:line-clamp-4" style={{ color: "var(--tdn-muted)" }}>
                  {featured.summary}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "var(--tdn-faint)" }}>
                <span className="font-semibold" style={{ color: "var(--tdn-muted)" }}>{featured.source}</span>
                <span>·</span>
                <span>{timeAgo(featured.publishedAt, now)}</span>
              </div>
            </div>
          </Link>

          {/* ── Secondary stories: horizontal carousel with prev/next ── */}
          {rest.length > 0 && (
            <div className="relative mt-6">
              <button
                type="button" onClick={() => scroll(-1)} aria-label="Previous stories"
                className="grid place-items-center absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full transition-colors hover:bg-[var(--tdn-card-hover)]"
                style={{ background: "var(--tdn-card)", border: "1px solid var(--tdn-border)", boxShadow: "var(--tdn-shadow-sm)", color: "var(--tdn-fg-strong)" }}
              >
                <ChevronLeft size={18} />
              </button>

              <div ref={scroller} className="flex gap-4 overflow-x-auto scroll-smooth snap-x tdn-scroll-hide pb-1">
                {rest.map((a) => (
                  <div key={a.id} className="shrink-0 snap-start basis-[80%] sm:basis-[46%] lg:basis-[31%] xl:basis-[23.5%]">
                    <NewsCard article={a} now={now} />
                  </div>
                ))}
              </div>

              <button
                type="button" onClick={() => scroll(1)} aria-label="Next stories"
                className="grid place-items-center absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full transition-colors hover:bg-[var(--tdn-card-hover)]"
                style={{ background: "var(--tdn-card)", border: "1px solid var(--tdn-border)", boxShadow: "var(--tdn-shadow-sm)", color: "var(--tdn-fg-strong)" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── Show more ── */}
          <div className="flex justify-end mt-5 pt-4" style={{ borderTop: "1px solid var(--tdn-border)" }}>
            <Link href="/tradeon/news" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[var(--tdn-iris)]" style={{ color: "var(--tdn-iris-2)" }}>
              Show more news <ArrowRight size={15} />
            </Link>
          </div>
        </>
      ) : (
        <p className="text-sm py-8 text-center" style={{ color: "var(--tdn-faint)" }}>No market news right now.</p>
      )}
    </section>
  );
}
