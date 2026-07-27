import { discoverPromotionPages } from "./crawler.service.js";
import { extractPromotionsFromPage } from "./parser.service.js";
import { getOrSetSaleCache, peekSaleCache, buildCacheKey } from "./cache.js";

// On-demand scrape + cache, standing in for the spec's "scheduled background
// job every 6h" — same refresh cadence, without needing a database or a
// worker process this app doesn't otherwise have. Reuses the same TTL-cache
// pattern already used everywhere else in src/lib/sale/.
const PROMOTIONS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function cacheKeyFor(homepage) {
  return buildCacheKey("mall:promotions", { site: `${homepage.origin}${homepage.pathname}` });
}

/**
 * Discover and stream real, currently-live promotions/offers/events from a
 * mall's own official website — emits a chunk as soon as EACH candidate
 * page finishes scraping, rather than waiting for all of them, so the UI
 * can render results progressively instead of one blocking wait. Never
 * invents data — a site with no discoverable promotion page, or a
 * promotion page with nothing parseable, simply yields a
 * `{ status: "no_promotions" }` final chunk.
 *
 * @param {{ website: string|null, name: string }} mall
 * @param {(chunk: { status: string, events: Array<object>, message?: string, done: boolean }) => void} onChunk
 * @returns {Promise<void>}
 */
export async function streamMallPromotions({ website, name }, onChunk) {
  if (!website) {
    onChunk({ status: "no_website", events: [], done: true });
    return;
  }

  let homepage;
  try {
    homepage = new URL(website);
  } catch {
    onChunk({ status: "no_website", events: [], done: true });
    return;
  }

  const cacheKey = cacheKeyFor(homepage);
  const cached = peekSaleCache(cacheKey);
  if (cached && !cached.then) {
    // Already have a fresh result — nothing to stream progressively, just
    // deliver it as a single chunk.
    onChunk({ ...cached, done: true });
    return;
  }

  let candidatePages;
  try {
    candidatePages = await discoverPromotionPages(homepage.toString());
  } catch {
    onChunk({
      status: "error",
      events: [],
      message: `Couldn't reach ${name || "the mall"}'s website right now.`,
      done: true,
    });
    return;
  }

  if (candidatePages.length === 0) {
    const result = { status: "no_promotions", events: [] };
    getOrSetSaleCache(cacheKey, async () => result, PROMOTIONS_CACHE_TTL_MS).catch(() => {});
    onChunk({ ...result, done: true });
    return;
  }

  const allEvents = [];
  let remaining = candidatePages.length;

  await new Promise((resolve) => {
    candidatePages.forEach((url) => {
      extractPromotionsFromPage(url)
        .then((events) => {
          if (events.length > 0) {
            allEvents.push(...events);
            // Emit this page's results the moment it's ready — the caller
            // does not wait for the slower remaining pages.
            onChunk({ status: "ok", events, done: false });
          }
        })
        .catch(() => {
          // One page failing to scrape shouldn't affect the others.
        })
        .finally(() => {
          remaining -= 1;
          if (remaining === 0) resolve();
        });
    });
  });

  const finalResult = allEvents.length > 0
    ? { status: "ok", events: [] } // events already streamed incrementally above
    : { status: "no_promotions", events: [] };

  // Cache the merged full list (not the empty "already streamed" shell) so a
  // later request within the TTL window can skip scraping entirely.
  getOrSetSaleCache(cacheKey, async () => ({
    status: allEvents.length > 0 ? "ok" : "no_promotions",
    events: allEvents,
  }), PROMOTIONS_CACHE_TTL_MS).catch(() => {});

  onChunk({ ...finalResult, done: true });
}
