"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Info, X } from "lucide-react";

import AdCard from "./AdCard";
import ActiveFilterChips from "./ActiveFilterChips";
import BrowseToolbar from "./BrowseToolbar";
import FilterRail from "./FilterRail";
import SaveSearchButton from "./SaveSearchButton";
import SkipToResults from "./SkipToResults";
import { EmptyState, Note, Pagination } from "./primitives";
import {
  computeFacetCounts,
  matchesFilters,
  prettifyQuery,
  readAttributeFilters,
  serializeRange,
  serializeSelectValues,
  toNumberOrNull,
} from "../data/filters";
import { getMarket } from "../data/market";
import { useLocale } from "../i18n/useLocale";

/**
 * The shared browse surface: filter rail + toolbar + grid + pagination.
 *
 * ---------------------------------------------------------------------------
 * Why the filter state lives in the URL and nowhere else
 * ---------------------------------------------------------------------------
 * Every filter, the sort and the page number are query-string parameters. The
 * filter controls below never hold "the current filters" in component state —
 * they read them back out of `useSearchParams()` and write them with
 * `router.push()`. That is what makes a filtered view linkable, shareable,
 * back-button-correct and (for the params a crawler actually follows)
 * crawlable. A `useState` filter rail would make `/bazaar/c/cars?fuel=Diesel`
 * mean nothing.
 *
 * ---------------------------------------------------------------------------
 * Two rendering modes, one component
 * ---------------------------------------------------------------------------
 * `result`   — the caller already ran the query on the server and hands over a
 *              `{ items, total, page, perPage, totalPages }` page. Used by
 *              /bazaar/search, which is `force-dynamic` and so can read
 *              `searchParams` on the server and query the whole corpus.
 * `listings` — the caller is a `force-static` page (category / subcategory) and
 *              therefore *cannot* read `searchParams` at all. It passes a
 *              bounded pool of that category's ads and this component does the
 *              filtering, sorting and paging in the browser.
 *
 * The static pages render the unfiltered first page as the Suspense fallback,
 * so the prerendered HTML still contains real listings for a crawler; this
 * component takes over once JS runs. A real backend would page mode 2 on the
 * server too and the `listings` prop would disappear.
 *
 * ---------------------------------------------------------------------------
 * Query-string contract
 * ---------------------------------------------------------------------------
 *   q         free text
 *   city      city slug
 *   locality  exact locality name (only meaningful with `city`)
 *   min,max   price bounds in rupees
 *   sort      one of SORT_OPTIONS' values
 *   page      1-based; omitted when 1
 *   category  category slug (search page only)
 *   <attrKey> one param per category attribute, named after the attribute's
 *             own `key`. Toggles carry the literal "true", ranges carry "lo-hi"
 *             with either side optionally empty ("2015-", "-2020"), and select
 *             attributes carry one *or more* comma-separated option strings —
 *             `?brand=Mahindra` still means exactly what it always meant, and
 *             `?brand=Mahindra,Tata` is the union of the two.
 *
 * The codec itself lives in `../data/filters` so the rail, the chip row and the
 * matcher share one implementation; see that file's header for why a comma is a
 * safe separator against this taxonomy.
 */

const PER_PAGE = 24;
const NO_ATTRIBUTES = [];

/**
 * Target for the "Skip to results" link. A constant rather than `useId()`
 * because it has to be a stable, quotable fragment — `/bazaar/c/cars#…` should
 * mean the same thing tomorrow — and because only one browse surface renders
 * per page, so there is nothing to collide with.
 */
const RESULTS_ID = "bazaar-results";

/**
 * Same selector the other Bazaar dialogs use (`ReportAdDialog`, `ShareSheet`,
 * `GalleryLightbox`) so the mobile filter sheet traps focus the same way they
 * do. Measured before this was added: 45 of 45 Tab presses inside the open
 * sheet landed on controls *behind* it — the sort select, the save-search chip
 * and every card in the grid — with the sheet still covering the screen.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------
 * Query-string codec
 * ---------------------------------------------------------------- */

// Re-exported because it was part of this module's surface before the codec
// moved out; `data/filters.js` is the definition.
export { toNumberOrNull };

/**
 * Money label for filter chips. Deliberately NOT `formatPrice` from
 * `data/listings` — importing that module would drag the whole corpus into
 * this client bundle. `data/market.js` is a few dozen bytes of config, so
 * symbol, grouping locale and symbol position still come from the one seam.
 * (No "Free" branch: a 0 bound here is a filter value, not a price.)
 */
function formatMoney(value) {
  const market = getMarket();
  const digits = Number(value).toLocaleString(market.numberLocale);
  return market.currencyDisplay === "symbol-first"
    ? `${market.currencySymbol}${digits}`
    : `${digits}${market.currencySymbol}`;
}

