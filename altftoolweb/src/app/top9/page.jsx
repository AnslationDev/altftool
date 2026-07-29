import JsonLd from "@/platform/seo/JsonLd";
import "./top9.css";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import Top9Client from "./Top9Client";
import {
  getTop9Items,
  getTop9RankedEntries,
  getTop9Title,
} from "./data/getTop9Items";

export async function generateMetadata() {
  const listCount = getTop9Items().length;

  return createPageMetadata({
    title: "Top9 Lists - Ranked Guides, Entertainment, Sports & Tools",
    description: `${listCount} ranked Top9 lists across entertainment, sports, business, tools, lifestyle, and trending topics on AltFTool.`,
    path: "/top9",
  });
}

export default function Page() {
  const items = getTop9Items();
  const rankedCount = items.filter(
    (item) => getTop9RankedEntries(item).length > 0,
  ).length;
  const featuredItems = items.slice(0, 24).map((item) => ({
    name: getTop9Title(item),
    path: `/top9/${item.slug}`,
  }));
  const itemListSchema = createItemListJsonLd({
    path: "/top9",
    name: "Featured Top9 lists",
    items: featuredItems,
  });

  return (
    <main>
      <JsonLd
        id="top9-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/top9",
            name: "Top9 Lists",
            description: `${items.length} ranked lists for entertainment, sports, lifestyle, tools, and trending topics.`,
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
