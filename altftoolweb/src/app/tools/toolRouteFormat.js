// Formatting helpers that need no tool data.
//
// These lived in toolRouteUtils, whose first line imports the whole
// toolMetaMap. ToolClient and ToolDetailChrome import only these two
// functions, but a module is the unit webpack follows, so both client
// components dragged the entire 3,753-tool catalogue — 1,016 KB raw,
// 210 KB brotli — into the eager bundle of every tool page.
//
// Keeping them here means the client graph reaches the taxonomy and nothing
// else. toolRouteUtils re-exports them, so server callers are unaffected.
import { getCanonicalCategoryBySlug } from "@/platform/registry/categoryTaxonomy";

export function getToolCategories(tool) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

export function formatCategoryLabel(value = "all") {
  if (value === "all") return "All Tools";
  const canonical = getCanonicalCategoryBySlug(String(value).toLowerCase());
  if (canonical) return canonical.label;
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
