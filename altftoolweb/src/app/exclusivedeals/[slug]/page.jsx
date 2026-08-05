// No generateMetadata here on purpose. layout.jsx already resolves the
// record and builds metadata from the category name; Next takes the deepest
// segment's metadata, so the hardcoded title that used to live here
// overrode all of it and every URL in this family shipped the same one.

import dealData from "../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";
import { brandSlug } from "@/app/exclusivedeals/lib/brandSlug";

import PageView from "./PageView";

/**
 * Route-level name for the heading when the slug matches no category.
 * The slug is always in the URL, so the H1 never depends on a lookup that can
 * miss — an unnamed page is worse than one named from its own path.
 */
function categoryNameFromSlug(slug = "") {
  const words = String(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)));
  return words.length ? words.join(" ") : "Exclusive";
}

export default async function Page(props) {
  const { slug } = await props.params;
  const category = (dealData.categories || []).find((item) => item.slug === slug);
  const headingName = category?.categoryName || categoryNameFromSlug(slug);

  const path = `/exclusivedeals/${slug}`;
  // brandSlug, not brand.id: the ItemList advertised /exclusivedeals/<cat>/1,
  // which is not the canonical URL for that brand and is not what the sitemap
  // submits. Those ids still resolve, but they canonicalise to the slug URL,
  // so pointing structured data at them listed a non-canonical URL as the item.
  const brandItems = (category?.brands || [])
    .filter((brand) => brand?.brandName)
    .map((brand) => ({
      name: brand.brandName,
      path: `${path}/${brandSlug(brand.brandName)}`,
    }));

  return (
    <>
      {/* Moved out of layout.jsx: rendered there it also ran on every
          /exclusivedeals/<category>/<brand> URL, which then shipped two
          BreadcrumbList nodes and a CollectionPage describing the parent. */}
      {category ? (
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
      ) : null}
      {/* All 12 category URLs shipped no H1 at all: the highest heading in
          CategoryBrand.jsx is the sidebar's "STORE CATEGORIES" H2. Rendered on
          the server so it does not wait on the client view, and visually
          hidden because the layout has no title slot to put it in. */}
      <h1 className="sr-only">{headingName} deals, coupons and brand offers</h1>
      <PageView {...props} />
    </>
  );
}
