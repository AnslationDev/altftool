import DealsClient from "./DealsClient";
import dealData from "./(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Best Deals & Offers – Save on Top Products | AltFTool",
    description:
      "Discover the best deals, discounts, and special offers on AltFTool. Compare prices and find the best savings on popular products and services.",
    path: "/exclusivedeals",
  });
}

export default function Page() {
  const categoryItems = (dealData.categories || [])
    .filter((category) => category?.slug && category?.categoryName)
    .map((category) => ({
      name: category.categoryName,
      path: `/exclusivedeals/${category.slug}`,
    }));

  return (
    <>
      <JsonLd
        id="exclusive-deals-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/exclusivedeals",
            name: "Best Deals & Offers",
            description:
              "Discover the best deals, discounts, and special offers on AltFTool.",
          }),
          createItemListJsonLd({
            path: "/exclusivedeals",
            name: "AltFTool deal categories",
            items: categoryItems,
          }),
        ]}
      />
      <DealsClient />
    </>
  );
}
