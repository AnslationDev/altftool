"use client";

/**
 * Saved ads.
 *
 * The store holds ids only, so each one is resolved against the listing corpus
 * at render time. Ids that no longer resolve are dropped rather than rendered
 * as an empty card — a saved ad that vanished from the corpus is a stale id,
 * not a listing with no data.
 */

import Link from "next/link";
import { useState } from "react";
import { Heart, Info } from "lucide-react";

import AdCard from "../components/AdCard";
import { EmptyState, Note } from "../components/primitives";
import { getListingById } from "../data/listings";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

export default function FavouritesClient() {
  const { t } = useLocale();
  const hydrated = useHydrated();
  const savedIds = useBazaarStore((s) => s.savedIds);
  const toggleSaved = useBazaarStore((s) => s.toggleSaved);
  const [confirming, setConfirming] = useState(false);

  if (!hydrated) {
    return (
      <div className="bzr-section" aria-busy="true">
        <p className="text-sm text-(--muted-foreground)">Loading your saved ads…</p>
      </div>
    );
  }

  const listings = savedIds.map((id) => getListingById(id)).filter(Boolean);
  const missing = savedIds.length - listings.length;

  function clearAll() {
    // `toggleSaved` reads the current state each call, so removing them one by
    // one converges on an empty set.
    for (const id of [...savedIds]) toggleSaved(id);
    setConfirming(false);
  }

  if (listings.length === 0) {
    return (
      <div className="bzr-section">
        <EmptyState
          title={t("empty.saved.title")}
          message={t("empty.saved.message")}
          action={
            <Link href="/bazaar" className="bzr-btn">
              {t("empty.browse")}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bzr-section">
      <div className="bzr-section-head">
        <h2 className="bzr-section-title">
          {listings.length} saved ad{listings.length === 1 ? "" : "s"}
        </h2>

        {confirming ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-(--foreground)">
              Remove all {listings.length} saved ads?
            </span>
            <button type="button" className="bzr-chip is-active" onClick={clearAll}>
              Yes, clear them
            </button>
            <button type="button" className="bzr-chip" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" className="bzr-chip" onClick={() => setConfirming(true)}>
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            Clear all saved
          </button>
        )}
      </div>

      {missing > 0 ? (
        <Note icon={Info}>
          {missing} saved {missing === 1 ? "ad is" : "ads are"} no longer listed, so{" "}
          {missing === 1 ? "it has" : "they have"} been left out below.
        </Note>
      ) : null}

      <div className="bzr-grid mt-4">
        {listings.map((listing) => (
          <AdCard key={listing.id} listing={listing} />
        ))}
      </div>

      <p className="mt-6 text-sm text-(--muted-foreground)">
        Saved ads are kept in this browser only — they are not synced to an account.
      </p>
    </div>
  );
}
