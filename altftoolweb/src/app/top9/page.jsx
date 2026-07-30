import JsonLd from "@/platform/seo/JsonLd";
import "./top9.css";
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import Top9Client from "./Top9Client";
import { getTop9Items, getTop9Title } from "./data/getTop9Items";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Top9 Ranked Lists - Entertainment, Sports & Tools",
    description:
      "Explore Top9 ranked lists across entertainment, sports, business, tools, lifestyle, and trending topics on AltFTool.",
    path: "/top9",
  });
}

export default function Page() {
  const featuredItems = getTop9Items()
    .slice(0, 24)
    .map((item) => ({
      name: getTop9Title(item),
      path: `/top9/${item.slug}`,
    }));

  return (
    <main>
      <h1 className="sr-only">
        Top9 ranked guides for entertainment, sports, tools, lifestyle, and trending topics
      </h1>
      <JsonLd
        id="top9-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/top9",
            name: "Top9 Lists",
            description:
              "Ranked lists for entertainment, sports, lifestyle, tools, and trending topics.",
          }),
          createItemListJsonLd({
            path: "/top9",
            name: "Featured Top9 lists",
            items: featuredItems,
          }),
        ]}
      />
      <Top9Client />
    </main>
  );
}
