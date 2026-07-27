import * as cheerio from "cheerio";

export const CRAWLER_USER_AGENT = "AltFTool-SaleLocator/1.0 (https://altftool.com)";

// Real, publicly-linked pages only — never guessed/invented URLs. A page is
// a promotion-page candidate if any of these keywords appear in its path.
const PROMO_KEYWORDS = [
  "offer",
  "event",
  "promotion",
  "sale",
  "festival",
  "campaign",
  "shopping",
  "whats-on",
  "whatson",
  "happenings",
];

// Keep the crawl small and fast — homepage + a handful of matched candidate
// pages, never a deep/recursive crawl of the whole site.
const MAX_CANDIDATE_PAGES = 5;
export const FETCH_TIMEOUT_MS = 8000;

function isPromoUrl(pathname) {
  const lower = pathname.toLowerCase();
  return PROMO_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Fetch a page's raw HTML — shared by the crawler and the parser so the
 * fetch/timeout/User-Agent logic isn't duplicated between them.
 *
 * @param {string} url
 * @returns {Promise<string>} raw HTML
 */
export async function fetchPageHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": CRAWLER_USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Page responded with ${res.status}`);
  }
  return res.text();
}

/**
 * Discover real promotion/offer/event page URLs linked from a mall's own
 * homepage — internal links only, matched by keyword in the URL path.
 * Never invents or guesses a URL that isn't actually linked on the site.
 *
 * @param {string} websiteUrl — the mall's official website (from OSM data)
 * @returns {Promise<string[]>} candidate promotion page URLs, same-origin only
 */
export async function discoverPromotionPages(websiteUrl) {
  const homepage = new URL(websiteUrl);
  const html = await fetchPageHtml(homepage.toString());
  const $ = cheerio.load(html);

  const candidates = new Set();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const resolved = new URL(href, homepage);
      if (resolved.origin !== homepage.origin) return; // internal links only
      if (isPromoUrl(resolved.pathname)) {
        candidates.add(resolved.toString());
      }
    } catch {
      // ignore malformed hrefs (mailto:, javascript:, etc.)
    }
  });

  return [...candidates].slice(0, MAX_CANDIDATE_PAGES);
}
