import Link from "next/link";
import { Globe2 } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { getAllGeoLocations } from "@/platform/seo/geoLocations";

/**
 * /locations — hub page linking every geo landing page (no orphan pages).
 * Grouped Countries → Indian states → Cities for humans; ItemList +
 * CollectionPage schema for crawlers.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

const T = {
  card: "var(--sc-card)",
  tile: "var(--sc-tile)",
  ink: "var(--sc-ink)",
  muted: "var(--sc-muted)",
  indigo: "var(--sc-indigo)",
  grad: "linear-gradient(135deg, #6D7BF7 0%, #8B5CF6 100%)",
  shadow: "var(--sc-shadow)",
};
const CARD = { backgroundColor: T.card, boxShadow: T.shadow };

/** Registry counts, so the copy below can never drift from the actual index. */
function getLocationCounts() {
  const all = getAllGeoLocations();
  return {
    countries: all.filter((entry) => entry.type === "Country").length,
    states: all.filter((entry) => entry.type === "State").length,
    cities: all.filter((entry) => entry.type === "City").length,
  };
}

export async function generateMetadata() {
  // trimMetaDescription() only passes a string through verbatim when it is
  // under 160 chars AND ends in terminal punctuation. The previous copy ran
  // 169, so the live page shipped "...PDF and image tools." with the closing
  // "near you" amputated. This lands at 152 with the current counts, and stays
  // inside the budget until a bucket reaches five digits.
  const { countries, states, cities } = getLocationCounts();
  const counted = `Browse ${siteConfig.name} by location: ${countries} countries, ${states} Indian states and ${cities} cities, each with a shortlist of free browser tools — image, PDF, QR and calculators.`;

  return createPageMetadata({
    title: `${siteConfig.name} Worldwide — Free Online Tools by Location`,
    description:
      counted.length < 160
        ? counted
        : `Browse ${siteConfig.name} by location — free browser tools for every country, state and city we index: image, PDF, QR and calculators.`,
    path: "/locations",
  });
}

function LocationGroup({ title, locations }) {
  if (!locations.length) return null;
  return (
    <section className="rounded-[24px] p-5 sm:p-7" style={CARD} aria-label={title}>
      <h2 className="text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
        {title}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {locations.map((location) => (
          <li key={location.slug}>
            <Link
              href={`/locations/${location.slug}`}
              className="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo)"
              style={{ backgroundColor: T.tile, color: T.ink }}
            >
              {location.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LocationsPage() {
  const all = getAllGeoLocations();
  const countries = all.filter((entry) => entry.type === "Country");
  const states = all.filter((entry) => entry.type === "State");
  const cities = all.filter((entry) => entry.type === "City");
  const counts = getLocationCounts();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-14 pt-6 sm:px-6 lg:px-8" style={{ color: T.ink }}>
      <JsonLd
        id="locations-hub"
        data={[
          createCollectionPageJsonLd({
            path: "/locations",
            name: `${siteConfig.name} Worldwide`,
            description: `${siteConfig.name}'s free online tools by country, state, and city.`,
          }),
          createItemListJsonLd({
            path: "/locations",
            name: `${siteConfig.name} locations`,
            items: all.map((entry) => ({ name: entry.name, path: `/locations/${entry.slug}` })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Locations", path: "/locations" },
          ]),
        ]}
      />

      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: T.indigo }}>
          <Globe2 size={13} aria-hidden="true" />
          Available worldwide
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: T.ink }}>
          {siteConfig.name} — Free Online Tools, Everywhere
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
          {siteConfig.name} works the same in every country, state and city — free, with nothing to
          install, and with the everyday tools doing their work inside your own browser. This index
          covers {counts.countries} countries, {counts.states} Indian states and {counts.cities}{" "}
          cities; pick one to see a shortlist of tools and the places we cover nearby.
        </p>
      </section>

      <LocationGroup title="Countries" locations={countries} />
      <LocationGroup title="States in India" locations={states} />
      <LocationGroup title="Cities" locations={cities} />
    </div>
  );
}
