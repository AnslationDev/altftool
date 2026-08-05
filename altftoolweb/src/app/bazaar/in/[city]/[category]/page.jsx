import Link from "next/link";
import { notFound } from "next/navigation";
import { Coins, IndianRupee, Layers, ShieldCheck, Tag } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import "../../../bazaar.css";
import AdCard from "../../../components/AdCard";
import BazaarShell from "../../../components/BazaarShell";
import GeoFaq from "../../../components/GeoFaq";
import PriceGuideTable from "../../../components/PriceGuideTable";
import {
  Breadcrumbs,
  EmptyState,
  LinkCloud,
  Note,
  SectionHead,
} from "../../../components/primitives";
import { getAllCategories, getCategory } from "../../../data/categories";
import { getAllCities, getCity } from "../../../data/cities";
import {
  formatPrice,
  getListings,
  getPriceStats,
  queryListings,
} from "../../../data/listings";

/**
 * /bazaar/in/[city]/[category] — the long-tail intent page ("used cars in Pune").
 *
 * This is where most organic classifieds traffic lands, which is exactly why it
 * has to be the opposite of a doorway: the count, the price stats, the
 * subcategory split and the ads are all computed for this city+category pair
 * specifically. When the pair is genuinely empty the page says so, sets
 * noindex, and spends its space on links that lead somewhere useful.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

/** Prerender only pairs that carry real inventory, biggest first. */
const PRERENDER_PAIR_LIMIT = 150;

/**
 * 50 cities × 24 categories is 1,200 routes, and 747 of those combinations have
 * no ads at all — prerendering them would burn build time producing pages we
 * then mark noindex. So: keep only pairs with listings (453 of them), rank by
 * inventory, and prerender the top 150. The remaining ~300 populated pairs are
 * long-tail enough to render on demand and be cached by `revalidate`, and the
 * empty ones are only ever reached by a crawler following a stale link.
 */
