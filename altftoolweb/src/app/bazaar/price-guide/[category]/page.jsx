import { notFound } from "next/navigation";
import { Coins, IndianRupee, Info, Layers, Tag } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import "../../bazaar.css";
import BazaarShell from "../../components/BazaarShell";
import GeoFaq from "../../components/GeoFaq";
import PriceGuideTable from "../../components/PriceGuideTable";
import { Breadcrumbs, LinkCloud, Note, SectionHead } from "../../components/primitives";
import { getAllCategories, getCategory, getCategorySlugs } from "../../data/categories";
import { getAllCities } from "../../data/cities";
import {
  formatPrice,
  getCategoryCounts,
  getListings,
  getPriceStats,
  getSubcategoryCounts,
} from "../../data/listings";

/**
 * /bazaar/price-guide/[category] — asking-price statistics for one category.
 *
 * Two cuts of the same corpus: by city (which is the cut people search for)
 * and by subcategory (which is the cut that actually explains the spread — a
 * "Mobiles" median means little when it mixes ₹2,000 accessories with ₹90,000
 * flagships). Both are honest about sample size, and neither claims to know
 * what anything sold for.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

/** 24 guides — cheap enough to prerender all of them. */
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getCategorySlugs().map((category) => ({ category }));
}

/**
 * Some categories do not quote a "price" in the plain sense. Saying so beats
 * letting someone compare a monthly salary against a car.
 */
const PRICE_MEANING = {
  jobs: "In Jobs the figure is the salary an employer quotes, and the period — monthly, weekly or daily — is set per ad, so two numbers here are not always comparable.",
  rentals:
    "In Rent Anything the figure is a hire charge for a period (per day, per week, per month), not a purchase price.",
  properties:
    "Properties mixes outright sale prices with monthly rents and PG charges in a single category, which is why the overall range is so wide. The subcategory table is the comparison worth trusting.",
};

