import MicrotoolClient from "./MicrotoolClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { formatCategoryLabel, getToolCategorySlugs } from "./toolRouteUtils";

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


export async function generateMetadata() {
  return createPageMetadata({
    title: "Micro Tools – 100+ Free Daily Use Online Tools",
    description:
      "Access 100+ free micro tools for everyday tasks including calculators, converters, generators, and productivity utilities on AltFTool.",
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
            description:
              "Hub of 100+ free browser-based tools: converters, calculators, PDF, image, developer and AI utilities.",
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