/**
 * Read the whole browse state out of the query string. Unknown params are
 * ignored, and an attribute param that does not belong to this category is
 * simply not read — so a stale link from another category degrades to the
 * unfiltered view rather than an empty one.
 *
 * `getAll` rather than `get` for the attribute params, so a repeated param
 * (`?brand=Tata&brand=Honda`) means the same thing as the comma form instead of
 * silently dropping everything after the first value.
 */
function readBrowseState(searchParams, attributes) {
  const attrs = readAttributeFilters((key) => searchParams.getAll(key), attributes);

  const page = toNumberOrNull(searchParams.get("page"));

  return {
    q: (searchParams.get("q") || "").trim(),
    city: searchParams.get("city") || "",
    locality: searchParams.get("locality") || "",
    min: toNumberOrNull(searchParams.get("min")),
    max: toNumberOrNull(searchParams.get("max")),
    sort: searchParams.get("sort") || "relevance",
    page: page && page >= 1 ? Math.floor(page) : 1,
    categorySlug: searchParams.get("category") || "",
    attrs,
  };
}

/* ------------------------------------------------------------------
 * Client-side query (mode 2 only)
 *
 * `matchesFilters` and the facet counter come from `../data/filters`, which is
 * deliberately a local re-implementation of the filter semantics in
 * `data/listings.js` rather than an import of it: importing that module into a
 * client component would ship the whole 720-ad generator (plus the taxonomy,
 * the city registry and the name pools) into the browser bundle. When the
 * corpus becomes a real API this code goes away, not the other way round.
 * ---------------------------------------------------------------- */

function sortListings(list, sort) {
  const out = [...list];
  switch (sort) {
    case "recent":
      return out.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    case "price-low":
      return out.sort((a, b) => a.price - b.price);
    case "price-high":
      return out.sort((a, b) => b.price - a.price);
    case "popular":
      return out.sort((a, b) => b.views - a.views);
    default:
      // Relevance: promoted first, then recency — the same ordering the server
      // uses, so a hydrated page does not reshuffle under the visitor.
      return out.sort((a, b) => {
        const promo =
          Number(b.spotlight) * 2 +
          Number(b.featured) -
          (Number(a.spotlight) * 2 + Number(a.featured));
        return promo || a.postedDaysAgo - b.postedDaysAgo;
      });
  }
}

/* ------------------------------------------------------------------
 * Active-filter chips
 *
 * One chip per *value*, not per key. With three brands selected, a buyer who
 * has changed their mind about one of them can drop just that one; a single
 * "Brand: Mahindra, Tata, Hyundai" chip would force them back into the rail to
 * undo a third of a filter.
 * ---------------------------------------------------------------- */

function buildChips({ state, attributes, cities, categoryOptions, tr }) {
  const chips = [];
  const { t } = tr;

  if (state.q) {
    chips.push({ id: "q", label: t("filter.chip.search", { q: state.q }), patch: { q: null } });
  }

  if (state.categorySlug && categoryOptions) {
    const found = categoryOptions.find((c) => c.slug === state.categorySlug);
    if (found) {
      chips.push({
        id: "category",
        label: tr.categoryName(found.slug, found.name),
        // Dropping the category must drop its attribute filters too, otherwise
        // the URL keeps params the new view cannot render or remove.
        patch: Object.fromEntries([
          ["category", null],
          ...attributes.map((attr) => [attr.key, null]),
        ]),
      });
    }
  }

  if (state.city) {
    const city = cities.find((c) => c.slug === state.city);
    chips.push({
      id: "city",
      label: city ? city.name : state.city,
      // Locality only means something inside a city.
      patch: { city: null, locality: null },
    });
  }

  if (state.locality) {
    chips.push({ id: "locality", label: state.locality, patch: { locality: null } });
  }

  if (state.min !== null || state.max !== null) {
    const low = state.min === null ? t("filter.any") : formatMoney(state.min);
    const high = state.max === null ? t("filter.any") : formatMoney(state.max);
    chips.push({
      id: "price",
      label: t("filter.chip.price", { low, high }),
      patch: { min: null, max: null },
    });
  }

  for (const attr of attributes) {
    const filter = state.attrs[attr.key];
    if (!filter) continue;

    // Label localises; the VALUE stays the URL param string ("Diesel"), so the
    // chip's patch keeps round-tripping through the codec untouched.
    const attrLabel = tr.attributeLabel(attr.key, attr.label);

    if (filter.type === "select") {
      for (const value of filter.values) {
        chips.push({
          id: `${attr.key}=${value}`,
          label: `${attrLabel}: ${value}`,
          // Removing one value re-serialises the rest; an empty selection
          // serialises to "" which `commit` treats as "delete the param".
          patch: {
            [attr.key]: serializeSelectValues(
              filter.values.filter((entry) => entry !== value),
            ),
          },
        });
      }
      continue;
    }

    let label = attrLabel;
    if (filter.type === "range") {
      const unit = attr.unit ? ` ${attr.unit}` : "";
      const low = filter.min === null ? t("filter.any") : filter.min.toLocaleString("en-IN");
      const high = filter.max === null ? t("filter.any") : filter.max.toLocaleString("en-IN");
      label = `${attrLabel}: ${low}–${high}${unit}`;
    }

    chips.push({ id: attr.key, label, patch: { [attr.key]: null } });
  }

  return chips;
}

