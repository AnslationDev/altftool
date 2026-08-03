"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import RankedItem from "./RankedItem";
import { RankedListSkeleton } from "@/components/ui/skeleton";
import { safeExternalUrl } from "@/lib/top10/safeExternalUrl";

// Every product (books, music, food, places, and whatever's
// added next) stops accumulating after this many items per category or
// search — this is a "Top 10" site, so each ranked list caps at 10, not
// an arbitrary longer list.
const MAX_ITEMS = 10;

// Shown when a route reports `unavailable` without a reason of its own.
const DEFAULT_UNAVAILABLE_MESSAGE = "This list has no live data source connected right now.";

/**
 * One category tile — image, title, and a 2-line description. Same
 * "poster left, text right" shape as RankedItem so every card on the
 * page reads identically.
 */
function CategoryCard({ category, onClick }) {
  const [failed, setFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const safeImage = safeExternalUrl(category.image);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className="group flex w-80 shrink-0 items-center gap-4 overflow-hidden rounded-lg border border-(--border) bg-(--card) p-3.5 text-left shadow-sm cursor-pointer focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-(--muted)">
        {!safeImage || failed ? (
          <div className="flex h-full w-full items-center justify-center text-(--muted-foreground)">
            <ImageOff className="h-6 w-6" />
          </div>
        ) : (
          <Image
            src={safeImage}
            alt={category.label}
            fill
            unoptimized
            sizes="96px"
            className="object-cover transition-transform duration-150 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            onError={() => setFailed(true)}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-lg font-extrabold text-(--primary-text) font-primary leading-tight transition-colors group-hover:text-(--primary-hover)">
          {category.label}
        </p>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-(--muted-foreground) font-secondary">
          {category.description || `Explore up to ten provider-sourced ${category.label.toLowerCase()} picks.`}
        </p>
      </div>
    </motion.button>
  );
}

// Reference-image "related list" card count — a short, focused rail,
// not every other product in the registry.
const RELATED_PRODUCTS_LIMIT = 5;

/**
 * One sidebar row, matching the reference "Top Remixes" layout: a
 * square thumbnail on the left; on the right, up to 3 real item titles
 * from that product stacked as link-styled lines, then a small
 * icon+name attribution row underneath (standing in for the reference's
 * avatar+username — we don't have user-submitted lists to attribute to,
 * so the product's own icon/name fills that slot honestly).
 */
function RelatedProductRow({ product, onSelect, index, scrollTriggered = false }) {
  const [failed, setFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const RelIcon = product.icon;
  const safeImage = safeExternalUrl(product.previewImage);
  const showImage = safeImage && !failed;
  // Sidebar (scrollTriggered=false): always right-to-left, animates once
  // on mount. Grid (scrollTriggered=true): alternates left/right by
  // position and only plays once this section actually scrolls into view.
  const fromLeft = scrollTriggered && index % 2 === 0;
  const offsetX = fromLeft ? -40 : 40;
  const motionProps = shouldReduceMotion
    ? { initial: false }
    : scrollTriggered
    ? {
        initial: { opacity: 0, x: offsetX },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.45, delay: (index % 3) * 0.12, ease: "easeOut" },
      }
    : {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4, delay: 0.35 + index * 0.12, ease: "easeOut" },
      };

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(product.categoryId)}
      {...motionProps}
      className="group flex w-full items-start gap-4 text-left cursor-pointer focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-(--muted)">
        {showImage ? (
          <Image
            src={safeImage}
            alt={product.title}
            fill
            unoptimized
            sizes="80px"
            className="object-cover transition-transform duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-(--primary)/20 to-(--secondary)/20 text-(--primary-text)">
            <RelIcon className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-base font-bold text-(--primary-text) font-secondary leading-snug transition-colors group-hover:text-(--primary-hover) group-hover:underline">
          {product.previewHeadline || product.title}
        </p>
        {product.previewDescription && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-(--muted-foreground) font-secondary">
            {product.previewDescription}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary)/15 text-(--primary-text)">
            <RelIcon className="h-3 w-3" />
          </span>
          {/* "Ranked by you" was on every one of these cards. Nothing on this
              site collects a visitor ranking of anything — the lists come from
              each provider's own ordering. The category name alone is true. */}
          <span className="truncate text-xs text-(--muted-foreground) font-secondary">{product.title}</span>
        </div>
      </div>
    </motion.button>
  );
}

/** Fisher-Yates — used to vary which related products surface each time. */
function deterministicShuffle(arr, seedText) {
  const a = [...arr];
  let seed = 2166136261;
  for (const character of String(seedText)) {
    seed ^= character.codePointAt(0);
    seed = Math.imul(seed, 16777619);
  }

  const nextRandom = () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sidebar of other products, shown beside the ranked list — a real,
 * vertically breathing image list (not a compact bordered card row).
 * Only products with a real preview photo are eligible (no icon-tile
 * placeholders here), and which 5 show up is reshuffled every time the
 * active product/section changes — not the same static list every time.
 * Clicking an entry hands off to the same category-select handler the
 * hero chips use, so it jumps straight to that product's own category grid.
 */
export function RelatedProductsSidebar({ products, onSelect, sectionKey }) {
  const shown = useMemo(() => {
    const withImages = products.filter((p) => p.previewImage);
    return deterministicShuffle(withImages, `sidebar:${sectionKey}`).slice(0, RELATED_PRODUCTS_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle only when the active section changes, not on every re-render
  }, [sectionKey]);

  if (!shown.length) return null;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <p className="mb-4 text-xs font-bold tracking-widest text-(--primary-text) font-secondary uppercase">
        Explore Other Top 10s
      </p>
      <div className="flex flex-col gap-6">
        {shown.map((product, index) => (
          <RelatedProductRow key={product.key} product={product} onSelect={onSelect} index={index} />
        ))}
      </div>
    </aside>
  );
}

// A bigger pool below the ranked list — the sidebar's own 5 stay put,
// this is a separate, wider "more lists" grid underneath.
const MORE_GRID_LIMIT = 12;

/**
 * Full-width "Top 10 {title}" card grid shown after the ranked list
 * finishes — same reference layout as the sidebar rows (image + title +
 * icon/name caption), just arranged 3-up instead of stacked in a rail.
 */
export function MoreTop10sGrid({ products, onSelect, sectionKey }) {
  const shown = useMemo(() => {
    const withImages = products.filter((p) => p.previewImage);
    return deterministicShuffle(withImages, `grid:${sectionKey}`).slice(0, MORE_GRID_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle only when the active section changes, not on every re-render
  }, [sectionKey]);

  if (!shown.length) return null;

  return (
    <div className="mt-12 border-t border-(--border) pt-8">
      <p className="mb-5 text-xs font-bold tracking-widest text-(--primary-text) font-secondary uppercase">
        More Top 10 Lists
      </p>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((product, index) => (
          <RelatedProductRow
            key={product.key}
            product={product}
            onSelect={onSelect}
            index={index}
            scrollTriggered
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Generic "browse by category" media section — category grid first, then
 * the top 10 items within whichever category is picked. Built once here
 * and configured per provider (books via OpenLibrary subjects and
 * whatever comes next) purely through props —
 * no provider-specific logic lives in this file.
 *
 * @param {{
 *   id: string,                                   // section anchor id
 *   title: string,
 *   icon: React.ComponentType,
 *   searchQuery?: string,                          // bypasses categories with a real search when set
 *   categoriesEndpoint: string,                     // GET -> { [categoriesResponseKey]: [{id,label}] }
 *   categoriesResponseKey: string,
 *   itemsEndpointForCategory: (categoryId: string, page: number) => string,
 *   searchEndpoint: (query: string, page: number) => string,
 *   itemsResponseKey: string,                       // e.g. "books" | "music"
 *   mapItemToCard: (item: object, index: number) => object, // -> RankedItem props
 *   loadingLabel: string,
 *   errorLabel: string,
 *   emptyLabel: string,
 *   onDebugData?: (data: object, url: string) => void, // optional — fires with the raw API response for every items fetch, opt-in per section
 *   fallbackItems?: object[],                      // optional — real, hand-curated items (same raw shape mapItemToCard expects) shown instead of an error when a live category/items fetch fails
 *   relatedProducts?: object[],                    // optional — other PRODUCT_REGISTRY entries, offered as a "browse something else" sidebar next to the ranked list
 *   onSelectRelated?: (categoryId: string) => void, // fires when a sidebar entry is clicked
 * }} props
 */
export default function CategoryMediaSection({
  id,
  title,
  icon: Icon,
  searchQuery = "",
  categoriesEndpoint,
  categoriesResponseKey,
  itemsEndpointForCategory,
  searchEndpoint,
  itemsResponseKey,
  mapItemToCard,
  loadingLabel,
  errorLabel,
  emptyLabel,
  onDebugData,
  fallbackItems,
  relatedProducts = [],
  onSelectRelated = () => {},
  onSearchStatus = () => {},
}) {
  const [view, setView] = useState(searchQuery ? "items" : "categories");
  const [categories, setCategories] = useState([]);
  const [categoriesStatus, setCategoriesStatus] = useState("loading");
  const [activeCategory, setActiveCategory] = useState(null);
  // Accumulates across pages as the user scrolls, capped at MAX_ITEMS.
  const [items, setItems] = useState([]);
  const [itemsStatus, setItemsStatus] = useState("idle");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Set when the route answers `unavailable: true` — the provider behind
  // this section has no credentials on this deployment. Distinct from an
  // error on purpose: nothing is broken and a retry will not help, so the
  // section says so plainly instead of showing a red failure box, and
  // never substitutes cached or invented rows for the live list.
  const [unavailableMessage, setUnavailableMessage] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const requestIdRef = useRef(0);
  const sentinelRef = useRef(null);
  // Cancels the section's own in-flight fetch the moment it's superseded
  // (a new search term, a new category click, or the section unmounting
  // because the user navigated away) — so switching away from a search
  // doesn't leave 38 other products' requests still running in the
  // background for no reason.
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  // Capped at MAX_ITEMS regardless of what the provider's hasMore says.
  const canLoadMore = hasMore && items.length < MAX_ITEMS;

  /** Real, hand-curated items (not fabricated) shown in place of an error when a live fetch fails. */
  function showFallbackItems() {
    if (!fallbackItems?.length) return false;
    setView("items");
    setItems(fallbackItems.map((item, index) => ({ ...item, id: item.id ?? `fallback-${index}` })));
    setHasMore(false);
    setItemsStatus("ok");
    setUsingFallback(true);
    return true;
  }

  // Load the category grid once (skip entirely while a search is active).
  useEffect(() => {
    if (searchQuery) return;
    const controller = new AbortController();

    fetch(categoriesEndpoint, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.unavailable) {
          setCategoriesStatus("unavailable");
          setCategories([]);
          setUnavailableMessage(data.unavailableMessage || DEFAULT_UNAVAILABLE_MESSAGE);
        } else if (data.error) {
          setCategoriesStatus("ok");
          setCategories([]);
          if (!showFallbackItems()) {
            setCategoriesStatus("error");
            setErrorMessage(data.error);
          }
        } else {
          setCategoriesStatus("ok");
          setCategories(data[categoriesResponseKey] || []);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (!showFallbackItems()) {
          setCategoriesStatus("error");
          setErrorMessage(err.message);
        }
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- endpoint/key are static per section instance
  }, []);

  // A new search query always wins — jump straight to the items view.
  useEffect(() => {
    if (!searchQuery) return;
    const startSearch = window.setTimeout(() => {
      setView("items");
      setActiveCategory(null);
      onSearchStatus(id, { loading: true, count: 0 });
      loadItems((p) => searchEndpoint(searchQuery, p), 1, { append: false });
    }, 0);

    return () => window.clearTimeout(startSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // `append: false` replaces the list (new category/search); `append:
  // true` is the infinite-scroll case — adds the next page to what's
  // already loaded. requestIdRef guards against a stale response landing
  // after the user has already switched category/search again; the
  // AbortController on top of that actually cancels the previous
  // in-flight network request instead of just ignoring its result.
  function loadItems(urlForPage, pageNumber, { append }) {
    const requestId = ++requestIdRef.current;
    if (!append) abortControllerRef.current?.abort();
    const controller = new AbortController();
    if (!append) abortControllerRef.current = controller;

    if (append) setLoadingMore(true);
    else setItemsStatus("loading");

    const url = urlForPage(pageNumber);
    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        onDebugData?.(data, url);
        // Checked before `error` and before any fallback: an unconfigured
        // provider is not a failed request, and swapping in cached rows
        // would present them as this list's live data.
        if (data.unavailable) {
          setItemsStatus("unavailable");
          setItems([]);
          setHasMore(false);
          setUnavailableMessage(data.unavailableMessage || DEFAULT_UNAVAILABLE_MESSAGE);
          if (append) setLoadingMore(false);
          if (searchQuery) onSearchStatus(id, { loading: false, count: 0 });
          return;
        }
        if (data.error) {
          if (append) {
            setLoadingMore(false);
            // Category browse only — during search, a live failure just means
            // "no real match" (the section hides), never a full unrelated
            // fallback list mislabeled as if it matched the search term.
          } else if (!searchQuery && showFallbackItems()) {
            // handled inside showFallbackItems()
          } else {
            setItemsStatus("error");
            setErrorMessage(data.error);
            setItems([]);
            if (searchQuery) onSearchStatus(id, { loading: false, count: 0 });
          }
          return;
        }

        // Search results show exactly what's real — however many that is.
        // Padding a thin match with this product's unrelated top-10 items
        // (e.g. "Atomic Habits" under a "Books for 'AI tools'" heading)
        // reads as misleading, not helpful, so genuine relevance always
        // wins over hitting a target count.
        const newItems = data[itemsResponseKey] || [];
        setUsingFallback(false);
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasMore(Boolean(data.hasMore));
        setPage(pageNumber);
        if (append) setLoadingMore(false);
        else {
          setItemsStatus("ok");
          // Cap at MAX_ITEMS so the page's "N results" header matches what's actually shown.
          if (searchQuery) onSearchStatus(id, { loading: false, count: Math.min(newItems.length, MAX_ITEMS) });
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (requestId !== requestIdRef.current) return;
        if (append) {
          setLoadingMore(false);
        } else if (!searchQuery && showFallbackItems()) {
          // handled inside showFallbackItems()
        } else {
          setItemsStatus("error");
          setErrorMessage(err.message);
          if (searchQuery) onSearchStatus(id, { loading: false, count: 0 });
        }
      });
  }

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setView("items");
    setItems([]);
    setHasMore(false);
    setUsingFallback(false);
    loadItems((p) => itemsEndpointForCategory(category.id, p), 1, { append: false });
  };

  const handleBack = () => {
    setView("categories");
    setActiveCategory(null);
    setItems([]);
    setItemsStatus("idle");
    setHasMore(false);
    setPage(1);
    setUsingFallback(false);
  };

  // Infinite scroll — a sentinel at the bottom of the list triggers the
  // next page once it comes into view, as long as one isn't already
  // in flight and the provider says there's more to load.
  useEffect(() => {
    if (view !== "items" || itemsStatus !== "ok" || !canLoadMore || loadingMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const urlForNextPage = searchQuery
      ? (p) => searchEndpoint(searchQuery, p)
      : activeCategory
        ? (p) => itemsEndpointForCategory(activeCategory.id, p)
        : null;
    if (!urlForNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadItems(urlForNextPage, page + 1, { append: true });
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, itemsStatus, canLoadMore, loadingMore, page, searchQuery, activeCategory]);

  // Search mode: only render this product if it actually has matching
  // results. While it's still fetching, or if it came back empty (or
  // errored), render nothing — so a search shows ONLY the related
  // products with their heading + items, never every other category
  // sitting there with a "not found" box. (Category-browse mode is
  // unaffected — this guard only applies when a search is active.)
  if (searchQuery && (itemsStatus !== "ok" || items.length === 0)) {
    return null;
  }

  return (
    <section id={id} className="section scroll-mt-24 focus:outline-none" tabIndex={-1}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="section-title text-left! mb-0! flex items-center gap-2">
          <Icon className="h-6 w-6 text-(--primary-text)" />
          {/* During a search the heading is dynamic — it names the category
              AND the term searched, e.g. "Books for “habits”". */}
          {searchQuery ? (
            <span>
              {title} <span className="text-(--muted-foreground) font-normal">for</span> &ldquo;{searchQuery}&rdquo;
            </span>
          ) : (
            title
          )}
        </h2>

        {view === "items" && (
          <button
            type="button"
            onClick={handleBack}
            disabled={!!searchQuery}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-(--border) bg-(--muted) px-3.5 py-1.5 text-xs font-semibold text-(--foreground) font-secondary transition-colors hover:text-(--primary-text) disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {searchQuery ? "Search results" : "Categories"}
          </button>
        )}
      </div>

      {view === "categories" && (
        <>
          {categoriesStatus === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
              <Loader2 className="h-8 w-8 animate-spin text-(--primary)" />
              <p className="text-sm text-(--muted-foreground) font-secondary">Loading categories...</p>
            </div>
          )}

          {categoriesStatus === "error" && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-(--border) py-16 text-center">
              <p className="font-semibold text-(--foreground) font-primary">Couldn&rsquo;t load categories</p>
              <p className="max-w-sm text-sm text-(--muted-foreground) font-secondary">{errorMessage}</p>
            </div>
          )}

          {/* Not an error state: the provider simply is not connected here.
              Says so, and shows nothing else — no stand-in rows. */}
          {categoriesStatus === "unavailable" && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-(--border) py-16 text-center">
              <p className="font-semibold text-(--foreground) font-primary">No live data for {title} yet</p>
              <p className="max-w-sm text-sm text-(--muted-foreground) font-secondary">{unavailableMessage}</p>
            </div>
          )}

          {categoriesStatus === "ok" && categories.length > 0 && (
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex w-max gap-4 pb-2">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category)}
                  />
                ))}
              </div>
            </div>
          )}

          {categoriesStatus === "ok" && categories.length === 0 && (
            <p className="text-sm text-(--muted-foreground) font-secondary">No categories available.</p>
          )}
        </>
      )}

      {view === "items" && (
        <div className={relatedProducts.length ? "lg:grid lg:grid-cols-5 lg:gap-16" : undefined}>
          <div className={relatedProducts.length ? "min-w-0 lg:col-span-3" : "min-w-0"}>
            {!searchQuery && activeCategory && (
              <p className="mb-4 text-sm font-semibold text-(--primary-text) font-secondary">
                Top 10 {activeCategory.label} Picks
              </p>
            )}

            {itemsStatus === "loading" && <RankedListSkeleton rows={4} />}

            {itemsStatus === "error" && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-(--border) py-16 text-center">
                <p className="font-semibold text-(--foreground) font-primary">{errorLabel}</p>
                <p className="max-w-sm text-sm text-(--muted-foreground) font-secondary">{errorMessage}</p>
              </div>
            )}

            {itemsStatus === "unavailable" && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-(--border) py-16 text-center">
                <p className="font-semibold text-(--foreground) font-primary">No live data for {title} yet</p>
                <p className="max-w-sm text-sm text-(--muted-foreground) font-secondary">{unavailableMessage}</p>
              </div>
            )}

            {itemsStatus === "ok" && (
              <div className="flex flex-col">
                {usingFallback && (
                  <p
                    className="mb-4 rounded-lg border border-(--border) bg-(--muted) p-3 text-sm text-(--muted-foreground)"
                    role="status"
                  >
                    Showing a saved provider snapshot because live data is temporarily unavailable.
                  </p>
                )}
                {items.slice(0, MAX_ITEMS).map((item, index) => {
                  const card = mapItemToCard(item, index);
                  return (
                    <RankedItem
                      key={item.id}
                      rank={index + 1}
                      title={card.title}
                      subtitle={card.subtitle}
                      image={card.image}
                      rating={card.rating}
                      description={card.description}
                      url={card.url}
                    />
                  );
                })}

                {items.length === 0 && (
                  <div className="flex w-full flex-col items-center py-16 text-center">
                    <p className="text-sm text-(--muted-foreground) font-secondary">{emptyLabel}</p>
                  </div>
                )}

                {/* Infinite scroll trigger — comes into view near the bottom of the list. */}
                {items.length > 0 && canLoadMore && <div ref={sentinelRef} className="h-1 w-full" />}

                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 py-6" role="status" aria-live="polite">
                    <Loader2 className="h-5 w-5 animate-spin text-(--primary)" />
                    <p className="text-sm text-(--muted-foreground) font-secondary">Loading more...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Held back until the left column's own data has actually
              landed — appearing together with a spinner/error state
              would read as "loaded" when it isn't. */}
          {relatedProducts.length > 0 && itemsStatus === "ok" && (
            <div className="mt-8 lg:col-span-2 lg:mt-0">
              <RelatedProductsSidebar
                products={relatedProducts}
                onSelect={onSelectRelated}
                sectionKey={`${id}-${activeCategory?.id || searchQuery || "all"}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Below the ranked list, once it's actually finished loading — a
          wider "more lists" grid, separate from (and in addition to) the
          sidebar above. */}
      {view === "items" && itemsStatus === "ok" && relatedProducts.length > 0 && (
        <MoreTop10sGrid
          products={relatedProducts}
          onSelect={onSelectRelated}
          sectionKey={`${id}-${activeCategory?.id || searchQuery || "all"}`}
        />
      )}
    </section>
  );
}
