"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ACCESS_LEVELS, CATEGORY_BY_SLUG } from "@altftool/core/atlas/taxonomy";
import SiteCard from "./SiteCard";

const PAGE_SIZE = 48;

/*
 * The browse surface.
 *
 * Filters live in component state, NOT in the URL. That is deliberate: every
 * filter combination worth indexing already has a real server-rendered route
 * (/category/…, /use-case/…, /collections/…), and minting a second, thinner
 * copy of each behind ?category= would compete with those pages for the same
 * query. Query strings here would add crawlable duplicates, not reach.
 */
const ACCESS_ORDER = { open: 0, account: 1, freemium: 2 };

const SORTS = [
  { id: "name", label: "A–Z" },
  { id: "access", label: "Fewest strings first" },
  { id: "device", label: "On-device first" },
  { id: "category", label: "By category" },
];

export default function BrowseExplorer({ entries = [], categories = [] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [access, setAccess] = useState("all");
  const [localOnly, setLocalOnly] = useState(false);
  const [sort, setSort] = useState("name");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const needle = query.trim().toLowerCase();

  const results = useMemo(() => {
    const matched = entries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (access !== "all" && entry.access !== access) return false;
      if (localOnly && entry.runtime !== "local") return false;
      if (needle.length < 2) return true;

      return (
        entry.name.toLowerCase().includes(needle) ||
        entry.domain.toLowerCase().includes(needle) ||
        entry.tagline.toLowerCase().includes(needle) ||
        (entry.tags || []).some((tag) => tag.includes(needle))
      );
    });

    // A query beats the sort control. If someone typed "photopea", relevance
    // is what they meant regardless of what the dropdown says — putting the
    // exact match on page four because the sort is "by category" is a bug the
    // user would blame on the search.
    if (needle.length >= 2) {
      return [...matched].sort((a, b) => {
        const rank = (entry) => {
          const name = entry.name.toLowerCase();
          if (name === needle) return 0;
          if (name.startsWith(needle)) return 1;
          if (name.includes(needle)) return 2;
          if (entry.domain.toLowerCase().includes(needle)) return 3;
          return 4;
        };
        return rank(a) - rank(b) || a.name.localeCompare(b.name);
      });
    }

    const byName = (a, b) => a.name.localeCompare(b.name);
    return [...matched].sort((a, b) => {
      if (sort === "access") {
        return (
          (ACCESS_ORDER[a.access] ?? 9) - (ACCESS_ORDER[b.access] ?? 9) ||
          byName(a, b)
        );
      }
      if (sort === "device") {
        const rank = (entry) => (entry.runtime === "local" ? 0 : 1);
        return rank(a) - rank(b) || byName(a, b);
      }
      if (sort === "category") {
        return a.category.localeCompare(b.category) || byName(a, b);
      }
      return byName(a, b);
    });
  }, [entries, needle, category, access, localOnly, sort]);

  const shown = results.slice(0, visible);
  const activeFilters =
    (category !== "all" ? 1 : 0) +
    (access !== "all" ? 1 : 0) +
    (localOnly ? 1 : 0);

  const reset = () => {
    setQuery("");
    setCategory("all");
    setAccess("all");
    setSort("name");
    setLocalOnly(false);
    setVisible(PAGE_SIZE);
  };

  const update = (fn) => {
    fn();
    setVisible(PAGE_SIZE);
  };

  const chipClass = (isActive) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      isActive
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground"
    }`;

  return (
    <div className="grid gap-5">
      {/* --------- search + filter toggle --------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => update(() => setQuery(event.target.value))}
            placeholder={`Search ${entries.length} sites by name, domain or job…`}
            aria-label="Search the Atlas"
            className="h-11 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilters ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.6875rem] text-primary-foreground">
              {activeFilters}
            </span>
          ) : null}
        </button>
      </div>

      {/* --------- filters --------- */}
      <div className={`${filtersOpen ? "grid" : "hidden"} gap-4 lg:grid`}>
        <div className="grid gap-2">
          <p className="afa-eyebrow">Category</p>
          <div className="afa-rail flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => update(() => setCategory("all"))}
              className={chipClass(category === "all")}
            >
              All ({entries.length})
            </button>
            {categories.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => update(() => setCategory(item.slug))}
                className={chipClass(category === item.slug)}
              >
                {item.name} ({item.count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="grid gap-2">
            <p className="afa-eyebrow">What it costs you</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update(() => setAccess("all"))}
                className={chipClass(access === "all")}
              >
                Any
              </button>
              {ACCESS_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  title={level.blurb}
                  onClick={() => update(() => setAccess(level.id))}
                  className={chipClass(access === level.id)}
                >
                  {level.short}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="afa-eyebrow">Privacy</p>
            <button
              type="button"
              aria-pressed={localOnly}
              onClick={() => update(() => setLocalOnly((value) => !value))}
              className={chipClass(localOnly)}
              title="Only sites that process your files in the browser, with no upload."
            >
              Runs on my device
            </button>
          </div>

          <div className="grid gap-2">
            <label className="afa-eyebrow" htmlFor="atlas-sort">
              Order
            </label>
            <select
              id="atlas-sort"
              value={sort}
              onChange={(event) => update(() => setSort(event.target.value))}
              disabled={needle.length >= 2}
              title={
                needle.length >= 2
                  ? "While searching, results are ordered by how well they match."
                  : undefined
              }
              className="h-9 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --------- result count --------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p
          className="text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <span className="font-semibold text-foreground">
            {results.length}
          </span>{" "}
          {results.length === 1 ? "site" : "sites"}
          {category !== "all" && CATEGORY_BY_SLUG[category]
            ? ` in ${CATEGORY_BY_SLUG[category].name}`
            : ""}
          {needle.length >= 2 ? ` matching “${query.trim()}”` : ""}
        </p>

        {activeFilters || needle ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {/* --------- results --------- */}
      {shown.length ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((entry) => (
            <li key={entry.slug} className="min-w-0">
              <SiteCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm font-semibold text-foreground">No matches</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Nothing in the Atlas fits that combination yet. Try a broader search
            or clear a filter.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Clear filters
          </button>
        </div>
      )}

      {results.length > visible ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            className="inline-flex h-11 items-center rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Show {Math.min(PAGE_SIZE, results.length - visible)} more
          </button>
        </div>
      ) : null}
    </div>
  );
}
