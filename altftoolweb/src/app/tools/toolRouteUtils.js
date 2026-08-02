import { cache } from "react";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { buildToolSeoContent } from "./toolSeoContent";
import { primeSeoConfig } from "@/platform/seo/seoConfigSource";
import {
  CANONICAL_CATEGORIES,
  getCanonicalCategoryBySlug,
  getLegacyCategorySlugMap,
  slugifyCategory,
} from "@/platform/registry/categoryTaxonomy";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";
// Re-exported so existing server callers keep working; defined apart from
// this module so client components can reach them without the catalogue.
import { formatCategoryLabel, getToolCategories } from "./toolRouteFormat";

export { formatCategoryLabel, getToolCategories };

export function getTool(slug) {
  return toolMetaMap[slug] ?? null;
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

/**
 * Every category the directory sidebar renders, with its real tool count.
 *
 * ToolsClient used to derive this from whatever `meta` it held, which is the
 * reason /tools and /tools/[category] pulled the catalogue chunk down after
 * every load (static/chunks/917906.*, 1,098,526 bytes raw / 226,782 brotli):
 * getInitialToolCatalog's 64-entry slice represents only 13-18 of the 22
 * categories, so the sidebar rendered short and each count was a count within
 * the slice until the chunk arrived. Twenty-two {slug, label, count} rows in
 * the RSC payload replace it, and the list is complete on first paint instead.
 *
 * Canonical display order — categoryTaxonomy owns it — with any slug outside
 * the canonical set appended alphabetically so a new category cannot silently
 * disappear from the sidebar.
 */
export function getToolCategoryCounts() {
  const counts = new Map();

  Object.values(toolMetaMap).forEach((tool) => {
    // Deduped per tool: a tool that repeats a category must not count twice.
    new Set(
      getToolCategories(tool).map(slugifyRouteSegment).filter(Boolean),
    ).forEach((slug) => counts.set(slug, (counts.get(slug) || 0) + 1));
  });

  const canonicalSlugs = CANONICAL_CATEGORIES.map((entry) => entry.slug);
  const canonicalSet = new Set(canonicalSlugs);
  const extraSlugs = [...counts.keys()]
    .filter((slug) => !canonicalSet.has(slug))
    .sort();

  return [...canonicalSlugs, ...extraSlugs]
    .filter((slug) => counts.has(slug))
    .map((slug) => ({
      slug,
      label: formatCategoryLabel(slug),
      count: counts.get(slug),
    }));
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

// Memoised per request: the tool page and ToolSeoSection each ask for the
// same related list, and each call scans all 3,753 tools. React's cache()
// dedupes within one render — measured at ~6.5 ms of server CPU per page.
export const getRelatedTools = cache(function getRelatedTools(slug, limit = 6) {
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
});

export async function buildToolMetadata(slug) {
  // Warm the central SEO config so per-URL admin overrides apply to tool pages.
  await primeSeoConfig();
  const tool = getTool(slug);

  if (!tool) {
    // These routes are force-static, and a statically generated notFound() is
    // served with a 200 on this deployment rather than a 404 — every unknown
    // slug under /tools is a soft 404. Verified live: /tools/all/not-real-xyz
    // returns HTTP 200 with 312 KB of HTML, and so do /blogs, /apps and
    // /alternatives, so the behaviour is the platform's, not this route's.
    //
    // Returning a bare object here left the robots directive to whatever the
    // layout had already set, so the page shipped BOTH `index, follow` and the
    // not-found boundary's `noindex`. Search engines resolve that conflict by
    // taking the most restrictive, but nothing guarantees answer engines parse
    // it the same way, and a page asking to be indexed is not what we mean.
    //
    // Declaring robots explicitly replaces the inherited directive instead of
    // appending to it.
    //
    // The canonical stays self-referencing, deliberately. An earlier version of
    // this comment claimed it was dropped; it was not, and dropping it would be
    // wrong twice over. createPageMetadata falls back to `path: args.path || "/"`,
    // so omitting it canonicalises every unknown slug to the homepage — the exact
    // duplicate signal that sentence was worried about. And a noindex page SHOULD
    // point at itself: noindex plus a canonical to a DIFFERENT URL is how the
    // noindex travels to that URL, a failure this repo already had to fix on
    // /extensions/[slug].
    return createPageMetadata({
      title: "Tool Not Found",
      description: "The requested tool does not exist.",
      path: `/tools/all/${slug}`,
      noindex: true,
    });
  }

  const seoContent = buildToolSeoContent(slug, tool);

  return createPageMetadata({
    title: seoContent.title || buildFallbackToolTitle(tool.name || slug),
    description: seoContent.metaDescription,
    path: `/tools/all/${slug}`,
  });
}

/** " | AltFTool", appended by the root layout's title template. */
const BRAND_SUFFIX_LENGTH = 11;
const TITLE_BUDGET = 60;

/**
 * Tool titles for the 3,811 tools with no hand-written seo.js title.
 *
 * The flat `${name} - Free Online Tool` put 1,194 of them past 60 characters
 * once the brand suffix landed — measured against the registry — e.g.
 * "Advance Tax Interest 234B 234C Calculator - Free Online Tool | AltFTool"
 * at 71. The suffix carries no information the tool name and the brand do not
 * already carry, so drop it down rather than let the SERP cut the title.
 *
 * Deliberately does NOT touch seoContent.title. Those are hand-written per
 * tool, and 57 of them are also over 60; machine-trimming them cuts words that
 * were chosen ("Age Calculator — Exact Age from Your Date of Birth" would lose
 * "Birth"), which is worse than letting Google truncate for display only. They
 * need editing at source, in src/tools/<slug>/seo.js.
 */
function buildFallbackToolTitle(name) {
  const suffixes = [" - Free Online Tool", " - Free Online", ""];
  const fitting = suffixes.find(
    (suffix) => name.length + suffix.length + BRAND_SUFFIX_LENGTH <= TITLE_BUDGET,
  );
  return fitting === undefined ? name : `${name}${fitting}`;
}
