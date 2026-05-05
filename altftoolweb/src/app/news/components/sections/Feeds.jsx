"use client";

import { useState, useEffect, useMemo } from "react";
import NewsCard from "../ui/NewsCard";
import { filterNews } from "../../lib/filterNews";
import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import { injectRandomFeedAds } from "@/ads/adInjector";
import AdNewsCard from "@/ads/layouts/news/AdNewsCard";

export default function Feeds({ type = "all", location }) {
  const device = useDevice();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch from API (cached server-side for 10 min) ──────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);

    fetch(`/news/api?${params}`)
      .then((r) => r.json())
      .then(({ news }) => setNewsData(news ?? []))
      .catch(() => setNewsData([]))
      .finally(() => setLoading(false));
  }, [location]);

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
        <h1 className="text-xl font-bold capitalize">
          {type === "all" ? "Latest News" : type}
        </h1>
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
      <h1 className="text-xl font-bold capitalize">
        {type === "all" ? "Latest News" : type}
      </h1>

      {newsWithAds.map((item) => {
        if (item.type === "ad-single") {
          return <AdNewsCard key={item.id} ad={item.ad} />;
        }
        return <NewsCard key={item.id} news={item} />;
      })}
    </main>
  );
}