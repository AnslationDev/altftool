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
  const label = formatCategoryLabel(category);
  const isAll = category === "all";

  // Games is a search vertical of its own ("free online games") — generic
  // "<label> Tools" metadata undersells it badly. /games 301s here, so this
  // page carries the games-hub SEO.
  if (category === "games") {
    const gameCount = getCategoryToolItems("games", 0).length;
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

/**
 * Tools belonging to this module (category), as ItemList entries.
 * `limit` of 0 returns the complete list (used by the on-page A–Z index);
 * the default 100 keeps the ItemList JSON-LD payload small.
 */
function getCategoryToolItems(category, limit = 100) {
  const isAll = category === "all";
  const items = Object.entries(toolMetaMap)
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
    .sort((a, b) => a.name.localeCompare(b.name));

  return limit > 0 ? items.slice(0, limit) : items;
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

  // Unknown slug → 404 instead of a self-canonical doorway page. proxy.js
  // already 301s these to /tools/all; this is the belt-and-braces guard for
  // anything that reaches the route without passing through the proxy.
  // (`dynamicParams` must stay on — generateStaticParams() returns [] on
  // Amplify builds, so disabling it would 404 every real category.)
  if (!getToolCategorySlugs().includes(category)) {
    notFound();
  }

  const label = formatCategoryLabel(category);
  const isAll = category === "all";
  const path = `/tools/${category}`;
  const items = getCategoryToolItems(category);
  // Crawlable index below the grid. The grid is client-rendered from a 64-tool
  // slice, so without this the ~2,000 tool pages have no server-rendered link
  // from their own category hub.
  //
  // /tools/all links the category hubs rather than all 2,049 tools: every tool
  // belongs to at least one category, so hub → category → tool still reaches
  // everything, and the full list pushed /tools/all to ~1.05 MiB — over the
  // 1 MiB budget enforced by scripts/check-prerender-size.mjs.
  const indexItems = isAll
    ? getToolCategorySlugs()
        .filter((slug) => slug !== "all")
        .map((slug) => {
          const categoryLabel = formatCategoryLabel(slug);
          return {
            // Avoid "AI Tools tools" for labels that already say "Tools".
            name: /tools$/i.test(categoryLabel)
              ? categoryLabel
              : `${categoryLabel} tools`,
            path: `/tools/${slug}`,
          };
        })
    : getCategoryToolItems(category, 0);

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
      {indexItems.length > 0 && (
        <nav
          aria-labelledby={`tools-index-heading-${category}`}
          className="mx-auto w-full max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <h2
              id={`tools-index-heading-${category}`}
              className="text-xl font-bold text-foreground"
            >
              {isAll
                ? `Browse all ${getToolCatalogCount("all")} tools by category`
                : `All ${label} tools (${indexItems.length})`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAll
                ? `Every AltFTool utility, grouped into ${indexItems.length} categories — each hub lists its complete A–Z index.`
                : `The complete A–Z list of every ${label.toLowerCase()} tool on AltFTool. Each one runs free in your browser.`}
            </p>
            <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&_a]:block [&_a]:rounded-md [&_a]:px-2 [&_a]:py-1.5 [&_a]:text-sm [&_a]:text-muted-foreground [&_a]:no-underline [&_a]:transition-colors [&_a]:duration-150 [&_a:hover]:bg-surface-soft [&_a:hover]:text-primary-text [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-primary motion-reduce:[&_a]:transition-none">
              {indexItems.map((item) => (
                <li key={item.path}>
                  <a href={item.path}>{item.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </>
  );
}
