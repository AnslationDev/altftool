"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Hero from "./components/Hero";
import CategoryMediaSection, { MoreTop10sGrid, RelatedProductsSidebar } from "./components/CategoryMediaSection";
import RankedItem from "./components/RankedItem";
import TrendingNow from "./components/TrendingNow";
import ExploreUniverse from "./components/ExploreUniverse";
import { PRODUCT_REGISTRY } from "./data/productRegistry";
import { UNIVERSES, UNIVERSE_PRODUCT_KEYS } from "./data/top10Data";
import { RankedListSkeleton } from "@/components/ui/skeleton";

/** Exact-match only: a query that IS a product's name/alias scopes search to that one product. */
function matchProductByQuery(query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return null;
  return PRODUCT_REGISTRY.find((p) => p.aliases?.includes(normalized)) || null;
}

/**
 * The "browse something else" list used by both the per-product sidebar/grid
 * and the keyword-fallback section — each product decorated with a real
 * preview image/titles/description (no per-entry fetch). `excludeKey` drops
 * the product you're currently looking at; pass null to keep them all.
 */
function buildRelatedProducts(excludeKey) {
  return PRODUCT_REGISTRY.filter((p) => p.key !== excludeKey).map((p) => {
    const mappedFallbacks = (p.fallbackItems || []).map((item) => p.mapItemToCard(item));
    const firstPhotographed = mappedFallbacks.find((card) => card.image);
    return {
      ...p,
      previewImage: p.previewImage || firstPhotographed?.image || null,
      previewTitles: p.previewTitles || mappedFallbacks.slice(0, 3).map((card) => card.title),
      previewDescription: p.previewDescription || firstPhotographed?.description || null,
    };
  });
}

/**
 * Renders one product's live section purely from its PRODUCT_REGISTRY
 * entry — the generic, reusable piece the rest of this file is built
 * around. Adding a future product (the "millions of categories" case)
 * is one new object in productRegistry.js; nothing here changes.
 */
function ProductSection({ product, searchQuery = "", onSelectRelated, onSearchStatus }) {
  // Every other product, offered as a "browse something else" sidebar
  // next to the ranked list — clicking one jumps straight to that
  // product's own category grid via the same handler the hero chips use.
  // previewImage: a real product's own first *photographed* fallback
  // item (already curated/verified), or a mock product's category photo
  // — never a fetch per sidebar entry. Some providers (Geoapify places,
  // for instance) frequently have no photo at all for an item, so this
  // scans past image-less items instead of assuming index 0 has one.
  // Real fallback items are in each provider's own raw shape (books/music
  // use `cover`, most others use `image`), so every item is run
  // through the product's own mapItemToCard rather than assuming a
  // plain `.image` field.
  const relatedProducts = buildRelatedProducts(product.key);

  return (
    <CategoryMediaSection
      id={product.sectionId}
      title={product.title}
      icon={product.icon}
      searchQuery={searchQuery}
      categoriesEndpoint={product.categoriesEndpoint}
      categoriesResponseKey={product.categoriesResponseKey}
      itemsEndpointForCategory={product.itemsEndpointForCategory}
      searchEndpoint={product.searchEndpoint}
      itemsResponseKey={product.itemsResponseKey}
      mapItemToCard={product.mapItemToCard}
      loadingLabel={product.loadingLabel}
      errorLabel={product.errorLabel}
      emptyLabel={product.emptyLabel(searchQuery)}
      onDebugData={product.onDebugData}
      // Category-browse only. During search, a live fetch failure just
      // means "no real match" for that product (the section hides) — never
      // this product's unrelated top-10 shown as if it matched the search.
      fallbackItems={searchQuery ? undefined : product.fallbackItems}
      relatedProducts={relatedProducts}
      onSelectRelated={onSelectRelated}
      onSearchStatus={onSearchStatus}
    />
  );
}

