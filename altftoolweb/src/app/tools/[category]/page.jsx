import Link from "next/link";
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
  getToolCategoryCounts,
  getToolCategorySlugs,
  slugifyRouteSegment,
} from "../toolRouteUtils";
import { getCanonicalCategoryBySlug } from "@/platform/registry/categoryTaxonomy";
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

  const isAll = category === "all";
  const count = getToolCatalogCount(category);

  // Games is a search vertical of its own ("free online games") — generic
  // "<label> Tools" metadata undersells it badly. /games 301s here, so this
  // page carries the games-hub SEO.
  //
  // The description used to run to 176 characters and trimMetaDescription cut
  // it at the sentence boundary after "board games." — every named game
  // ("2048, sudoku, minesweeper, solitaire, typing test") was dropped before it
  // ever reached the HTML, so the tag served 87 characters. This one is 134 and
  // round-trips unchanged. Every game named here is a real slug in the
  // registry: 2048-game, sudoku, minesweeper, klondike-solitaire,
  // typing-speed-game.
  if (category === "games") {
    return createPageMetadata({
      title: `${count} Free Online Games — Play in Your Browser`,
      description: `Play ${count} free browser games — 2048, sudoku, minesweeper, solitaire, typing tests, word, card and arcade games. No download, no sign-up.`,
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

  if (isAll) {
    return createPageMetadata({
      // Description is 140 characters. The previous string measured exactly 160
      // — the hard cap in trimMetaDescription — so it round-tripped only by
      // touching the cap, and any edit to it would have been silently clipped.
      //
      // No "AltFTool" in the title: the root layout appends " | AltFTool", and
      // resolveDocumentTitle only treats a title as absolute when the brand
      // follows a separator, so "…AltFTool Tools" would have rendered the brand
      // twice.
      title: `All ${count.toLocaleString("en-US")} Free Online Tools in One Directory`,
      description: `Every AltFTool tool in one directory: ${count.toLocaleString("en-US")} free converters, calculators, PDF and image tools, developer helpers and productivity utilities.`,
      path: "/tools/all",
    });
  }

  const noun = getCategoryNoun(category);
  const blurb = getCanonicalCategoryBySlug(category)?.description || "";

  // A category holding one or two tools is a thinner page than the tool pages
  // it links to, and it duplicates them. Keep it crawlable (follow) so the
  // links still carry, but keep it out of the index until it has enough on it
  // to be worth a result. /tools/other holds exactly 1 tool today.
  if (count < 3) {
    return createPageMetadata({
      title: noun.title,
      description: `${blurb} This category currently holds ${count === 1 ? "a single tool" : `${count} tools`} — browse the full AltFTool directory to find what you need.`,
      path: `/tools/${category}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    // `${label} Tools` shipped "AI Tools Tools - Free Online Utilities" live,
    // and the lowercased label shipped "Browse free ai tools tools on
    // AltFTool" — formatCategoryLabel returns "AI Tools", so appending "Tools"
    // doubles the noun. The noun table below carries the plural phrase each
    // title and description reads naturally with instead.
    //
    // The count is the same number getToolCategoryCounts() renders in the H1,
    // read from the same registry, so the two can't drift.
    title: `${count} Free Online ${noun.title}`,
    description: `${blurb} Browse all ${count} free ${noun.lower} on AltFTool — no install, no sign-up.`,
    path: `/tools/${category}`,
  });
}

/**
 * Plural noun phrase per canonical category, in Title Case for the <title> and
 * lowercase for the description. The taxonomy owns the label and the one-line
 * blurb; it does not own a phrase that reads correctly after a count, which is
 * what "63 Free Online ___" and "63 free ___" both need.
 *
 * Unknown slugs fall back to the label, so a category added to the taxonomy
 * without a row here degrades to the old wording rather than breaking.
 */
const CATEGORY_NOUNS = {
  "ai-tools": ["AI Tools", "AI tools"],
  "pdf-documents": ["PDF & Document Tools", "PDF & document tools"],
  "image-photo": ["Image & Photo Tools", "image & photo tools"],
  "video-audio": ["Video & Audio Tools", "video & audio tools"],
  "text-writing": ["Text & Writing Tools", "text & writing tools"],
  converters: ["Converters", "converters"],
  generators: ["Generators", "generators"],
  calculators: ["Calculators", "calculators"],
  "finance-calculators": ["Finance Calculators", "finance calculators"],
  "health-calculators": ["Health Calculators", "health calculators"],
  "health-fitness": ["Health & Fitness Tools", "health & fitness tools"],
  developer: ["Developer Tools", "developer tools"],
  "design-color": ["Design & Color Tools", "design & color tools"],
  "marketing-social": ["Marketing & Social Tools", "marketing & social tools"],
  "security-privacy": ["Security & Privacy Tools", "security & privacy tools"],
  "education-science": ["Education & Science Tools", "education & science tools"],
  productivity: ["Productivity Tools", "productivity tools"],
  business: ["Business Tools", "business tools"],
  lifestyle: ["Lifestyle Tools", "lifestyle tools"],
  fun: ["Fun Tools", "fun tools"],
  games: ["Games", "games"],
  other: ["Other Tools", "tools"],
};

function getCategoryNoun(category) {
  const row = CATEGORY_NOUNS[category];
  if (row) return { title: row[0], lower: row[1] };
  const label = formatCategoryLabel(category);
  return { title: `${label} Tools`, lower: `${label.toLowerCase()} tools` };
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

// The same set, uncapped. getCategoryToolItems stays at 100 because an ItemList
// of 500 entries is not a useful entity; this one exists to put a real anchor on
// the page for every tool in the category.
//
// It is the fix for the largest structural SEO problem this site has: of 3,947
// tools, 518 had any inbound crawlable link from a non-tool page and 3,429 had
// none. Tool routes are not prerendered (generateStaticParams returns [] under
// the deferred-prerender flag), so the sitemap was the only way in, and a URL
// whose only referrer is the sitemap accumulates no internal signal — which is
// why a blog post outranks the tool it is written about.
//
// Cost lands where it is cheap: the largest category (Calculators, 503 tools)
// adds roughly 32 KB of HTML, and these category pages are not prerendered on
// Amplify, so this adds nothing to the build artifact.
function getCategoryToolIndex(category) {
  const isAll = category === "all";
  return Object.entries(toolMetaMap)
    .filter(
      ([, tool]) =>
        isAll ||
        getToolCategories(tool)
          .map(slugifyRouteSegment)
          .includes(slugifyRouteSegment(category)),
    )
    .map(([slug, tool]) => ({ name: tool.name || slug, path: `/tools/all/${slug}` }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
  const toolIndex = getCategoryToolIndex(category);

  return (
    <>
      {/* Module entity: CollectionPage + ItemList + Breadcrumb, all linked to
          the Organization/WebSite graph (Entity SEO: Website → Module → Tool). */}
      <JsonLd
        id={`tools-category-schema-${category}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: isAll ? "All Online Tools" : getCategoryNoun(category).title,
            description: isAll
              ? "Directory of every free AltFTool browser tool."
              : `Free ${getCategoryNoun(category).lower} that run entirely in your browser.`,
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
      {/* categoryCounts is what keeps the 1,098,526-byte catalogue chunk off
          this route: the sidebar's category list and counts were the only
          thing the client needed the whole map for on load. Twenty-two rows
          against a 226 KB brotli download. */}
      <ToolsClient
        meta={getInitialToolCatalog(category)}
        catalogTotal={getToolCatalogCount("all")}
        categoryCounts={getToolCategoryCounts()}
        category={category}
      />
      {/* Deliberately excluded on /tools/all: 3,947 anchors is ~250 KB of
          HTML for a page where every one of those tools is already one hop
          away through its own category. */}
      {!isAll && toolIndex.length > 0 ? (
        <nav
          aria-label={`All ${label} tools`}
          className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6"
        >
          <h2 className="mb-4 text-base font-semibold text-[var(--foreground)]">
            All {toolIndex.length} {getCategoryNoun(category).lower}
          </h2>
          <ul className="columns-1 gap-x-8 sm:columns-2 lg:columns-3 xl:columns-4">
            {toolIndex.map((tool) => (
              <li key={tool.path} className="break-inside-avoid">
                <Link
                  href={tool.path}
                  className="block py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)] hover:underline"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
