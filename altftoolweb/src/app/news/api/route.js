// app/api/news/route.js

import { NextResponse } from "next/server";
import { GLOBAL_FEEDS, buildGoogleNewsUrl } from "../lib/sources";
import { fetchFeeds } from "../lib/fetchFeeds";
import { normalizeItems } from "../lib/normalize";
import { deduplicate } from "../lib/dedupe";
import { rankArticles } from "../lib/rank";
import { cache } from "../lib/cache";

export const runtime = "nodejs"; // rss-parser needs Node APIs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location")?.trim() || null;

  const cacheKey = `news:${location ?? "global"}`;

  // ── Cache hit ──────────────────────────────────────────────────────────
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ news: cached, cached: true });
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

  // ── Fetch → normalize → dedupe → rank ─────────────────────────────────
  const rawItems = await fetchFeeds(feeds);
  const normalized = normalizeItems(rawItems);
  const deduped = deduplicate(normalized);
  const ranked = rankArticles(deduped);

  // ── Cache & respond ────────────────────────────────────────────────────
  cache.set(cacheKey, ranked);

  return NextResponse.json({ news: ranked, cached: false });
}