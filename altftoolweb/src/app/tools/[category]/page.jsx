import ToolsClient from "../ToolsClient";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { notFound, redirect } from "next/navigation";
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

  // The page calls notFound() for these, but a statically generated notFound()
  // is served with a 200 on this deployment, so the robots directive is what
  // actually keeps them out of the index. Tool slugs and legacy categories are
  // excluded: the page redirects those rather than 404ing.
  // Object.hasOwn, not toolMetaMap[category]: the map inherits from
  // Object.prototype, so /tools/toString and /tools/constructor would read as
  // real tools and slip past this guard.
  if (
    !getToolCategorySlugs().includes(category) &&
    !Object.hasOwn(toolMetaMap, category) &&
    !getLegacyCategoryRedirect(category)
  ) {
    return createPageMetadata({
      title: "Category Not Found",
      description: "This tool category does not exist.",
      path: `/tools/${category}`,
      noindex: true,
    });
  }

  const label = formatCategoryLabel(category);
  const isAll = category === "all";

  // Games is a search vertical of its own ("free online games") — generic
  // "<label> Tools" metadata undersells it badly. /games 301s here, so this
  // page carries the games-hub SEO.
  if (category === "games") {
    const gameCount = getCategoryToolItems("games").length;
    return createPageMetadata({
      title: `Free Online Games – Play ${gameCount}+ Browser Games`,
      description: `Play ${gameCount}+ free games right in your browser — puzzle, arcade, word, card and board games. No downloads, no sign-up: 2048, sudoku, minesweeper, solitaire, typing test and more.`,
      path: "/tools/games",
      keywords: [
        "free online games",
        "browser games",
        "puzzle games",
        "arcade games",
        "play games online free",
        "no download games",
      ],
    });
  }

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

  // Own properties only — the map inherits from Object.prototype, so
  // /tools/toString would otherwise redirect to /tools/all/toString.
  if (Object.hasOwn(toolMetaMap, category)) {
    redirect(`/tools/all/${category}`);
  }

  // Legacy free-text category slugs (pre-consolidation taxonomy) → canonical.
  const legacyTarget = getLegacyCategoryRedirect(category);
  if (legacyTarget) {
    redirect(`/tools/${legacyTarget}`);
  }

  // Anything left that is not a real category was rendering a full, indexable,
  // self-canonical page built from the slug itself — /tools/asdfgh served
  // "Asdfgh Tools - Free Online Utilities" with robots index,follow. That is an
  // unbounded crawl trap: every typo or spam link mints another indexable URL.
  // The list is the same one generateStaticParams uses, so a slug missing from
  // it has no tools and the page would have been empty regardless.
  if (!getToolCategorySlugs().includes(category)) {
    notFound();
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
