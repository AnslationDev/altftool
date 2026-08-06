"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, Shuffle, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  TIME_BANDS,
  VIBES,
} from "@altftool/core/rabbithole/taxonomy";
import SiteCard from "./SiteCard";
import { tonedStyle } from "../_lib/presentation";

const SORTS = [
  { id: "curated", label: "Curated" },
  { id: "quickest", label: "Quickest payoff" },
  { id: "oldest", label: "Oldest first" },
  { id: "az", label: "A–Z" },
];

const TOGGLES = [
  { id: "noSignup", label: "No sign-up" },
  { id: "mobile", label: "Good on phone" },
  { id: "altf", label: "We built one" },
];

const TIME_ORDER = Object.fromEntries(
  TIME_BANDS.map((band, index) => [band.id, index]),
);

const PAGE_SIZE = 48;

function toggleIn(list, value) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

/** Comma-joined lists keep the query string readable and short. */
function readList(params, key, allowed) {
  const raw = params.get(key);
  if (!raw) return [];
  return raw.split(",").filter((value) => allowed.includes(value));
}

const CATEGORY_VALUES = CATEGORIES.map((category) => category.id);
const TIME_VALUES = TIME_BANDS.map((band) => band.id);
const VIBE_VALUES = VIBES.map((vibe) => vibe.id);
const TOGGLE_VALUES = TOGGLES.map((toggle) => toggle.id);
const SORT_VALUES = SORTS.map((option) => option.id);

/** The only query keys this component may rewrite. Everything else is left alone. */
const OWNED_PARAMS = ["q", "cat", "time", "vibe", "only", "sort"];

/**
 * The single filter predicate, shared by the result list and the facet counts.
 *
 * `ignore` lifts one dimension so a facet can be counted as "what you would
 * get if you also picked this". Keeping one implementation is what stops the
 * counts and the results from ever disagreeing.
 */
