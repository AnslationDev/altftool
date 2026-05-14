import HeroSectionBrand from "./(components)/HeroSectionBrand";
import Categories from "./(components)/Categories";
import PopularTopic from "./(components)/PopularTopic";
import MethodologySection from "./(components)/MethodologySection";
import Brand from "./(components)/Brand";
import ConsumerRating from "./(components)/ConsumerRating";
import TrustSecure from "./(components)/TrustSecure";
import data from "./(data)/data.json";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const brandRatingRouteHub = getRouteHub("brandrating");
const brandRatingDescription =
  "Check brand ratings, product reviews, comparison signals, and tool scores on AltFTool. Compare brands and online tools with reliable context before choosing.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Brand Rating & Reviews – Tool Scores | AltFTool",
    description: brandRatingDescription,
    path: "/brandrating",
  });
}


function Page() {
  const allCategory = data.brandRating || {};
  return (
    <>
      <JsonLd
        id="brandrating-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/brandrating",
            name: "AltFTool Brand Rating",
            description: brandRatingDescription,
          }),
          createItemListJsonLd({
            path: "/brandrating",
            name: "AltFTool brand rating next routes",
            items: getRouteHubJsonLdItems("brandrating"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Brand Rating", path: "/brandrating" },
          ]),
        ]}
      />
      <div className="w-full ">
        <HeroSectionBrand />

        <Categories data={allCategory} />
        <PopularTopic data={allCategory} />
        <MethodologySection />
        <ConsumerRating />
        <Brand />

        <TrustSecure />
      </div>
      <RouteDiscoveryBand {...brandRatingRouteHub} />
    </>


  );
}

export default Page;
