import Link from "next/link";
import { Suspense } from "react";
import { Compass, SearchCheck } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import BrowseView from "../components/BrowseView";
import { Breadcrumbs, Note } from "../components/primitives";
import { getAllCategories, getCategory } from "../data/categories";
import { getAllCities, getCity } from "../data/cities";
import { matchesAttributeFilter, parseSelectValues } from "../data/filters";
import {
  LISTING_COUNT,
  SORT_OPTIONS,
  getCategoryCounts,
  queryListings,
} from "../data/listings";
import { getMarket } from "../data/market";
import { closestCategories, dropOneWordQueries, parseQuery } from "../data/search";

/**
 * Search results — /bazaar/search
 *
 * The only browse surface that is dynamic. It reads arbitrary `searchParams`,
 * so it cannot be `force-static`, and it must not be indexed either: an
 * open-ended filter surface generates an unbounded set of near-identical URLs,
 * which is exactly the doorway-page pattern crawlers penalise. The category
 * and subcategory pages carry the indexable version of the same inventory.
 *
 * Because this page runs per request it can query the whole corpus on the
 * server and hand <BrowseView> a finished result page, rather than shipping a
 * pool of ads to the browser the way the static pages have to.
 */

export const dynamic = "force-dynamic";

const PER_PAGE = 24;

/** searchParams values are `string | string[] | undefined`. */
function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function toNumberOrNull(raw) {
  const text = String(first(raw) ?? "").trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function parseRangeParam(raw) {
  const text = String(first(raw) ?? "");
  if (!text) return { min: null, max: null };
  const split = text.indexOf("-");
  if (split < 0) return { min: toNumberOrNull(text), max: null };
  return {
    min: toNumberOrNull(text.slice(0, split)),
    max: toNumberOrNull(text.slice(split + 1)),
  };
}

/**
 * Turn the query string into a query.
 *
 * `queryListings` only does exact matching on attributes, so two shapes are
 * pulled out here and applied after the fact:
 *
 *   ranges  `?year=2015-2020`
 *   unions  `?brand=Mahindra,Tata` — a select attribute with more than one value
 *
 * Both keep this page's semantics identical to the client-side path in
 * <BrowseView>, which matters because the two render the same URLs: a
 * multi-select built in the filter rail here must not come back empty just
 * because the server was the one that ran the query. The parsing and the
 * matching both come from `data/filters.js`, the shared codec.
 *
 * A select param with exactly one value still goes through `queryListings`'
 * `attributes` fast path, so every link that worked before this file learned
 * about unions takes the identical code path it always did.
 */
function readSearchState(searchParams, category) {
  const exact = {};
  const ranges = [];
  const unions = [];

  for (const attr of category?.attributes || []) {
    const raw = first(searchParams[attr.key]);

    if (attr.type === "range") {
      if (!raw) continue;
      const range = parseRangeParam(raw);
      if (range.min !== null || range.max !== null) ranges.push({ key: attr.key, ...range });
    } else if (attr.type === "toggle") {
      if (raw === "true") exact[attr.key] = true;
    } else {
      const values = parseSelectValues(searchParams[attr.key]);
      if (values.length === 1) exact[attr.key] = values[0];
      else if (values.length > 1) unions.push({ key: attr.key, type: "select", values });
    }
  }

  const page = toNumberOrNull(searchParams.page);

  return {
    q: String(first(searchParams.q) || "").trim(),
    city: String(first(searchParams.city) || ""),
    locality: String(first(searchParams.locality) || ""),
    min: toNumberOrNull(searchParams.min),
    max: toNumberOrNull(searchParams.max),
    sort: String(first(searchParams.sort) || "relevance"),
    page: page && page >= 1 ? Math.floor(page) : 1,
    exact,
    ranges,
    unions,
  };
}

function matchesRanges(listing, ranges) {
  for (const range of ranges) {
    const value = Number(listing.attributes?.[range.key]);
    if (!Number.isFinite(value)) return false;
    if (range.min !== null && value < range.min) return false;
    if (range.max !== null && value > range.max) return false;
  }
  return true;
}

function matchesUnions(listing, unions) {
  return unions.every((union) => matchesAttributeFilter(listing, union.key, union));
}

/**
 * Rebuild this page's own URL with some params changed.
 *
 * Recovery links have to be real URLs into this same surface, so that following
 * one lands on a page that shows the count the link promised. `page` is always
 * dropped: a relaxed query has a different number of pages, and landing on page
 * 7 of a two-page result is the classic filtered-listing bug.
 */
function buildSearchHref(searchParams, patch) {
  const params = new URLSearchParams();

  for (const [key, raw] of Object.entries(searchParams || {})) {
    if (key === "page") continue;
    const value = first(raw);
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === "") params.delete(key);
    else params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `/bazaar/search?${query}` : "/bazaar/search";
}

/** One row in the recovery panel: a real destination and a real count. */
function RecoveryRow({ href, label, count, note }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-(--secondary-bg)"
      >
        <span className="min-w-0 text-(--foreground)">
          {label}
          {note ? <span className="ms-1.5 text-xs text-(--muted-foreground)">{note}</span> : null}
        </span>
        <span className="shrink-0 text-xs font-semibold text-(--muted-foreground)">
          {count.toLocaleString("en-IN")} ad{count === 1 ? "" : "s"}
        </span>
      </Link>
    </li>
  );
}

