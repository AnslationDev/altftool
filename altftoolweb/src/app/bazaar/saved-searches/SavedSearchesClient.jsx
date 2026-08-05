"use client";

/**
 * Saved searches.
 *
 * Each row is a filter set the visitor saved from a browse page. The row stores
 * its own human label and chip breakdown (built once, at save time, by
 * `describeSearch` in SaveSearchButton) rather than re-deriving them here —
 * re-deriving would mean importing the whole 24-category taxonomy into this
 * page's client bundle to translate `?year=2015-2020` back into
 * "Year: 2015–2020".
 *
 * The alerts toggle is deliberately honest. There is no backend, so nothing is
 * ever sent; the switch records a preference and the page says so in plain
 * words instead of implying an email is on its way.
 */

import Link from "next/link";
import { useState } from "react";
import { BellRing, Info, Search, Trash2 } from "lucide-react";

import { EmptyState, Note } from "../components/primitives";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

function hrefFor(search) {
  const path = search.path || "/bazaar/search";
  return search.query ? `${path}?${search.query}` : path;
}

export default function SavedSearchesClient() {
  const { t } = useLocale();
  const hydrated = useHydrated();
  const savedSearches = useBazaarStore((s) => s.savedSearches);
  const removeSavedSearch = useBazaarStore((s) => s.removeSavedSearch);
  const toggleSearchAlerts = useBazaarStore((s) => s.toggleSearchAlerts);
  const clearSavedSearches = useBazaarStore((s) => s.clearSavedSearches);
  const [confirming, setConfirming] = useState(false);

  // Neutral state until the store is known, or the prerendered HTML and the
  // first client render disagree and React throws a hydration error.
  if (!hydrated) {
    return (
      <div className="bzr-section" aria-busy="true">
        <p className="text-sm text-(--muted-foreground)">Loading your saved searches…</p>
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="bzr-section">
        <EmptyState
          title={t("empty.savedSearches.title")}
          message={t("empty.savedSearches.message")}
          action={
            <Link href="/bazaar" className="bzr-btn">
              {t("empty.browse")}
            </Link>
          }
        />
      </div>
    );
  }

  const alertCount = savedSearches.filter((s) => s.alerts).length;

  return (
    <div className="bzr-section">
      <div className="bzr-section-head">
        <h2 className="bzr-section-title">
          {savedSearches.length} saved search{savedSearches.length === 1 ? "" : "es"}
        </h2>

        {confirming ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-(--foreground)">
              Delete all {savedSearches.length}?
            </span>
            <button
              type="button"
              className="bzr-chip is-active"
              onClick={() => {
                clearSavedSearches();
                setConfirming(false);
              }}
            >
              Yes, clear them
            </button>
            <button type="button" className="bzr-chip" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" className="bzr-chip" onClick={() => setConfirming(true)}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      <Note icon={Info}>
        Alerts are a <strong>demo preference only</strong>. AltF Bazaar has no backend yet, so
        turning one on records your choice in this browser and sends nothing — no email, no push,
        no SMS.
        {alertCount > 0
          ? ` ${alertCount} ${alertCount === 1 ? "is" : "are"} switched on.`
          : ""}
      </Note>

      <ul className="mt-4 flex flex-col gap-3">
        {savedSearches.map((search) => (
          <li key={search.id} className="bzr-panel">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold leading-snug text-(--foreground)">
                  {search.label}
                </h3>
                <p className="mt-0.5 text-xs text-(--muted-foreground)">
                  {search.createdAtLabel}
                </p>
              </div>

              <Link href={hrefFor(search)} className="bzr-btn bzr-btn-secondary shrink-0">
                <Search className="h-4 w-4" aria-hidden="true" />
                Run search
              </Link>
            </div>

            {search.chips?.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {search.chips.map((chip) => (
                  <span key={chip} className="bzr-chip">
                    {chip}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-(--muted-foreground)">No filters — everything.</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-(--border) pt-3">
              {/* role="switch" rather than a plain toggle button: this controls a
                  stored preference, not a page state, and aria-checked is what
                  a screen reader announces as on/off. */}
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(search.alerts)}
                className={`bzr-chip${search.alerts ? " is-active" : ""}`}
                onClick={() => toggleSearchAlerts(search.id)}
              >
                <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
                Alerts {search.alerts ? "on" : "off"}
                <span className="sr-only"> for {search.label} (demo preference, sends nothing)</span>
              </button>

              <span className="text-xs text-(--muted-foreground)">
                Demo preference — nothing is sent.
              </span>

              <button
                type="button"
                className="ms-auto bzr-chip"
                onClick={() => removeSavedSearch(search.id)}
                aria-label={`Delete saved search ${search.label}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-(--muted-foreground)">
        Saved searches are kept in this browser only — they are not synced to an account.
      </p>
    </div>
  );
}
