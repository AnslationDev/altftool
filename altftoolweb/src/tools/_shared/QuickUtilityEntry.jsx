"use client";

import { toolMetaMap } from "@/platform/registry/toolMetaMap";

import QuickUtilityPage from "./QuickUtilityPage";

function titleizeSlug(slug) {
  return String(slug || "quick-utility")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function QuickUtilityEntry({ slug }) {
  const fallbackName = titleizeSlug(slug);
  const tool = toolMetaMap[slug] ?? {
    name: fallbackName,
    description: `Create a quick, copy-ready output for ${fallbackName}.`,
  };

  return (
    <QuickUtilityPage
      config={{
        name: tool.name || fallbackName,
        description: tool.description || `Create a quick, copy-ready output for ${fallbackName}.`,
      }}
    />
  );
}
