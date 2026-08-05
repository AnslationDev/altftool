import PageView from "./PageView";
import dealData from "../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

// "verified coupons" was the claim here and on every /exclusivedeals/<category>
// description. Nothing tests these codes: the offers come straight from the
// brand feed, none carries a checked-on date, and there is no validation job
// anywhere in this repo. The word asserted a process that does not exist.
const STORE_DESCRIPTION =
  "Browse stores by category on AltFTool and open any brand to see the coupon codes, promo codes and deals currently listed for it.";

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
      {/* This URL shipped no H1: PageView's highest heading is the sidebar's
          "STORE CATEGORIES" H3. Visually hidden — the grid has no title slot —
          but server-rendered and in the accessibility tree. */}
      <h1 className="sr-only">Store coupons and deals by category</h1>
      <PageView {...props} />
    </>
  );
}
