import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import Top9Client from "./Top9Client";
import {
  getTop9Items,
  getTop9Title,
  isTop9Indexable,
} from "./data/getTop9Items";

export async function generateMetadata() {
  const items = getTop9Items();
  const rankedCount = items.filter(isTop9Indexable).length;

  // Both figures are counted from the list data, and they are counted
  // separately: the description used to call all of them "ranked Top9 lists"
  // when only a few publish a ranking. The hub matches the hero copy.
  return createPageMetadata({
    title: "Top9 Lists - Ranked Guides, Entertainment, Sports & Tools",
    description: `${items.length} Top9 topic pages across entertainment, sports, business, tools, lifestyle, and trending topics on AltFTool, ${rankedCount} of them with their ranked picks published in full.`,
    path: "/top9",
  });
}

export default function Page() {
  const items = getTop9Items();
  const rankedItems = items.filter(isTop9Indexable);
  const rankedCount = rankedItems.length;
  // The hub's ItemList points only at routes that are still in the index.
  // Marking up a link to a noindexed URL invites a crawl of a page that can
  // never appear, and the list is meant to advertise what can.
  const featuredItems = rankedItems.slice(0, 24).map((item) => ({
    name: getTop9Title(item),
    path: `/top9/${item.slug}`,
  }));
  const itemListSchema = featuredItems.length
    ? createItemListJsonLd({
        path: "/top9",
        name: "Top9 lists with published rankings",
        items: featuredItems,
      })
    : null;

  return (
    // The page heading is the visible one in Hero.jsx. A screen-reader-only H1
    // here as well gave the hub two, saying nearly the same thing twice, and a
    // hidden heading is the weaker of the pair for both readers and crawlers.
    <main>
      <JsonLd
        id="top9-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/top9",
            name: "Top9 Lists",
            description: `${items.length} Top9 topic pages for entertainment, sports, lifestyle, tools, and trending topics, ${rankedCount} of them with their ranked picks published in full.`,
          }),
          itemListSchema
            ? {
                ...itemListSchema,
                numberOfItems: itemListSchema.itemListElement.length,
              }
            : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top9", path: "/top9" },
          ]),
        ]}
      />
      <Top9Client listCount={items.length} rankedCount={rankedCount} />
    </main>
  );
}
