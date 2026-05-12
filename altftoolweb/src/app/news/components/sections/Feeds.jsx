"use client";

import { useState, useEffect, useMemo } from "react";
import NewsCard from "../ui/NewsCard";
import { filterNews } from "../../lib/filterNews";
import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import { injectRandomFeedAds } from "@/ads/adInjector";
import AdNewsCard from "@/ads/layouts/news/AdNewsCard";

function formatFeedTitle({ title, type, topic }) {
  if (title) return title;
  if (topic) return `${topic} News`;
  return type === "all" ? "Latest News" : type;
}

export default function Feeds({ type = "all", location, topic, title }) {
  const device = useDevice();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const feedTitle = formatFeedTitle({ title, type, topic });

  // ── Fetch from API (cached server-side for 10 min) ──────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (topic) params.set("topic", topic);

    fetch(`/news/api?${params}`)
      .then((r) => r.json())
      .then(({ news }) => setNewsData(news ?? []))
      .catch(() => setNewsData([]))
      .finally(() => setLoading(false));
  }, [location, topic]);

  const filteredNews = useMemo(
    () => filterNews(newsData, type),
    [newsData, type]
  );

  const newsAds = useAds({
    placement: "news_feed",
    layout: "news_card",
    device,
  });

  const newsWithAds = useMemo(
    () => injectRandomFeedAds(filteredNews, newsAds, 3),
    [filteredNews, newsAds]
  );

  if (loading) {
    return (
      <main className="space-y-6">
        <h1 className="text-xl font-bold capitalize">{feedTitle}</h1>
        {/* Skeleton placeholders — matches NewsCard height */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] h-64 animate-pulse"
          />
        ))}
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-bold capitalize">{feedTitle}</h1>

      {newsWithAds.length ? newsWithAds.map((item) => {
        if (item.type === "ad-single") {
          return <AdNewsCard key={item.id} ad={item.ad} />;
        }
        return <NewsCard key={item.id} news={item} />;
      }) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">No stories found</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Try another topic or come back when the feed refreshes.
          </p>
        </div>
      )}
    </main>
  );
}
