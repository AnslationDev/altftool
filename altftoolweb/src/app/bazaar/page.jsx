import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub } from "@/platform/navigation/routeHubs";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import "./bazaar.css";

import BazaarShell from "./components/BazaarShell";
import HomeCategoryStrip from "./components/HomeCategoryStrip";
import HomeCityCloud from "./components/HomeCityCloud";
import HomeFreshGrid from "./components/HomeFreshGrid";
import HomeHero from "./components/HomeHero";
import HomeSpotlightRail from "./components/HomeSpotlightRail";
import HomeTrustBand from "./components/HomeTrustBand";
import RecentlyViewed from "./components/RecentlyViewed";
import { Breadcrumbs } from "./components/primitives";
import { CATEGORY_COUNT, getAllCategories } from "./data/categories";
import { CITY_COUNT, getPopularCities } from "./data/cities";
import {
  LISTING_COUNT,
  getCategoryCounts,
  getFeaturedListings,
  getFreshListings,
} from "./data/listings";

export const revalidate = 3600;

/**
 * Card budgets.
 *
 * `scripts/check-prerender-size.mjs` fails the build if a prerendered document
 * crosses 1 MiB, and an AdCard is not cheap (image, badges, two links). 24 + 10
 * is the agreed ceiling for this page; deeper browsing lives on /bazaar/search.
 */
const bazaarRouteHub = getRouteHub("bazaar");

const FRESH_LIMIT = 24;
const SPOTLIGHT_LIMIT = 10;

const BAZAAR_DESCRIPTION =
  `Buy and sell locally across India on AltF Bazaar — ${LISTING_COUNT} ads in ` +
  `${CATEGORY_COUNT} categories across ${CITY_COUNT} cities. Post your ad free and chat in-platform.`;

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltF Bazaar — Buy & Sell Locally in India",
    description: BAZAAR_DESCRIPTION,
    path: "/bazaar",
    keywords: [
      "buy and sell online india",
      "free classifieds india",
      "olx alternative india",
      "post free ad",
      "used mobiles for sale",
      "second hand cars",
      "flats for rent",
      "local marketplace india",
    ],
  });
}

export default function BazaarHomePage() {
  const categories = getAllCategories();
  const categoryCounts = getCategoryCounts();
  const spotlight = getFeaturedListings(SPOTLIGHT_LIMIT);
  const fresh = getFreshListings(FRESH_LIMIT);
  const popularCities = getPopularCities(20);

  return (
    <BazaarShell>
      <JsonLd
        id="altf-bazaar-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/bazaar",
            name: "AltF Bazaar — Buy & Sell Locally in India",
            description: BAZAAR_DESCRIPTION,
          }),
          // Exactly one ItemList per page: every builder derives its @id from
          // the path, so a second node here would collide with this one and
          // invalidate both.
          createItemListJsonLd({
            path: "/bazaar",
            name: "Popular categories on AltF Bazaar",
            items: categories.map((category) => ({
              name: category.name,
              path: `/bazaar/c/${category.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AltF Bazaar", path: "/bazaar" },
          ]),
        ]}
      />

      <div className="section-container">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "AltF Bazaar", path: "/bazaar" },
          ]}
        />
      </div>

      <HomeHero
        listingCount={LISTING_COUNT}
        categoryCount={CATEGORY_COUNT}
        cityCount={CITY_COUNT}
      />

      <HomeCategoryStrip categories={categories} counts={categoryCounts} />

      <HomeSpotlightRail listings={spotlight} />

      <HomeFreshGrid listings={fresh} />

      <RecentlyViewed />

      <HomeTrustBand />

      <HomeCityCloud
        cities={popularCities}
        categories={categories}
        categoryCounts={categoryCounts}
      />

      {/* Cross-vertical discovery band — same pattern as BuySmart's hub.
          No ItemList JSON-LD from it: this page already emits its one
          ItemList (the category list), and two would collide on @id. */}
      <RouteDiscoveryBand {...bazaarRouteHub} />
    </BazaarShell>
  );
}
