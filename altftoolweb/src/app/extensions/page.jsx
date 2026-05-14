import ExtensionClient from "./ExtensionClient";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const extensionsRouteHub = getRouteHub("extensions");
const extensionsDescription =
  "Explore must-have Chrome extensions and browser add-ons on AltFTool. Find useful extensions for productivity, browsing, SEO, developer workflows, writing, games, and more.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Best Chrome Extensions & Browser AddOns | AltFTool Extensions",
    description: extensionsDescription,
    path: "/extensions",
    image: "/extension/hero.jpg",
  });
}

export default function Page() {
  return (
    <>
      <JsonLd
        id="extensions-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/extensions",
            name: "AltFTool Extensions",
            description: extensionsDescription,
          }),
          createItemListJsonLd({
            path: "/extensions",
            name: "AltFTool extension next routes",
            items: getRouteHubJsonLdItems("extensions"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Extensions", path: "/extensions" },
          ]),
        ]}
      />
      <ExtensionClient />
      <RouteDiscoveryBand {...extensionsRouteHub} />
    </>
  );
}
