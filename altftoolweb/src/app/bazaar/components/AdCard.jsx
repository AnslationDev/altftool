"use client";

import Link from "next/link";
import { Heart, MapPin } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import CompareToggle from "./CompareToggle";
import { formatPosted, postedParts } from "../data/listings";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

/**
 * The listing card.
 *
 * Photos go through `ManagedImage` rather than `next/image`: the mock corpus
 * points at picsum, which is not in `next.config.mjs`'s `remotePatterns`, and
 * ManagedImage carries the fallback chain for when a remote photo fails.
 * Swapping to `next/image` later means changing this one component.
 *
 * The whole card is clickable via a stretched pseudo-element on the title
 * link, so the accessible name is the ad title rather than "image, link".
 */
export default function AdCard({ listing, priority = false }) {
  const { t } = useLocale();
  const hydrated = useHydrated();
  const savedIds = useBazaarStore((s) => s.savedIds);
  const toggleSaved = useBazaarStore((s) => s.toggleSaved);

  // Before hydration the saved set is unknown; render the neutral state so
  // the server HTML and first client render agree.
  const saved = hydrated && savedIds.includes(listing.id);

  const isFree = listing.price === 0;
  const cover = listing.images?.[0];

  return (
    <article className="bzr-card">
      <div className="bzr-card-media">
        {cover ? (
          <ManagedImage
            src={cover.src}
            alt={cover.alt}
            width={400}
            height={300}
            loading={priority ? "eager" : "lazy"}
          />
        ) : null}

        <div className="bzr-badges">
          {listing.spotlight ? (
            <span className="bzr-badge bzr-badge-featured">{t("card.spotlight")}</span>
          ) : listing.featured ? (
            <span className="bzr-badge bzr-badge-featured">{t("card.featured")}</span>
          ) : null}
          {listing.urgent ? (
            <span className="bzr-badge bzr-badge-urgent">{t("card.urgent")}</span>
          ) : null}
          {isFree ? <span className="bzr-badge bzr-badge-free">{t("card.free")}</span> : null}
        </div>

        <button
          type="button"
          className="bzr-save"
          aria-pressed={saved}
          aria-label={t(saved ? "card.unsaveAria" : "card.saveAria", { title: listing.title })}
          onClick={() => toggleSaved(listing.id)}
        >
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>

      <div className="bzr-card-body">
        <p className={`bzr-card-price${isFree ? " is-free" : ""}`}>
          {listing.priceLabel}
          {listing.pricePeriod ? <span className="bzr-period">{listing.pricePeriod}</span> : null}
        </p>

        <h3 className="bzr-card-title">
          <Link href={`/bazaar/item/${listing.slug}`}>{listing.title}</Link>
        </h3>

        <div className="bzr-card-meta">
          <span className="bzr-card-place">
            <MapPin className="me-1 inline h-3 w-3" aria-hidden="true" />
            {listing.locality}, {listing.cityName}
          </span>
          {/* Relative age is interface text, not seller content, so it
              follows the locale. Fallback = the exact English formatter, so
              EN output is byte-identical to the prerendered HTML. */}
          <span>
            {(() => {
              const parts = postedParts(listing.postedDaysAgo);
              return t(parts.id, formatPosted(listing.postedDaysAgo), {
                count: parts.count,
              });
            })()}
          </span>
        </div>

        <CompareToggle listing={listing} className="mt-1" />
      </div>
    </article>
  );
}
