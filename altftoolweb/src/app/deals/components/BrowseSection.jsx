"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Search } from "lucide-react";

import DealCard from "./DealCard";
import { DEAL_CATEGORIES, getDealCategoryCounts, getDealReviewCount, getDeals } from "../data/deals";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "reviews", label: "Most reviews" },
  { value: "savings", label: "Biggest savings" },
];

export default function BrowseSection() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");

  const counts = useMemo(() => getDealCategoryCounts(), []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let deals = getDeals().filter((deal) => {
      const matchesCategory = category === "all" || deal.category === category;
      const matchesQuery =
        !query ||
        deal.name.toLowerCase().includes(query) ||
        deal.tagline.toLowerCase().includes(query) ||
        (deal.alternativeTo || []).some((alt) => alt.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });

    if (sort === "rating") deals = [...deals].sort((a, b) => b.rating - a.rating);
    else if (sort === "reviews") deals = [...deals].sort((a, b) => getDealReviewCount(b) - getDealReviewCount(a));
    else if (sort === "savings") deals = [...deals].sort((a, b) => b.originalPrice - a.originalPrice);

    return deals;
  }, [category, search, sort]);

  return (
    <section id="browse-deals" className="section py-6 scroll-mt-24" aria-labelledby="browse-heading">
      <div className="mb-6">
        <h2 id="browse-heading" className="section-title text-left! mb-1">
          Browse all deals
        </h2>
        <p className="text-sm text-(--muted-foreground) md:text-base">
          {getDeals().length} free lifetime deals and counting — every one replaces a paid subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside aria-label="Deal filters">
          <div className="afd-card lg:sticky lg:top-24">
            <div className="afd-card-body">
              <h3 className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">Shop by category</h3>
              <ul className="flex flex-col gap-1" role="list">
                <li>
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    aria-pressed={category === "all"}
                    className={`afd-filter-button ${category === "all" ? "is-active" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                      All deals
                    </span>
                    <small>{counts.get("all") || 0}</small>
                  </button>
                </li>
                {DEAL_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={category === cat}
                      className={`afd-filter-button ${category === cat ? "is-active" : ""}`}
                    >
                      <span>{cat}</span>
                      <small>{counts.get(cat) || 0}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative flex-1 sm:max-w-sm">
              <span className="sr-only">Search deals</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search deals or the paid tool they replace…"
                className="afd-input pl-9"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-(--muted-foreground)">
              Sort by
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="afd-input w-auto min-w-40 cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((deal) => (
                <DealCard key={deal.slug} deal={deal} />
              ))}
            </div>
          ) : (
            <div className="afd-card">
              <div className="afd-card-body items-center py-12 text-center">
                <p className="text-base font-semibold text-(--foreground)">No deals match that search</p>
                <p className="text-sm text-(--muted-foreground)">
                  Try a different keyword — or search the paid tool you want to replace, like &ldquo;Photoshop&rdquo;.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
