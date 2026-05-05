"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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

  const handleSearch = () => {
    const searchBrand = searchInput.toLowerCase().trim();

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
    <section className="overflow-hidden rounded-[var(--anslation-ds-radius)] bg-(--search-buysmart) px-4 pb-0 pt-6 animate-slide-up sm:px-6 lg:px-10">
      <div className="section-container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex w-full flex-col items-center justify-center gap-5 text-center animate-slide-right lg:items-start lg:text-left">
            <div className="w-full space-y-3">
              <h2 className="section-title font-normal text-(--foreground)">
                Find Your Favourite Brand
              </h2>

              <p className="section-subtitle !mx-0 max-w-full">
                Type the brand name and explore directly.
              </p>
            </div>

            <div className="flex w-full max-w-full items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 py-2 shadow-[var(--anslation-ds-shadow-sm)] transition duration-200 focus-within:border-(--primary) focus-within:ring-2 focus-within:ring-(--primary) sm:max-w-xl lg:max-w-2xl">
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
              <button
                type="button"
                onClick={handleSearch}
                className="h-9 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
              >
                Search
              </button>
            </div>
            {error ? (
              <p className="text-sm font-medium text-[var(--anslation-ds-danger)]">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex h-full items-end justify-center animate-slide-left lg:justify-end">
            <ManagedImage
              src="/searchbrand.png"
              alt="Search Brands"
              loading="lazy"
              decoding="async"
              className="block w-full max-w-[220px] object-contain sm:max-w-xs md:max-w-md lg:max-w-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