/** Percentile stats for one subcategory across every city. */
function subcategoryStats(categorySlug, subSlug) {
  const prices = getListings()
    .filter(
      (listing) =>
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

function cityRows(categorySlug) {
  return getAllCities()
    .map((city) => ({
      key: city.slug,
      label: city.name,
      href: `/bazaar/in/${city.slug}/${categorySlug}`,
      stats: getPriceStats(categorySlug, city.slug),
    }))
    .filter((row) => row.stats)
    .sort((a, b) => b.stats.median - a.stats.median);
}

function subRows(category) {
  return category.subcategories
    .map((sub) => ({
      key: sub.slug,
      label: sub.name,
      href: `/bazaar/c/${category.slug}/${sub.slug}`,
      stats: subcategoryStats(category.slug, sub.slug),
    }))
    .filter((row) => row.stats)
    .sort((a, b) => b.stats.median - a.stats.median);
}

function buildFaqs(category, stats, cities, subs) {
  const dearest = cities[0];
  const cheapest = cities[cities.length - 1];

  const faqs = [
    {
      question: `What is the average price of ${category.name.toLowerCase()} on Bazaar?`,
      answer: stats
        ? `Across ${stats.count} priced ${category.name} ads the median asking price is ${formatPrice(stats.median)}. Half of all ads sit between ${formatPrice(stats.p25)} and ${formatPrice(stats.p75)}, and the full spread runs from ${formatPrice(stats.min)} to ${formatPrice(stats.max)}. The median is quoted rather than the mean because a handful of very expensive listings would otherwise pull the figure well above what most ads ask.`
        : `${category.name} ads on Bazaar do not quote a price above zero, so there is no meaningful average to report for this category.`,
    },
    {
      question: `Do ${category.name.toLowerCase()} prices vary between cities?`,
      answer:
        dearest && cheapest && dearest.key !== cheapest.key
          ? `Yes. ${dearest.label} currently carries the highest median ask at ${formatPrice(dearest.stats.median)}, while ${cheapest.label} is the lowest at ${formatPrice(cheapest.stats.median)}. Some of that gap is genuine local demand and some of it is simply which items happen to be listed this week, so compare the sample sizes in the table before reading too much into a difference.`
          : `There is not enough city-level data in this category yet to compare markets fairly.`,
    },
    {
      question: `Is the guide price what I should pay for ${category.name.toLowerCase()}?`,
      answer: `No. Every number here is what a seller is asking, taken from live ads. Bazaar never sees the final handshake, so it cannot report sale prices. Most ads are marked negotiable; use the median as the top of a sensible range, inspect the item, and price the condition you actually find.`,
    },
  ];

  if (subs.length > 1) {
    const top = subs[0];
    const bottom = subs[subs.length - 1];
    faqs.push({
      question: `Which ${category.name.toLowerCase()} listings are most expensive?`,
      answer: `${top.label} has the highest median at ${formatPrice(top.stats.median)}, against ${formatPrice(bottom.stats.median)} for ${bottom.label}. That spread is why a single category-wide average is close to useless here — always compare within the subcategory you are actually buying.`,
    });
  }

  faqs.push({
    question: `How current are these ${category.name.toLowerCase()} prices?`,
    answer: `They are recalculated from the live corpus every time this page rebuilds, at least once a day. Nothing on the page is hand-written, so it cannot go stale while the listings underneath it move.`,
  });

  return faqs;
}

export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) {
    return { title: "Not found | AltF Bazaar", robots: { index: false, follow: true } };
  }

  const path = `/bazaar/price-guide/${category.slug}`;
  const stats = getPriceStats(category.slug);

  return createPageMetadata({
    title: stats
      ? `${category.name} Price Guide — Median ${formatPrice(stats.median)} in India`
      : `${category.name} Price Guide — What Listings Ask`,
    description: stats
      ? `${category.name} asking prices from ${stats.count} live ads: median ${formatPrice(stats.median)}, typical range ${formatPrice(stats.p25)} to ${formatPrice(stats.p75)}. Broken down by city and subcategory.`
      : `What ${category.name} listings ask on AltF Bazaar, broken down by city and subcategory.`,
    path,
    keywords: [
      `${category.name.toLowerCase()} price india`,
      `used ${category.name.toLowerCase()} price`,
      `${category.name.toLowerCase()} resale value`,
      `second hand ${category.name.toLowerCase()} rate`,
    ],
  });
}

