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


// "100+" was a launch-era number. The registry holds 3,947 tools and the H1 on
// this same page states that figure, so the tag understated the catalogue by
// about 39x and contradicted the page it described. Read the count instead of
// writing one down, so it cannot go stale again.
//
// NOTE: the live tag does not come from here. Production serves
// "Explore 100+ Free Online Tools | AltFTool" with the description "Discover
// over 100 free online tools for various tasks…", neither of which appears in
// this repo — a per-URL override in the central SEO config wins over page code
// (applyCentralSeo, "force" precedence). That override also needs updating; it
// is in Firestore, not here. The JSON-LD below is NOT overridden and does ship
// from this file.
export async function generateMetadata() {
  const total = getToolCatalogCount("all").toLocaleString("en-US");
  return createPageMetadata({
    title: `${total} Free Online Tools for Everyday Tasks`,
    description: `Browse ${total} free online tools on AltFTool — calculators, converters, generators, PDF and image tools, developer utilities and browser games.`,
    path: "/tools",
  });
}

export default function Page() {
  // Module hub entity: the /tools hub links every module (category) as an
  // ItemList so Google reads Website → Tools hub → Module → Tool as one graph.
  //
  // The label is used as-is when it already ends in "Tools": formatCategoryLabel
  // returns "AI Tools", and appending unconditionally put "AI Tools Tools" into
  // the ItemList — the same doubling that shipped in the /tools/ai-tools title.
  const moduleItems = getToolCategorySlugs()
    .filter((slug) => slug !== "all")
    .map((slug) => {
      const label = formatCategoryLabel(slug);
      return {
        name: /\btools$/i.test(label) ? label : `${label} Tools`,
        path: `/tools/${slug}`,
      };
    });
  const total = getToolCatalogCount("all").toLocaleString("en-US");

  return (
    <>
      <JsonLd
        id="tools-hub-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/tools",
            name: "AltFTool Micro Tools",
            description: `Hub of ${total} free browser-based tools: converters, calculators, PDF, image, developer and AI utilities.`,
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
