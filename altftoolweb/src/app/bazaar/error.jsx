"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Store } from "lucide-react";

import "./bazaar.css";

import { getCategoryIcon } from "./components/categoryIcons";

/**
 * The Bazaar error boundary — /bazaar/**
 *
 * Next's convention: a client component receiving `{ error, reset }`, rendered
 * in place of the failed segment. Two decisions worth stating.
 *
 * **It keeps the visitor inside Bazaar.** A marketplace visitor who hits an
 * error is mid-task — they were looking for a phone in Pune. Dropping them on
 * a generic site-wide "something went wrong" page ends the session. So this
 * renders a real recovery surface: retry, the Bazaar home, and the categories
 * people actually arrive for.
 *
 * **It does not print `error.message`.** A server-side digest or a stack
 * fragment in the UI is noise to a buyer and a small information leak to
 * anybody else. The detail goes to `console.error` (where a developer and
 * error reporting can both see it) and the visitor gets a sentence in their
 * own language. `error.digest` is surfaced as an opaque reference so a support
 * conversation has something to quote.
 *
 * There is no `<BazaarShell>` here on purpose: the shell's search bar posts to
 * a route that may be the thing that just failed, and pulling the shell (and
 * its client children) into the error bundle makes the recovery path depend on
 * more code than the page it is recovering from. `bazaar.css` is imported
 * directly because Bazaar has no layout file — each page imports the
 * stylesheet itself, and a boundary that replaces a page has to do the same or
 * every `bzr-*` class here would be unstyled.
 */

/**
 * The categories a classifieds visitor is most likely to be heading for.
 *
 * Written out rather than read from `data/categories.js`: this is a client
 * component, and importing the taxonomy would ship 24 categories, 176
 * sub-categories and every filter attribute definition into the browser to
 * render six links. The slugs are asserted against the data layer in the audit
 * that added this file.
 */
const RECOVERY_CATEGORIES = [
  { slug: "cars", name: "Cars" },
  { slug: "properties", name: "Properties" },
  { slug: "mobiles", name: "Mobiles" },
  { slug: "bikes", name: "Bikes" },
  { slug: "electronics-appliances", name: "Electronics & Appliances" },
  { slug: "furniture", name: "Furniture" },
];

export default function BazaarError({ error, reset }) {
  useEffect(() => {
    // The whole diagnostic, once, where it belongs — not in the UI.
    console.error("AltF Bazaar route error:", error);
  }, [error]);

  return (
    <main className="bazaar-page">
      <div className="bzr-shell">
        <div className="section-container px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl rounded-[var(--bzr-radius,0.75rem)] border border-(--border) bg-(--card) p-5 sm:p-8">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/40 text-(--bzr-urgent)"
              aria-hidden="true"
            >
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-(--foreground) sm:text-3xl">
              This Bazaar page did not load
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-(--muted-foreground)">
              Something broke while building this page. Nothing you did caused it, and nothing
              you saved has been lost — your saved ads, your posted ads and your compare list
              live in this browser and are untouched. Try again, or pick up from one of the
              category pages below.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => reset()} className="bzr-btn">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
              <Link href="/bazaar" className="bzr-btn bzr-btn-secondary">
                <Store className="h-4 w-4" aria-hidden="true" />
                Bazaar home
              </Link>
            </div>

            <nav aria-labelledby="bazaar-error-categories" className="mt-8">
              <h2
                id="bazaar-error-categories"
                className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)"
              >
                Or start from a category
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {RECOVERY_CATEGORIES.map((category) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <li key={category.slug}>
                      <Link
                        href={`/bazaar/c/${category.slug}`}
                        className="flex items-center gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--background) px-3 py-2.5 text-sm font-semibold text-(--foreground) transition-colors hover:border-(--primary) hover:bg-(--muted)/40"
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--muted-foreground)">
              <Link href="/bazaar/categories" className="bzr-section-link">
                All 24 categories
              </Link>
              <Link href="/bazaar/cities" className="bzr-section-link">
                Browse by city
              </Link>
              <Link href="/bazaar/help" className="bzr-section-link">
                Help
              </Link>
            </p>

            {/* An opaque reference, not a message. Useful to quote, useless to
                leak. Next only sets `digest` for server-side errors. */}
            {error?.digest ? (
              <p className="mt-4 text-xs text-(--muted-foreground)">
                Reference <span className="font-mono">{error.digest}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
