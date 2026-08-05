import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Layers, MapPin, ShieldCheck, Tag } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
} from "@/platform/seo/generateMetadata";
import { createGeoPageMetadata } from "@/platform/seo/geoEntities";
import { getGeoChain, getGeoLocation } from "@/platform/seo/geoLocations";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import "../../bazaar.css";
import AdCard from "../../components/AdCard";
import BazaarShell from "../../components/BazaarShell";
import GeoFaq from "../../components/GeoFaq";
import MapPanel from "../../components/MapPanel";
import PriceGuideTable from "../../components/PriceGuideTable";
import { getCategoryIcon } from "../../components/categoryIcons";
import { Breadcrumbs, EmptyState, LinkCloud, Note, SectionHead } from "../../components/primitives";
import { getAllCategories } from "../../data/categories";
import { getAllCities, getCity, getCitySlugs, getPopularCities } from "../../data/cities";
import {
  formatPrice,
  getCityCounts,
  getPriceStats,
  queryListings,
  SORTS,
} from "../../data/listings";

/**
 * /bazaar/in/[city] — the city directory.
 *
 * ANTI-DOORWAY CONTRACT (same rule `/locations/[geo]` carries): this must be a
 * real directory surface, not a template with the city name swapped in. So
 * every number on the page is computed from the ads that actually exist in
 * this city — the category breakdown, the locality counts, the price snapshot,
 * even the FAQ answers. Shimla has ads in 3 of 24 categories and the page says
 * exactly that, with links onward to the national category pages, rather than
 * implying inventory that is not there.
 *
 * A GEO city Bazaar does not serve (London, Dubai) is NOT a 404 — it is a real
 * place, so it gets an honest "not live here yet" surface, marked noindex.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

/** 50 city pages — small enough to prerender in full. */
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getCitySlugs().map((city) => ({ city }));
}

/* ------------------------------------------------------------------
 * Derivations — all of them read the live corpus, none of them guess.
 * ---------------------------------------------------------------- */

/** Every category with its count IN THIS CITY, busiest first. */
function categoryBreakdown(citySlug) {
  return getAllCategories()
    .map((category) => ({
      category,
      count: queryListings({ city: citySlug, category: category.slug, perPage: 1 }).total,
    }))
    .sort((a, b) => b.count - a.count || a.category.name.localeCompare(b.category.name));
}

/** Localities of this city that actually carry ads, busiest first. */
function localityBreakdown(city) {
  return city.localities
    .map((locality) => ({
      locality,
      count: queryListings({ city: city.slug, locality, perPage: 1 }).total,
    }))
    .sort((a, b) => b.count - a.count || a.locality.localeCompare(b.locality));
}

/** Bazaar cities sharing this city's state, then the rest by demand. */
function nearbyCities(city) {
  const sameState = getAllCities().filter(
    (entry) => entry.slug !== city.slug && city.stateSlug && entry.stateSlug === city.stateSlug,
  );
  const rest = getPopularCities(14).filter(
    (entry) => entry.slug !== city.slug && !sameState.some((s) => s.slug === entry.slug),
  );
  return [...sameState, ...rest].slice(0, 12);
}

