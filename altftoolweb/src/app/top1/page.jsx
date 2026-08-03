import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import Top1Client from "./Top1Client";
import { TOP_PICKS } from "./data/top1Data";

export async function generateMetadata() {
  // 40 chars authored; the root layout appends " | AltFTool" for a 51-char
  // rendered title. Every category named below is one TOP_PICKS actually
  // builds — a product with no photographed snapshot item is dropped at
  // module load, so this list has to be re-checked whenever a provider
  // goes. Places and Cryptocurrency are absent for exactly that reason.
  return createPageMetadata({
    title: "Top 1: The Lead Pick From Every Category",
    // 158 chars ending in a period, so trimMetaDescription passes it through
    // verbatim instead of clipping it and bolting a period back on.
    description:
      "One leading pick per category, taken straight from each provider's own list: books, music, food, restaurants, drinks, dogs, cats, AI tools, anime and Pokemon.",
    path: "/top1",
    keywords: ["top 1", "top pick", "number one", "best of lists"],
  });
}

export default function Page() {
  // Each pick has its own anchor on this page, so the ItemList entries are
  // distinct URLs rather than one URL repeated per row.
  const pickItems = TOP_PICKS.map((pick) => ({
    name: `Top 1 ${pick.label}`,
    path: `/top1#top1-${pick.key}`,
  }));

  return (
    <>
      <JsonLd
        id="top1-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/top1",
            name: "Top 1 Picks",
            description:
              "One provider-sourced entry per category across entertainment, technology, lifestyle, knowledge, and people and culture.",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top 1 Picks", path: "/top1" },
          ]),
          createItemListJsonLd({
            path: "/top1",
            name: "Top 1 categories",
            items: pickItems,
          }),
        ]}
      />
      {/* The page's one h1 lives in Top1Client -> Top1Hero. It is static
          copy, not animated and not gated on a fetch, so it is in the
          server-rendered HTML even when every provider is unreachable. */}
      <Top1Client />
    </>
  );
}
