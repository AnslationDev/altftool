// src/app/tradeon/api/news/route.js
// Aggregates free real-time RSS feeds into a normalised, auto-categorised news
// feed for the Tradeon News module. Server-side (no CORS, no API key). Resilient
// (one bad feed never fails the response), deduped, newest-first, and cached
// in-memory for 5 minutes so the client can auto-refresh cheaply.
//   GET /tradeon/api/news            -> { articles, updatedAt, sources }
//   GET /tradeon/api/news?id=<id>    -> { article, related }

import Parser from "rss-parser";
import { NEWS_FEEDS, categorize, newsId } from "@/app/tradeon/lib/news";
import { extractArticleHtml } from "@/app/tradeon/lib/articleExtract";
import { findNewsBySlug, newsSlug } from "@/app/tradeon/lib/slug";

export const runtime = "nodejs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36";
const parser = new Parser({
  timeout: 12000,
  headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
  customFields: { item: [["media:content", "media", { keepArray: true }], ["media:thumbnail", "thumb"], ["content:encoded", "contentEncoded"]] },
});

const TTL = 5 * 60 * 1000;
let CACHE = { at: 0, articles: [], sources: 0 };

function pickImage(item) {
  const media = Array.isArray(item.media) ? item.media.find((m) => m?.$?.url) : null;
  if (media) return media.$.url;
  if (item.thumb?.$?.url) return item.thumb.$.url;
  if (item.enclosure?.url && /(image|jpg|jpeg|png|webp|gif)/i.test(item.enclosure.type || item.enclosure.url)) return item.enclosure.url;
  const html = item.contentEncoded || item.content || item["content:encoded"] || "";
  const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

async function fetchFeed(feed) {
  const parsed = await parser.parseURL(feed.url);
  return (parsed.items || []).map((it) => {
    const link = (it.link || "").trim();
    const title = (it.title || "").replace(/\s+/g, " ").trim();
    if (!link || !title) return null;
    const fullText = (it.contentSnippet || it.summary || "").replace(/ /g, " ").trim();
    const summary = fullText.replace(/\s+/g, " ").slice(0, 320);
    const { primary, categories } = categorize(`${title} ${summary}`, feed.category);
    const ts = it.isoDate || it.pubDate || null;
    return {
      id: newsId(link),
      title,
      summary,
      content: fullText,
      source: feed.source,
      url: link,
      image: pickImage(it),
      publishedAt: ts ? new Date(ts).toISOString() : null,
      category: primary,
      categories,
    };
  }).filter(Boolean);
}

async function getArticles() {
  if (CACHE.articles.length && Date.now() - CACHE.at < TTL) return CACHE;
  const results = await Promise.allSettled(NEWS_FEEDS.map(fetchFeed));
  const sources = results.filter((r) => r.status === "fulfilled").length;
  const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const seen = new Map();
  for (const a of all) if (a && !seen.has(a.id)) seen.set(a.id, a);
  const articles = Array.from(seen.values()).sort(
    (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
  );
  if (articles.length) CACHE = { at: Date.now(), articles, sources };
  return { ...CACHE, articles, sources };
}

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

// Per-article extracted full-content HTML (fetched from the source on demand).
// Successful extractions are cached 30 min so repeat views are instant; failures
// (a slow/blocked source) are cached only briefly so they retry soon instead of
// leaving the article empty for half an hour.
const HTML_TTL = 30 * 60 * 1000;
const HTML_FAIL_TTL = 3 * 60 * 1000;
const htmlCache = new Map();
async function getContentHtml(url, summary) {
  const hit = htmlCache.get(url);
  if (hit && Date.now() - hit.at < (hit.html ? HTML_TTL : HTML_FAIL_TTL)) return hit.html;
  let html = null;
  try { html = await extractArticleHtml(url, summary); } catch { html = null; }
  htmlCache.set(url, { at: Date.now(), html });
  if (htmlCache.size > 300) htmlCache.delete(htmlCache.keys().next().value);
  return html;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("slug") || searchParams.get("id");
    const { articles, sources } = await getArticles();

    if (q) {
      const found = findNewsBySlug(articles, q);
      const article = found
        ? { ...found, slug: newsSlug(found), contentHtml: await getContentHtml(found.url, found.summary) }
        : null;
      const related = found
        ? articles.filter((a) => a.id !== found.id && a.categories.some((c) => found.categories.includes(c))).slice(0, 6).map(({ content, ...rest }) => ({ ...rest, slug: newsSlug(rest) }))
        : [];
      return Response.json({ article, related }, { headers: CACHE_HEADERS });
    }

    return Response.json(
      { articles: articles.slice(0, 150).map(({ content, ...rest }) => ({ ...rest, slug: newsSlug(rest) })), updatedAt: new Date().toISOString(), sources, total: articles.length },
      { headers: CACHE_HEADERS }
    );
  } catch (e) {
    return Response.json({ error: "news unavailable", detail: String(e?.message || e), articles: [] }, { status: 502 });
  }
}