function rankedPairs() {
  const counts = new Map();
  for (const listing of getListings()) {
    const key = `${listing.citySlug}|${listing.categorySlug}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    // Ties are common at the tail, so break them on the key to keep
    // generateStaticParams byte-identical between builds.
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key]) => {
      const [city, category] = key.split("|");
      return { city, category };
    });
}

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return rankedPairs().slice(0, PRERENDER_PAIR_LIMIT);
}

/* ------------------------------------------------------------------
 * Derivations
 * ---------------------------------------------------------------- */

function subcategoryBreakdown(citySlug, category) {
  return category.subcategories
    .map((sub) => ({
      sub,
      count: queryListings({
        city: citySlug,
        category: category.slug,
        subcategory: sub.slug,
        perPage: 1,
      }).total,
      stats: priceStatsForSub(citySlug, category.slug, sub.slug),
    }))
    .sort((a, b) => b.count - a.count || a.sub.name.localeCompare(b.sub.name));
}

/**
 * `getPriceStats` scopes to category+city; the subcategory cut is narrow enough
 * that it is cheaper to compute here than to widen the data module's API.
 */
function priceStatsForSub(citySlug, categorySlug, subSlug) {
  const prices = getListings()
    .filter(
      (listing) =>
        listing.citySlug === citySlug &&
        listing.categorySlug === categorySlug &&
        listing.subcategorySlug === subSlug &&
        listing.price > 0,
    )
    .map((listing) => listing.price)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;
  const at = (fraction) => prices[Math.min(prices.length - 1, Math.floor(prices.length * fraction))];
  return {
    count: prices.length,
    min: prices[0],
    max: prices[prices.length - 1],
    median: at(0.5),
    p25: at(0.25),
    p75: at(0.75),
  };
}

/** Same category, other cities — ranked by how much stock they hold. */
function sameCategoryElsewhere(categorySlug, citySlug, limit = 14) {
  return getAllCities()
    .filter((entry) => entry.slug !== citySlug)
    .map((entry) => ({
      city: entry,
      count: queryListings({ city: entry.slug, category: categorySlug, perPage: 1 }).total,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.city.name.localeCompare(b.city.name))
    .slice(0, limit);
}

/** Other categories in the same city. */
function otherCategoriesHere(citySlug, excludeSlug, limit = 12) {
  return getAllCategories()
    .filter((category) => category.slug !== excludeSlug)
    .map((category) => ({
      category,
      count: queryListings({ city: citySlug, category: category.slug, perPage: 1 }).total,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.category.name.localeCompare(b.category.name))
    .slice(0, limit);
}

function buildFaqs({ city, category, total, stats, subs, elsewhere }) {
  const topSubs = subs.filter((row) => row.count > 0).slice(0, 3);
  const faqs = [
    {
      question: `How many ${category.name} ads are there in ${city.name}?`,
      answer: `${total} ${category.name} ad${total === 1 ? "" : "s"} are live in ${city.name} right now${
        topSubs.length > 0
          ? `, led by ${topSubs.map((row) => `${row.sub.name} (${row.count})`).join(", ")}`
          : ""
      }. The number is counted from the ads on this page, so it moves as sellers post and close listings.`,
    },
  ];

  if (stats) {
    faqs.push({
      question: `What is the going rate for ${category.name.toLowerCase()} in ${city.name}?`,
      answer: `The median asking price across ${stats.count} priced ${category.name} ads in ${city.name} is ${formatPrice(stats.median)}. Half of the ads fall between ${formatPrice(stats.p25)} and ${formatPrice(stats.p75)}; the cheapest is ${formatPrice(stats.min)} and the dearest ${formatPrice(stats.max)}. Asking prices are a starting point — most sellers on Bazaar mark their ad negotiable.`,
    });
  }

  if (elsewhere.length > 0) {
    faqs.push({
      question: `Where else can I find ${category.name.toLowerCase()} nearby?`,
      answer: `${elsewhere
        .slice(0, 4)
        .map((row) => `${row.city.name} (${row.count} ads)`)
        .join(", ")} all carry ${category.name} stock. If nothing in ${city.name} fits, widening to the nearest metro usually doubles the choice — just factor in the trip before you agree a price.`,
    });
  }

  faqs.push({
    question: `How do I check a ${category.name.toLowerCase()} ad in ${city.name} is genuine?`,
    answer: `Meet at the item, not at a landmark. Ask for the original bill or papers, match them against the item in front of you, and pay only once you have it in hand. Bazaar verifies a seller's phone and email but does not verify ownership, condition or documents — the safety guide lists the checks that catch the common scams.`,
  });

  return faqs;
}

/* ------------------------------------------------------------------
 * Metadata
 * ---------------------------------------------------------------- */

export async function generateMetadata({ params }) {
  const { city: citySlug, category: categorySlug } = await params;
  const city = getCity(citySlug);
  const category = getCategory(categorySlug);

  if (!city || !category) {
    return { title: "Not found | AltF Bazaar", robots: { index: false, follow: true } };
  }

  const path = `/bazaar/in/${city.slug}/${category.slug}`;
  const total = queryListings({ city: city.slug, category: category.slug, perPage: 1 }).total;

  // A zero-result page has nothing to offer a searcher, so it is deliberately
  // kept out of the index while still being crawlable for its outbound links.
  if (total === 0) {
    return createPageMetadata({
      title: `${category.name} in ${city.name} — no ads listed yet`,
      description: `No ${category.name} ads are listed in ${city.name} on AltF Bazaar at the moment. See ${category.name} in nearby cities, or the categories that do have stock in ${city.name}.`,
      path,
      noindex: true,
    });
  }

  const stats = getPriceStats(category.slug, city.slug);

  return createPageMetadata({
    title: `${category.name} in ${city.name} — ${total} Ads${stats ? `, Median ${formatPrice(stats.median)}` : ""}`,
    description: `${total} ${category.name} ads in ${city.name}${city.stateName ? `, ${city.stateName}` : ""}.${
      stats
        ? ` Median asking price ${formatPrice(stats.median)}, typical range ${formatPrice(stats.p25)} to ${formatPrice(stats.p75)}.`
        : ""
    } Compare by locality and contact sellers directly.`,
    path,
    keywords: [
      `${category.name} in ${city.name}`,
      `used ${category.name.toLowerCase()} ${city.name}`,
      `${category.name.toLowerCase()} price in ${city.name}`,
      `second hand ${category.name.toLowerCase()} ${city.name}`,
    ],
  });
}

