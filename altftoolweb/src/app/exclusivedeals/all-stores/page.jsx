import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const ALL_STORES_DESCRIPTION =
  "Explore all stores across categories with live deals, coupons, and top discounts on AltFTool. Sort by popularity, A-Z, and more.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "All Stores – Exclusive Deals & Coupons",
    description: ALL_STORES_DESCRIPTION,
    path: "/exclusivedeals/all-stores",
  });
}

export default function Page(props) {
  return (
    <>
      {/* CollectionPage + BreadcrumbList only. The store grid is a live
          Firestore subscription in PageView, so there is no server-side list to
          mirror — an ItemList built from db.json would describe a different set
          of stores than the page renders. Discounts shown are brand claims, not
          prices, so no Offer/Product node either. */}
      <JsonLd
        id="exclusive-deals-all-stores-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/exclusivedeals/all-stores",
            name: "All Stores",
            description: ALL_STORES_DESCRIPTION,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exclusive Deals", path: "/exclusivedeals" },
            { name: "All Stores", path: "/exclusivedeals/all-stores" },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