function listPhrase(values) {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function buildFaqs(city, { total, present, localities, cityCounts }) {
  const top = present.slice(0, 3);
  const topNames = listPhrase(top.map((row) => `${row.category.name} (${row.count})`));
  const busiest = top[0];
  const busiestStats = busiest ? getPriceStats(busiest.category.slug, city.slug) : null;
  const activeLocalities = localities.filter((row) => row.count > 0);
  const emptyCategories = 24 - present.length;
  const where = city.stateName ? `${city.name}, ${city.stateName}` : city.name;
  const nationalRank =
    [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).findIndex(([slug]) => slug === city.slug) +
    1;

  const faqs = [
    {
      question: `How many ads are live in ${city.name} on AltF Bazaar?`,
      answer: `${total} ads are currently posted in ${where}, spread across ${present.length} of Bazaar's 24 categories. That makes ${city.name} the ${nationalRank}${ordinalSuffix(nationalRank)} busiest of the 50 cities Bazaar covers. The count on this page updates with the listings themselves — it is not a marketing figure.`,
    },
    {
      question: `Which categories are busiest in ${city.name}?`,
      answer: topNames
        ? `Right now the busiest categories in ${city.name} are ${topNames}. ${
            emptyCategories > 0
              ? `${emptyCategories} of the 24 categories have no ads in ${city.name} yet — those are listed on this page as empty rather than shown as if they had stock.`
              : `All 24 categories have at least one ad in ${city.name}.`
          }`
        : `No category has ads in ${city.name} yet.`,
    },
  ];

  if (activeLocalities.length > 0) {
    const localityNames = listPhrase(
      activeLocalities.slice(0, 3).map((row) => `${row.locality} (${row.count})`),
    );
    faqs.push({
      question: `Which areas of ${city.name} have the most listings?`,
      answer: `${localityNames} carry the most ads at the moment. Bazaar tracks ${city.localities.length} localities in ${city.name}; use the locality row on this page to filter down to the neighbourhood you can actually travel to, which matters more than price when you are collecting a sofa or viewing a flat.`,
    });
  }

  if (busiest && busiestStats) {
    faqs.push({
      question: `What do ${busiest.category.name.toLowerCase()} ads cost in ${city.name}?`,
      answer: `Across ${busiestStats.count} priced ${busiest.category.name} ads in ${city.name} the median asking price is ${formatPrice(busiestStats.median)}, with half of all ads between ${formatPrice(busiestStats.p25)} and ${formatPrice(busiestStats.p75)}. These are asking prices on Bazaar, not confirmed sale prices — sellers routinely accept less, and the ${city.name} price guide breaks the same numbers down by subcategory.`,
    });
  }

  faqs.push(
    {
      question: `Is it free to post an ad in ${city.name}?`,
      answer: `Yes. Posting a standard ad in ${city.name} is free and needs no subscription. Paid promotion (featured placement and spotlight slots) is optional, and promoted ads are labelled as such wherever they appear, so a paid ad never quietly outranks a free one without saying so.`,
    },
    {
      question: `Does AltF Bazaar verify sellers in ${city.name}?`,
      answer: `Only partly, and it is worth being precise about it. Bazaar verifies a seller's phone number and email address, and shows badges for both. It does not verify identity documents, ownership of the item, vehicle papers, or property titles anywhere — including ${city.name}. Treat every ad as unverified until you have inspected the item in person; the safety guide explains the checks that matter.`,
    },
  );

  return faqs;
}

function ordinalSuffix(value) {
  if (value % 100 >= 11 && value % 100 <= 13) return "th";
  if (value % 10 === 1) return "st";
  if (value % 10 === 2) return "nd";
  if (value % 10 === 3) return "rd";
  return "th";
}

/* ------------------------------------------------------------------
 * Metadata
 * ---------------------------------------------------------------- */

export async function generateMetadata({ params }) {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);
  const geo = getGeoLocation(citySlug);

  if (!city && (!geo || geo.type !== "City")) {
    return { title: "Not found | AltF Bazaar", robots: { index: false, follow: true } };
  }

  const path = `/bazaar/in/${citySlug}`;

  // Served-city metadata rides on the shared GEO generator so the Bazaar page
  // and /locations/<slug> describe the same entity; the overrides spread last
  // and win, because the default copy is about the tools directory.
  if (!city) {
    return createGeoPageMetadata(citySlug, {
      title: `AltF Bazaar is not live in ${geo.name} yet`,
      description: `AltF Bazaar does not carry classified ads in ${geo.name} yet. See the 50 Indian cities Bazaar currently covers and how much inventory each one has.`,
      path,
      // A page with no inventory has nothing to offer a searcher.
      noindex: true,
    });
  }

  const total = getCityCounts().get(city.slug) || 0;
  const present = categoryBreakdown(city.slug).filter((row) => row.count > 0);
  const topNames = present
    .slice(0, 3)
    .map((row) => row.category.name)
    .join(", ");
  const where = city.stateName ? `${city.name}, ${city.stateName}` : city.name;

  return createGeoPageMetadata(citySlug, {
    title: `Buy and Sell in ${city.name} — ${total} Free Classified Ads`,
    description: `${total} live classified ads in ${where}${topNames ? `: ${topNames} and more` : ""}. Browse by locality, compare asking prices and contact sellers directly.`,
    path,
    // createGeoPageMetadata spreads overrides into createPageMetadata, so
    // `image` passes straight through to the openGraph block.
    image: `/bazaar/in/${city.slug}/opengraph-image`,
    imageAlt: `Classified ads in ${city.name} on AltF Bazaar`,
    keywords: [
      `olx ${city.name}`,
      `classifieds ${city.name}`,
      `buy and sell ${city.name}`,
      `used items ${city.name}`,
      `free ads ${city.name}`,
    ],
  });
}

