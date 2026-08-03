import { NextResponse } from "next/server";
import { enforceTop10RateLimit, top10ProviderFailure } from "@/lib/top10/apiResponse";
import { getTrendingCards } from "@/lib/top10/trendingCards";
import { UNIVERSE_PRODUCT_KEYS } from "@/app/top10/data/top10Data";

export const runtime = "nodejs";

// Every user sees the SAME highlighted universe for a full 6-hour window
// (module-scope cache, same pattern as trendingCards.js's own 1-hour
// cache) — it only recomputes once this window elapses, so "Explore Top10
// by Universe" reads as "this is what's hot right now" without changing
// on every page load.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
let cachedResult = null;
let cachedAt = 0;

/**
 * Real data drives the pick: how many of a universe's own products
 * currently have a genuine `trending: true` card (OpenLibrary/live
 * crypto price/Wikipedia's real "most read" feed — see trendingCards.js),
 * tie-broken by how many of its products returned a real card at all this
 * cycle. Never a fabricated/random choice.
 */
async function computeHighlightedUniverse() {
  const cards = await getTrendingCards();
  const cardsByKey = new Map(cards.map((c) => [c.key, c]));

  let best = null;
  for (const [universeId, productKeys] of Object.entries(UNIVERSE_PRODUCT_KEYS)) {
    const matched = productKeys.map((key) => cardsByKey.get(key)).filter(Boolean);
    const trendingCount = matched.filter((c) => c.trending).length;
    const score = { universeId, trendingCount, totalCount: matched.length };
    if (
      !best ||
      score.trendingCount > best.trendingCount ||
      (score.trendingCount === best.trendingCount && score.totalCount > best.totalCount)
    ) {
      best = score;
    }
  }

  // Nothing was measured, so nothing is highlighted. Without this, `best`
  // is whichever universe happened to be first in the object — every
  // universe ties at 0/0 when no provider answered — and the page paints a
  // "Most Trending" badge on Entertainment off zero data. A missing badge
  // is correct here; an unearned one is a fabricated claim.
  if (!best || best.totalCount === 0) return null;
  return best.universeId;
}

async function getHighlight() {
  const now = Date.now();
  if (cachedResult && now - cachedAt < CACHE_TTL_MS) return cachedResult;

  const highlightedUniverseId = await computeHighlightedUniverse();
  cachedResult = { highlightedUniverseId, refreshedAt: now, nextRefreshAt: now + CACHE_TTL_MS };
  cachedAt = now;
  return cachedResult;
}

/**
 * GET /api/top10/universe-highlight
 *
 * Which "Explore Top10 by Universe" tile is genuinely hottest right now,
 * real-data-driven and stable for a 6-hour window before it can change.
 */
export async function GET(request) {
  const limited = enforceTop10RateLimit(request);
  if (limited) return limited;
  try {
    const result = await getHighlight();
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=21600" },
    });
  } catch (error) {
    return top10ProviderFailure(
      { highlightedUniverseId: null },
      error,
    );
  }
}
