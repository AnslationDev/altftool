import { notFound } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import "../../bazaar.css";

import AdCard from "../../components/AdCard";
import AdFreshness from "../../components/AdFreshness";
import BazaarShell from "../../components/BazaarShell";
import PriceInsight from "../../components/PriceInsight";
import ItemActions from "../../components/ItemActions";
import ItemGallery from "../../components/ItemGallery";
import MapPanel from "../../components/MapPanel";
import RecentlyViewed from "../../components/RecentlyViewed";
import SafetyTips from "../../components/SafetyTips";
import TrackListingView from "../../components/TrackListingView";
import SellerPanel from "../../components/SellerPanel";
import { Breadcrumbs, SectionHead } from "../../components/primitives";
import { T } from "../../i18n/T";
import {
  buildListingCrumbs,
  createListingProductJsonLd,
  describeListing,
} from "../../data/bazaarSchema";
import { getCategoryAttribute } from "../../data/categories";
import {
  formatPosted,
  getFeaturedListings,
  getFreshListings,
  getListing,
  getSimilarListings,
} from "../../data/listings";
import { getMarket } from "../../data/market";
import { getSeller } from "../../data/sellers";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * 720 detail pages is a lot of build time for a set of pages that individually
 * see very little traffic. Prerender the subset that is actually linked from
 * somewhere — promoted ads first, then the freshest — and let the long tail
 * render on demand and settle into the ISR cache under `revalidate: 3600`.
 *
 * The order is deterministic (both helpers sort the frozen corpus), so a
 * rebuild prerenders exactly the same 200 slugs.
 */
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];

  const PRERENDER_LIMIT = 200;
  const slugs = [];
  const seen = new Set();

  for (const listing of [...getFeaturedListings(PRERENDER_LIMIT), ...getFreshListings(400)]) {
    if (seen.has(listing.slug)) continue;
    seen.add(listing.slug);
    slugs.push(listing.slug);
    if (slugs.length >= PRERENDER_LIMIT) break;
  }

  return slugs.map((slug) => ({ slug }));
}

/* ------------------------------------------------------------------
 * Formatting helpers
 * ---------------------------------------------------------------- */

/** Last-resort label when a listing carries a key the taxonomy never declared. */
function humanizeKey(key) {
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatAttributeValue(value, attribute) {
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") {
    // A model year is a label, not a quantity — "2,018" would be nonsense.
    if (attribute?.key === "year") return String(value);

    const market = getMarket();
    const formatted = value.toLocaleString(market.numberLocale);
    if (!attribute?.unit) return formatted;
    // The currency is the one unit that may lead rather than trail; which
    // side it takes is the market's `currencyDisplay`.
    if (attribute.unit !== market.currencySymbol) return `${formatted} ${attribute.unit}`;
    return market.currencyDisplay === "symbol-first"
      ? `${market.currencySymbol}${formatted}`
      : `${formatted}${market.currencySymbol}`;
  }

  return String(value);
}

/**
 * Split the generated description into readable paragraphs.
 *
 * The corpus stores one long string; two sentences per paragraph keeps the
 * measure comfortable without inventing structure that is not there.
 */
function toParagraphs(description) {
  const sentences = String(description || "")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) return [];

  const paragraphs = [];
  for (let index = 0; index < sentences.length; index += 2) {
    paragraphs.push(sentences.slice(index, index + 2).join(" "));
  }
  return paragraphs;
}

/* ------------------------------------------------------------------
 * Metadata
 * ---------------------------------------------------------------- */

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const listing = getListing(slug);

  if (!listing) {
    return { title: "Not found | AltF Bazaar", robots: { index: false, follow: true } };
  }

  // createPageMetadata already emits the whole openGraph + twitter block
  // (title, description, url, siteName, locale, summary_large_image card and a
  // 1200x630 image entry), so the only thing to add is which image. Without an
  // explicit `image` it advertises the site-wide og-default.png: an
  // openGraph.images returned from generateMetadata takes precedence over the
  // opengraph-image file convention, so the generated card would never be seen.
  // Same wiring as `src/app/blogs/[slug]/page.jsx`.
  return createPageMetadata({
    title: `${listing.title} in ${listing.cityName}`,
    description: describeListing(listing),
    path: `/bazaar/item/${listing.slug}`,
    image: `/bazaar/item/${listing.slug}/opengraph-image`,
    imageAlt: `${listing.title} — ${listing.priceLabel} in ${listing.locality}, ${listing.cityName}`,
    type: "article",
    keywords: [
      listing.title,
      listing.categoryName,
      listing.subcategoryName,
      listing.cityName,
      `${listing.subcategoryName} in ${listing.cityName}`,
      `used ${listing.categoryName} in ${listing.cityName}`,
      `${listing.categoryName} in ${listing.locality}`,
      "classifieds",
    ],
  });
}

