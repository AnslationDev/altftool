import { toolMetaMap } from "@/platform/registry/toolMetaMap";

const DIRECT_HINTS = [
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

  DIRECT_HINTS.forEach((hint) => {
    if (hint.slugs.includes(slug) && hint.terms.every((term) => blogTokens.has(term))) {
      score += 80;
    }
  });

  slugTokens.forEach((token) => {
    if (blogTokens.has(token)) score += 18;
  });
  nameTokens.forEach((token) => {
    if (blogTokens.has(token)) score += 20;
  });
  categoryTokens.forEach((token) => {
    if (blogTokens.has(token)) score += 14;
  });
  descriptionTokens.forEach((token) => {
    if (blogTokens.has(token)) score += 4;
  });

  return score;
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

export function getRelatedToolsForBlog(blog = {}, limit = 6) {
  const blogTokens = getBlogTokens(blog);
  const scored = Object.entries(toolMetaMap)
    .map(([slug, tool]) => ({
      slug,
      tool,
      score: scoreTool(slug, tool, blogTokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .map((item) => toToolItem(item.slug, item.tool, blogTokens, item.score));

  const fallback = FALLBACK_SLUGS
    .filter((slug) => toolMetaMap[slug] && !scored.some((item) => item.slug === slug))
    .map((slug) => toToolItem(slug, toolMetaMap[slug], blogTokens, 0));

  return [...scored, ...fallback].slice(0, limit);
}
