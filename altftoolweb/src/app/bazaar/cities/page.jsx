import Link from "next/link";
import { MapPin } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs, LinkCloud, Note, SectionHead } from "../components/primitives";
import { CITY_COUNT, getCitiesByState, getPopularCities } from "../data/cities";
import { LISTING_COUNT, getCityCounts } from "../data/listings";

/**
 * /bazaar/cities — the city directory.
 *
 * Grouped by state, and every row carries that city's real ad count. The
 * quietest city on Bazaar has three ads and this page says three: a directory
 * that hides how thin a market is sends people to a dead end and burns the
 * trust the rest of the vertical depends on.
 *
 * No ItemList node here on purpose — /bazaar/categories owns the single
 * ItemList in this vertical (their `@id` would otherwise collide).
 */

export const dynamic = "force-dynamic";

const PATH = "/bazaar/cities";

export async function generateMetadata() {
  return createPageMetadata({
    title: `Buy and Sell in ${CITY_COUNT} Indian Cities — Bazaar City Directory`,
    description: `Every city AltF Bazaar covers, grouped by state, with the live ad count for each. ${LISTING_COUNT} ads across ${CITY_COUNT} cities — pick yours and browse locally.`,
    path: PATH,
    keywords: [
      "classifieds cities india",
      "buy and sell near me",
      "olx cities list",
      "local classified ads india",
    ],
  });
}

export default async function BazaarCitiesPage() {
  const counts = getCityCounts();
  const groups = getCitiesByState();
  const popular = getPopularCities(12);

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const busiestCount = ranked.length > 0 ? ranked[0][1] : 0;
  const quietestCount = ranked.length > 0 ? ranked[ranked.length - 1][1] : 0;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Cities", path: PATH },
  ];

  return (
    <BazaarShell>
      <JsonLd
        id="bazaar-cities-directory"
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path: PATH,
            name: "AltF Bazaar cities",
            description: `All ${CITY_COUNT} Indian cities covered by AltF Bazaar, grouped by state, with live ad counts.`,
          }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="max-w-3xl pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">
            Bazaar cities across {groups.length} states and territories
          </h1>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Bazaar operates in {CITY_COUNT} Indian cities and carries{" "}
            {LISTING_COUNT.toLocaleString("en-IN")} live ads between them. Inventory is not spread
            evenly: the busiest city holds {busiestCount} ads and the quietest {quietestCount}. Each
            count below is the real figure for that city, so you can tell a busy market from a thin
            one before you click.
          </p>
        </header>

        <section className="bzr-section" aria-label="Most active cities">
          <SectionHead title="Most active cities" href="/bazaar" linkLabel="Bazaar home" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map((city) => (
              <Link
                key={city.slug}
                href={`/bazaar/in/${city.slug}`}
                className="flex items-center justify-between gap-2 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2.5 text-sm hover:border-(--primary)"
              >
                <span className="min-w-0 truncate font-medium text-(--foreground)">
                  {city.name}
                </span>
                <span className="shrink-0 text-xs text-(--muted-foreground)">
                  {(counts.get(city.slug) || 0).toLocaleString("en-IN")}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bzr-section" aria-label="All cities by state">
          <SectionHead title="All cities by state" as="h2" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const stateTotal = group.cities.reduce(
                (sum, city) => sum + (counts.get(city.slug) || 0),
                0,
              );
              return (
                <article
                  key={group.state}
                  className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4"
                >
                  <h3 className="text-sm font-bold text-(--foreground)">{group.state}</h3>
                  <p className="mt-0.5 text-xs text-(--muted-foreground)">
                    {group.cities.length} cit{group.cities.length === 1 ? "y" : "ies"} ·{" "}
                    {stateTotal.toLocaleString("en-IN")} ads
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {group.cities.map((city) => (
                      <li key={city.slug} className="flex items-center justify-between gap-2">
                        <Link
                          href={`/bazaar/in/${city.slug}`}
                          className="min-w-0 truncate text-sm text-(--foreground) hover:underline"
                        >
                          {city.name}
                        </Link>
                        <span className="shrink-0 text-xs text-(--muted-foreground)">
                          {(counts.get(city.slug) || 0).toLocaleString("en-IN")} ads
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <Note icon={MapPin}>
          Your city is not here? Bazaar only lists cities it actually has inventory in. Open{" "}
          <Link href="/bazaar/cities">this directory</Link> from the nearest metro instead, or check{" "}
          <Link href="/locations/india">AltFTool in India</Link> for the rest of the site.
        </Note>

        <section className="bzr-section">
          <LinkCloud
            title="Keep browsing"
            links={[
              { href: "/bazaar/categories", label: "All categories" },
              { href: "/bazaar/price-guide", label: "Price guides" },
              { href: "/bazaar/safety", label: "Safety guide" },
              { href: "/bazaar/help", label: "Help centre" },
              { href: "/bazaar/post", label: "Post a free ad" },
            ]}
          />
        </section>
      </div>
    </BazaarShell>
  );
}
