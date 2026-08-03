import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import Top10Client from "./Top10Client";

export async function generateMetadata() {
  return createPageMetadata({
    // 41 chars authored — the root layout appends " | AltFTool" for a
    // 52-char rendered <title>, inside the ~60 mobile SERP cut.
    //
    // Every noun here is a category PRODUCT_REGISTRY actually serves, and that
    // has to be re-checked whenever a product is removed. This said "Movies"
    // and the description led with it after Movies had been dropped for having
    // no TMDB key — the snippet was promising a category the page did not have.
    title: "Top 10 Lists: Books, Music, Food & Places",
    // 154 chars ending in a period, so trimMetaDescription passes it
    // through verbatim rather than clipping and re-punctuating it.
    description:
      "Browse Top 10 lists for books, music, anime, food, drinks, places, restaurants, dogs, cats and Pokemon. See up to ten provider-sourced picks per category.",
    path: "/top10",
    keywords: ["top 10 lists", "best of lists", "rankings", "top ten"],
  });
}

export default function Page() {
  // CollectionPage + BreadcrumbList only. An ItemList was considered and
  // dropped: every category on this page lives at /top10 itself, so the
  // list would have been five ListItems carrying the identical URL.
  return (
    <>
      <JsonLd
        id="top10-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/top10",
            name: "Top 10 Lists",
            description:
              "Provider-sourced Top 10 lists across entertainment, technology, lifestyle, knowledge, and people & culture.",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top 10 Lists", path: "/top10" },
          ]),
        ]}
      />
      {/* The page's single h1 lives in Top10Client -> Hero. It is plain
          static copy, not gated on any fetch, so it is present in the
          server-rendered HTML even when every client fetch fails. */}
      <Top10Client />
    </>
  );
}