function RecoveryBlock({ title, children }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
        {title}
      </h3>
      <ul className="-mx-2">{children}</ul>
    </div>
  );
}

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const q = String(first(sp?.q) || "").trim();

  return createPageMetadata({
    title: q ? `${q} - Search AltF Bazaar` : "Search Classified Ads - AltF Bazaar",
    description: q
      ? `Ads matching ${q} on AltF Bazaar. Filter by city, price, category and condition.`
      : "Search classified ads across 24 categories and 50 Indian cities on AltF Bazaar.",
    path: "/bazaar/search",
    // Arbitrary filter permutations must not enter the index; the category and
    // subcategory pages are the crawlable version of this inventory.
    noindex: true,
  });
}

export default async function BazaarSearchPage({ searchParams }) {
  const sp = await searchParams;

  const categorySlug = String(first(sp?.category) || "");
  const category = categorySlug ? getCategory(categorySlug) : null;
  const state = readSearchState(sp || {}, category);

  // Parse the free text ONCE. Every count on this page runs the same query
  // with one thing changed, and re-parsing (which walks the term index for any
  // token it does not recognise) 30 times for one request would be waste.
  const parsed = state.q ? parseQuery(state.q) : null;

  const baseQuery = {
    parsedQuery: parsed || undefined,
    city: state.city || undefined,
    locality: state.locality || undefined,
    minPrice: state.min ?? undefined,
    maxPrice: state.max ?? undefined,
  };

  /**
   * The full pipeline — `queryListings` plus the range and union attribute
   * filters it cannot express — with any part overridden.
   *
   * Every number the recovery panel shows comes through here, so "12 results
   * across all India" is the count of the page that link actually opens rather
   * than an estimate.
   */
  function runQuery(overrides = {}) {
    const ranges = overrides.ranges ?? state.ranges;
    const unions = overrides.unions ?? state.unions;
    return queryListings({
      ...baseQuery,
      category: category?.slug,
      attributes: state.exact,
      sort: state.sort,
      page: 1,
      perPage: LISTING_COUNT,
      ...overrides,
    })
      .items.filter((listing) => matchesRanges(listing, ranges))
      .filter((listing) => matchesUnions(listing, unions));
  }

  // Pull every match in sort order, apply the range attributes, then page.
  // `queryListings` sorts before it slices, so ordering survives the filter.
  const matched = runQuery();

  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, state.page), totalPages);
  const start = (page - 1) * PER_PAGE;
  const result = {
    items: matched.slice(start, start + PER_PAGE),
    total,
    page,
    perPage: PER_PAGE,
    totalPages,
  };

  // Live counts per category, honouring the query and the location/price
  // filters but not the attribute filters (those belong to one category).
  const categoryOptions = getAllCategories().map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    count: queryListings({ ...baseQuery, category: entry.slug, perPage: 1 }).total,
  }));

  const cities = getAllCities().map(({ slug, name, localities }) => ({
    slug,
    name,
    localities,
  }));

  /* ----------------------------------------------------------------
   * Zero-result recovery
   *
   * An empty result set used to be the end of the road: one line of "try a
   * shorter search term" and no way forward. Everything below is computed
   * against the real corpus — a recovery panel that guesses at counts is worse
   * than none, because the visitor follows the promise and finds it broken.
   *
   * Only built when there is nothing to show, so a successful search pays
   * none of it.
   * -------------------------------------------------------------- */
  const activeFilters =
    Boolean(category) ||
    Boolean(state.city) ||
    Boolean(state.locality) ||
    state.min !== null ||
    state.max !== null ||
    Object.keys(state.exact).length > 0 ||
    state.ranges.length > 0 ||
    state.unions.length > 0;

  let recovery = null;

  if (total === 0) {
    const city = state.city ? getCity(state.city) : null;

    // Same words, no city. The single most common reason a real search comes
    // back empty is that the inventory exists one city over.
    const withoutCity =
      state.city || state.locality
        ? runQuery({ city: undefined, locality: undefined }).length
        : null;

    // Same words, nothing else at all.
    const wordsOnly =
      state.q && activeFilters
        ? runQuery({
            city: undefined,
            locality: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            category: undefined,
            attributes: undefined,
            ranges: [],
            unions: [],
          }).length
        : null;

    // One word fewer, everything else untouched.
    const relaxations = dropOneWordQueries(state.q)
      .map((variant) => ({
        ...variant,
        count: runQuery({ parsedQuery: parseQuery(variant.query) }).length,
      }))
      .filter((variant) => variant.count > 0)
      .sort((a, b) => b.count - a.count);

    // Categories whose own NAME resembles the query. When a search matches
    // nothing there is no inventory signal left to rank by, so this is the only
    // honest one — and each is paired with that category's real total.
    const named = closestCategories(state.q, 6)
      .map((entry) => ({
        ...entry,
        count: queryListings({
          category: entry.slug,
          subcategory: entry.subcategorySlug || undefined,
          perPage: 1,
        }).total,
      }))
      // A name can resemble the query and still hold nothing. Offering it as a
      // way out of an empty page is offering a second empty page.
      .filter((entry) => entry.count > 0)
      .slice(0, 4);

    // Nothing resembled a category name ("red honda"). Fall back to where the
    // best surviving word actually lives, tallied from one pass over its
    // matches rather than 24 more queries.
    let byInventory = [];
    if (named.length === 0 && relaxations.length > 0) {
      const best = relaxations[0];
      const tally = new Map();
      for (const listing of runQuery({ parsedQuery: parseQuery(best.query) })) {
        const entry = tally.get(listing.categorySlug);
        if (entry) entry.count += 1;
        else tally.set(listing.categorySlug, { name: listing.categoryName, count: 1 });
      }
      byInventory = [...tally.entries()]
        .map(([slug, entry]) => ({ slug, ...entry, query: best.query }))
        .sort((a, b) => b.count - a.count || (a.name < b.name ? -1 : 1))
        .slice(0, 4);
    }

    const counts = getCategoryCounts();
    const popular = getAllCategories()
      .slice(0, 6)
      .map((entry) => ({ ...entry, count: counts.get(entry.slug) || 0 }));

    recovery = { city, withoutCity, wordsOnly, relaxations, named, byInventory, popular };
  }

  const heading = state.q ? `Search results for ${state.q}` : "Browse every ad";
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "AltF Bazaar", path: "/bazaar" },
    { name: state.q ? `Search: ${state.q}` : "Search", path: "/bazaar/search" },
  ];

  return (
    <>
      <JsonLd
        id="bazaar-search"
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path: "/bazaar/search",
            name: "Search AltF Bazaar",
            description: "Search classified ads across every AltF Bazaar category and city.",
          }),
        ]}
      />

      <BazaarShell query={state.q}>
        <div className="section-container px-4 pb-16 sm:px-6">
          <Breadcrumbs items={crumbs} />

          <header className="mb-5">
            <h1 className="text-2xl font-bold text-(--foreground) sm:text-3xl">{heading}</h1>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {total.toLocaleString("en-IN")} ad{total === 1 ? "" : "s"}
              {category ? ` in ${category.name}` : ""}
              {state.q ? "" : " across every category"}.
            </p>
          </header>

          {/* Correcting a query silently is worse than not correcting it: the
              visitor cannot tell whether we have no iPhones or whether they
              mistyped. Say it, above the results, in both the hit and the miss
              case. */}
          {parsed?.corrections.length ? (
            <div className="mb-4">
              <Note icon={SearchCheck}>
                Showing results for{" "}
                <strong className="font-semibold text-(--foreground)">
                  {parsed.correctedQuery}
                </strong>
                {parsed.corrections.length === 1 ? (
                  <> — “{parsed.corrections[0].from}” matched no ad on its own.</>
                ) : (
                  <> — no ad matched what was typed exactly.</>
                )}
              </Note>
            </div>
          ) : null}

          <Suspense fallback={null}>
            <BrowseView
              result={result}
              category={category}
              categoryOptions={categoryOptions}
              cities={cities}
              sortOptions={SORT_OPTIONS}
              emptyTitle={
                state.q ? `No ads match ${state.q}` : "No ads match those filters"
              }
              emptyMessage={
                recovery ? "Everything below is a way out of this." : "Try a wider price range."
              }
            />
          </Suspense>

          {recovery ? (
            <section
              aria-labelledby="bazaar-search-recovery"
              className="mt-6 rounded-xl border border-(--border) bg-(--card) p-4 sm:p-5"
            >
              <h2
                id="bazaar-search-recovery"
                className="flex items-center gap-2 text-base font-semibold text-(--foreground)"
              >
                <Compass className="h-4 w-4 opacity-70" aria-hidden="true" />
                Where to go from here
              </h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                Every count below was measured against the live corpus, not estimated.
              </p>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {recovery.withoutCity ? (
                  <RecoveryBlock title="Widen the location">
                    <RecoveryRow
                      href={buildSearchHref(sp, { city: null, locality: null })}
                      label={`${state.q || "These filters"} across all ${getMarket().countryName}`}
                      note={recovery.city ? `instead of ${recovery.city.name}` : null}
                      count={recovery.withoutCity}
                    />
                  </RecoveryBlock>
                ) : null}

                {/* Suppressed when the city WAS the only filter, or this block
                    and the one above show the same number twice. */}
                {recovery.wordsOnly && recovery.wordsOnly !== recovery.withoutCity ? (
                  <RecoveryBlock title="Drop the filters">
                    <RecoveryRow
                      href={`/bazaar/search?q=${encodeURIComponent(state.q)}`}
                      label={`“${state.q}” with no filters at all`}
                      count={recovery.wordsOnly}
                    />
                  </RecoveryBlock>
                ) : null}

                {recovery.relaxations.length > 0 ? (
                  <RecoveryBlock title="One word fewer">
                    {recovery.relaxations.map((variant) => (
                      <RecoveryRow
                        key={variant.query}
                        href={buildSearchHref(sp, { q: variant.query })}
                        label={`“${variant.query}”`}
                        note={`without “${variant.dropped}”`}
                        count={variant.count}
                      />
                    ))}
                  </RecoveryBlock>
                ) : null}

                {recovery.named.length > 0 ? (
                  <RecoveryBlock title="Closest categories">
                    {recovery.named.map((entry) => (
                      <RecoveryRow
                        key={entry.href}
                        href={entry.href}
                        label={entry.subcategoryName || entry.name}
                        note={entry.subcategoryName ? `in ${entry.name}` : null}
                        count={entry.count}
                      />
                    ))}
                  </RecoveryBlock>
                ) : null}

                {recovery.byInventory.length > 0 ? (
                  <RecoveryBlock title="Closest categories">
                    {recovery.byInventory.map((entry) => (
                      <RecoveryRow
                        key={entry.slug}
                        href={buildSearchHref(sp, {
                          q: entry.query,
                          category: entry.slug,
                        })}
                        label={entry.name}
                        note={`matching “${entry.query}”`}
                        count={entry.count}
                      />
                    ))}
                  </RecoveryBlock>
                ) : null}

                <RecoveryBlock title="Popular categories">
                  {recovery.popular.map((entry) => (
                    <RecoveryRow
                      key={entry.slug}
                      href={`/bazaar/c/${entry.slug}`}
                      label={entry.name}
                      count={entry.count}
                    />
                  ))}
                </RecoveryBlock>
              </div>
            </section>
          ) : null}
        </div>
      </BazaarShell>
    </>
  );
}
