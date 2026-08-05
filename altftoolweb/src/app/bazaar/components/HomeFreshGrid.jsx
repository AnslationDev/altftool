import Link from "next/link";
import { ArrowRight } from "lucide-react";

import AdCard from "./AdCard";
import { EmptyState, SectionHead } from "./primitives";
import { T } from "../i18n/T";

/**
 * The main grid — the reason anyone lands on this page.
 *
 * Capped at whatever the page hands over (24) rather than paginating here: the
 * prerendered HTML has a 1 MiB budget and 24 cards is the agreed ceiling. Deeper
 * browsing belongs to `/bazaar/search`, which is a real, filterable, crawlable
 * surface rather than a "load more" button.
 *
 * The first four cards get `priority` so the largest contentful paint candidate
 * is not lazy-loaded.
 *
 * @param {{ listings: Array<object> }} props
 */
export default function HomeFreshGrid({ listings = [] }) {
  return (
    <section className="bzr-section" aria-label="Fresh recommendations">
      <div className="section-container">
        <SectionHead
          title={<T id="home.fresh.title" fallback="Fresh recommendations" />}
          href="/bazaar/search"
          linkLabel={<T id="home.fresh.link" fallback="See more ads" />}
        />

        {listings.length === 0 ? (
          <EmptyState
            title={<T id="home.fresh.emptyTitle" fallback="No ads to show yet" />}
            message={
              <T
                id="home.fresh.emptyMessage"
                fallback="Nothing has been posted recently. Be the first — listing an ad takes about a minute."
              />
            }
            action={
              <Link href="/bazaar/post" className="bzr-btn">
                <T id="home.fresh.postCta" fallback="Post your ad" />
              </Link>
            }
          />
        ) : (
          <>
            <div className="bzr-grid">
              {listings.map((listing, index) => (
                <AdCard key={listing.id} listing={listing} priority={index < 4} />
              ))}
            </div>

            <div className="mt-7 flex justify-center">
              <Link href="/bazaar/search" className="bzr-btn bzr-btn-secondary">
                <T id="home.fresh.link" fallback="See more ads" />
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
