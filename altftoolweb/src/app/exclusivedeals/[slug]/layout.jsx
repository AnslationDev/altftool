import dealData from "../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

function findCategory(slug) {
  return (dealData.categories || []).find((category) => category.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = findCategory(slug);

  if (!category) {
    return {
      title: "Deals Category Not Found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${category.categoryName} Deals, Coupons & Offers | AltFTool`,
    description: `Browse ${category.categoryName} deals, verified coupons, sale picks, and brand offers curated by AltFTool.`,
    path: `/exclusivedeals/${category.slug}`,
    image: category.image || category.img,
    keywords: [
      `${category.categoryName} deals`,
      `${category.categoryName} coupons`,
      "exclusive deals",
      "AltFTool offers",
    ],
  });
}

export default async function ExclusiveDealsCategoryLayout({ children, params }) {
  const { slug } = await params;
  const category = findCategory(slug);

  if (!category) return children;

  const path = `/exclusivedeals/${category.slug}`;
  const brandItems = (category.brands || [])
    .filter((brand) => brand?.id && brand?.brandName)
    .map((brand) => ({
      name: brand.brandName,
      path: `${path}/${brand.id}`,
    }));

  return (
    <>
      <JsonLd
        id={`exclusive-deals-category-schema-${category.slug}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `${category.categoryName} Deals`,
            description: `Browse ${category.categoryName} deals, coupons, and brand offers on AltFTool.`,
          }),
          createItemListJsonLd({
            path,
            name: `${category.categoryName} brand offers`,
            items: brandItems,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exclusive Deals", path: "/exclusivedeals" },
            { name: category.categoryName, path },
          ]),
        ]}
      />
      {children}
    </>
  );
}
