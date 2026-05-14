import BuySmartClient from "./BuySmartClient";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const buySmartRouteHub = getRouteHub("buysmart");
const buySmartDescription =
  "Explore BuySmart on AltFTool for smart product and tool deals, top recommendations, buying guides, store pages, and savings insights for software, gadgets, and digital services.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "BuySmart – Smart Product & Tool Deals | AltFTool",
    description: buySmartDescription,
    path: "/buysmart",
  });
}

export default function Page() {
  return (
    <>
      <JsonLd
        id="buysmart-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/buysmart",
            name: "AltFTool BuySmart",
            description: buySmartDescription,
          }),
          createItemListJsonLd({
            path: "/buysmart",
            name: "AltFTool BuySmart next routes",
            items: getRouteHubJsonLdItems("buysmart"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "BuySmart", path: "/buysmart" },
          ]),
        ]}
      />
      <BuySmartClient />
      <RouteDiscoveryBand {...buySmartRouteHub} />
    </>
  );
}
