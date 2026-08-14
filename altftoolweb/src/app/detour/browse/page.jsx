import { Suspense } from "react";
import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  CATEGORIES,
  CATEGORIES_BY_FAMILY,
  TIME_BANDS,
  VIBES,
  getCategory,
  getTimeBand,
  getVibe,
} from "@altftool/core/detour/taxonomy";
import { ALL_SITES, FACETS, STATS } from "@altftool/core/detour";
import { filterSites } from "@altftool/core/detour/randomiser";
import { searchSites, suggestedSearches } from "@altftool/core/detour/search";
import BrowseFilters from "../_components/BrowseFilters";
import SearchBox from "../_components/SearchBox";
import Pagination from "../_components/Pagination";
import SiteCard from "../_components/SiteCard";
import GoButton from "../_components/GoButton";

export const revalidate = 86400;

const PER_PAGE = 48;
const CATEGORY_FAMILY = new Map(CATEGORIES.map((c) => [c.id, c.family]));
const CATEGORY_NAMES = new Map(CATEGORIES.map((c) => [c.id, c.name]));
const SUGGESTIONS = suggestedSearches(ALL_SITES, 6);

/*
 * Slim projections handed to the client filter component. Only the fields it
 * renders cross the boundary — passing the taxonomy objects wholesale would
 * ship every category's intro and metaDescription into the browser.
 */
const FILTER_FAMILIES = CATEGORIES_BY_FAMILY.map((family) => ({
  id: family.id,
  name: family.name,
  categories: family.categories.map((category) => ({
    id: category.id,
    name: category.name,
  })),
}));

const FILTER_VIBES = VIBES.map((vibe) => ({
  id: vibe.id,
  label: vibe.label,
  emoji: vibe.emoji,
}));

const FILTER_TIME_BANDS = TIME_BANDS.map((band) => ({
  id: band.id,
  label: band.label,
}));

export async function generateMetadata({ searchParams }) {
  const query = await searchParams;

  // A filtered view gets its own title so the handful that do get indexed read
  // as distinct pages, but anything with filters applied is noindexed below —
  // there are thousands of filter permutations and they are all thin.
  const parts = [];
  const category = query?.category ? getCategory(query.category) : null;
  const vibe = query?.vibe ? getVibe(query.vibe) : null;
  const band = query?.time ? getTimeBand(query.time) : null;

  if (vibe) parts.push(vibe.label.toLowerCase());
  if (category) parts.push(category.name.toLowerCase());
  if (band) parts.push(`for ${band.label.toLowerCase()}`);

  const search = typeof query?.q === "string" ? query.q.trim() : "";
  // Search result pages are noindexed alongside filtered views: they are
  // unbounded, user-generated and near-duplicates of the category pages that
  // are meant to rank for these terms.
  const filtered = parts.length > 0 || search.length > 0;

  return createPageMetadata({
    title: search
      ? `Search results for “${search}” — AltF Detour`
      : filtered
        ? `Browse ${parts.join(" ")} websites — AltF Detour`
        : `Browse all ${STATS.sites.toLocaleString("en-GB")} websites — AltF Detour`,
    description:
      "Filter the full Detour directory by mood, time, topic and practicalities — safe for work, no sound, works on a phone, no sign-up.",
    path: "/detour/browse",
    noindex: filtered,
    keywords: [
      "browse interesting websites",
      "website directory",
      "cool websites list",
      "find fun websites",
    ],
  });
}

function FiltersFallback() {
  return (
    <div
      className="h-72 animate-pulse rounded-xl border border-border bg-muted/40"
      aria-hidden="true"
    />
  );
}

export default async function BrowsePage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const query$ = params.q;

  const filters = {
    timeToJoy: params.time,
    vibes: params.vibe ? [params.vibe] : undefined,
    categories: params.category ? [params.category] : undefined,
    sfwOnly: params.sfw === "1",
    silentOnly: params.silent === "1",
    mobileOnly: params.mobile === "1",
    noAccountOnly: params.noaccount === "1",
    originalsOnly: params.originals === "1",
    categoryFamilyMap: CATEGORY_FAMILY,
  };

  // Search first, then facets. Doing it in this order means the facets narrow
  // the search results rather than the search re-ranking a facet slice — which
  // is what someone who typed a query and then ticked "safe for work" expects.
  const query = typeof query$ === "string" ? query$.trim() : "";
  const pool = query
    ? searchSites(ALL_SITES, query, { categoryNames: CATEGORY_NAMES })
    : ALL_SITES;

  const matched = filterSites(pool, filters);
  const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const page = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1),
  );
  const visible = matched.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "Browse", path: "/detour/browse" },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path: "/detour/browse",
    name: "Browse every site on AltF Detour",
    description: `The full directory of ${STATS.sites.toLocaleString("en-GB")} websites, filterable by mood, time and topic.`,
  });

  const itemList = createItemListJsonLd({
    path: "/detour/browse",
    name: "Detour directory",
    items: visible.map((site) => ({
      name: site.name,
      path: `/detour/site/${site.slug}`,
    })),
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />
      <JsonLd data={collectionPage} />
      {itemList ? <JsonLd data={itemList} /> : null}

      <header className="max-w-2xl">
        <p
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--dtr-accent-text)" }}
        >
          The whole directory
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Browse {STATS.sites.toLocaleString("en-GB")} websites
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Across {STATS.categories} categories. Filter by how long you have got,
          what mood you are in, and whether you are at a desk with people
          walking past.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<FiltersFallback />}>
            <BrowseFilters
              counts={FACETS}
              families={FILTER_FAMILIES}
              vibes={FILTER_VIBES}
              timeBands={FILTER_TIME_BANDS}
            />
          </Suspense>

          <div className="mt-4 rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Cannot decide? Let it choose.
            </p>
            <div className="mt-3">
              <Suspense fallback={null}>
                <GoButton label="Surprise me" />
              </Suspense>
            </div>
          </div>
        </aside>

        <section aria-label="Results">
          <Suspense
            fallback={
              <div
                className="h-12 animate-pulse rounded-xl border border-border bg-muted/40"
                aria-hidden="true"
              />
            }
          >
            <SearchBox initialQuery={query} preserve={params} />
          </Suspense>

          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">
                {matched.length.toLocaleString("en-GB")}
              </span>{" "}
              {matched.length === 1 ? "site" : "sites"}
              {query ? (
                <>
                  {" "}
                  for <span className="text-foreground">“{query}”</span>
                </>
              ) : null}
              {totalPages > 1 ? (
                <>
                  {" "}
                  · page {page} of {totalPages}
                </>
              ) : null}
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
              <p className="font-medium">
                {query
                  ? `Nothing matches “${query}”.`
                  : "Nothing matches all of that."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {query
                  ? "Search covers site names, categories and descriptions. Try a single, more general word."
                  : "Try loosening one filter — the mood tags are the narrowest."}
              </p>

              {query ? (
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Try one of these
                  </p>
                  <ul className="mt-2 flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <li key={suggestion}>
                        <Link
                          href={`/detour/browse?q=${encodeURIComponent(suggestion)}`}
                          className="inline-block rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-[var(--dtr-accent)] hover:bg-muted"
                        >
                          {suggestion}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Link
                href="/detour/browse"
                className="mt-5 inline-block text-sm font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--dtr-accent-text)" }}
              >
                Clear everything
              </Link>
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((site) => (
                <SiteCard key={site.slug} site={site} />
              ))}
            </ul>
          )}

          <Pagination
            basePath="/detour/browse"
            searchParams={params}
            page={page}
            totalPages={totalPages}
          />
        </section>
      </div>
    </main>
  );
}