/* ------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------- */

export default async function BazaarItemPage({ params }) {
  const { slug } = await params;
  const listing = getListing(slug);

  if (!listing) notFound();

  const seller = getSeller(listing.sellerId);
  const similar = getSimilarListings(listing, 8);
  const paragraphs = toParagraphs(listing.description);
  const specs = Object.entries(listing.attributes || {});

  // The visible trail and the BreadcrumbList node are built from one array so
  // the structured data cannot drift away from what the page actually shows.
  const crumbs = buildListingCrumbs(listing);

  // Product + Offer comes from `data/bazaarSchema.js` — the vertical's own
  // builder, since the platform helper has no createProductJsonLd. Only the
  // Product and the BreadcrumbList ship: the similar-ads grid stays out of
  // structured data so the page carries no ItemList at all, which is what the
  // `#item-list` @id collision rule is protecting.
  const productJsonLd = createListingProductJsonLd(listing, seller);

  return (
    <BazaarShell>
      <JsonLd
        id={`bazaar-item-${listing.slug}`}
        data={[productJsonLd, createBreadcrumbJsonLd(crumbs)]}
      />

      <div className="section-container px-4 pb-14 pt-4 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <div className="bzr-detail-grid mt-4">
          {/* ---------------- Main column ---------------- */}
          <div className="min-w-0">
            <ItemGallery images={listing.images} title={listing.title} />

            {/* Price, title, meta */}
            <div className="mt-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <p
                  className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${
                    listing.price === 0 ? "text-(--bzr-free)" : "text-(--foreground)"
                  }`}
                >
                  {listing.priceLabel}
                  {listing.pricePeriod ? (
                    <span className="ms-1.5 text-base font-semibold text-(--muted-foreground)">
                      {listing.pricePeriod}
                    </span>
                  ) : null}
                </p>
                {listing.negotiable ? <span className="bzr-chip">Negotiable</span> : null}
                {listing.spotlight ? (
                  <span className="bzr-badge bzr-badge-featured">Spotlight</span>
                ) : listing.featured ? (
                  <span className="bzr-badge bzr-badge-featured">Featured</span>
                ) : null}
                {listing.urgent ? <span className="bzr-badge bzr-badge-urgent">Urgent</span> : null}
              </div>

              <h1 className="mt-2 text-xl font-semibold leading-snug text-(--foreground) sm:text-2xl">
                {listing.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-(--muted-foreground)">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {listing.locality}, {listing.cityName}
                </span>
                <span>Posted {formatPosted(listing.postedDaysAgo).toLowerCase()}</span>
              </div>

              {/* Views and saves used to sit in the meta row above as bare
                  counts. They mean more next to the ad's age — 3,000 views on
                  a 40-day-old ad reads very differently from 3,000 on a
                  two-day-old one — so AdFreshness now carries both. */}
              <AdFreshness listing={listing} />
            </div>

            {/* "Is this a good price?" — placed directly under the price block
                it is about. Renders nothing for jobs (a salary is not a price)
                or free giveaways (everything is ₹0). */}
            <PriceInsight listing={listing} />

            {/* Specs */}
            {specs.length > 0 ? (
              <section aria-labelledby="specs-heading" className="mt-7">
                <h2 id="specs-heading" className="bzr-section-title mb-3">
                  <T id="section.details" fallback="Details" />
                </h2>
                <dl className="bzr-spec-grid bzr-panel">
                  {specs.map(([key, value]) => {
                    const attribute = getCategoryAttribute(listing.categorySlug, key);
                    return (
                      <div key={key} className="min-w-0">
                        {/* Label localises via the catalogue; the VALUE below is
                            listing data and stays as the seller stored it. */}
                        <dt className="bzr-spec-label">
                          <T
                            id={`attr.${key}`}
                            fallback={attribute?.label || humanizeKey(key)}
                          />
                        </dt>
                        <dd className="bzr-spec-value break-words">
                          {formatAttributeValue(value, attribute || { key })}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            ) : null}

            {/* Description */}
            {paragraphs.length > 0 ? (
              <section aria-labelledby="description-heading" className="mt-7">
                <h2 id="description-heading" className="bzr-section-title mb-3">
                  <T id="section.description" fallback="Description" />
                </h2>
                <div className="flex flex-col gap-3 text-sm leading-relaxed text-(--foreground)">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Location */}
            <section aria-labelledby="location-heading" className="mt-7">
              <h2 id="location-heading" className="bzr-section-title mb-3">
                <T id="post.step.location" fallback="Location" />
              </h2>
              <div className="bzr-panel">
                <p className="flex items-start gap-2 text-sm text-(--foreground)">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--muted-foreground)" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">{listing.locality}</strong>
                    <br />
                    {listing.cityName}, {listing.stateName}
                  </span>
                </p>

                {/* A real map, but the honesty is unchanged: the pin is drawn
                    inside an explicit ~1.4 km ring rather than as a lone
                    needle, because `coords` is a seeded neighbourhood scatter
                    and a sharp pin on a stranger's home would imply an address
                    we neither have nor would publish.

                    `MapPanel` is the only supported entry point — leaflet reads
                    `window` at import time, so it loads through next/dynamic
                    with ssr:false behind a same-height skeleton. */}
                {listing.coords ? (
                  <>
                    <MapPanel
                      className="mt-3"
                      height={220}
                      variant="single"
                      points={[
                        {
                          id: listing.id,
                          slug: listing.slug,
                          title: listing.title,
                          priceLabel: listing.priceLabel,
                          coords: listing.coords,
                          locality: listing.locality,
                          citySlug: listing.citySlug,
                          cityName: listing.cityName,
                          image: listing.images?.[0]?.src || null,
                        },
                      ]}
                      center={listing.coords}
                      zoom={13}
                      radiusMeters={1400}
                      scrollWheelZoom={false}
                      ariaLabel={`Approximate area: ${listing.locality}, ${listing.cityName}`}
                    />
                    <p className="mt-2 text-xs bzr-muted-on-tint">
                      Approximate area only — the exact address is shared by the seller.
                    </p>
                  </>
                ) : (
                  /* Cities the GEO registry has no coordinates for get the
                     text-only panel, never an empty map. */
                  <div
                    className="mt-3 grid h-40 place-items-center rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-dashed border-(--border) bg-(--bzr-media) px-3 text-center"
                    role="img"
                    aria-label={`Approximate area: ${listing.locality}, ${listing.cityName}`}
                  >
                    <div>
                      <Navigation className="mx-auto h-6 w-6 text-(--muted-foreground)" aria-hidden="true" />
                      <p className="mt-1.5 text-sm font-semibold text-(--foreground)">
                        {listing.locality}, {listing.cityName}
                      </p>
                      <p className="text-xs bzr-muted-on-tint">
                        Approximate area only — the exact address is shared by the seller
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Safety */}
            <div className="mt-7">
              <SafetyTips title={listing.title} />
            </div>
          </div>

          {/* ---------------- Sidebar ---------------- */}
          <aside className="bzr-panel bzr-sticky">
            <SellerPanel seller={seller} />

            <hr className="my-4 border-(--border)" />

            <ItemActions listing={listing} seller={seller} />
          </aside>
        </div>

        {/* ---------------- Similar ads ---------------- */}
        {similar.length > 0 ? (
          <section aria-label="Similar ads" className="bzr-section">
            <SectionHead
              title={<T id="section.similar" fallback="Similar ads" />}
              as="h2"
              href={`/bazaar/c/${listing.categorySlug}/${listing.subcategorySlug}`}
              linkLabel={`More ${listing.subcategoryName}`}
            />
            <div className="bzr-grid">
              {similar.map((item) => (
                <AdCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        ) : null}

        <TrackListingView id={listing.id} />
        <RecentlyViewed excludeId={listing.id} contained={false} />
      </div>
    </BazaarShell>
  );
}
