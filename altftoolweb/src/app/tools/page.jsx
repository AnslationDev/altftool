import MicrotoolClient from "./MicrotoolClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { formatCategoryLabel, getToolCategorySlugs } from "./toolRouteUtils";

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
  const moduleItems = getToolCategorySlugs()
    .filter((slug) => slug !== "all")
    .map((slug) => ({
      name: `${formatCategoryLabel(slug)} Tools`,
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
