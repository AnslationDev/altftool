import ToolsClient from "../ToolsClient";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { redirect } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";
import {
  formatCategoryLabel,
  getInitialToolCatalog,
  getLegacyCategoryRedirect,
  getToolCatalogCount,
  getToolCategories,
  getToolCategorySlugs,
  slugifyRouteSegment,
} from "../toolRouteUtils";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";
export const revalidate = 86400;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getToolCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const label = formatCategoryLabel(category);
  const isAll = category === "all";

  return createPageMetadata({
    title: isAll
      ? "All Online Tools - Free Browser Microtools"
      : `${label} Tools - Free Online Utilities`,
    description: isAll
      ? "Browse every AltFTool microtool in one fast directory, including converters, developer helpers, PDF tools, calculators, media tools, and productivity utilities."
      : `Browse free ${label.toLowerCase()} tools on AltFTool with quick browser-based workflows, copy-ready results, and mobile-friendly utility pages.`,
    path: `/tools/${category}`,
  });
}

/** Tools belonging to this module (category), as ItemList entries. */
function getCategoryToolItems(category) {
  const isAll = category === "all";
  return Object.entries(toolMetaMap)
    .filter(
      ([, tool]) =>
        isAll ||
        getToolCategories(tool)
          .map(slugifyRouteSegment)
          .includes(slugifyRouteSegment(category)),
    )
    .map(([slug, tool]) => ({
      name: tool.name || slug,
      path: `/tools/all/${slug}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 100);
}

export default async function Page({ params }) {
  const { category } = await params;

  if (toolMetaMap[category]) {
    redirect(`/tools/all/${category}`);
  }

  // Legacy free-text category slugs (pre-consolidation taxonomy) → canonical.
  const legacyTarget = getLegacyCategoryRedirect(category);
  if (legacyTarget) {
    redirect(`/tools/${legacyTarget}`);
  }

  const label = formatCategoryLabel(category);
  const isAll = category === "all";
  const path = `/tools/${category}`;
  const items = getCategoryToolItems(category);

  return (
    <>
      {/* Module entity: CollectionPage + ItemList + Breadcrumb, all linked to
          the Organization/WebSite graph (Entity SEO: Website → Module → Tool). */}
      <JsonLd
        id={`tools-category-schema-${category}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: isAll ? "All Online Tools" : `${label} Tools`,
            description: isAll
              ? "Directory of every free AltFTool browser tool."
              : `Free ${label.toLowerCase()} tools that run entirely in your browser.`,
          }),
          createItemListJsonLd({
            path,
            name: isAll ? "AltFTool tools" : `${label} tools on AltFTool`,
            items,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: isAll ? "All Tools" : label, path },
          ]),
        ]}
      />
      <ToolsClient
        meta={getInitialToolCatalog(category)}
        catalogTotal={getToolCatalogCount("all")}
        category={category}
      />
    </>
  );
}
