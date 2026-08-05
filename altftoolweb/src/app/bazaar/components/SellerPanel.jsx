import Link from "next/link";
import { BadgeCheck, ChevronRight, Clock, Package, Star } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import { T } from "../i18n/T";

/**
 * "Member for 3 years 2 months" from an integer month count.
 *
 * Deliberately derived from `monthsActive` rather than from a stored join
 * date: there is no `Date.now()` anywhere in this vertical, so a prerendered
 * page and a hydrated page always agree on how long someone has been here.
 */
export function formatMemberFor(monthsActive = 0) {
  const months = Math.max(0, Math.round(monthsActive));
  if (months < 1) return "Joined this month";
  if (months < 12) return `Member for ${months} month${months === 1 ? "" : "s"}`;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearPart = `${years} year${years === 1 ? "" : "s"}`;
  if (rest === 0) return `Member for ${yearPart}`;
  return `Member for ${yearPart} ${rest} month${rest === 1 ? "" : "s"}`;
}

/** Star row + numeric rating. Half stars are rounded down deliberately. */
export function SellerRating({ rating = 0, reviewCount = 0, className = "" }) {
  const filled = Math.floor(rating);

  return (
    <p className={`flex flex-wrap items-center gap-1.5 text-sm ${className}`}>
      <span className="flex items-center" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <Star
            key={index}
            className={
              index < filled
                ? "h-3.5 w-3.5 text-(--primary)"
                : "h-3.5 w-3.5 text-(--muted-foreground) opacity-40"
            }
            fill={index < filled ? "currentColor" : "none"}
          />
        ))}
      </span>
      <span className="font-semibold text-(--foreground)">{rating.toFixed(1)}</span>
      <span className="text-(--muted-foreground)">
        ({reviewCount.toLocaleString("en-IN")} review{reviewCount === 1 ? "" : "s"})
      </span>
    </p>
  );
}

/**
 * Seller summary for the detail-page sidebar.
 *
 * Server component: this is trust-critical copy, so it belongs in the HTML the
 * crawler and a JS-less visitor both see.
 */
export default function SellerPanel({ seller }) {
  if (!seller) return null;

  const profileHref = `/bazaar/seller/${seller.slug}`;

  return (
    <section aria-labelledby="seller-heading">
      <h2 id="seller-heading" className="mb-3 text-sm font-bold uppercase tracking-wide text-(--muted-foreground)">
        <T id="seller.postedBy" fallback="Posted by" />
      </h2>

      <div className="flex items-start gap-3">
        <ManagedImage
          src={seller.avatar}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full border border-(--border) object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={profileHref}
              className="truncate text-base font-semibold text-(--foreground) hover:underline"
            >
              {seller.name}
            </Link>
            {seller.verified ? (
              <span className="bzr-badge bzr-badge-verified inline-flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                Verified
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 text-xs capitalize text-(--muted-foreground)">
            {seller.type === "business" ? (
              <T id="seller.business" fallback="Business seller" />
            ) : (
              <T id="seller.individual" fallback="Individual seller" />
            )}{" "}
            · {seller.cityName}
          </p>

          <p className="mt-1 text-xs text-(--muted-foreground)">
            {formatMemberFor(seller.monthsActive)}
          </p>
        </div>
      </div>

      <SellerRating
        rating={seller.rating}
        reviewCount={seller.reviewCount}
        className="mt-3"
      />

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-[var(--anslation-ds-radius-xs,0.375rem)] border border-(--border) px-2.5 py-2">
          <dt className="flex items-center gap-1 text-(--muted-foreground)">
            <Package className="h-3 w-3" aria-hidden="true" />
            <T id="seller.itemsSold" fallback="Items sold" />
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-(--foreground)">
            {seller.salesCount.toLocaleString("en-IN")}
          </dd>
        </div>
        <div className="rounded-[var(--anslation-ds-radius-xs,0.375rem)] border border-(--border) px-2.5 py-2">
          <dt className="flex items-center gap-1 text-(--muted-foreground)">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <T id="seller.replies" fallback="Replies" />
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-(--foreground)">
            Typically responds {seller.respondsIn}
          </dd>
        </div>
      </dl>

      <Link
        href={profileHref}
        className="bzr-section-link mt-3 inline-flex items-center gap-1"
      >
        See all ads by {seller.name}
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
      </Link>
    </section>
  );
}
