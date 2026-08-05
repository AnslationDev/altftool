// lib/news/normalize.js

import { getNewsHoursAgo, normalizePublishedAt } from "./time.js";

/**
 * Deterministic 32-bit hash, used only to disambiguate slugs for syndicated
 * stories that share a headline. It must never be used to synthesise data
 * that is presented to readers as fact.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Extract the best image URL from a raw RSS item.
 */
function extractImage(item) {
  // media:content
  if (item.mediaContent?.["$"]?.url) return item.mediaContent["$"].url;
  // media:thumbnail
  if (item.mediaThumbnail?.["$"]?.url) return item.mediaThumbnail["$"].url;
  // enclosure (podcasts / image feeds)
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/"))
    return item.enclosure.url;
  // itunes:image
  if (item["itunes:image"]) return item["itunes:image"];
  // fallback: parse first <img> from content snippet
  const html = item["content:encoded"] || item.content || item.summary || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/**
 * Strip HTML tags from a string.
 */
function stripHtml(str = "") {
  return str.replace(/<[^>]*>/g, "").trim();
}

/**
 * Build a URL-safe slug from a headline.
 */
function slugify(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Guess a favicon URL for a source domain.
 */
function faviconUrl(link = "") {
  try {
    const { hostname } = new URL(link);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

/**
 * Infer category from title/description text if not already set.
 */
const CATEGORY_KEYWORDS = {
  tech: ["ai", "software", "apple", "google", "microsoft", "startup", "tech", "cyber", "robot"],
  business: ["market", "stock", "economy", "finance", "trade", "gdp", "bank", "revenue"],
  politics: ["election", "president", "senate", "congress", "parliament", "minister", "vote"],
  science: ["nasa", "climate", "research", "study", "science", "space", "discovery"],
  health: ["covid", "vaccine", "health", "hospital", "cancer", "disease", "medical"],
  sports: ["nba", "nfl", "soccer", "cricket", "football", "tennis", "olympic", "match"],
  world: [],
};

function inferCategory(text = "", fallback = "world") {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return fallback;
}

/**
 * Normalize a raw RSS item into the NewsCard-compatible shape.
 */
export function normalizeItem(item) {
  const headline = stripHtml(item.title || "Untitled");
  const summary = stripHtml(
    item["content:encodedSnippet"] ||
    item.contentSnippet ||
    item.summary ||
    ""
  ).slice(0, 200);

  const externalUrl = item.link || item.guid || "";
  const imageUrl = extractImage(item);
  const source = item._source || item["dc:creator"] || "Unknown";
  const publishedAt = normalizePublishedAt(item.isoDate || item.pubDate);
  const category = inferCategory(headline + " " + summary, item._category || "world");
  const idSuffix = publishedAt
    ? Date.parse(publishedAt)
    : hashString(`${externalUrl}|${source}|${headline}`);
  const id = `${slugify(headline)}-${idSuffix}`;
  // Syndicated wire stories often share an identical (or near-identical)
  // headline across sources — a bare slugify(headline) collides and the
  // second article becomes permanently unreachable behind the first's page.
  // The suffix disambiguates without needing to change the id shape above.
  const slugSuffix = hashString(externalUrl || id).toString(36).slice(0, 6);

  return {
    id,
    headline,
    summary,
    image_url: imageUrl,
    source,
    source_favicon: faviconUrl(externalUrl),
    external_url: externalUrl,
    category,
    published_at: publishedAt,
    published_hours_ago: getNewsHoursAgo(publishedAt),
    location: null,
    // No likes/comments/shares: we have no engagement data for syndicated
    // feed items, and inventing counts would be fabricated.
    slug: `${slugify(headline)}-${slugSuffix}`,
    publisher_type: "media",
    tags: [],
  };
}

/**
 * Normalize an array of raw RSS items.
 */
export function normalizeItems(rawItems) {
  return rawItems.map(normalizeItem).filter((n) => n.headline && n.external_url);
}
