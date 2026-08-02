import { cache } from "react";
import { notFound } from "next/navigation";
import newsData from "../../../../public/data/newsdata.json";
import NewsArticleView from "./NewsArticleView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

export const revalidate = 600;

const ALL_CATEGORIES = [
  "politics", "tech", "business", "science", "sports", "health", "world", "entertainment",
];

// Feed items are syndicated, so credit goes to the originating publication when
// the feed names one and to AltFTool otherwise. Never to an individual byline —
// we do not know who wrote a syndicated item.
const ORGANIZATION_ATTRIBUTION = "AltFTool News";

/**
 * Build a <title> for a feed article that survives a mobile SERP.
 *
 * The title used to be `${article.headline} | AltFTool News` with no length
 * control. Headlines are written for the page, not for a result listing: the
 * ten items in public/data/newsdata.json run 50-100 characters, so with the
 * 16-character section suffix every single one shipped over the ~60 characters
 * Google renders (measured range 66-116). 84% of this site's search clicks are
 * mobile, where the cut is harshest, so the tail of the headline was being
 * thrown away by Google rather than chosen by us.
 *
 * The suffix cannot simply be dropped to buy room: resolveDocumentTitle() in
 * src/platform/seo/generateMetadata.js only treats a title as absolute when it
 * carries the brand, so a bare headline would have " | AltFTool" appended by
 * the root layout and end up longer than it started.
 */
const NEWS_TITLE_MAX = 60;

// Words that must never be the last thing in a title — clipping mid-phrase
// leaves a dangling "... after" or "... in", which reads as broken markup.
const TRAILING_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "from", "by", "with", "as", "into", "onto", "over", "under", "after",
  "before", "during", "that", "which", "who", "when", "while", "about", "its",
  "their", "his", "her", "was", "were", "is", "are", "be", "been", "has",
  "have", "had", "up", "out", "off", "than", "then", "so", "if", "it", "he",
  "she", "they", "we", "you", "this", "these", "those", "there",
]);

