import HeroSectionBrand from "./(components)/HeroSectionBrand";
import Categories from "./(components)/Categories";
import PopularTopic from "./(components)/PopularTopic";
import MethodologySection from "./(components)/MethodologySection";
import Brand from "./(components)/Brand";
import ConsumerRating from "./(components)/ConsumerRating";
import TrustSecure from "./(components)/TrustSecure";
import "./brandrating.css";
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
      <div className="brandrating-page route-page-shell w-full">
        <header className="section pb-3 pt-8 sm:pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--primary)">
            Independent comparisons
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-(--foreground) sm:text-3xl">
            Compare brands with confidence
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
            Review ratings, features, offers, and comparison signals in one clear workspace.
          </p>
        </header>
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
