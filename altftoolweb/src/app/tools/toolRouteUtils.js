import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { buildToolSeoContent } from "./toolSeoContent";
import { primeSeoConfig } from "@/platform/seo/seoConfigSource";
import {
  getCanonicalCategoryBySlug,
  getLegacyCategorySlugMap,
  slugifyCategory,
} from "@/platform/registry/categoryTaxonomy";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";

export function getTool(slug) {
  return toolMetaMap[slug] ?? null;
}

export function getToolCategories(tool) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

export function slugifyRouteSegment(value = "") {
  // Category labels may contain "&" (e.g. "Design & Color") — strip to a
  // clean URL slug ("design-color") via the shared taxonomy slugifier.
  return slugifyCategory(value);
}

/**
 * Resolve a requested category slug to its canonical slug, following the
 * legacy free-text taxonomy (e.g. "calculator" → "calculators",
 * "utility" → "productivity"). Returns null when no redirect applies.
 */
export function getLegacyCategoryRedirect(categorySlug) {
  if (!categorySlug || categorySlug === "all") return null;
  if (getCanonicalCategoryBySlug(categorySlug)) return null;
  const target = getLegacyCategorySlugMap()[categorySlug];
  return target && target !== categorySlug ? target : null;
}

export function getToolCategorySlugs() {
  const categories = new Set(["all"]);

  Object.values(toolMetaMap).forEach((tool) => {
    getToolCategories(tool).forEach((category) => {
      const slug = slugifyRouteSegment(category);
      if (slug) categories.add(slug);
    });
  });

  return [...categories].sort();
}

function getCatalogEntries(category = "all") {
  const normalizedCategory = slugifyRouteSegment(category || "all");
  return Object.entries(toolMetaMap).filter(
    ([, tool]) =>
      normalizedCategory === "all" ||
      getToolCategories(tool)
        .map(slugifyRouteSegment)
        .includes(normalizedCategory),
  );
}

export function getToolCatalogCount(category = "all") {
  return getCatalogEntries(category).length;
}

export function getInitialToolCatalog(category = "all", limit = 64) {
  const selected = new Map();
  const normalizedCategory = slugifyRouteSegment(category || "all");
  const allEntries = Object.entries(toolMetaMap);
  const categoryEntries = getCatalogEntries(normalizedCategory);
  const priorityRank = new Map(
    TOP_PRIORITY_TOOL_SLUGS.map((slug, index) => [slug, index]),
  );
  const byPriorityAndName = ([slugA, toolA], [slugB, toolB]) => {
    const rankA = priorityRank.get(slugA) ?? Number.MAX_SAFE_INTEGER;
    const rankB = priorityRank.get(slugB) ?? Number.MAX_SAFE_INTEGER;
    return (
      rankA - rankB ||
      String(toolA.name || slugA).localeCompare(String(toolB.name || slugB))
    );
  };
  const add = ([slug, tool]) => {
    if (selected.size < limit) selected.set(slug, tool);
  };

  if (normalizedCategory !== "all") {
    categoryEntries
      .sort(byPriorityAndName)
      .slice(0, Math.min(36, limit))
      .forEach(add);
  }

  TOP_PRIORITY_TOOL_SLUGS.forEach((slug) => {
    if (toolMetaMap[slug]) add([slug, toolMetaMap[slug]]);
  });

  const representedCategories = new Set();
  allEntries.forEach((entry) => {
    getToolCategories(entry[1])
      .map(slugifyRouteSegment)
      .forEach((categorySlug) => {
        if (representedCategories.has(categorySlug)) return;
        representedCategories.add(categorySlug);
        add(entry);
      });
  });

  allEntries.sort(byPriorityAndName).forEach(add);
  return Object.fromEntries(selected);
}

