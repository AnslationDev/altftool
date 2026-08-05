import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import {
  getRouteHub,
  getRouteHubJsonLdItems,
} from "@/platform/navigation/routeHubs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const DESCRIPTION =
  "Explore AltFTool brand comparison previews, category guides, and product research in one place.";
const brandRatingRouteHub = getRouteHub("brandrating");

export async function generateMetadata() {
  return createPageMetadata({
    title: "Brand Comparisons & Rating Guides",
    description: DESCRIPTION,
    path: "/brandrating",
    // The current hub contains sample statistics and promotional examples.
    // Keep it discoverable to users without indexing those claims as facts.
    noindex: true,
    follow: true,
  });
}

export default function BrandRatingLayout({ children }) {
  return (
    <>
      <JsonLd
        id="brandrating-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/brandrating",
            name: "AltFTool Brand Rating",
            description: DESCRIPTION,
          }),
          createItemListJsonLd({
            path: "/brandrating",
            name: "AltFTool brand rating routes",
            items: getRouteHubJsonLdItems("brandrating"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Brand Rating", path: "/brandrating" },
          ]),
        ]}
      />
      {children}
      <RouteDiscoveryBand {...brandRatingRouteHub} />
    </>
  );
}
