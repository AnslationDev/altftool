import { Suspense } from "react";

import { createPageMetadata } from "@/platform/seo/generateMetadata";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs } from "../components/primitives";
import { getAllCategories } from "../data/categories";
import { getAllCities } from "../data/cities";
import { LISTING_COUNT, queryListings } from "../data/listings";
import MapExplorerClient from "./MapExplorerClient";

/**
 * /bazaar/map — browse by "near me" instead of by page number.
 *
 * Dynamic, not static, for the same reason `/bazaar/search` is: it reads
 * arbitrary `searchParams`, and a page that reads them cannot be
 * `force-static`. Being dynamic also means the whole corpus can be filtered on
 * the server and only the plotted subset crosses the wire.
 *
 * `noindex` — an interactive map is a tool, not a crawlable surface, and its
 * URL space is the same unbounded filter permutation set that keeps
 * `/bazaar/search` out of the index. The city and category pages carry this
 * inventory in a form a crawler can use.
 */
export const dynamic = "force-dynamic";

/**
 * How many individual ads get plotted.
 *
 * The map is useless above a few hundred pins and the payload is not free
 * (every point is serialised into the RSC stream). The cap is above any single
 * city's or category's inventory, so a filtered view is always complete; only
 * the unfiltered national view is trimmed, and the UI says so. Cluster bubbles
 * are counted from the points that were actually sent, so a bubble never
 * promises pins that are not there.
 */
const MAP_CAP = 480;

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "AltF Bazaar", path: "/bazaar" },
  { name: "Map", path: "/bazaar/map" },
];

/** searchParams values are `string | string[] | undefined`. */
function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function toNumberOrUndefined(raw) {
  const text = String(first(raw) ?? "").trim();
  if (text === "") return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * The leanest shape a pin and its list row need.
 *
 * Deliberately not the card projection: `AdCard`'s fields (badges, views,
 * saves, attributes, seller) are dead weight here, and 480 of them would be a
 * few hundred KB of RSC payload for data nothing renders.
 */
function toMapPoint(listing) {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    priceLabel: listing.priceLabel,
    coords: listing.coords,
    locality: listing.locality,
    citySlug: listing.citySlug,
    cityName: listing.cityName,
    image: listing.images?.[0]?.src || null,
  };
}

export async function generateMetadata() {
  return createPageMetadata({
    title: "Ads near you on the map - AltF Bazaar",
    description:
      "See AltF Bazaar classified ads plotted on a map of India. Filter by city, category and price, then browse the ads inside the area you can actually travel to. Pins show approximate areas, never exact addresses.",
    path: "/bazaar/map",
    noindex: true,
  });
}

export default async function BazaarMapPage({ searchParams }) {
  const sp = (await searchParams) || {};

  const citySlug = String(first(sp.city) || "");
  const categorySlug = String(first(sp.category) || "");

  // One query against the whole corpus, in the same relevance order every other
  // browse surface uses, so the map is not quietly a different ranking.
  const matched = queryListings({
    city: citySlug || undefined,
    category: categorySlug || undefined,
    q: String(first(sp.q) || "").trim() || undefined,
    minPrice: toNumberOrUndefined(sp.min),
    maxPrice: toNumberOrUndefined(sp.max),
    page: 1,
    perPage: LISTING_COUNT,
  });

  // A listing whose city has no coordinates is counted, never guessed onto the
  // map — the count difference is stated in the UI instead.
  const plottable = matched.items.filter((listing) =>
    Array.isArray(listing.coords),
  );
  const points = plottable.slice(0, MAP_CAP).map(toMapPoint);

  const cities = getAllCities().map(({ slug, name, coords }) => ({
    slug,
    name,
    coords,
  }));
  const categories = getAllCategories().map(({ slug, name }) => ({
    slug,
    name,
  }));

  return (
    <BazaarShell query={String(first(sp.q) || "")}>
      <div className="section-container px-4 pb-6 pt-4 sm:px-6">
        <Breadcrumbs items={CRUMBS} />

        <header className="mb-4">
          <h1 className="text-2xl font-bold text-(--foreground) sm:text-3xl">
            Ads on the map
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-(--muted-foreground)">
            Classifieds are a &ldquo;can I get there&rdquo; decision before they
            are a price decision. Pan the map, and the list beside it stays in
            step with whatever is in view.
          </p>
        </header>

        {/* useSearchParams() suspends on a dynamic render boundary. The client
            tree renders in the same server pass here, so the fallback is never
            actually painted — and seeding it with content would duplicate the
            whole list in the HTML, the trap documented in the blueprint. */}
        <Suspense fallback={null}>
          <MapExplorerClient
            points={points}
            cities={cities}
            categories={categories}
            total={matched.total}
            plottedTotal={plottable.length}
            cap={MAP_CAP}
          />
        </Suspense>
      </div>
    </BazaarShell>
  );
}
