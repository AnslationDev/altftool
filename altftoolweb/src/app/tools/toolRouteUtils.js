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

export async function buildToolMetadata(slug) {
  // Warm the central SEO config so per-URL admin overrides apply to tool pages.
  await primeSeoConfig();
  const tool = getTool(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested tool does not exist.",
    };
  }

  const seoContent = buildToolSeoContent(slug, tool);

  // NOTE: this module is imported by client components (ToolsClient,
  // ToolClient, ToolDetailChrome), so it must never import a `server-only`
  // module. The oEmbed discovery link is therefore added by the route's own
  // generateMetadata — see /tools/all/[slug]/page.jsx.
  return createPageMetadata({
    title: seoContent.title || `${tool.name} - Free Online Tool`,
    description: seoContent.metaDescription,
    path: `/tools/all/${slug}`,
  });
}
