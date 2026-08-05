import Link from "next/link";
import { IndianRupee, Info, LayoutGrid, MapPin, Search, Tag } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import { getCategoryIcon } from "../components/categoryIcons";
import { Breadcrumbs, LinkCloud, Note, SectionHead } from "../components/primitives";
import { CATEGORY_COUNT, SUBCATEGORY_COUNT, getCategory } from "../data/categories";
import { CITY_COUNT, getCity } from "../data/cities";
import {
  LISTING_COUNT,
  formatPrice,
  getListings,
  getPriceStats,
} from "../data/listings";
import { getMarket } from "../data/market";

/**
 * `formatPrice` output minus its leading currency symbol, for the one tile
 * where a lucide `IndianRupee` glyph already renders the symbol and printing
 * it twice would read "₹ ₹42,000". (The icon itself is the default market's
 * glyph — a second market swaps the icon along with the config.)
 */
function priceDigits(text) {
  const symbol = getMarket().currencySymbol;
  return text.startsWith(symbol) ? text.slice(symbol.length) : text;
}

/**
 * /bazaar/trending — the discovery hub.
 *
 * Everything on this page is counted out of the live corpus in one pass, so a
 * heading that says "412 ads" means 412 ads. Nothing is hand-listed and
 * nothing is aspirational: if a category, a city or a brand has no inventory
 * it does not appear, which is the only way a link farm and a discovery hub
 * differ from each other.
 *
 * Destination policy. `/bazaar/search` is `noindex` by design — arbitrary
 * filter permutations are the doorway-page pattern. So every link here that
 * *can* point at an indexable surface does: categories and subcategories to
 * `/bazaar/c/…`, cities to `/bazaar/in/…`, city+category pairs to the
 * `/bazaar/in/{city}/{category}` money pages, and price entry points to
 * `/bazaar/price-guide/…`. Brand filters are the one exception — no route
 * exists for "Honda cars", the corpus genuinely holds that facet, and the
 * search page renders it correctly — so those, and only those, are search
 * URLs.
 */

export const dynamic = "force-dynamic";

const PATH = "/bazaar/trending";

/** How many of each ranking to show. Kept small — a hub, not a dump. */
const TOP_CATEGORIES = 12;
const TOP_SUBCATEGORIES = 18;
const TOP_CITIES = 12;
const TOP_PAIRS = 18;
const TOP_BRAND_CATEGORIES = 4;
const BRANDS_PER_CATEGORY = 8;
const TOP_PRICE_GUIDES = 8;

/**
 * One pass over the 720-ad corpus produces every ranking on the page.
 *
 * Ties are broken by slug so the ordering is stable across builds — a
 * `force-static` page whose lists reshuffle on every rebuild would churn the
 * sitemap's lastModified for no reason.
 */
function buildTrends() {
  const categories = new Map();
  const subcategories = new Map();
  const cities = new Map();
  const pairs = new Map();
  const brands = new Map();

  const bump = (map, key, seed) => {
    const entry = map.get(key);
    if (entry) entry.count += 1;
    else map.set(key, { ...seed, count: 1 });
  };

  for (const listing of getListings()) {
    bump(categories, listing.categorySlug, {
      slug: listing.categorySlug,
      name: listing.categoryName,
    });

    bump(subcategories, `${listing.categorySlug}/${listing.subcategorySlug}`, {
      href: `/bazaar/c/${listing.categorySlug}/${listing.subcategorySlug}`,
      name: listing.subcategoryName,
      parent: listing.categoryName,
    });

    bump(cities, listing.citySlug, {
      slug: listing.citySlug,
      name: listing.cityName,
      stateName: listing.stateName,
    });

    bump(pairs, `${listing.citySlug}/${listing.categorySlug}`, {
      href: `/bazaar/in/${listing.citySlug}/${listing.categorySlug}`,
      name: `${listing.categoryName} in ${listing.cityName}`,
      cityName: listing.cityName,
      categoryName: listing.categoryName,
    });

    const brand = listing.attributes?.brand;
    if (brand) {
      bump(brands, `${listing.categorySlug}::${brand}`, {
        categorySlug: listing.categorySlug,
        categoryName: listing.categoryName,
        brand,
      });
    }
  }

  const rank = (map, limit) =>
    [...map.entries()]
      .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([, value]) => value);

  // Brands are ranked inside their own category, then the categories that
  // actually carry a brand facet are ranked by how much inventory they hold.
  const brandsByCategory = new Map();
  for (const entry of rank(brands, Infinity)) {
    const bucket = brandsByCategory.get(entry.categorySlug);
    if (bucket) bucket.brands.push(entry);
    else
      brandsByCategory.set(entry.categorySlug, {
        slug: entry.categorySlug,
        name: entry.categoryName,
        brands: [entry],
      });
  }

  const brandGroups = [...brandsByCategory.values()]
    .map((group) => ({
      ...group,
      total: group.brands.reduce((sum, entry) => sum + entry.count, 0),
      brands: group.brands.slice(0, BRANDS_PER_CATEGORY),
    }))
    .sort((a, b) => b.total - a.total || a.slug.localeCompare(b.slug))
    .slice(0, TOP_BRAND_CATEGORIES);

  return {
    categories: rank(categories, TOP_CATEGORIES),
    subcategories: rank(subcategories, TOP_SUBCATEGORIES),
    cities: rank(cities, TOP_CITIES),
    pairs: rank(pairs, TOP_PAIRS),
    brandGroups,
  };
}

