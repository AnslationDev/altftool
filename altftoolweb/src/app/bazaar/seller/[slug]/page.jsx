import { notFound } from "next/navigation";
import { BadgeCheck, Check, Clock, MapPin, Package, X } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import "../../bazaar.css";

import AdCard from "../../components/AdCard";
import BazaarShell from "../../components/BazaarShell";
import { SellerRating, formatMemberFor } from "../../components/SellerPanel";
import { Breadcrumbs, EmptyState } from "../../components/primitives";
import { getListingsBySeller } from "../../data/listings";
import { getSellerBySlug, getSellerSlugs } from "../../data/sellers";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * 240 seller profiles, of which only the busiest are ever linked from a
 * detail page a crawler reaches early. Prerender the first 100 (the slug
 * order is the frozen generation order, so this is stable across builds) and
 * let the rest render on demand into the ISR cache.
 */
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getSellerSlugs()
    .slice(0, 100)
    .map((slug) => ({ slug }));
}

function describe(seller, adCount) {
  const kind = seller.type === "business" ? "Business seller" : "Individual seller";
  const rated =
    seller.reviewCount > 0
      ? `Rated ${seller.rating.toFixed(1)} out of 5 across ${seller.reviewCount.toLocaleString("en-IN")} review${seller.reviewCount === 1 ? "" : "s"}.`
      : "No reviews yet.";

  return `${kind} in ${seller.cityName} with ${adCount} live ad${adCount === 1 ? "" : "s"} on AltF Bazaar. ${rated} Typically responds ${seller.respondsIn}.`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const seller = getSellerBySlug(slug);

  if (!seller) {
    return { title: "Not found | AltF Bazaar", robots: { index: false, follow: true } };
  }

  const adCount = getListingsBySeller(seller.id).length;

  return createPageMetadata({
    title: `${seller.name} — seller profile in ${seller.cityName}`,
    description: describe(seller, adCount),
    path: `/bazaar/seller/${seller.slug}`,
    type: "profile",
    keywords: [
      seller.name,
      `${seller.name} ads`,
      `${seller.type} seller ${seller.cityName}`,
      seller.cityName,
      "AltF Bazaar seller",
      "classifieds",
    ],
  });
}