/* ------------------------------------------------------------------
 * Not-served surface
 * ---------------------------------------------------------------- */

function NotLiveYet({ geo }) {
  const chain = getGeoChain(geo.slug);
  const parentSlugs = new Set(chain.slice(1).map((entry) => entry.slug));
  const inRegion = getAllCities().filter((entry) => {
    const entryGeo = getGeoLocation(entry.slug);
    return entryGeo?.containedIn && parentSlugs.has(entryGeo.containedIn);
  });
  const suggestions = (inRegion.length > 0 ? inRegion : getPopularCities(12)).slice(0, 12);
  const cityCounts = getCityCounts();
  const region = chain.length > 1 ? chain[1].name : null;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Cities", path: "/bazaar/cities" },
    { name: geo.name },
  ];

  return (
    <BazaarShell>
      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="max-w-2xl pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">
            AltF Bazaar is not live in {geo.name} yet
          </h1>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            {geo.name} is a real place and this is a real page for it, but Bazaar carries no ads
            here. Rather than show you an empty grid dressed up as a marketplace, here is where
            Bazaar does operate: 50 cities across India, with live inventory in every one of them.
          </p>
        </header>

        <Note icon={MapPin}>
          Bazaar is currently an India-only marketplace.{" "}
          {region ? `Nothing is listed anywhere in ${region} at the moment.` : ""} If you want to
          sell in {geo.name}, the post flow will only accept one of the served cities below.
        </Note>

        <section className="bzr-section">
          <SectionHead
            title={inRegion.length > 0 ? `Served cities near ${geo.name}` : "Where Bazaar is live"}
            href="/bazaar/cities"
            linkLabel="All 50 cities"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((entry) => (
              <Link
                key={entry.slug}
                href={`/bazaar/in/${entry.slug}`}
                className="flex items-center justify-between gap-3 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--card) px-3 py-2.5 text-sm hover:border-(--primary)"
              >
                <span className="font-medium text-(--foreground)">{entry.name}</span>
                <span className="text-xs text-(--muted-foreground)">
                  {(cityCounts.get(entry.slug) || 0).toLocaleString("en-IN")} ads
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bzr-section">
          <LinkCloud
            title="Browse instead"
            links={[
              { href: "/bazaar", label: "Bazaar home" },
              { href: "/bazaar/categories", label: "All categories" },
              { href: "/bazaar/cities", label: "All cities" },
              { href: "/bazaar/price-guide", label: "Price guides" },
              { href: `/locations/${geo.slug}`, label: `AltFTool tools in ${geo.name}` },
            ]}
          />
        </section>
      </div>
    </BazaarShell>
  );
}

/* ------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------- */

export default async function BazaarCityPage({ params }) {
  const { city: citySlug } = await params;
  const city = getCity(citySlug);

  if (!city) {
    const geo = getGeoLocation(citySlug);
    // A state or country slug is not a city page; a real city Bazaar does not
    // serve gets the honest surface instead of a 404.
    if (!geo || geo.type !== "City") notFound();
    return <NotLiveYet geo={geo} />;
  }

  const path = `/bazaar/in/${city.slug}`;
  const cityCounts = getCityCounts();
  const total = cityCounts.get(city.slug) || 0;

  const breakdown = categoryBreakdown(city.slug);
  const present = breakdown.filter((row) => row.count > 0);
  const absent = breakdown.filter((row) => row.count === 0);

  const localities = localityBreakdown(city);
  const activeLocalities = localities.filter((row) => row.count > 0);

  const recent = queryListings({
    city: city.slug,
    sort: SORTS.RECENT,
    perPage: 24,
  });

  // Price snapshot for the four biggest categories in THIS city. Categories
  // whose ads are all free (Free & Giveaway) return null stats and are simply
  // not in the table — an empty row would imply a price that does not exist.
  const priceRows = present.slice(0, 4).map((row) => ({
    key: row.category.slug,
    label: row.category.name,
    href: `/bazaar/in/${city.slug}/${row.category.slug}`,
    stats: getPriceStats(row.category.slug, city.slug),
  }));

  const faqs = buildFaqs(city, { total, present, localities, cityCounts });
  const nearby = nearbyCities(city);
  const where = city.stateName ? `${city.name}, ${city.stateName}` : city.name;

  const intro = `${where} has ${total} live ads on Bazaar right now, spread across ${present.length} of the 24 categories. ${
    present.length > 0
      ? `The busiest is ${present[0].category.name} with ${present[0].count} ads.`
      : ""
  } ${
    absent.length > 0
      ? `${absent.length} categories have nothing listed here yet, and they are named further down rather than hidden.`
      : "Every category has at least one ad here."
  } Everything below is counted from the ads themselves.`;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Cities", path: "/bazaar/cities" },
    { name: city.name, path },
  ];

  return (
    <BazaarShell>
      {/*
        Breadcrumb JSON-LD is built from the SAME array the visible trail
        renders, not from the geo containment chain: `/bazaar/in/maharashtra`
        is not a route, and a BreadcrumbList that advertises URLs which do not
        resolve is structured data lying about the site.
      */}
      <JsonLd
        id={`bazaar-city-${city.slug}`}
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path,
            name: `Classified ads in ${city.name}`,
            description: `${total} live classified ads in ${where} across ${present.length} categories on AltF Bazaar.`,
          }),
          createFaqJsonLd({ path, questions: faqs }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">Buy and sell in {city.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">{intro}</p>

          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={Tag} label="Live ads" value={total.toLocaleString("en-IN")} />
            <Stat icon={Layers} label="Categories with stock" value={`${present.length} / 24`} />
            <Stat
              icon={MapPin}
              label="Localities tracked"
              value={String(city.localities.length)}
            />
            <Stat
              icon={Building2}
              label="State"
              value={city.stateName || "Union territory"}
            />
          </dl>
        </header>

        {activeLocalities.length > 0 ? (
          <section className="bzr-section" aria-label={`Areas of ${city.name}`}>
            <SectionHead
              title={`Areas of ${city.name}`}
              href={`/bazaar/search?city=${city.slug}`}
              linkLabel="Search this city"
            />
            <div className="flex flex-wrap gap-2">
              {activeLocalities.map((row) => (
                <Link
                  key={row.locality}
                  href={`/bazaar/search?city=${city.slug}&locality=${encodeURIComponent(row.locality)}`}
                  className="bzr-chip"
                >
                  {row.locality}
                  <span className="ms-1.5 text-xs opacity-70">{row.count}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {city.coords ? (
          <section className="bzr-section" aria-label={`Map of ads in ${city.name}`}>
            <SectionHead
              title={`Where the ads are in ${city.name}`}
              href={`/bazaar/map?city=${city.slug}`}
              linkLabel="Open the full map"
            />
            <MapPanel
              height={320}
              center={city.coords}
              zoom={11}
              cities={[{ slug: city.slug, name: city.name, coords: city.coords }]}
              points={queryListings({ city: city.slug, perPage: 60 })
                .items.filter((listing) => listing.coords)
                .map((listing) => ({
                  id: listing.id,
                  slug: listing.slug,
                  title: listing.title,
                  priceLabel: listing.priceLabel,
                  coords: listing.coords,
                  locality: listing.locality,
                  citySlug: listing.citySlug,
                  cityName: listing.cityName,
                  image: listing.images?.[0]?.src || null,
                }))}
            />
            <div className="mt-3">
              <Note icon={MapPin}>
                Pins show approximate areas, not addresses.
              </Note>
            </div>
          </section>
        ) : null}

        <section className="bzr-section" aria-label={`Categories in ${city.name}`}>
          <SectionHead
            title={`What people are selling in ${city.name}`}
            href="/bazaar/categories"
            linkLabel="All categories"
          />

          {present.length === 0 ? (
            <EmptyState
              title={`No ads in ${city.name} yet`}
              message="Nothing is listed in this city at the moment. Post the first ad, or browse a nearby city."
              action={
                <Link href="/bazaar/post" className="bzr-btn">
                  Post an ad
                </Link>
              }
            />
          ) : (
            <div className="bzr-cat-grid">
              {present.map((row) => {
                const Icon = getCategoryIcon(row.category.icon);
                return (
                  <Link
                    key={row.category.slug}
                    href={`/bazaar/in/${city.slug}/${row.category.slug}`}
                    className="bzr-cat-tile"
                  >
                    <span className="bzr-cat-icon">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="bzr-cat-name">{row.category.name}</span>
                    <span className="bzr-cat-count">
                      {row.count} ad{row.count === 1 ? "" : "s"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {absent.length > 0 ? (
            <div className="mt-6">
              <LinkCloud
                title={`Nothing listed in ${city.name} yet — browse these nationally`}
                links={absent.map((row) => ({
                  href: `/bazaar/c/${row.category.slug}`,
                  label: row.category.name,
                }))}
              />
            </div>
          ) : null}
        </section>

        {priceRows.some((row) => row.stats) ? (
          <section className="bzr-section" aria-label={`Price snapshot for ${city.name}`}>
            <SectionHead
              title={`Price snapshot for ${city.name}`}
              href="/bazaar/price-guide"
              linkLabel="All price guides"
            />
            <p className="mb-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
              Asking prices from the busiest categories in {city.name}, taken from the ads live on
              Bazaar today. These are what sellers are asking, not what buyers paid.
            </p>
            <PriceGuideTable
              caption={`Asking price statistics by category in ${city.name}`}
              columnLabel="Category"
              rows={priceRows}
            />
          </section>
        ) : null}

        <section className="bzr-section" aria-label={`Latest ads in ${city.name}`}>
          <SectionHead
            title={`Latest ads in ${city.name}`}
            href={`/bazaar/search?city=${city.slug}`}
            linkLabel={`See all ${total}`}
          />

          {recent.items.length === 0 ? (
            <EmptyState
              title={`No ads in ${city.name} yet`}
              message="Be the first to list something here."
              action={
                <Link href="/bazaar/post" className="bzr-btn">
                  Post an ad
                </Link>
              }
            />
          ) : (
            <div className="bzr-grid">
              {recent.items.map((listing, index) => (
                <AdCard key={listing.id} listing={listing} priority={index < 4} />
              ))}
            </div>
          )}
        </section>

        <GeoFaq
          title={`${city.name} — questions people actually ask`}
          items={faqs}
          headingId="city-faq"
        />

        <Note icon={ShieldCheck}>
          Meet in a public place, inspect before you pay, and never send an advance to hold an item.
          Read the <Link href="/bazaar/safety">Bazaar safety guide</Link> before your first deal in{" "}
          {city.name}.
        </Note>

        <section className="bzr-section grid gap-6 sm:grid-cols-2">
          <LinkCloud
            title={
              city.stateName ? `Other cities in ${city.stateName} and nearby` : "Other Bazaar cities"
            }
            links={nearby.map((entry) => ({
              href: `/bazaar/in/${entry.slug}`,
              label: `${entry.name} (${cityCounts.get(entry.slug) || 0})`,
            }))}
          />
          <LinkCloud
            title={`Popular searches in ${city.name}`}
            links={[
              ...present.slice(0, 8).map((row) => ({
                href: `/bazaar/in/${city.slug}/${row.category.slug}`,
                label: `${row.category.name} in ${city.name}`,
              })),
              { href: "/bazaar/price-guide", label: "Price guides" },
              { href: `/locations/${city.slug}`, label: `AltFTool tools in ${city.name}` },
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
      <dd className="mt-1 text-base font-bold text-(--foreground)">{value}</dd>
    </div>
  );
}
