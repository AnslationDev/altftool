"use client";

import { useEffect, useState } from "react";
import "./top6.css";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import RankedRow from "./components/RankedRow";
import SearchStatus from "./components/SearchStatus";
import { CATEGORIES, ITEMS_PER_CATEGORY } from "./data/top6Data";
import { slugFor } from "./lib/slugFor";
import { fetchLatestCategories } from "./lib/latestData";

const SEARCH_RESULTS_ID = "top6-search-results";

export default function Top6Client() {
  // Every category renders from its provider snapshot on the server. Live
  // rows overlay them once the fetch lands; a provider that fails keeps
  // its snapshot rather than blanking the section.
  const [liveItemsById, setLiveItemsById] = useState(null);
  // Non-null only while a query matched no category on this page.
  const [search, setSearch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchLatestCategories()
      .then((latest) => {
        if (cancelled) return;
        const byId = {};
        latest.forEach((category) => {
          byId[category.id] = category.items;
        });
        setLiveItemsById(byId);
      })
      .catch(() => {
        // The snapshot rows already on screen stay exactly as they are.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A query naming one of our own categories jumps there. Anything else
  // goes to the keyless Wikipedia search /top10 already uses as its
  // catch-all, so the box answers arbitrary topics, not just these rows.
  const handleSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();

    const match = CATEGORIES.find(
      (category) =>
        category.label.toLowerCase().includes(normalized) ||
        category.tag.toLowerCase().includes(normalized) ||
        category.items.some((item) =>
          item.title.toLowerCase().includes(normalized),
        ),
    );
    if (match) {
      setSearch(null);
      document
        .getElementById(slugFor(match.id))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setSearch({ status: "loading", query: trimmed, items: [] });

    try {
      const response = await fetch(
        `/api/top10/search-wikipedia?query=${encodeURIComponent(trimmed)}`,
      );
      const data = await response.json();
      const items = (data.results || [])
        .filter((result) => result.image && result.title)
        .slice(0, ITEMS_PER_CATEGORY)
        .map((result, index) => ({ ...result, rank: index + 1 }));
      setSearch({
        status: items.length ? "ok" : "empty",
        query: trimmed,
        items,
      });
    } catch {
      setSearch({ status: "error", query: trimmed, items: [] });
    }
  };

  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <Hero categories={CATEGORIES} onSearch={handleSearch} />

      {search && (
        <section id={SEARCH_RESULTS_ID} className="section scroll-mt-28">
          {search.status === "ok" ? (
            <>
              <h2 className="font-primary text-2xl font-extrabold tracking-tight text-(--foreground)">
                Wikipedia results for &ldquo;{search.query}&rdquo;
              </h2>
              <p className="mt-1 text-sm text-(--muted-foreground) font-secondary">
                Live from Wikipedia, in Wikipedia&rsquo;s own result order —
                not one of the categories below.
              </p>
              <div className="mt-4">
                {search.items.map((item) => (
                  <RankedRow key={`search-${item.rank}`} item={item} />
                ))}
              </div>
            </>
          ) : (
            <SearchStatus status={search.status} query={search.query} />
          )}
        </section>
      )}

      <div className="section">
        {CATEGORIES.map((category) => (
          <CategorySection
            key={category.id}
            category={{
              ...category,
              items: liveItemsById?.[category.id] ?? category.items,
            }}
          />
        ))}
      </div>
    </main>
  );
}