/** One verification row — a check or a cross, never an ambiguous dash. */
function VerificationRow({ label, ok, detail }) {
  const Icon = ok ? Check : X;
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
          ok ? "bg-(--bzr-free) text-white" : "border border-(--border) text-(--muted-foreground)"
        }`}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-(--foreground)">
          {label}
          <span className="sr-only">: {ok ? "verified" : "not verified"}</span>
        </span>
        <span className="block text-xs text-(--muted-foreground)">{detail}</span>
      </span>
    </li>
  );
}

export default async function BazaarSellerPage({ params }) {
  const { slug } = await params;
  const seller = getSellerBySlug(slug);

  if (!seller) notFound();

  // Cap what the server renders: the prerender budget allows 24 cards, and no
  // mock seller comes close, but the cap keeps a future data change from
  // quietly blowing the 1 MiB HTML limit.
  const allListings = getListingsBySeller(seller.id);
  const listings = allListings.slice(0, 24);
  const path = `/bazaar/seller/${seller.slug}`;
  const isBusiness = seller.type === "business";

  // "Sellers" is a label, not a link: there is no seller directory route, and
  // a BreadcrumbList entry pointing at a 404 is worse than a shorter trail.
  // createBreadcrumbJsonLd drops path-less entries, so the structured data
  // describes only the three URLs that really exist.
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "AltF Bazaar", path: "/bazaar" },
    { name: "Sellers" },
    { name: seller.name, path },
  ];

  const sellerJsonLd = {
    "@context": "https://schema.org",
    "@type": isBusiness ? "Organization" : "Person",
    "@id": `${absoluteUrl(path)}#seller`,
    name: seller.name,
    description: seller.bio,
    url: absoluteUrl(path),
    image: seller.avatar,
    address: {
      "@type": "PostalAddress",
      addressLocality: seller.cityName,
      addressCountry: "IN",
    },
    // schema.org only defines aggregateRating on Organization-like types, so
    // an individual seller's rating stays out of the graph rather than being
    // attached to a property Person does not have.
    ...(isBusiness && seller.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: seller.rating,
            reviewCount: seller.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <BazaarShell>
      <JsonLd
        id={`bazaar-seller-${seller.slug}`}
        data={[sellerJsonLd, createBreadcrumbJsonLd(crumbs)]}
      />

      <div className="section-container px-4 pb-14 pt-4 sm:px-6">
        <Breadcrumbs items={crumbs} />

        {/* ---------------- Header ---------------- */}
        <header className="bzr-panel mt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ManagedImage
              src={seller.avatar}
              alt=""
              width={96}
              height={96}
              className="h-20 w-20 shrink-0 rounded-full border border-(--border) object-cover sm:h-24 sm:w-24"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <h1 className="text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">
                  {seller.name}
                </h1>
                {seller.verified ? (
                  <span className="bzr-badge bzr-badge-verified inline-flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    Verified
                  </span>
                ) : null}
              </div>

              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-(--muted-foreground)">
                <span>{isBusiness ? "Business seller" : "Individual seller"}</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {seller.cityName}
                </span>
                <span>{formatMemberFor(seller.monthsActive)}</span>
              </p>

              <SellerRating
                rating={seller.rating}
                reviewCount={seller.reviewCount}
                className="mt-2"
              />

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-2.5 py-1 text-(--muted-foreground)">
                  <Package className="h-3.5 w-3.5" aria-hidden="true" />
                  {seller.salesCount.toLocaleString("en-IN")} items sold
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-2.5 py-1 text-(--muted-foreground)">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Typically responds {seller.respondsIn}
                </span>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--foreground)">
                {seller.bio}
              </p>
            </div>
          </div>
        </header>

        {/* ---------------- Verification ---------------- */}
        <section aria-labelledby="verification-heading" className="mt-6">
          <h2 id="verification-heading" className="bzr-section-title mb-3">
            Verification
          </h2>
          <div className="bzr-panel">
            <ul className="divide-y divide-(--border)">
              <VerificationRow
                label="Phone number"
                ok={seller.phoneVerified}
                detail={
                  seller.phoneVerified
                    ? "Confirmed by SMS one-time password."
                    : "Not confirmed. Ask the seller to call you from the number on the ad."
                }
              />
              <VerificationRow
                label="Email address"
                ok={seller.emailVerified}
                detail={
                  seller.emailVerified
                    ? "Confirmed by a link sent to the seller."
                    : "Not confirmed. Keep the conversation inside AltF Bazaar chat."
                }
              />
              <VerificationRow
                label="Identity check"
                ok={seller.verified}
                detail={
                  seller.verified
                    ? "Government ID reviewed and a trading history on record."
                    : "No ID on file yet. Meet in a public place and inspect before you pay."
                }
              />
            </ul>
            <p className="mt-3 border-t border-(--border) pt-3 text-xs text-(--muted-foreground)">
              Verification confirms who someone is — it is not a guarantee about the goods.
              Inspect anything you buy and never pay before you collect it.
            </p>
          </div>
        </section>

        {/* ---------------- Their ads ---------------- */}
        <section aria-labelledby="seller-ads-heading" className="bzr-section">
          <div className="bzr-section-head">
            <h2 id="seller-ads-heading" className="bzr-section-title">
              Ads by {seller.name}
              <span className="ms-2 text-sm font-medium text-(--muted-foreground)">
                {allListings.length.toLocaleString("en-IN")} live ad
                {allListings.length === 1 ? "" : "s"}
              </span>
            </h2>
          </div>

          {listings.length > 0 ? (
            <div className="bzr-grid">
              {listings.map((listing, index) => (
                <AdCard key={listing.id} listing={listing} priority={index < 4} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`${seller.name} has no live ads right now`}
              message="Everything this seller listed has been sold or withdrawn. Try a category or a nearby city instead."
            />
          )}
        </section>
      </div>
    </BazaarShell>
  );
}
