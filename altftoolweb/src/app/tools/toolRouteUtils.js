import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function getTool(slug) {
  return toolMetaMap[slug] ?? null;
}

export function getToolCategories(tool) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

export function formatCategoryLabel(value = "all") {
  if (value === "all") return "All Tools";
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function buildToolMetadata(slug) {
  const tool = getTool(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested tool does not exist.",
    };
  }

  return createPageMetadata({
    title: tool.name,
    description: tool.description,
    path: `/tools/all/${slug}`,
  });
}
