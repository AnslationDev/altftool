import MicrotoolClient from "./MicrotoolClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  formatCategoryLabel,
  getToolCatalogCount,
  getToolCategorySlugs,
} from "./toolRouteUtils";

/**
 * The catalogue size, rounded down to a round hundred.
 *
 * The hub advertised "100+" in its title, its description and its
 * CollectionPage entity while its own H1 — rendered from the live registry a
 * few hundred bytes below — read "3,947 free online tools". A searcher who
 * clicks a result promising 100 tools and lands on 3,947 has been told the
 * wrong thing about the page, and every one of those three strings was a
 * hardcoded literal that no longer tracked the registry.
 *
 * Derived, not literal, so it cannot drift again. Rounded down so the claim
 * stays true between registry regenerations, and formatted the same way the
 * body copy already formats it.
 */
function getRoundedCatalogTotal() {
  return (Math.floor(getToolCatalogCount("all") / 100) * 100).toLocaleString();
}

// Evergreen and free of dynamic APIs — no cookies(), headers(), searchParams
// or fetch — so it can be served from the edge. Without this the root layout's
// `await connection()` opts it out of caching and every view pays origin TTFB:
// ~251 ms at the median against ~47 ms for routes CloudFront already holds.
//
// Scoped deliberately to this one route. Deleting the layout's connection()
// instead would make roughly 339 static routes prerender at build time, about
// 237 MiB of artifact against a 184 MiB gate — which is why that line exists.
export const dynamic = "force-static";
export const revalidate = 86400;


export const dynamic = "force-static";
export const revalidate = 86400;

export async function generateMetadata() {
  const total = getRoundedCatalogTotal();

  return createPageMetadata({
    title: `Micro Tools – ${total}+ Free Daily Use Online Tools`,
    description: `Browse ${total}+ free AltFTool microtools in one directory: calculators, converters, generators, PDF and image tools, developer utilities and browser games.`,
    path: "/tools",
  });
}

export default function Page() {
  // Module hub entity: the /tools hub links every module (category) as an
  // ItemList so Google reads Website → Tools hub → Module → Tool as one graph.
  //
  // Named by the canonical label alone. Appending "Tools" produced "AI Tools
  // Tools" (formatCategoryLabel already returns "AI Tools") and six more that
  // simply read wrong: "Converters Tools", "Calculators Tools", "Generators
  // Tools", "Finance Calculators Tools", "Health Calculators Tools", "Games
  // Tools". The label is also exactly what the directory sidebar renders, so
  // the ItemList entity and the visible UI now agree.
  const moduleItems = getToolCategorySlugs()
    .filter((slug) => slug !== "all")
    .map((slug) => ({
      name: formatCategoryLabel(slug),
      path: `/tools/${slug}`,
    }));

  return (
    <>
      <JsonLd
        id="tools-hub-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/tools",
            name: "AltFTool Micro Tools",
            description: `Hub of ${getRoundedCatalogTotal()}+ free browser-based tools: converters, calculators, PDF, image, developer and AI utilities.`,
          }),
          createItemListJsonLd({
            path: "/tools",
            name: "AltFTool tool modules",
            items: [{ name: "All Tools", path: "/tools/all" }, ...moduleItems],
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
          ]),
        ]}
      />
      <MicrotoolClient />
    </>
  );
}
