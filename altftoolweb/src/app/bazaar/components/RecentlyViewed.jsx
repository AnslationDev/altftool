"use client";

import { History } from "lucide-react";

import AdCard from "./AdCard";
import { SectionHead } from "./primitives";
import { getListingById } from "../data/listings";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

/**
 * The "Recently viewed" rail — the return-visit surface.
 *
 * Self-contained and self-hiding: it renders `null` before hydration and when
 * there is nothing to show, so a page can drop it in unconditionally and never
 * has to reason about whether the visitor has history. That is why the pages
 * that host it need exactly one line each.
 *
 * The store keeps ids only, so each is resolved against the corpus here. Ids
 * that no longer resolve are dropped — a viewed ad that left the corpus is a
 * stale id, not a card with no data. `data/listings` is already in the client
 * bundle on every Bazaar page (AdCard imports `formatPosted` from it), so this
 * lookup costs no extra JavaScript.
 *
 * @param {{ excludeId?: string, title?: string, contained?: boolean }} props
 *   `excludeId` keeps the ad you are currently reading out of its own rail.
 *   `contained` adds the page gutter. Home-page sections each own their
 *   `.section-container`; the item page already sits inside one, and nesting
 *   two would double `.bazaar-page .section-container`'s inline padding and
 *   push the rail out of alignment with everything above it.
 */
export default function RecentlyViewed({
  excludeId = null,
  // `null` = the locale's own "Recently viewed"; pass a string to override.
  title = null,
  contained = true,
}) {
  const { t } = useLocale();
  const hydrated = useHydrated();
  const recentlyViewed = useBazaarStore((s) => s.recentlyViewed);
  const clearRecentlyViewed = useBazaarStore((s) => s.clearRecentlyViewed);
  const heading = title ?? t("section.recentlyViewed");

  // Before hydration the history is unknown, and rendering a guess would make
  // the prerendered HTML disagree with the first client render.
  if (!hydrated) return null;

  const listings = recentlyViewed
    .filter((id) => id !== excludeId)
    .map((id) => getListingById(id))
    .filter(Boolean);

  if (listings.length === 0) return null;

  return (
    <section className="bzr-section" aria-label={heading}>
      <div className={contained ? "section-container" : undefined}>
        <SectionHead title={heading} as="h2">
          <button
            type="button"
            className="bzr-chip"
            onClick={clearRecentlyViewed}
            aria-label={t("recent.clearAria")}
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            {t("common.clear")}
          </button>
        </SectionHead>

        <div className="bzr-rail mt-4">
          {listings.map((listing) => (
            <AdCard key={listing.id} listing={listing} />
          ))}
        </div>

        <p className="mt-3 text-xs text-(--muted-foreground)">{t("recent.localNote")}</p>
      </div>
    </section>
  );
}
