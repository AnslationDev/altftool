import TrendingClient from "./TrendingClient";
import "./styles/trendingvids.css";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const trendingRouteHub = getRouteHub("trendingvids");
const trendingDescription =
  "Watch the latest trending videos on AltFTool. Discover viral clips, popular content, shorts, creator picks, and useful video workflows from across the web in one place.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Trending Videos – Watch Viral & Popular Videos",
    description: trendingDescription,
    path: "/trendingvids",
  });
}

export default function Page() {
  return (
    <>
      <JsonLd
        id="trending-videos-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/trendingvids",
            name: "AltFTool Trending Videos",
            description: trendingDescription,
          }),
          createItemListJsonLd({
            path: "/trendingvids",
            name: "AltFTool trending video next routes",
            items: getRouteHubJsonLdItems("trendingvids"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Trending Videos", path: "/trendingvids" },
          ]),
        ]}
      />
      <TrendingClient />
      <RouteDiscoveryBand {...trendingRouteHub} />
    </>
  );
}