export default function Top10Client() {
  // Every product section is real API data, not mock — driven entirely
  // by PRODUCT_REGISTRY (src/app/top10/data/productRegistry.js) through
  // the single <ProductSection> above, only fetched once the user
  // actually asks for it: clicking a category chip, an Explore Universe
  // card, or submitting the hero search box / a "Popular:" tag.
  //
  // Two distinct modes:
  // - Category mode (activeProduct set, searchQuery null): exactly one
  //   product section shows, browsable by its own categories — the
  //   existing "click a chip" behavior.
  // - Search mode (searchQuery set): EVERY product searches for that
  //   query at once, each through its own real search endpoint (same
  //   CategoryMediaSection code path as clicking a category — nothing
  //   about that pipeline changes). A product with no matches shows its
  //   own "not found" empty state; a future product added to
  //   PRODUCT_REGISTRY participates automatically.
  const [activeProduct, setActiveProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  // Per-product search status, keyed by section id: { [sectionId]: { loading, count } }.
  // Lets the page show a live "Searching…" indicator, then decide whether any
  // real provider matched — and if none did, show a keyword-themed fallback.
  const [searchStatuses, setSearchStatuses] = useState({});
  // "Settled" flips true a few seconds after a search starts, so we stop
  // waiting on the slowest external APIs before deciding to show the
  // keyword fallback. Real results still appear the moment they arrive.
  const [searchSettled, setSearchSettled] = useState(false);
  const settleTimerRef = useRef(null);
  // The true "global search" catch-all: once every wired product has come
  // back empty for this query, try Wikipedia's own real, keyless search
  // before ever falling back to the generic keyword-templated list —
  // {status: 'idle'|'loading'|'ok'|'empty'|'error', items, forQuery}.
  const [wikiFallback, setWikiFallback] = useState({ status: "idle", items: [], forQuery: null });
  // Which query the Wikipedia catch-all has already been asked for. Kept in a
  // ref rather than read off wikiFallback so it never becomes an effect
  // dependency — see the effect below.
  const wikiRequestedForRef = useRef(null);

  const handleSearchStatus = useCallback((sectionId, status) => {
    setSearchStatuses((prev) => ({ ...prev, [sectionId]: status }));
  }, []);

  const revealSection = (sectionId) => {
    requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      section.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const handleCategorySelect = (categoryId) => {
    const product = PRODUCT_REGISTRY.find((p) => p.categoryId === categoryId);
    if (!product) return;
    setSearchQuery(null);
    setActiveProduct(product.key);
    revealSection(product.sectionId);
  };

  // The hero search box / "Popular:" tags search every product at once —
  // whichever ones have matching data show it, the rest show their own
  // "not found" state for that query. Scrolls to the top of the whole
  // results stack (not straight into one product specifically) — search mode
  // renders every matching product one after another, so jumping into
  // the first one hid everything below it (Food, Dogs, etc. were
  // rendering fine, just below the fold from where the page landed).
  //
  // Exception: if the query IS a product's name (e.g. "book", "books"),
  // only that product searches — matches user intent ("show me books")
  // instead of cluttering the page with other products' "not found"
  // states for a query that was never meant to search them.
  const handleSearchSubmit = (query) => {
    setActiveProduct(null);
    setSearchStatuses({}); // clear the previous search's per-product results before the new one reports in
    setSearchSettled(false);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    // Give the providers ~3.5s; after that, decide whether to show the fallback.
    settleTimerRef.current = setTimeout(() => setSearchSettled(true), 3500);
    setSearchQuery(query);
    revealSection("top10-search-results");
  };

  const matchedSearchProduct = matchProductByQuery(searchQuery);
  const searchResultProducts = matchedSearchProduct ? [matchedSearchProduct] : PRODUCT_REGISTRY;

  // Aggregate what every product reported for the current search.
  const statusList = Object.values(searchStatuses);
  const allReported = statusList.length >= searchResultProducts.length && statusList.every((s) => !s.loading);
  const searchTotalResults = statusList.reduce((sum, s) => sum + (s.count || 0), 0);
  // "Done" = every provider answered, OR the settle timer fired (so slow
  // external APIs don't hold up the fallback). Real results show as they arrive.
  const searchDone = allReported || searchSettled;
  const searchStillLoading = searchQuery && !searchDone && searchTotalResults === 0;
  const noWiredProductMatched = searchQuery && searchDone && searchTotalResults === 0;

  // Global-search catch-all: only once every wired product has come back
  // empty for THIS query, ask Wikipedia's own real search. Real results
  // win; the fully generic keyword template is the last-resort safety net
  // (Wikipedia covers almost everything, so that net rarely triggers).
  //
  // The "have we already asked?" guard is a ref, not `wikiFallback.forQuery`,
  // and that is load-bearing. With the state value in the dependency array,
  // this effect's own `setWikiFallback({status:"loading", forQuery})` changed
  // a dependency, so React ran the cleanup — flipping `cancelled` to true on
  // the very request that was still in flight. The response then hit
  // `if (cancelled) return;` and no state was ever written, leaving the page
  // stuck on "Searching for …" forever for any query nothing matched.
  useEffect(() => {
    if (!noWiredProductMatched) return;
    if (wikiRequestedForRef.current === searchQuery) return; // already fetched (or fetching) for this exact query
    wikiRequestedForRef.current = searchQuery;
    const controller = new AbortController();
    setWikiFallback({ status: "loading", items: [], forQuery: searchQuery });
    fetch(`/api/top10/search-wikipedia?query=${encodeURIComponent(searchQuery)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const items = data.results || [];
        setWikiFallback({ status: items.length ? "ok" : "empty", items, forQuery: searchQuery });
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setWikiFallback({ status: "error", items: [], forQuery: searchQuery });
        }
      });
    return () => {
      controller.abort();
      if (wikiRequestedForRef.current === searchQuery) wikiRequestedForRef.current = null;
    };
  }, [noWiredProductMatched, searchQuery]);

  const wikiFallbackLoading = noWiredProductMatched && (wikiFallback.forQuery !== searchQuery || wikiFallback.status === "loading");
  const showWikiResults = noWiredProductMatched && wikiFallback.forQuery === searchQuery && wikiFallback.status === "ok";
  // Only the fully generic templated list — after wired products AND Wikipedia have both come back empty.
  const searchHasNoResults =
    noWiredProductMatched && wikiFallback.forQuery === searchQuery && (wikiFallback.status === "empty" || wikiFallback.status === "error");

  // Real product/category data merged onto each static universe tile —
  // productCount and categorySources drive the real category-count fetch
  // in ExploreUniverse, exploreCategoryId is where "Explore Now" navigates.
  const universes = UNIVERSES.map((universe) => {
    const keys = UNIVERSE_PRODUCT_KEYS[universe.id] || [];
    const products = PRODUCT_REGISTRY.filter((p) => keys.includes(p.key));
    return {
      ...universe,
      productCount: products.length,
      categorySources: products.map((p) => ({ endpoint: p.categoriesEndpoint, key: p.categoriesResponseKey })),
      exploreCategoryId: products[0]?.categoryId || null,
    };
  });

  return (
    <main className="top10-page min-h-screen">
      <Hero onCategorySelect={handleCategorySelect} onSearchSubmit={handleSearchSubmit} />
      {searchQuery ? (
        <div
          id="top10-search-results"
          className="scroll-mt-24 focus:outline-none"
          tabIndex={-1}
          aria-labelledby="top10-search-results-heading"
        >
          <h2 id="top10-search-results-heading" className="sr-only">
            Search results for {searchQuery}
          </h2>
          {/* Shimmer skeleton instead of a bare spinner+text while every
              product's search is still in flight — no "Search Results / N
              results" header (per request); each product keeps its own
              heading once it actually resolves. */}
          {(searchStillLoading || wikiFallbackLoading) && (
            <div className="section pb-0!">
              <div className="mb-4 flex items-center gap-2" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin text-(--primary)" />
                <span className="text-sm text-(--muted-foreground) font-secondary">
                  Searching for “{searchQuery}”…
                </span>
              </div>
              <RankedListSkeleton rows={4} />
            </div>
          )}

          {/* Global-search catch-all: nothing in our wired products matched,
              but Wikipedia's own real, keyless search found something —
              genuinely open-ended search, not limited to the site's ~39
              pre-wired categories. Same layout as a real product section. */}
          {showWikiResults && (
            <section className="section scroll-mt-24">
              <h2 className="section-title text-left! mb-6! flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-(--primary)" />
                Top 10 {searchQuery}
              </h2>

              <div className="lg:grid lg:grid-cols-5 lg:gap-16">
                <div className="flex min-w-0 flex-col lg:col-span-3">
                  {wikiFallback.items.slice(0, 10).map((item, index) => (
                    <RankedItem
                      key={item.id}
                      rank={index + 1}
                      title={item.title}
                      subtitle={item.subtitle}
                      image={item.image}
                      rating={item.rating}
                      description={item.description}
                      url={item.url}
                    />
                  ))}
                </div>

                <div className="mt-8 lg:col-span-2 lg:mt-0">
                  <RelatedProductsSidebar
                    products={buildRelatedProducts(null)}
                    onSelect={handleCategorySelect}
                    sectionKey={`search-wiki-${searchQuery}`}
                  />
                </div>
              </div>

              <MoreTop10sGrid
                products={buildRelatedProducts(null)}
                onSelect={handleCategorySelect}
                sectionKey={`search-wiki-grid-${searchQuery}`}
              />
            </section>
          )}

          {/* Last-resort safety net — only when NEITHER our wired products
              NOR Wikipedia found anything for this query (rare). */}
          {searchHasNoResults && (
            <section className="section scroll-mt-24">
              <h2 className="section-title text-left! mb-6! flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-(--primary)" />
                Top 10 {searchQuery}
              </h2>

              <div className="lg:grid lg:grid-cols-5 lg:gap-16">
                {/* No results, and no invented ones. getSearchFallback built a ranked
                    list out of the visitor's own query — titles like "Midnight
                    Broadcast" over stock photos, rendered in the same RankedItem
                    component as real data. Its module header calls it "explicitly mock,
                    not fabricated-as-real", which was true of the data and not of what
                    the screen showed. */}
                <div className="flex min-w-0 flex-col lg:col-span-3">
                  <p className="text-(--muted-foreground)">
                    No ranked list for “{searchQuery}” yet — browse the categories
                    below, or try one of the popular searches.
                  </p>
                </div>

                <div className="mt-8 lg:col-span-2 lg:mt-0">
                  <RelatedProductsSidebar
                    products={buildRelatedProducts(null)}
                    onSelect={handleCategorySelect}
                    sectionKey={`search-fallback-${searchQuery}`}
                  />
                </div>
              </div>

              <MoreTop10sGrid
                products={buildRelatedProducts(null)}
                onSelect={handleCategorySelect}
                sectionKey={`search-fallback-grid-${searchQuery}`}
              />
            </section>
          )}

          {searchResultProducts.map((product) => (
            <ProductSection
              key={product.key}
              product={product}
              searchQuery={searchQuery}
              onSelectRelated={handleCategorySelect}
              onSearchStatus={handleSearchStatus}
            />
          ))}
        </div>
      ) : (
        PRODUCT_REGISTRY.filter((p) => p.key === activeProduct).map((product) => (
          <ProductSection key={product.key} product={product} onSelectRelated={handleCategorySelect} />
        ))
      )}
      {/* Only on the plain homepage — hidden on a product's own details
          page (a category picked or a search in progress), per request. */}
      {!activeProduct && !searchQuery && (
        <>
          <TrendingNow />
          <ExploreUniverse universes={universes} onExplore={handleCategorySelect} />
        </>
      )}
    </main>
  );
}