export function formatCategoryLabel(value = "all") {
  if (value === "all") return "All Tools";
  const canonical = getCanonicalCategoryBySlug(String(value).toLowerCase());
  if (canonical) return canonical.label;
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getRelatedTools(slug, limit = 6) {
  const tool = getTool(slug);
  if (!tool) return [];

  const currentCategories = getToolCategories(tool).map((item) =>
    String(item).toLowerCase(),
  );
  const currentTopics = (tool.topics || []).map((item) =>
    String(item).toLowerCase(),
  );
  const currentWords = new Set(
    `${slug} ${tool.name || ""} ${tool.description || ""}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2),
  );

  return Object.entries(toolMetaMap)
    .filter(([candidateSlug]) => candidateSlug !== slug)
    .map(([candidateSlug, candidate]) => {
      const candidateCategories = getToolCategories(candidate).map((item) =>
        String(item).toLowerCase(),
      );
      const categoryScore =
        candidateCategories.filter((item) => currentCategories.includes(item))
          .length * 12;
      // Original free-text taxonomy survives as `topics` — a finer-grained
      // similarity signal than the ~20 canonical categories (e.g. "Selfie").
      const candidateTopics = (candidate.topics || []).map((item) =>
        String(item).toLowerCase(),
      );
      const topicScore =
        candidateTopics.filter((item) => currentTopics.includes(item)).length *
        8;
      const wordScore =
        `${candidateSlug} ${candidate.name || ""} ${candidate.description || ""}`
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((word) => word.length > 2)
          .reduce((score, word) => score + (currentWords.has(word) ? 2 : 0), 0);
      return {
        slug: candidateSlug,
        name: candidate.name || candidateSlug,
        score: categoryScore + topicScore + wordScore,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ slug: relatedSlug, name }) => ({ slug: relatedSlug, name }));
}

// ---------------------------------------------------------------------------
// Tool page titles
//
// Google renders about 60 characters of a <title>, and the root layout appends
// " | AltFTool" through its title.template — so a tool page owns roughly 49.
// The old fixed "{name} - Free Online Tool" suffix spent 19 of those on
// boilerplate, which pushed 441 of ~2,050 tool titles past the cut-off, where
// they truncate into look-alike duplicates. Titles now lead with the tool's own
// name (never rewritten) and spend whatever room is left on the words people
// actually search for — "free", "online" and the category head noun — skipping
// any word the name already carries.
// ---------------------------------------------------------------------------
const TITLE_MAX_LENGTH = 60;
// Keep in sync with the title.template in src/app/layout.jsx.
const TITLE_BRAND_SUFFIX = " | AltFTool";
const TITLE_BASE_MAX = TITLE_MAX_LENGTH - TITLE_BRAND_SUFFIX.length;
const TITLE_SEPARATOR = " - ";

// The head noun searchers pair with a tool of this category ("free online pdf
// tool", "free online calculator"). Categories without a distinctive noun fall
// through to the generic "Tool".
const CATEGORY_TITLE_KEYWORDS = {
  "AI Tools": "AI Tool",
  Calculators: "Calculator",
  Converters: "Converter",
  "Design & Color": "Design Tool",
  Developer: "Developer Tool",
  "Finance Calculators": "Calculator",
  Games: "Game",
  Generators: "Generator",
  "Health & Fitness": "Health Tool",
  "Health Calculators": "Calculator",
  "Image & Photo": "Image Tool",
  "Marketing & Social": "Marketing Tool",
  "PDF & Documents": "PDF Tool",
  "Security & Privacy": "Privacy Tool",
  "Text & Writing": "Text Tool",
  "Video & Audio": "Media Tool",
};

function normalizeTitleText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

/** Singular/plural tolerant word test, so "Images" blocks "Image Tool". */
function nameContainsWord(name, word) {
  const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}(?:e?s)?\\b`, "i").test(name);
}

function getTitleKeyword(name, tool) {
  const isNewToName = (noun) =>
    noun.split(" ").every((word) => !nameContainsWord(name, word));

  // Walk the tool's categories in order. A category with no distinctive noun is
  // skipped; the first one that does have a noun decides — either the noun is
  // new to the name and gets used, or the name already says it ("2048 Game",
  // "Image Compressor") and we fall back to the generic "Tool" rather than
  // borrowing a secondary category's noun, which would mislabel the tool.
  for (const category of getToolCategories(tool)) {
    const noun = CATEGORY_TITLE_KEYWORDS[normalizeTitleText(category)];
    if (!noun) continue;
    if (isNewToName(noun)) return noun;
    break;
  }

  return isNewToName("Tool") ? "Tool" : "";
}

/**
 * Append as many of the trailing phrases as the 60-character budget allows.
 * Phrases stay atomic, so a title never degrades to "… - Free Online Developer".
 */
function fitTitle(name, phrases = []) {
  const parts = phrases.filter(Boolean);
  for (let count = parts.length; count > 0; count -= 1) {
    const candidate = `${name}${TITLE_SEPARATOR}${parts.slice(0, count).join(" ")}`;
    if (candidate.length <= TITLE_BASE_MAX) return candidate;
  }
  return name;
}

function clipToolName(name) {
  if (name.length <= TITLE_BASE_MAX) return name;
  const clipped = name.slice(0, TITLE_BASE_MAX);
  const wordBoundary = clipped.lastIndexOf(" ");
  return (
    wordBoundary > TITLE_BASE_MAX * 0.6 ? clipped.slice(0, wordBoundary) : clipped
  )
    .replace(/[\s&,:;-]+$/g, "")
    .trim();
}

let toolNameGroups = null;

/** Slugs grouped by tool name, keeping only the names used by 2+ tools. */
function getToolNameGroups() {
  if (toolNameGroups) return toolNameGroups;
  const groups = new Map();

  Object.entries(toolMetaMap).forEach(([slug, tool]) => {
    const key = normalizeTitleText(tool?.name || slug).toLowerCase();
    const bucket = groups.get(key);
    if (bucket) bucket.push(slug);
    else groups.set(key, [slug]);
  });

  toolNameGroups = new Map(
    [...groups]
      .filter(([, slugs]) => slugs.length > 1)
      .map(([key, slugs]) => [key, [...slugs].sort()]),
  );
  return toolNameGroups;
}

/**
 * A handful of tools ship under a name another tool already uses (duplicate
 * registry entries). Give each the first category/topic label its name-twins do
 * not share, so two pages never compete for one title. Returns "" when the
 * registry offers nothing to tell them apart.
 */
function getToolTitleDifferentiator(slug, name) {
  const group = getToolNameGroups().get(name.toLowerCase());
  if (!group) return "";

  const labelsFor = (candidateSlug) => {
    const candidate = toolMetaMap[candidateSlug] || {};
    return [...getToolCategories(candidate), ...(candidate.topics || [])]
      .map(normalizeTitleText)
      .filter(Boolean);
  };
  const taken = new Set(
    group
      .filter((candidateSlug) => candidateSlug !== slug)
      .flatMap(labelsFor)
      .map((label) => label.toLowerCase()),
  );

  return (
    labelsFor(slug).find(
      (label) =>
        !taken.has(label.toLowerCase()) &&
        `${name}${TITLE_SEPARATOR}${label}`.length <= TITLE_BASE_MAX,
    ) || ""
  );
}

export function buildToolTitle(slug, tool = {}) {
  const rawName =
    normalizeTitleText(tool?.name) ||
    normalizeTitleText(String(slug).replace(/[-_]/g, " "));
  const name = clipToolName(rawName);

  const differentiator = getToolTitleDifferentiator(slug, rawName);
  if (differentiator) return fitTitle(name, [differentiator]);

  const modifiers = ["Free", "Online"].filter(
    (word) => !nameContainsWord(name, word),
  );
  return fitTitle(name, [...modifiers, getTitleKeyword(name, tool)]);
}

export async function buildToolMetadata(slug) {
  // Warm the central SEO config so per-URL admin overrides apply to tool pages.
  await primeSeoConfig();
  const tool = getTool(slug);

  if (!tool) {
    // Unknown slugs render the 404 page. Without an explicit robots directive
    // they inherited index,follow (plus the site-wide canonical), so any junk
    // /tools/all/<anything> URL was indexable.
    return createPageMetadata({
      title: "Tool Not Found",
      description:
        "This tool page does not exist. Browse the AltFTool library to find a free online tool for the job.",
      path: `/tools/all/${slug}`,
      noindex: true,
    });
  }

  const seoContent = buildToolSeoContent(slug, tool);

  // NOTE: this module is imported by client components (ToolsClient,
  // ToolClient, ToolDetailChrome), so it must never import a `server-only`
  // module. The oEmbed discovery link is therefore added by the route's own
  // generateMetadata — see /tools/all/[slug]/page.jsx.
  return createPageMetadata({
    title: buildToolTitle(slug, tool),
    description: seoContent.metaDescription,
    path: `/tools/all/${slug}`,
    keywords: [
      tool.name,
      ...getToolCategories(tool),
      ...(tool.topics || []),
    ].filter(Boolean),
  });
}
