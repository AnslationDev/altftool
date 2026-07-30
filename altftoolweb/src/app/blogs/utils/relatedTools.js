import { toolMetaMap } from "@/platform/registry/toolMetaMap";

const DIRECT_HINTS = [
  // Search Console, 7-day export: "utm builder"-class queries drew 2,198
  // impressions and 0 clicks, all of them landing on
  // /blogs/best-utm-builder-tools-to-track-marketing-campaigns (2,523 imp,
  // 1 click, pos 21.6) while /tools/all/utm-link-builder recorded no
  // impressions at all. The queries are tool intent, so pin the owned tool to
  // the top of that post's rail — relatedTools[0] is what BlogArticleSnapshot
  // promotes above the fold.
  { terms: ["utm"], slugs: ["utm-link-builder"] },
  // Same shape: word-count queries drew 296 impressions and 0 clicks against
  // /blogs/the-best-real-time-word-counter-tools-you-should-try-today
  // (484 imp, 0 clicks, pos 13.7); /tools/all/word-character-counter had no
  // impressions of its own.
  { terms: ["word", "counter"], slugs: ["word-character-counter"] },
  { terms: ["word", "count"], slugs: ["word-character-counter"] },
  { terms: ["youtube", "thumbnail"], slugs: ["youtube-thumbnail-downloader", "youtube-video-analyzer"] },
  { terms: ["facebook", "video"], slugs: ["facebook-video-downloader"] },
  { terms: ["image", "resize"], slugs: ["image-resizer", "image-compressor", "image-cropper"] },
  { terms: ["image", "background"], slugs: ["bg-remover", "image-compressor"] },
  { terms: ["pdf"], slugs: ["pdf-merger", "pdf-split-tool", "word-ppt-excel-to-pdf", "pdf-to-base64"] },
  { terms: ["base64"], slugs: ["text-to-base64", "base64-to-text", "base64-to-image", "base64-to-pdf"] },
  { terms: ["json"], slugs: ["json-editor", "json-formatter", "json-to-csv"] },
  { terms: ["seo"], slugs: ["meta-tag-generator", "keyword-density-checker", "page-speed-analyzer"] },
  { terms: ["calculator"], slugs: ["percentage-calculator", "loan-emi-calculator", "sip-calculator"] },
  { terms: ["color"], slugs: ["color-palette-from-image", "color-contrast-checker", "gradient-generator"] },
];

const FALLBACK_SLUGS = [
  "youtube-thumbnail-downloader",
  "image-compressor",
  "pdf-merger",
  "json-editor",
  "qr-generator",
  "password-generator",
];

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "blog",
  "can",
  "for",
  "from",
  "guide",
  "how",
  "into",
  "read",
  "that",
  "the",
  "this",
  "tool",
  "tools",
  "use",
  "with",
  "your",
]);

function normalize(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(value = "") {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function getToolCategories(tool = {}) {
  return Array.isArray(tool.category)
    ? tool.category.filter(Boolean)
    : [tool.category].filter(Boolean);
}

function getBlogTokens(blog = {}) {
  return new Set(
    [
      blog.heading,
      blog.title,
      blog.category,
      blog.tool,
      blog.topic,
      blog.excerpt,
      Array.isArray(blog.tags) ? blog.tags.join(" ") : blog.tags,
    ]
      .filter(Boolean)
      .flatMap(tokenize),
  );
}

function getMatchLabel(tool, blogTokens) {
  const categories = getToolCategories(tool);
  const category = categories.find((item) => blogTokens.has(normalize(item))) || categories[0];
  return category || "AltFTool";
}

function scoreTool(slug, tool, blogTokens) {
  const slugTokens = tokenize(slug);
  const nameTokens = tokenize(tool.name);
  const categoryTokens = getToolCategories(tool).flatMap(tokenize);
  const descriptionTokens = tokenize(tool.description);
  let score = 0;
  // Which DISTINCT post words the tool answers to, and whether a curated hint
  // vouched for it. The score cannot tell these apart on its own: one word
  // landing in both the slug and the name scores 38, more than two unrelated
  // words would.
  const matchedWords = new Set();
  let hinted = false;

  DIRECT_HINTS.forEach((hint) => {
    if (hint.slugs.includes(slug) && hint.terms.every((term) => blogTokens.has(term))) {
      score += 80;
      hinted = true;
      hint.terms.forEach((term) => matchedWords.add(term));
    }
  });

  slugTokens.forEach((token) => {
    if (blogTokens.has(token)) {
      score += 18;
      matchedWords.add(token);
    }
  });
  nameTokens.forEach((token) => {
    if (blogTokens.has(token)) {
      score += 20;
      matchedWords.add(token);
    }
  });
  categoryTokens.forEach((token) => {
    if (blogTokens.has(token)) {
      score += 14;
      matchedWords.add(token);
    }
  });
  descriptionTokens.forEach((token) => {
    if (blogTokens.has(token)) {
      score += 4;
      matchedWords.add(token);
    }
  });

  return { score, breadth: matchedWords.size, hinted };
}

function toToolItem(slug, tool, blogTokens, score = 0) {
  const categories = getToolCategories(tool);
  return {
    slug,
    name: tool.name || slug.replace(/-/g, " "),
    description: tool.description || "Open this AltFTool utility for a faster workflow.",
    category: categories[0] || "Tool",
    href: `/tools/all/${slug}`,
    searchHref: `/tools/all?search=${encodeURIComponent(categories[0] || tool.name || slug)}`,
    matchLabel: getMatchLabel(tool, blogTokens),
    score,
  };
}

// One shared word is a coincidence, not a relationship, and this rail scores a
// single word landing in a slug or name high enough to publish: the screen
// recorder post linked /tools/all/dmarc-record-generator and
// /tools/all/mx-record-priority-planner on nothing but "record", and the word
// counter post linked /tools/all/word-search. Ask for a second, independent
// word — or a curated DIRECT_HINTS pairing, which a human already vouched for.
//
// Measured over all 31 posts: this drops 19 of 186 shipped links (10.2%),
// every post still fills its 6 slots, and because the replacements are spread
// wider the rail ends up linking MORE of the catalogue, not less — 109
// distinct tools before, 113 after.
function isCorroborated(match) {
  return match.hinted || match.breadth >= 2;
}

export function getRelatedToolsForBlog(blog = {}, limit = 6) {
  const blogTokens = getBlogTokens(blog);
  const scored = Object.entries(toolMetaMap)
    .map(([slug, tool]) => ({
      slug,
      tool,
      match: scoreTool(slug, tool, blogTokens),
    }))
    .filter((item) => item.match.score > 0 && isCorroborated(item.match))
    .sort((a, b) => b.match.score - a.match.score || a.slug.localeCompare(b.slug))
    .map((item) => toToolItem(item.slug, item.tool, blogTokens, item.match.score));

  const fallback = FALLBACK_SLUGS
    .filter((slug) => toolMetaMap[slug] && !scored.some((item) => item.slug === slug))
    .map((slug) => toToolItem(slug, toolMetaMap[slug], blogTokens, 0));

  return [...scored, ...fallback].slice(0, limit);
}
