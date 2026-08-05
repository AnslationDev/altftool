import { LinkCloud } from "./primitives";
import { T, TName } from "../i18n/T";

/**
 * The vertical's internal-linking surface.
 *
 * Every link here points at a route that actually exists, and the category
 * ordering is derived from live listing counts rather than a hand-kept list, so
 * the cloud keeps promoting whatever the corpus is genuinely deepest in. Ties
 * break on name so the prerendered HTML is byte-stable between builds.
 *
 * @param {{
 *   cities: Array<object>,
 *   categories: Array<object>,
 *   categoryCounts: Map<string, number>,
 * }} props
 */
export default function HomeCityCloud({ cities = [], categories = [], categoryCounts }) {
  const countOf = (slug) => categoryCounts?.get(slug) ?? 0;

  const rankedCategories = [...categories].sort(
    (a, b) => countOf(b.slug) - countOf(a.slug) || a.name.localeCompare(b.name),
  );

  // Labels are `<T>`/`<TName>` leaves, so this stays a server component while
  // the visible text follows the EN/हिन्दी toggle. City names are proper nouns
  // and render as-is inside both templates.
  const cityLinks = cities.map((city) => ({
    href: `/bazaar/in/${city.slug}`,
    label: (
      <T id="home.popular.adsIn" fallback={`Ads in ${city.name}`} params={{ city: city.name }} />
    ),
  }));

  const categoryLinks = rankedCategories.slice(0, 12).map((category) => ({
    href: `/bazaar/c/${category.slug}`,
    label: <TName kind="category" slug={category.slug} fallback={category.name} />,
  }));

  // Name-first in both languages: "Cars prices" / "कार की कीमतें".
  const priceGuideLinks = rankedCategories.slice(0, 8).map((category) => ({
    href: `/bazaar/price-guide/${category.slug}`,
    label: (
      <>
        <TName kind="category" slug={category.slug} fallback={category.name} />{" "}
        <T id="home.popular.pricesSuffix" fallback="prices" />
      </>
    ),
  }));

  // Directory hubs. These are the only inbound crawl paths some of these
  // pages have — /bazaar/trending in particular is referenced from
  // /llms.txt, but that reaches answer engines, not crawlers.
  const directoryLinks = [
    { href: "/bazaar/trending", label: <T id="home.dir.trending" fallback="Trending on Bazaar" /> },
    { href: "/bazaar/categories", label: <T id="home.dir.categories" fallback="All categories" /> },
    { href: "/bazaar/cities", label: <T id="home.dir.cities" fallback="All cities" /> },
    {
      href: "/bazaar/price-guide",
      label: <T id="home.dir.priceGuides" fallback="All price guides" />,
    },
    { href: "/bazaar/safety", label: <T id="home.dir.safety" fallback="Safety centre" /> },
    { href: "/bazaar/help", label: <T id="home.dir.help" fallback="Help & FAQ" /> },
  ];

  return (
    <section className="bzr-section border-t border-(--border)" aria-label="Popular on AltF Bazaar">
      <div className="section-container">
        <h2 className="bzr-section-title mb-5">
          <T id="home.popular.title" fallback="Popular on AltF Bazaar" />
        </h2>

        <div className="flex flex-col gap-6">
          <LinkCloud title={<T id="home.popular.cities" fallback="Popular cities" />} links={cityLinks} />
          <LinkCloud
            title={<T id="home.popular.categories" fallback="Popular categories" />}
            links={categoryLinks}
          />
          <LinkCloud
            title={<T id="home.popular.priceGuides" fallback="Price guides" />}
            links={priceGuideLinks}
          />
          <LinkCloud
            title={<T id="home.popular.directory" fallback="Browse the directory" />}
            links={directoryLinks}
          />
        </div>
      </div>
    </section>
  );
}
