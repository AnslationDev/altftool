"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";

import { useBuySmartCategories } from "@/app/buysmart/hooks/useBuySmartLiveData";
import ManagedImage from "@/components/ui/ManagedImage";

export default function SearchExplore({
  scrollToFilter,
  onSearchResult,
  SetSearchInput,
  searchInput,
}) {
  const { items: categoriesData } = useBuySmartCategories();
  const [error, setError] = useState("");

  const quickSearches = useMemo(() => {
    const counts = (categoriesData || []).reduce((acc, item) => {
      const category = item.category || "Popular";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [categoriesData]);

  const handleSearch = (overrideValue) => {
    const rawSearch = typeof overrideValue === "string" ? overrideValue : searchInput;
    const searchBrand = rawSearch.toLowerCase().trim();

    if (!searchBrand) {
      setError("Please enter a brand name");
      onSearchResult(null);
      return;
    }

    const matched = categoriesData.filter((item) => {
      const category = (item.category || "").toLowerCase();
      const title = (item.title || "").toLowerCase();
      const dealText = [
        item.discount,
        item.cashback,
        item.points,
        item.code,
        item.audience,
        item.offerType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        category.includes(searchBrand) ||
        title.includes(searchBrand) ||
        dealText.includes(searchBrand)
      );
    });

    if (matched.length) {
      setError("");

      if (typeof overrideValue === "string") SetSearchInput(overrideValue);
      onSearchResult(matched);

      window.requestAnimationFrame(() => {
        scrollToFilter();
      });
    } else {
      setError("No matching brands found. Try another keyword.");
      onSearchResult(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) px-4 py-5 shadow-[var(--anslation-ds-shadow-sm)] animate-slide-up sm:px-6 lg:px-8">
      <div className="section-container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_340px] lg:gap-10">
          <div className="flex w-full flex-col items-center justify-center gap-5 text-center animate-slide-right lg:items-start lg:text-left">
            <div className="w-full space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
                <Sparkles className="h-3.5 w-3.5 text-(--primary)" />
                Fast brand lookup
              </div>
              <h2 className="section-title mb-2 text-(--foreground)">
                Search a brand, category, or saving type
              </h2>

              <p className="section-subtitle !mx-0 max-w-2xl">
                Jump directly to matching stores and offers without scrolling through the full directory.
              </p>
            </div>

            <div className="flex w-full max-w-full items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-2 shadow-[var(--anslation-ds-shadow-sm)] transition duration-200 focus-within:border-(--primary) focus-within:ring-2 focus-within:ring-(--primary) sm:max-w-xl lg:max-w-2xl">
              <Search className="shrink-0 text-(--muted-foreground)" size={20} />

              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  SetSearchInput(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search brands by name, category, or keyword..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-(--foreground) outline-none placeholder:text-(--input-placeholder) sm:text-base"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    SetSearchInput("");
                    setError("");
                    onSearchResult(null);
                  }}
                  className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--anslation-ds-radius-xs)] text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
                  aria-label="Clear BuySmart search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-3 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover) sm:px-4"
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {error ? (
              <p className="text-sm font-medium text-[var(--anslation-ds-danger)]">
                {error}
              </p>
            ) : null}

            <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                Try
              </span>
              {quickSearches.map(([category, count]) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSearch(category)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[var(--anslation-ds-radius-xs)] border border-(--border) bg-(--background) px-2.5 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
                >
                  {category}
                  <span className="rounded-full bg-(--muted) px-1.5 py-0.5 text-[10px] text-(--muted-foreground)">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[240px] overflow-hidden rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) p-5 animate-slide-left md:block">
            <ManagedImage
              src="/searchbrand.png"
              alt="Search Brands"
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 right-2 block w-[230px] object-contain opacity-95 lg:w-[280px]"
            />
            <div className="relative z-10 max-w-[180px]">
              <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                Result flow
              </p>
              <p className="mt-2 text-xl font-bold leading-tight text-(--foreground)">
                Search once, then continue in the filtered directory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
