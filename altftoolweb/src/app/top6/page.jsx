import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import Top6Client from "./Top6Client";
import { CATEGORIES } from "./data/top6Data";
import { slugFor } from "./lib/slugFor";

export async function generateMetadata() {
  // 42 chars authored; the root layout appends " | AltFTool" for a 53-char
  // rendered title. Every noun named here is a category CATEGORIES actually
  // builds — a category that cannot fill six photographed rows is dropped at
  // module load, so this line has to be re-checked whenever a provider goes.
  // Places and Cryptocurrency are deliberately absent: places ships no photos
  // in its snapshot and crypto ships no snapshot at all, so neither renders.
  return createPageMetadata({
    title: "Top 6 Lists: Books, Music, Food & AI Tools",
    // 154 chars ending in a period, so trimMetaDescription passes it through
    // verbatim instead of clipping it and bolting a period back on.
    description:
      "Six provider-sourced picks in every category: books, music, food, restaurants, drinks, dogs, cats, AI tools, anime, Pokemon and famous people on AltFTool.",
    path: "/top6",
    keywords: ["top 6 lists", "top six", "best of lists", "rankings"],
  });
}

export default function Page() {
  // Each category has its own anchor on this page, so the ItemList entries
  // are distinct URLs rather than the same one repeated per row.
  const categoryItems = CATEGORIES.map((category) => ({
    name: `Top 6 ${category.label}`,
    path: `/top6#${slugFor(category.id)}`,
  }));

  return (
    <>
      <JsonLd
        id="top6-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/top6",
            name: "Top 6 Lists",
            description:
              "Six provider-sourced picks per category across entertainment, technology, lifestyle, knowledge, and people and culture.",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top 6 Lists", path: "/top6" },
          ]),
          createItemListJsonLd({
            path: "/top6",
            name: "Top 6 categories",
            items: categoryItems,
          }),
        ]}
      />
      {/* The page's one h1 lives in Top6Client -> Hero. It is static copy,
          not animated and not gated on a fetch, so it is in the server-
          rendered HTML even when every provider is unreachable. */}
      <Top6Client />
    </>
  );
}