/* ------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------- */

export default function BrowseView({
  listings = null,
  result = null,
  poolTotal = null,
  category = null,
  categoryOptions = null,
  cities = [],
  sortOptions = [],
  emptyTitle,
  emptyMessage,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tr = useLocale();
  const { t } = tr;
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef(null);
  const sheetTriggerRef = useRef(null);

  const attributes = category?.attributes || NO_ATTRIBUTES;
  const state = useMemo(
    () => readBrowseState(searchParams, attributes),
    [searchParams, attributes],
  );

  /**
   * Write a patch of params. `null` / `""` / `false` delete a param.
   * Any change other than paging resets to page 1 — landing on page 7 of a
   * result set that now has two pages is the classic filtered-listing bug.
   */
  const commit = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "" || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      if (!Object.hasOwn(patch, "page")) next.delete("page");
      const query = prettifyQuery(next.toString());
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const commitAttributeRange = useCallback(
    (key, min, max) => commit({ [key]: serializeRange(min, max) }),
    [commit],
  );

  /**
   * A whole select selection at once. `serializeSelectValues` sorts, so the same
   * set of ticked boxes always produces the same URL — which is what keeps a
   * saved search's derived id stable.
   */
  const commitAttributeSelect = useCallback(
    (key, values) => commit({ [key]: serializeSelectValues(values) }),
    [commit],
  );

  const clearAll = useCallback(() => {
    setSheetOpen(false);
    // Same reason as `closeSheet` below: this is one of the sheet's close
    // paths, so focus has to come back to the control that opened it.
    sheetTriggerRef.current?.focus();
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  /** Pagination must preserve every other param and only move `page`. */
  const buildHref = useCallback(
    (page) => {
      const next = new URLSearchParams(searchParams.toString());
      if (page <= 1) next.delete("page");
      else next.set("page", String(page));
      // Same spelling as `commit` produces, so paging never re-encodes the
      // commas in a multi-select param.
      const query = prettifyQuery(next.toString());
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  const view = useMemo(() => {
    if (result) return result;

    const pool = listings || [];
    const sorted = sortListings(
      pool.filter((listing) => matchesFilters(listing, state)),
      state.sort,
    );
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const page = Math.min(Math.max(1, state.page), totalPages);
    const start = (page - 1) * PER_PAGE;

    return {
      items: sorted.slice(start, start + PER_PAGE),
      total,
      page,
      perPage: PER_PAGE,
      totalPages,
    };
  }, [result, listings, state]);

  // `tr` is referentially stable per locale (memoised in useLocale), so this
  // recomputes exactly when the filters or the language change.
  const chips = useMemo(
    () => buildChips({ state, attributes, cities, categoryOptions, tr }),
    [state, attributes, cities, categoryOptions, tr],
  );

  /**
   * Per-option counts for the rail.
   *
   * Only mode 2 can produce them honestly: mode 1 (`/bazaar/search`) filtered on
   * the server and holds a single page of 24 results, so there is nothing to
   * count and `null` is the correct answer — the rail then draws no numbers
   * rather than made-up ones.
   *
   * Memoised on the pool and the parsed state. `state` also carries `sort` and
   * `page`, so sorting recounts once needlessly; at ~8 attributes × ≤96 ads that
   * is a few hundred comparisons, and deriving a narrower key would cost more
   * than the work it saves. What actually mattered was keeping the rail's own
   * option-search box in local state, so typing in it never reaches this memo.
   */
  const facets = useMemo(() => {
    if (result || !listings) return null;
    return computeFacetCounts({ pool: listings, attributes, state });
  }, [result, listings, attributes, state]);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    // Returning focus to the control that opened the sheet: without it, focus
    // falls back to <body> and the next Tab restarts from the top of the page.
    sheetTriggerRef.current?.focus();
  }, []);

  // Move focus into the sheet when it opens. It is `role="dialog"
  // aria-modal="true"`, so a screen reader will announce it as modal — leaving
  // focus outside makes that announcement a lie.
  useEffect(() => {
    if (!sheetOpen) return;
    const root = sheetRef.current;
    if (!root) return;
    const first = root.querySelector(FOCUSABLE);
    (first || root).focus();
  }, [sheetOpen]);

  // Escape closes the mobile filter sheet, Tab stays inside it, and the page
  // behind it must not scroll while it is open.
  useEffect(() => {
    if (!sheetOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== "Tab") return;

      const root = sheetRef.current;
      if (!root) return;

      // tabIndex >= 0 keeps anything the browser skips out of the boundary
      // calculation, otherwise "last" can be a stop Tab never reaches.
      const nodes = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (node) =>
          node.tabIndex >= 0 &&
          (node.offsetParent !== null || node === document.activeElement),
      );
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (!root.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpen, closeSheet]);

  const railProps = {
    state,
    attributes,
    priceBand: category?.priceBand || null,
    cities,
    categoryOptions,
    facets,
    onChange: commit,
    onAttributeRange: commitAttributeRange,
    onAttributeSelect: commitAttributeSelect,
  };

  const truncated =
    !result && typeof poolTotal === "number" && listings && poolTotal > listings.length;

  return (
    <>
      {/* First stop inside the browse surface, so the filter rail (41 focus
          stops on /bazaar/c/cars alone) can be bypassed. See
          SkipToResults.jsx for the measurements that justify it. */}
      <SkipToResults targetId={RESULTS_ID} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-7">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pe-1">
            <FilterRail idPrefix="rail" {...railProps} />
          </div>
        </aside>

        <div id={RESULTS_ID} tabIndex={-1} className="min-w-0 flex-1">
          {/* Every card title is an `h3`, and on the category / sub-category /
              search pages the only heading above them is the page `h1` — so the
              outline jumped h1 → h3 and a screen-reader user skimming by
              heading level got no "this is the results list" landmark at all.
              (Home and the detail page already have a visible `h2` above their
              card grids, which is why only these three pages were affected.)
              The heading is visually hidden rather than drawn, because the
              toolbar immediately below already states the count on screen and
              the card grid is deliberately quiet. */}
          <h2 className="sr-only">{t("section.results")}</h2>

          <BrowseToolbar
            total={view.total}
            page={view.page}
            perPage={view.perPage}
            sort={state.sort}
            sortOptions={sortOptions}
            activeCount={chips.length}
            onSortChange={(value) => commit({ sort: value === "relevance" ? null : value })}
            // The event carries the button that opened the sheet, so focus can
            // be handed back to it on close without the toolbar having to
            // forward a ref.
            onOpenFilters={(event) => {
              sheetTriggerRef.current = event?.currentTarget || null;
              setSheetOpen(true);
            }}
            saveSearch={
              <SaveSearchButton
                category={category}
                cities={cities}
                categoryOptions={categoryOptions}
              />
            }
          />

          <ActiveFilterChips chips={chips} onRemove={commit} onClearAll={clearAll} />

          {truncated ? (
            <div className="mb-4">
              <Note icon={Info}>
                {t("browse.truncated", {
                  shown: listings.length.toLocaleString("en-IN"),
                  total: poolTotal.toLocaleString("en-IN"),
                })}
              </Note>
            </div>
          ) : null}

          {view.items.length > 0 ? (
            <div className="bzr-grid">
              {view.items.map((listing, index) => (
                <AdCard key={listing.id} listing={listing} priority={index < 4} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={emptyTitle}
              message={emptyMessage}
              action={
                chips.length > 0 ? (
                  <button type="button" className="bzr-btn bzr-btn-secondary" onClick={clearAll}>
                    {t("filter.clearAllFilters")}
                  </button>
                ) : null
              }
            />
          )}

          <Pagination page={view.page} totalPages={view.totalPages} buildHref={buildHref} />
        </div>
      </div>

      {sheetOpen ? (
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("filter.heading")}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex flex-col bg-(--background) lg:hidden"
        >
          <div className="flex items-center justify-between gap-3 border-b border-(--border) px-4 py-3">
            <h2 className="text-base font-semibold text-(--foreground)">{t("filter.heading")}</h2>
            <button
              type="button"
              className="bzr-chip"
              onClick={closeSheet}
              aria-label={t("filter.close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <FilterRail idPrefix="sheet" {...railProps} />
          </div>

          <div className="flex items-center gap-3 border-t border-(--border) px-4 py-3">
            <button type="button" className="bzr-btn bzr-btn-secondary flex-1" onClick={clearAll}>
              {t("filter.clearAll")}
            </button>
            <button type="button" className="bzr-btn flex-1" onClick={closeSheet}>
              {t("filter.showCount", { count: view.total.toLocaleString("en-IN") })}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