/* ------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------- */

export default async function BazaarCityCategoryPage({ params }) {
  const { city: citySlug, category: categorySlug } = await params;
  const city = getCity(citySlug);
  const category = getCategory(categorySlug);

  if (!city || !category) notFound();

  const path = `/bazaar/in/${city.slug}/${category.slug}`;
  const results = queryListings({ city: city.slug, category: category.slug, perPage: 24 });
  const total = results.total;
  const stats = getPriceStats(category.slug, city.slug);
  const elsewhere = sameCategoryElsewhere(category.slug, city.slug);
  const otherHere = otherCategoriesHere(city.slug, category.slug);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Cities", path: "/bazaar/cities" },
    { name: city.name, path: `/bazaar/in/${city.slug}` },
    { name: category.name, path },
  ];

  if (total === 0) {
    return (
      <BazaarShell>
        <JsonLd
          id={`bazaar-city-category-${city.slug}-${category.slug}`}
          data={[createBreadcrumbJsonLd(crumbs)]}
        />
        <div className="section-container px-4 pb-16 sm:px-6">
          <Breadcrumbs items={crumbs} />

          <header className="max-w-2xl pt-2">
            <h1 className="bzr-section-title text-2xl sm:text-3xl">
              {category.name} in {city.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
              Nobody has listed {category.name} in {city.name} yet. Rather than fill this page with
              ads from somewhere else and call them local, here is where the stock actually is.
            </p>
          </header>

          <EmptyState
            title={`No ${category.name} ads in ${city.name}`}
            message="This combination is empty today. Post the first one, or use the links below."
            action={
              <Link href="/bazaar/post" className="bzr-btn">
                Post the first ad
              </Link>
            }
          />

          <section className="bzr-section grid gap-6 sm:grid-cols-2">
            <LinkCloud
              title={`${category.name} in other cities`}
              links={elsewhere.map((row) => ({
                href: `/bazaar/in/${row.city.slug}/${category.slug}`,
                label: `${row.city.name} (${row.count})`,
              }))}
            />
            <LinkCloud
              title={`What is selling in ${city.name}`}
              links={[
                ...otherHere.map((row) => ({
                  href: `/bazaar/in/${city.slug}/${row.category.slug}`,
                  label: `${row.category.name} (${row.count})`,
                })),
                { href: `/bazaar/in/${city.slug}`, label: `All ads in ${city.name}` },
                { href: `/bazaar/c/${category.slug}`, label: `${category.name} across India` },
              ]}
            />
          </section>
        </div>
      </BazaarShell>
    );
  }

  const subs = subcategoryBreakdown(city.slug, category);
  const activeSubs = subs.filter((row) => row.count > 0);
  const emptySubs = subs.filter((row) => row.count === 0);
  const faqs = buildFaqs({ city, category, total, stats, subs, elsewhere });

  const intro = `${total} ${category.name} ad${total === 1 ? "" : "s"} are live in ${
    city.stateName ? `${city.name}, ${city.stateName}` : city.name
  }, covering ${activeSubs.length} of the ${category.subcategories.length} ${category.name} subcategories. ${
    stats
      ? `The median ask is ${formatPrice(stats.median)}, with most ads between ${formatPrice(stats.p25)} and ${formatPrice(stats.p75)}.`
      : "Ads in this category are listed without a price."
  } ${category.description}`;

  return (
    <BazaarShell>
      <JsonLd
        id={`bazaar-city-category-${city.slug}-${category.slug}`}
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path,
            name: `${category.name} in ${city.name}`,
            description: `${total} ${category.name} ads listed in ${city.name} on AltF Bazaar.`,
          }),
          createFaqJsonLd({ path, questions: faqs }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">
            {category.name} in {city.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">{intro}</p>

          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={Tag} label="Live ads" value={total.toLocaleString("en-IN")} />
            <Stat
              icon={Layers}
              label="Subcategories with stock"
              value={`${activeSubs.length} / ${category.subcategories.length}`}
            />
            <Stat
              icon={IndianRupee}
              label="Median ask"
              value={stats ? formatPrice(stats.median) : "Not priced"}
            />
            <Stat
              icon={Coins}
              label="Typical range"
              value={stats ? `${formatPrice(stats.p25)} – ${formatPrice(stats.p75)}` : "—"}
            />
          </dl>
        </header>

        <section className="bzr-section" aria-label={`${category.name} ads in ${city.name}`}>
          <SectionHead
            title={`${total} ${category.name} ads in ${city.name}`}
            href={`/bazaar/search?city=${city.slug}&category=${category.slug}`}
            linkLabel="Filter and sort"
          />
          <p className="mb-3 text-sm text-(--muted-foreground)">
            Showing the first {results.items.length}. Promoted ads appear first and carry a badge
            saying so.
          </p>
          <div className="bzr-grid">
            {results.items.map((listing, index) => (
              <AdCard key={listing.id} listing={listing} priority={index < 4} />
            ))}
          </div>
        </section>

        {activeSubs.length > 0 ? (
          <section
            className="bzr-section"
            aria-label={`${category.name} subcategories in ${city.name}`}
          >
            <SectionHead
              title={`${category.name} by type in ${city.name}`}
              href={`/bazaar/c/${category.slug}`}
              linkLabel={`${category.name} across India`}
            />
            <div className="flex flex-wrap gap-2">
              {activeSubs.map((row) => (
                <Link
                  key={row.sub.slug}
                  href={`/bazaar/search?city=${city.slug}&category=${category.slug}&subcategory=${row.sub.slug}`}
                  className="bzr-chip"
                >
                  {row.sub.name}
                  <span className="ms-1.5 text-xs opacity-70">{row.count}</span>
                </Link>
              ))}
            </div>

            {activeSubs.some((row) => row.stats) ? (
              <div className="mt-5">
                <PriceGuideTable
                  caption={`Asking prices by ${category.name} subcategory in ${city.name}`}
                  columnLabel="Subcategory"
                  rows={activeSubs.map((row) => ({
                    key: row.sub.slug,
                    label: row.sub.name,
                    href: `/bazaar/search?city=${city.slug}&category=${category.slug}&subcategory=${row.sub.slug}`,
                    stats: row.stats,
                  }))}
                />
              </div>
            ) : null}

            {emptySubs.length > 0 ? (
              <div className="mt-6">
                <LinkCloud
                  title={`Not listed in ${city.name} yet`}
                  links={emptySubs.map((row) => ({
                    href: `/bazaar/c/${category.slug}/${row.sub.slug}`,
                    label: row.sub.name,
                  }))}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        <GeoFaq
          title={`${category.name} in ${city.name} — common questions`}
          items={faqs}
          headingId="pair-faq"
        />

        <Note icon={ShieldCheck}>
          Inspect before you pay and never transfer money to hold an item you have not seen. The{" "}
          <Link href="/bazaar/safety">safety guide</Link> covers the scams that show up most in this
          category.
        </Note>

        <section className="bzr-section grid gap-6 sm:grid-cols-2">
          <LinkCloud
            title={`${category.name} in other cities`}
            links={elsewhere.map((row) => ({
              href: `/bazaar/in/${row.city.slug}/${category.slug}`,
              label: `${row.city.name} (${row.count})`,
            }))}
          />
          <LinkCloud
            title={`More in ${city.name}`}
            links={[
              ...otherHere.map((row) => ({
                href: `/bazaar/in/${city.slug}/${row.category.slug}`,
                label: `${row.category.name} (${row.count})`,
              })),
              { href: `/bazaar/in/${city.slug}`, label: `All ads in ${city.name}` },
              {
                href: `/bazaar/price-guide/${category.slug}`,
                label: `${category.name} price guide`,
              },
            ]}
          />
        </section>
      </div>
    </BazaarShell>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-bold text-(--foreground) sm:text-base">{value}</dd>
    </div>
  );
}
