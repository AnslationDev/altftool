import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { buildToolSeoContent } from "./toolSeoContent";

export function getTool(slug) {
  return toolMetaMap[slug] ?? null;
}

export function getToolCategories(tool) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

export function slugifyRouteSegment(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, "-");
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

export function formatCategoryLabel(value = "all") {
  if (value === "all") return "All Tools";
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
      const wordScore = `${candidateSlug} ${candidate.name || ""} ${candidate.description || ""}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
        .reduce((score, word) => score + (currentWords.has(word) ? 2 : 0), 0);
      return { slug: candidateSlug, name: candidate.name || candidateSlug, score: categoryScore + wordScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ slug: relatedSlug, name }) => ({ slug: relatedSlug, name }));
}

export function buildToolMetadata(slug) {
  const tool = getTool(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested tool does not exist.",
    };
  }

  const seoContent = buildToolSeoContent(slug, tool);

  return createPageMetadata({
    title: `${tool.name} - Free Online Tool`,
    description: seoContent.metaDescription,
    path: `/tools/all/${slug}`,
  });
}
