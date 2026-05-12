// app/api/news/route.js

import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";
import { GLOBAL_FEEDS, buildGoogleNewsUrl } from "../lib/sources";
import { fetchFeeds } from "../lib/fetchFeeds";
import { normalizeItems } from "../lib/normalize";
import { deduplicate } from "../lib/dedupe";
import { rankArticles } from "../lib/rank";
import { cache } from "../lib/cache";

export const runtime = "nodejs"; // rss-parser needs Node APIs

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 120,
    scope: "news-api",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location")?.trim() || null;
  const topic = searchParams.get("topic")?.trim() || null;

  const cacheKey = `news:${location ?? "global"}:${topic ?? "all"}`;

  // ── Cache hit ──────────────────────────────────────────────────────────
  const cached = cache.get(cacheKey);
  if (cached) {
    return jsonResponse(NextResponse, { news: cached, cached: true }, {
      cache: { sMaxage: 600, staleWhileRevalidate: 1200 },
    });
  }

  // ── Build feed list ────────────────────────────────────────────────────
  const feeds = [...GLOBAL_FEEDS];

  if (location) {
    feeds.push({
      url: buildGoogleNewsUrl(location),
      source: `Google News – ${location}`,
      category: "world",
    });
  }

  if (topic) {
    feeds.push({
      url: buildGoogleNewsUrl(topic),
      source: `Google News – ${topic}`,
      category: "world",
    });
  }

  // ── Fetch → normalize → dedupe → rank ─────────────────────────────────
  const rawItems = await fetchFeeds(feeds);
  const normalized = normalizeItems(rawItems);
  const deduped = deduplicate(normalized);
  const ranked = rankArticles(deduped);

  // ── Cache & respond ────────────────────────────────────────────────────
  cache.set(cacheKey, ranked);

  return jsonResponse(NextResponse, { news: ranked, cached: false }, {
    cache: { sMaxage: 600, staleWhileRevalidate: 1200 },
  });
}