export default async function BazaarCategoryPriceGuidePage({ params }) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) notFound();

  const path = `/bazaar/price-guide/${category.slug}`;
  const stats = getPriceStats(category.slug);
  const totalAds = getCategoryCounts().get(category.slug) || 0;
  const cities = cityRows(category.slug);
  const subs = subRows(category);
  const subCounts = getSubcategoryCounts(category.slug);
  const faqs = buildFaqs(category, stats, cities, subs);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Price guides", path: "/bazaar/price-guide" },
    { name: category.name, path },
  ];

  const otherGuides = getAllCategories()
    .filter((entry) => entry.slug !== category.slug)
    .slice(0, 14);

  return (
    <BazaarShell>
      <JsonLd
        id={`bazaar-price-guide-${category.slug}`}
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path,
            name: `${category.name} price guide`,
            description: `Asking-price statistics for ${category.name} on AltF Bazaar, by city and subcategory.`,
          }),
          createFaqJsonLd({ path, questions: faqs }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">{category.name} price guide</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
            {stats
              ? `Every priced ${category.name} ad on Bazaar, summarised. ${stats.count} of the ${totalAds} live ads in this category quote a price, and this page reports what those sellers are asking — by city, and by the type of ${category.name.toLowerCase()} being sold.`
              : `${category.name} ads on Bazaar are listed without a price, so there is no rate to report. This page exists to say that plainly rather than leave you searching for a number that does not exist.`}
          </p>

          {stats ? (
            <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat icon={IndianRupee} label="Median ask" value={formatPrice(stats.median)} />
              <Stat
                icon={Coins}
                label="Typical range"
                value={`${formatPrice(stats.p25)} – ${formatPrice(stats.p75)}`}
              />
              <Stat
                icon={Tag}
                label="Cheapest / dearest"
                value={`${formatPrice(stats.min)} – ${formatPrice(stats.max)}`}
              />
              <Stat icon={Layers} label="Priced ads counted" value={String(stats.count)} />
            </dl>
          ) : null}
        </header>

        <Note icon={Info}>
          These are asking prices on live Bazaar listings, not transaction prices. Bazaar has no
          visibility of the final agreed amount, and most ads are marked negotiable, so real sale
          prices usually land below the medians shown here.
          {PRICE_MEANING[category.slug] ? ` ${PRICE_MEANING[category.slug]}` : ""}
        </Note>

        {cities.length > 0 ? (
          <section className="bzr-section" aria-label={`${category.name} prices by city`}>
            <SectionHead
              title={`${category.name} prices by city`}
              href="/bazaar/cities"
              linkLabel="All cities"
            />
            <p className="mb-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
              {cities.length} of the 50 Bazaar cities currently have priced {category.name} ads.
              Cities with none are not listed — an empty row implying a market that does not exist
              is worse than no row. Sorted by median ask, highest first.
            </p>
            <PriceGuideTable
              caption={`${category.name} asking prices by city`}
              columnLabel="City"
              rows={cities}
            />
          </section>
        ) : null}

        {subs.length > 0 ? (
          <section className="bzr-section" aria-label={`${category.name} prices by subcategory`}>
            <SectionHead
              title={`${category.name} prices by type`}
              href={`/bazaar/c/${category.slug}`}
              linkLabel={`Browse ${category.name}`}
            />
            <p className="mb-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
              A category-wide median hides a lot. This is the same statistic computed inside each of
              the {category.subcategories.length} {category.name} subcategories, which is the
              comparison worth making before you judge an individual ad.
            </p>
            <PriceGuideTable
              caption={`${category.name} asking prices by subcategory`}
              columnLabel="Subcategory"
              rows={subs}
            />
          </section>
        ) : null}

        {!stats ? (
          <section className="bzr-section" aria-label={`${category.name} listings`}>
            <SectionHead
              title={`What is actually listed in ${category.name}`}
              href={`/bazaar/c/${category.slug}`}
              linkLabel={`Browse ${category.name}`}
            />
            <p className="mb-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
              Every ad in this category is listed at zero rupees, so there is no distribution to
              report and no guide number to quote. What there is: {totalAds} live ads, split by type
              below.
            </p>
            <LinkCloud
              title="By type"
              links={subCounts
                .filter((row) => row.count > 0)
                .map((row) => ({
                  href: `/bazaar/c/${category.slug}/${row.slug}`,
                  label: `${row.name} (${row.count})`,
                }))}
            />
          </section>
        ) : null}

        {subCounts.some((row) => row.count === 0) ? (
          <section className="bzr-section" aria-label="Subcategories with no listings">
            <LinkCloud
              title="No ads listed yet in these types"
              links={subCounts
                .filter((row) => row.count === 0)
                .map((row) => ({
                  href: `/bazaar/c/${category.slug}/${row.slug}`,
                  label: row.name,
                }))}
            />
          </section>
        ) : null}

        <GeoFaq
          title={`${category.name} prices — what people ask`}
          items={faqs}
          headingId="guide-faq"
        />

        <section className="bzr-section grid gap-6 sm:grid-cols-2">
          <LinkCloud
            title="Other price guides"
            links={otherGuides.map((entry) => ({
              href: `/bazaar/price-guide/${entry.slug}`,
              label: entry.name,
            }))}
          />
          <LinkCloud
            title={`${category.name} city by city`}
            links={[
              ...cities.slice(0, 10).map((row) => ({
                href: row.href,
                label: `${category.name} in ${row.label}`,
              })),
              { href: "/bazaar/price-guide", label: "All price guides" },
              { href: "/bazaar/help", label: "Help centre" },
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