function trimDanglingWords(text = "") {
  let out = text.replace(/[,:;\-–—\s]+$/g, "").trim();
  for (;;) {
    const match = out.match(/\s([\w.’'-]+)$/);
    if (!match) break;
    const word = match[1].toLowerCase().replace(/[.’'"]+$/g, "");
    if (!TRAILING_STOPWORDS.has(word)) break;
    out = out.slice(0, match.index).replace(/[,:;\-–—\s]+$/g, "").trim();
  }
  return out;
}

export function buildNewsTitle(headline = "") {
  const clean = String(headline).replace(/\s+/g, " ").trim();
  if (!clean) return ORGANIZATION_ATTRIBUTION;

  // Preferred form: the section brand, whenever the headline leaves room.
  const sectionSuffix = ` | ${ORGANIZATION_ATTRIBUTION}`;
  if (clean.length + sectionSuffix.length <= NEWS_TITLE_MAX) {
    return `${clean}${sectionSuffix}`;
  }

  // Otherwise fall back to the shorter site brand, which buys 5 characters.
  const siteSuffix = " | AltFTool";
  const budget = NEWS_TITLE_MAX - siteSuffix.length;
  if (clean.length <= budget) return `${clean}${siteSuffix}`;

  const clipped = clean.slice(0, budget + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const raw =
    lastSpace >= Math.floor(budget * 0.6)
      ? clipped.slice(0, lastSpace)
      : clean.slice(0, budget);
  const base = trimDanglingWords(raw) || clean.slice(0, budget).trim();
  return `${base}${siteSuffix}`;
}

function getSourceAttribution(article) {
  const source = typeof article.source === "string" ? article.source.trim() : "";
  if (!source || source.toLowerCase() === "unknown") return null;
  return source;
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Deterministic 32-bit hash so the fallback category picked for an article
// stays stable across requests and ISR revalidations instead of re-rolling
// with Math.random() on every server call.
function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickSeeded(list, seed) {
  return list[hashString(seed) % list.length];
}

function enrichArticle(article) {
  const seed = article.id || article.slug || article.headline || "";
  const sourceName = getSourceAttribution(article);
  const category = article.category || pickSeeded(ALL_CATEGORIES, seed);
  const tags = article.tags?.length
    ? article.tags
    : [category, article.source?.toLowerCase().replace(/\s+/g, ""), "trending"].filter(Boolean);
  const readingTime = article.reading_time_minutes || Math.max(3, Math.ceil((article.summary?.length || 100) / 200) * 3 + 2);
  const content = article.content || (
    article.summary
      ? [
          article.summary,
          article.external_url
            ? `Read the full story from ${article.source || "the original source"}: ${article.external_url}`
            : null,
        ].filter(Boolean)
      : null
  );

  return {
    ...article,
    category,
    tags,
    reading_time_minutes: readingTime,
    content,
    attribution: sourceName || ORGANIZATION_ATTRIBUTION,
    is_syndicated: Boolean(sourceName),
    subtitle: article.subtitle || `An in-depth look at ${article.headline?.toLowerCase() || "this developing story"}, exploring the key developments, reactions, and what comes next.`,
    highlights: article.highlights || [],
    image_caption: article.image_caption || `${article.source || "News"} — A visual report on the ongoing developments.`,
  };
}

const findArticle = cache(async (slug) => {
  let article = (newsData.news || []).find((n) => n.slug === slug);
  if (!article) {
    const remoteNews = await getNewsDataServer();
    article = (remoteNews || []).find((n) => n.slug === slug);
  }
  return article ? enrichArticle(article) : null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await findArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: "News Article - AltFTool News",
      description:
        "This AltFTool News article is no longer available. Head to the news hub for the latest technology, business, and web tools coverage.",
      path: `/news/${slug}`,
      // Feed items rotate out, so this slug 404s — do not index the miss.
      noindex: true,
    });
  }

  return createPageMetadata({
    title: buildNewsTitle(article.headline),
    description: article.summary || "Read the latest news update on AltFTool News.",
    path: `/news/${article.slug}`,
    image: article.image_url,
    keywords: [article.category, ...(article.tags || []), "AltFTool News"],
    type: "article",
  });
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const article = await findArticle(slug);

  if (!article) {
    notFound();
  }

  // No fabricated fallback: when the feed is unavailable the sidebar widget
  // simply renders nothing.
  const allNewsData = await getNewsDataServer().catch(() => []);
  const allArticles = Array.isArray(allNewsData) ? allNewsData : allNewsData.news || [];

  const relatedNews = (newsData.news || [])
    .filter((n) => n.slug !== slug)
    .slice(0, 4);

  // getNewsDataServer already returns newest-first; we have no engagement
  // signal to rank by, so recency is the honest ordering.
  const trendingArticles = allArticles.filter((n) => n.slug !== slug).slice(0, 5);

  const relatedContentItems = getRelatedContentForPreset(
    {
      href: `/news/${slug}`,
      title: article.headline || article.title,
      description: article.summary,
      tags: [article.source, article.location, ...(article.tags || [])].filter(Boolean),
      section: "news",
    },
    "editorial"
  );

  return (
    <>
      <JsonLd
        id={`news-schema-${article.slug}`}
        data={[
          createArticleJsonLd({
            path: `/news/${article.slug}`,
            headline: article.headline,
            description: article.summary,
            image: article.image_url,
            datePublished: article.published_at || new Date().toISOString(),
            // Organization credit only: the originating publication when the
            // feed names one, otherwise the site's own organization default.
            author: article.is_syndicated ? article.attribution : undefined,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            {
              name: article.category || "General",
              path: article.category ? `/news/topics/${slugify(article.category)}` : "/news",
            },
            { name: article.headline, path: `/news/${article.slug}` },
          ]),
        ]}
      />
      <NewsArticleView
        article={article}
        relatedNews={relatedNews}
        trendingArticles={trendingArticles}
      />
      <RelatedContentSection
        title="Tools & guides from AltFTool"
        items={relatedContentItems}
        path={`/news/${article.slug}`}
        jsonLdName="Tools & guides from AltFTool"
      />
    </>
  );
}
