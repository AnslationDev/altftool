import PageView from "./PageView";
import dealData from "../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const STORE_DESCRIPTION =
  "Browse stores by category and find verified coupons, deals, and exclusive offers on AltFTool. Save more on your favorite brands.";

// PageView builds every card link with its own slugify ("&" becomes "and"),
// which is NOT lib/brandSlug.js. The ItemList has to use the same one or it
// would advertise store URLs that no card on this page points at.
function storeCardSlug(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function generateMetadata() {
  return createPageMetadata({
    title: "Store Coupons – Exclusive Deals by Category",
    description: STORE_DESCRIPTION,
    path: "/exclusivedeals/store",
  });
}

export default function Page(props) {
  // The grid paginates in client state on this single URL, so the whole store
  // list belongs to this page — not only the nine cards shown first.
  const storeItems = (dealData.store || []).flatMap((category) =>
    (category.brands || [])
      .filter((brand) => brand?.brandName)
      .map((brand) => ({
        name: brand.brandName,
        path: `/exclusivedeals/store/${storeCardSlug(category.categoryName)}/${storeCardSlug(brand.brandName)}`,
      })),
  );

  return (
    <>
      {/* Editorial coupon listing: CollectionPage + ItemList only. The cards
          show an offer count and a logo, never a price or stock state, so an
          Offer/Product node here would assert data the page does not have. */}
      <JsonLd
        id="exclusive-deals-store-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/exclusivedeals/store",
            name: "Store Coupons by Category",
            description: STORE_DESCRIPTION,
          }),
          createItemListJsonLd({
            path: "/exclusivedeals/store",
            name: "AltFTool coupon stores",
            items: storeItems,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exclusive Deals", path: "/exclusivedeals" },
            { name: "Stores", path: "/exclusivedeals/store" },
          ]),
        ]}
      />
      {/* PageView's highest heading is the sidebar's <h3>, so this URL shipped
          with no <h1>. Rendered on the server from the same db.json the
          ItemList above is built from. */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 md:pt-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
          Store Coupons by Category
        </h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-(--muted-foreground)">
          Browse {storeItems.length} stores across {(dealData.store || []).length} categories
          and open any store for its current coupons and deals.
        </p>
      </header>
      <PageView {...props} />
    </>
  );
}
