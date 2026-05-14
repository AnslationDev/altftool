import AcademyClient from "./AcademyClient";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const academyRouteHub = getRouteHub("academy");
const academyDescription =
  "Explore AltFTool Academy to compare digital learning platforms, career-growth resources, skill courses, and practical tutorials for productivity and tech workflows.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Academy – Learn Tools, Tech & Digital Skills",
    description: academyDescription,
    path: "/academy",
    image: "/academy/hero/banner-academy.jpg",
  });
}

export default function Page() {
  return (
    <>
      <JsonLd
        id="academy-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/academy",
            name: "AltFTool Academy",
            description: academyDescription,
          }),
          createItemListJsonLd({
            path: "/academy",
            name: "AltFTool Academy next routes",
            items: getRouteHubJsonLdItems("academy"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Academy", path: "/academy" },
          ]),
        ]}
      />
      <AcademyClient />
      <RouteDiscoveryBand {...academyRouteHub} />
    </>
  );
}
