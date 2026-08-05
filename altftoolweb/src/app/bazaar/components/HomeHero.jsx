import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { getMarket } from "../data/market";
import { T } from "../i18n/T";

/**
 * Bazaar home hero.
 *
 * Deliberately short. On a classifieds home page the hero is not the product —
 * the category grid is. Anything taller than this pushes the 24 category tiles
 * below the fold on a 1280x800 desktop, which is the one thing this page must
 * not do.
 *
 * The three stats are passed in from the data layer rather than written into
 * the copy, so the page cannot drift out of sync with the corpus it renders.
 *
 * @param {{ listingCount: number, categoryCount: number, cityCount: number }} props
 */
export default function HomeHero({ listingCount, categoryCount, cityCount }) {
  const market = getMarket();
  const stats = [
    { value: listingCount, id: "home.stat.ads", label: "live ads" },
    { value: categoryCount, id: "home.stat.categories", label: "categories" },
    { value: cityCount, id: "home.stat.cities", label: "cities" },
  ];

  return (
    <section className="border-b border-(--border) bg-(--bzr-soft)">
      <div className="section-container py-6 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-(--foreground) sm:text-4xl">
              <T id="home.hero.title" fallback="Buy. Sell. Nearby." />
            </h1>
            <p className="bzr-muted-on-tint mt-2 text-sm leading-relaxed sm:text-base">
              {/* The fallback mirrors the catalogue's en template exactly;
                  `{country}` interpolates from the market config either way,
                  so the default market renders the same sentence as ever. */}
              <T
                id="home.hero.subtitle"
                fallback="Local classifieds for {country} — find the thing you need a few streets away, and turn what you no longer use into cash. Free to list, no commission on the sale."
                params={{ country: market.countryName }}
              />
            </p>

            <dl className="mt-3.5 flex flex-wrap items-baseline gap-x-6 gap-y-1.5">
              {stats.map((stat) => (
                <div key={stat.id} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">
                    <T id={stat.id} fallback={stat.label} />
                  </dt>
                  <dd className="text-base font-extrabold tabular-nums text-(--foreground)">
                    {stat.value.toLocaleString(market.numberLocale)}
                  </dd>
                  <dd className="bzr-muted-on-tint text-xs uppercase tracking-wide">
                    <T id={stat.id} fallback={stat.label} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Link href="/bazaar/post" className="bzr-btn bzr-btn-sell shrink-0 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <T id="home.hero.cta" fallback="Post your ad — it's free" />
          </Link>
        </div>
      </div>
    </section>
  );
}