function passesFilters(site, state, ignore) {
  const { needle, categories, times, vibes, toggles } = state;

  if (ignore !== "category" && categories.length) {
    if (!categories.includes(site.category)) return false;
  }
  if (ignore !== "time" && times.length) {
    if (!times.includes(site.timeToJoy)) return false;
  }
  if (ignore !== "vibe" && vibes.length) {
    if (!vibes.some((vibe) => site.vibes.includes(vibe))) return false;
  }
  if (ignore !== "toggle") {
    if (toggles.includes("noSignup") && (!site.free || site.needsAccount)) {
      return false;
    }
    if (toggles.includes("mobile") && site.bestOn === "desktop") return false;
    if (toggles.includes("altf") && !site.altfAlternative) return false;
  }
  if (needle) {
    const haystack = `${site.name} ${site.host} ${site.blurb}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

/**
 * The filterable directory.
 *
 * Filtering runs client-side over the whole catalog because 300 records is
 * small enough to be instant and a round trip per keystroke would feel worse.
 * The server passes a projection rather than full records — descriptions and
 * rationales are only needed on detail pages, and shipping them here would
 * roughly triple the payload for no visible benefit.
 */
export default function BrowseExplorer({ sites }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [times, setTimes] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [toggles, setToggles] = useState([]);
  const [sort, setSort] = useState("curated");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const deferredQuery = useDeferredValue(query);

  /*
   * Filter state is adopted from the query string once, after mount, by
   * reading window.location directly.
   *
   * useSearchParams would be the idiomatic call, but it opts this route out of
   * a clean static prerender: wrapped in Suspense, Next emits the explorer
   * TWICE into the HTML (once in the shell, once through the streaming
   * boundary) which doubled the document to half a megabyte, and any crawler
   * that does not run JavaScript is served the fallback skeleton instead of
   * the grid. Reading location on mount keeps the full 48-card grid in the
   * static HTML, and costs only a repaint for visitors arriving on a shared
   * filtered link.
   */
  // Two refs, not one. `adopted` is set at the END of the adopt pass, because
  // React flushes both effects in the same pass on mount — a flag set at the
  // top of this one is already true by the time the writer below reads it, so
  // the guard it was supposed to provide never fired.
  const adopted = useRef(false);
  useEffect(() => {
    if (adopted.current) return;

    const params = new URLSearchParams(window.location.search);
    if (![...params.keys()].length) {
      adopted.current = true;
      return;
    }

    const nextQuery = params.get("q") || "";
    const nextCategories = readList(params, "cat", CATEGORY_VALUES);
    const nextSort = params.get("sort");

    // Setting state from an effect is normally worth avoiding, but the value
    // being read lives outside React and does not exist during the server
    // render. Doing it in a useState initializer instead would make the
    // client's first render disagree with the prerendered HTML — a genuine
    // hydration mismatch — so the post-mount adjustment is the correct shape.
    // React batches these into one re-render.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (nextQuery) setQuery(nextQuery);
    if (nextCategories.length) setCategories(nextCategories);
    setTimes(readList(params, "time", TIME_VALUES));
    setVibes(readList(params, "vibe", VIBE_VALUES));
    setToggles(readList(params, "only", TOGGLE_VALUES));
    if (SORT_VALUES.includes(nextSort)) setSort(nextSort);

    adopted.current = true;
  }, []);

  const filterState = useMemo(
    () => ({
      needle: deferredQuery.trim().toLowerCase(),
      categories,
      times,
      vibes,
      toggles,
    }),
    [deferredQuery, categories, times, vibes, toggles],
  );

  /*
   * Per-facet counts: how many results you would get if you added this chip.
   *
   * Each dimension is counted with its OWN filter lifted, which is what makes
   * the numbers useful — otherwise selecting "Calm Corner" would show 0 against
   * every other category and the counts would just restate the current filter.
   */
  const facetCounts = useMemo(() => {
    const category = Object.fromEntries(CATEGORY_VALUES.map((id) => [id, 0]));
    const time = Object.fromEntries(TIME_VALUES.map((id) => [id, 0]));
    const vibe = Object.fromEntries(VIBE_VALUES.map((id) => [id, 0]));
    const toggle = Object.fromEntries(TOGGLE_VALUES.map((id) => [id, 0]));

    for (const site of sites) {
      if (passesFilters(site, filterState, "category")) category[site.category] += 1;
      if (passesFilters(site, filterState, "time")) time[site.timeToJoy] += 1;
      if (passesFilters(site, filterState, "vibe")) {
        for (const id of site.vibes) vibe[id] += 1;
      }
      if (passesFilters(site, filterState, "toggle")) {
        if (site.free && !site.needsAccount) toggle.noSignup += 1;
        if (site.bestOn !== "desktop") toggle.mobile += 1;
        if (site.altfAlternative) toggle.altf += 1;
      }
    }

    return { category, time, vibe, toggle };
  }, [sites, filterState]);

  const results = useMemo(() => {
    const filtered = sites.filter((site) => passesFilters(site, filterState, null));

    const sorted = [...filtered];
    if (sort === "az") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "en"));
    } else if (sort === "quickest") {
      sorted.sort(
        (a, b) =>
          TIME_ORDER[a.timeToJoy] - TIME_ORDER[b.timeToJoy] ||
          a.name.localeCompare(b.name, "en"),
      );
    } else if (sort === "oldest") {
      sorted.sort(
        (a, b) =>
          (a.year ?? 9999) - (b.year ?? 9999) ||
          a.name.localeCompare(b.name, "en"),
      );
    }
    // "curated" keeps the order the server sent, which already interleaves
    // categories so the first screen is not eighteen archives in a row.

    return sorted;
  }, [sites, filterState, sort]);

  const activeCount =
    categories.length + times.length + vibes.length + toggles.length;

  /*
   * Mirror the filter state into the query string so a filtered view can be
   * shared, bookmarked and reloaded. `replace` rather than `push` keeps the
   * back button meaning "the page before this one" instead of unwinding forty
   * chip clicks, and `scroll: false` stops every toggle from jumping the user
   * back to the top of the results.
   */
  useEffect(() => {
    // Nothing to mirror until the adopt pass above has run, or the first paint
    // would strip the filters straight back off a shared link.
    if (!adopted.current) return;

    // Seed from the live query string and delete only the keys this component
    // owns, so utm_source, gclid, ref and anything else a campaign appended
    // survive. Rebuilding from scratch silently destroyed them on every load.
    const params = new URLSearchParams(window.location.search);
    for (const key of OWNED_PARAMS) params.delete(key);
    if (deferredQuery.trim()) params.set("q", deferredQuery.trim());
    if (categories.length) params.set("cat", categories.join(","));
    if (times.length) params.set("time", times.join(","));
    if (vibes.length) params.set("vibe", vibes.join(","));
    if (toggles.length) params.set("only", toggles.join(","));
    if (sort !== "curated") params.set("sort", sort);

    const search = params.toString();
    const path = window.location.pathname;
    const next = search ? `${path}?${search}` : path;

    // Skip when the URL already says this. Without the check every visit to a
    // clean /rabbithole/browse fires one pointless navigation on mount, and a
    // shared filtered link fires two.
    const current = `${window.location.pathname}${window.location.search}`;
    if (next === current) return;

    router.replace(next, { scroll: false });
  }, [deferredQuery, categories, times, vibes, toggles, sort, router]);

  function reset() {
    setCategories([]);
    setTimes([]);
    setVibes([]);
    setToggles([]);
    setQuery("");
    setVisible(PAGE_SIZE);
  }

  function surprise() {
    if (results.length === 0) return;
    const pick = results[Math.floor(Math.random() * results.length)];
    router.push(`/rabbithole/site/${pick.slug}`);
  }

  return (
    <div>
      <div className="rh-filter-bar -mx-4 px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder={`Search ${sites.length} sites by name or idea`}
                aria-label="Search the directory"
                className="h-10 w-full rounded-[var(--anslation-ds-radius-pill)] border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-[var(--anslation-ds-focus-ring,var(--primary))]"
              />
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="rh-filter-panel"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[var(--anslation-ds-radius-pill)] border border-border px-3 text-sm font-medium text-foreground transition hover:border-primary lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {activeCount ? (
                <span className="rounded-full bg-primary px-1.5 text-[0.6875rem] text-primary-foreground">
                  {activeCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={surprise}
              aria-label="Surprise me"
              disabled={results.length === 0}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[var(--anslation-ds-radius-pill)] border border-border px-3 text-sm font-medium text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Surprise me</span>
            </button>
          </div>

          <div
            id="rh-filter-panel"
            className={`${filtersOpen ? "grid" : "hidden"} gap-3 lg:grid`}
          >
            <FilterRow label="Category">
              {CATEGORIES.map((category) => (
                <FilterChip
                  key={category.id}
                  tone={category.tone}
                  count={facetCounts.category[category.id]}
                  active={categories.includes(category.id)}
                  onClick={() => {
                    setCategories((current) => toggleIn(current, category.id));
                    setVisible(PAGE_SIZE);
                  }}
                >
                  {category.name}
                </FilterChip>
              ))}
            </FilterRow>

            <FilterRow label="Time">
              {TIME_BANDS.map((band) => (
                <FilterChip
                  key={band.id}
                  count={facetCounts.time[band.id]}
                  active={times.includes(band.id)}
                  onClick={() => {
                    setTimes((current) => toggleIn(current, band.id));
                    setVisible(PAGE_SIZE);
                  }}
                >
                  {band.label}
                </FilterChip>
              ))}
            </FilterRow>

            <FilterRow label="Only">
              {TOGGLES.map((toggle) => (
                <FilterChip
                  key={toggle.id}
                  count={facetCounts.toggle[toggle.id]}
                  active={toggles.includes(toggle.id)}
                  onClick={() => {
                    setToggles((current) => toggleIn(current, toggle.id));
                    setVisible(PAGE_SIZE);
                  }}
                >
                  {toggle.label}
                </FilterChip>
              ))}
            </FilterRow>

            <FilterRow label="Vibe">
              {VIBES.map((vibe) => (
                <FilterChip
                  key={vibe.id}
                  tone={vibe.tone}
                  count={facetCounts.vibe[vibe.id]}
                  active={vibes.includes(vibe.id)}
                  onClick={() => {
                    setVibes((current) => toggleIn(current, vibe.id));
                    setVisible(PAGE_SIZE);
                  }}
                >
                  {vibe.label}
                </FilterChip>
              ))}
            </FilterRow>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
          <span className="font-semibold text-foreground">{results.length}</span>{" "}
          {results.length === 1 ? "site" : "sites"}
          {activeCount ? " match your filters" : " in the directory"}
        </p>

        <div className="flex items-center gap-2">
          {activeCount ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-9 rounded-[var(--anslation-ds-radius)] border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <h2 className="sr-only">Results</h2>

      {results.length === 0 ? (
        <div className="mt-8 rounded-[var(--anslation-ds-radius-xl)] border border-dashed border-border p-10 text-center">
          <p className="text-base font-medium text-foreground">
            Nothing matches that combination.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try removing a vibe or widening the time filter.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex h-9 items-center rounded-[var(--anslation-ds-radius-pill)] bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="rh-grid mt-5">
            {results.slice(0, visible).map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>

          {visible < results.length ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
                className="inline-flex h-11 items-center rounded-[var(--anslation-ds-radius-pill)] border border-border px-6 text-sm font-medium text-foreground transition hover:border-primary"
              >
                Show {Math.min(PAGE_SIZE, results.length - visible)} more
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function FilterRow({ label, children }) {
  const labelId = `rh-filter-${label.toLowerCase()}`;

  return (
    // min-w-0 is load-bearing: this is a grid item, and a grid item defaults to
    // min-width:auto, which lets it stretch to its content instead of clipping.
    // Without it the chip row grows to its full ~2100px and the inner scroller
    // never scrolls, so every category past the second is unreachable on a phone.
    <div className="flex min-w-0 items-start gap-3">
      {/* sr-only rather than hidden below sm: the label has to stay in the
          accessibility tree, or a screen reader hears thirty-odd unlabelled
          toggles in a row with no idea which facet each belongs to. */}
      <span
        id={labelId}
        className="rh-eyebrow sr-only w-14 shrink-0 pt-1.5 sm:not-sr-only sm:block"
      >
        {label}
      </span>
      {/* Narrow screens scroll the chips sideways; from lg they wrap instead,
          because there is room for two or three rows without pushing the
          results below the fold. */}
      <div
        role="group"
        aria-labelledby={labelId}
        className="rh-scroller min-w-0 flex-1 lg:flex-wrap lg:overflow-x-visible"
      >
        {children}
      </div>
    </div>
  );
}

function FilterChip({ tone, active, count, onClick, children }) {
  // A facet that would return nothing stays visible but is disabled, so the
  // taxonomy never appears to shrink as you filter — you can see that the
  // option exists and that this combination has nothing in it.
  const empty = count === 0 && !active;

  return (
    <button
      type="button"
      onClick={empty ? undefined : onClick}
      aria-pressed={active}
      aria-disabled={empty || undefined}
      className={`rh-chip rh-toned ${empty ? "cursor-not-allowed opacity-40" : ""}`}
      style={tonedStyle(tone || "stone")}
    >
      {children}
      {typeof count === "number" ? (
        <span className="font-mono text-[0.6875rem] opacity-60" aria-hidden="true">
          {count}
        </span>
      ) : null}
      {typeof count === "number" ? (
        <span className="sr-only">{`, ${count} ${count === 1 ? "site" : "sites"}`}</span>
      ) : null}
    </button>
  );
}
