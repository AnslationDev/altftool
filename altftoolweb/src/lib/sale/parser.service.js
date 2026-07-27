import * as cheerio from "cheerio";
import { fetchPageHtml } from "./crawler.service.js";

// Common container patterns real sites use for promo/event/offer cards.
// Tried in order; the first selector that yields multiple matches wins.
const CARD_SELECTORS = [
  "article",
  "[class*='event-card']",
  "[class*='offer-card']",
  "[class*='promo-card']",
  "[class*='card']",
  "[class*='event']",
  "[class*='offer']",
  "[class*='promotion']",
];

// e.g. "20 Jul - 31 Jul 2025", "Jul 20 – Jul 31", "20/07/2025 - 31/07/2025"
const DATE_RANGE_PATTERN =
  /(\d{1,2}\s*[A-Za-z]{3,9}|\b[A-Za-z]{3,9}\s*\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:-|–|to)\s*(\d{1,2}\s*[A-Za-z]{3,9}(?:\s*\d{2,4})?|\b[A-Za-z]{3,9}\s*\d{1,2}(?:,?\s*\d{2,4})?|\d{1,2}\/\d{1,2}\/\d{2,4})/i;

function resolveUrl(maybeUrl, baseUrl) {
  if (!maybeUrl) return null;
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractDateRange(text) {
  const match = text.match(DATE_RANGE_PATTERN);
  if (!match) return { startDate: null, endDate: null };
  return { startDate: match[1].trim(), endDate: match[2].trim() };
}

function extractFromCard($, card, pageUrl) {
  const $card = $(card);

  const title = $card.find("h1, h2, h3, h4").first().text().trim() || $card.find("strong").first().text().trim();
  if (!title) return null;

  const description = $card.find("p").first().text().trim() || null;
  const imageSrc = $card.find("img").first().attr("src") || $card.find("img").first().attr("data-src");
  const ctaHref = $card.find("a[href]").first().attr("href");
  const { startDate, endDate } = extractDateRange($card.text());

  return {
    title,
    description,
    image: resolveUrl(imageSrc, pageUrl),
    startDate,
    endDate,
    ctaLink: resolveUrl(ctaHref, pageUrl) || pageUrl,
    sourceUrl: pageUrl,
  };
}

/**
 * Extract promotion/event cards from a single page's real HTML. Purely
 * extractive — every field comes directly from the page's own markup, and
 * a page that doesn't parse cleanly simply yields no results rather than a
 * guessed/fabricated one.
 *
 * @param {string} pageUrl
 * @returns {Promise<Array<{
 *   title: string, description: string|null, image: string|null,
 *   startDate: string|null, endDate: string|null, ctaLink: string,
 *   sourceUrl: string,
 * }>>}
 */
export async function extractPromotionsFromPage(pageUrl) {
  const html = await fetchPageHtml(pageUrl);
  const $ = cheerio.load(html);

  for (const selector of CARD_SELECTORS) {
    const matches = $(selector);
    if (matches.length < 2) continue; // a single stray match is usually chrome, not a real repeating card list

    const extracted = matches
      .toArray()
      .map((el) => extractFromCard($, el, pageUrl))
      .filter(Boolean);

    if (extracted.length > 0) {
      // De-dupe by title — many sites repeat the same card in mobile/desktop markup.
      const seen = new Set();
      return extracted.filter((item) => {
        const key = item.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 12);
    }
  }

  return [];
}