export async function generateMetadata() {
  return createPageMetadata({
    title: "Trending on AltF Bazaar — Popular Categories, Cities & Searches",
    // Kept under 160 characters on purpose: `createPageMetadata` trims longer
    // descriptions mid-sentence, and a clipped meta description is a wasted one.
    description: `The busiest AltF Bazaar categories, cities and city-plus-category pages, with popular brand filters and price guides — all ranked by live listing volume.`,
    path: PATH,
    keywords: [
      "trending classifieds",
      "popular searches olx india",
      "most listed categories",
      "busiest classifieds cities india",
      "used goods price guide india",
    ],
  });
}

export default async function BazaarTrendingPage() {
  const { categories, subcategories, cities, pairs, brandGroups } = buildTrends();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Trending", path: PATH },
  ];

  const priceGuides = categories
    .slice(0, TOP_PRICE_GUIDES)
    .map((entry) => ({ ...entry, stats: getPriceStats(entry.slug) }))
    .filter((entry) => entry.stats);

  return (
    <BazaarShell>
      <JsonLd
        id="bazaar-trending"
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path: PATH,
            name: "Trending on AltF Bazaar",
            description: `The busiest categories, cities and searches on AltF Bazaar, counted from ${LISTING_COUNT} live ads.`,
          }),
          // The page's single ItemList, and the only one it is allowed: the
          // `#item-list` @id is derived from the URL, so a second node here
          // would overwrite this one. It describes the city+category pages,
          // which are the most valuable destinations on the page.
          createItemListJsonLd({
            path: PATH,
            name: "Trending city and category pages on AltF Bazaar",
            items: pairs.map((pair) => ({ name: pair.name, path: pair.href })),
          }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="max-w-3xl pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">Trending on AltF Bazaar</h1>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Where the {LISTING_COUNT.toLocaleString("en-IN")} ads currently on Bazaar actually
            sit — which of the {CATEGORY_COUNT} categories are deepest, which of the {CITY_COUNT}{" "}
            cities are busiest, and which filters are worth starting from. Every number below is
            counted from the live corpus, and anything with no inventory is simply not listed.
          </p>
        </header>

        <Note icon={Info}>
          AltF Bazaar is a demonstration marketplace running on a generated catalogue, so
          &ldquo;trending&rdquo; here means <strong>listing volume</strong> — how much inventory
          sits behind each link. It is not search-log data, and no ad on this site is a real one
          for sale.
        </Note>

        {/* ---------------- Categories ---------------- */}
        <section className="bzr-section" aria-label="Most-listed categories">
          <SectionHead
            title="Most-listed categories"
            as="h2"
            href="/bazaar/categories"
            linkLabel={`All ${CATEGORY_COUNT} categories`}
          />
          <div className="bzr-cat-grid">
            {categories.map((entry) => {
              const category = getCategory(entry.slug);
              const Icon = getCategoryIcon(category?.icon);
              return (
                <Link key={entry.slug} href={`/bazaar/c/${entry.slug}`} className="bzr-cat-tile">
                  <span className="bzr-cat-icon">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="bzr-cat-name">{entry.name}</span>
                  <span className="bzr-cat-count">
                    {entry.count.toLocaleString("en-IN")} ad{entry.count === 1 ? "" : "s"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---------------- Subcategories ---------------- */}
        <section className="bzr-section" aria-label="Most-listed subcategories">
          <SectionHead title="Most-listed subcategories" as="h2" />
          <p className="-mt-3 mb-4 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            The narrowest pages with real depth behind them — usually a better starting point than
            the parent category, because the filters on them already match what you are looking
            for.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((entry) => (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  className="flex items-baseline justify-between gap-3 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2 hover:border-(--primary)"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-(--foreground)">
                      {entry.name}
                    </span>
                    <span className="block truncate text-xs text-(--muted-foreground)">
                      {entry.parent}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-(--muted-foreground)">
                    {entry.count.toLocaleString("en-IN")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- Cities ---------------- */}
        <section className="bzr-section" aria-label="Busiest cities">
          <SectionHead
            title="Busiest cities"
            as="h2"
            href="/bazaar/cities"
            linkLabel={`All ${CITY_COUNT} cities`}
          />
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((entry) => {
              const city = getCity(entry.slug);
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/bazaar/in/${entry.slug}`}
                    className="flex items-baseline justify-between gap-3 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2 hover:border-(--primary)"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-(--foreground)">
                        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
                        {entry.name}
                      </span>
                      <span className="block truncate text-xs text-(--muted-foreground)">
                        {city?.stateName || entry.stateName}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-(--muted-foreground)">
                      {entry.count.toLocaleString("en-IN")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------------- City + category ---------------- */}
        <section className="bzr-section" aria-label="Trending city and category pages">
          <SectionHead title="Popular searches by city" as="h2" />
          <p className="-mt-3 mb-4 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            The city and category combinations carrying the most inventory. Each one is a full
            page with its own price medians, localities and subcategory breakdown.
          </p>
          <div className="bzr-linkcloud">
            {pairs.map((pair) => (
              <Link key={pair.href} href={pair.href}>
                {pair.name} <span className="opacity-60">({pair.count})</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------- Brands ---------------- */}
        {brandGroups.length > 0 ? (
          <section className="bzr-section" aria-label="Popular brand filters">
            <SectionHead title="Popular brands" as="h2" />
            <p className="-mt-3 mb-4 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              The brands with the most ads behind them, in the categories that record a brand.
              These open the filtered results directly — the count next to each is the number of
              ads you will land on.
            </p>
            <div className="flex flex-col gap-5">
              {brandGroups.map((group) => (
                <div key={group.slug}>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    {group.name}
                  </h3>
                  <div className="bzr-linkcloud">
                    {group.brands.map((entry) => (
                      <Link
                        key={`${group.slug}-${entry.brand}`}
                        href={`/bazaar/search?category=${encodeURIComponent(
                          group.slug,
                        )}&brand=${encodeURIComponent(entry.brand)}`}
                      >
                        {entry.brand} <span className="opacity-60">({entry.count})</span>
                      </Link>
                    ))}
                    <Link href={`/bazaar/c/${group.slug}`}>All {group.name}</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------------- Price guides ---------------- */}
        {priceGuides.length > 0 ? (
          <section className="bzr-section" aria-label="Price guides">
            <SectionHead
              title="What things go for"
              as="h2"
              href="/bazaar/price-guide"
              linkLabel="All price guides"
            />
            <p className="-mt-3 mb-4 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              Median asking price per category, broken down by city and subcategory on each guide.
              These are what sellers are asking, not what buyers paid.
            </p>
            <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {priceGuides.map((entry) => (
                <div
                  key={entry.slug}
                  className="rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2.5"
                >
                  <dt className="text-sm font-semibold text-(--foreground)">
                    <Link href={`/bazaar/price-guide/${entry.slug}`} className="hover:underline">
                      {entry.name}
                    </Link>
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-base font-bold text-(--foreground)">
                    <IndianRupee className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                    {priceDigits(formatPrice(entry.stats.median))}
                    <span className="text-xs font-medium text-(--muted-foreground)">median</span>
                  </dd>
                  <dd className="text-xs text-(--muted-foreground)">
                    {formatPrice(entry.stats.p25)} – {formatPrice(entry.stats.p75)} typical ·{" "}
                    {entry.stats.count.toLocaleString("en-IN")} ads
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <Note icon={Tag}>
          Nothing here is promoted placement. The order is inventory volume, top to bottom, and a
          seller cannot pay to move up this page.
        </Note>

        <section className="bzr-section">
          <LinkCloud
            title="Keep browsing"
            links={[
              { href: "/bazaar", label: "Bazaar home" },
              { href: "/bazaar/categories", label: `All ${CATEGORY_COUNT} categories` },
              { href: "/bazaar/cities", label: `All ${CITY_COUNT} cities` },
              { href: "/bazaar/price-guide", label: "Price guides" },
              { href: "/bazaar/safety", label: "Safety guide" },
              { href: "/bazaar/help", label: "Help centre" },
              { href: "/bazaar/post", label: "Post a free ad" },
            ]}
          />
        </section>

        <p className="mt-6 text-xs text-(--muted-foreground)">
          <LayoutGrid className="me-1 inline h-3 w-3" aria-hidden="true" />
          {SUBCATEGORY_COUNT} subcategories exist in total — the{" "}
          <Link href="/bazaar/categories" className="bzr-section-link">
            category directory
          </Link>{" "}
          lists every one of them with its live count.
        </p>
      </div>
    </BazaarShell>
  );
}
