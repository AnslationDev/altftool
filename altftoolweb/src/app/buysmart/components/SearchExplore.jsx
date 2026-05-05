import { useState, useEffect } from "react";

import { Search } from "lucide-react";

import { firebaseBuySmartCategoriesSource } from "../service.js/firebaseBuySmartCategories";
import { SearchExploreSkeleton } from "@/components/ui/skeleton";
import fallbackBrands from "@/app/buysmart/data/categories.json";

const fallbackCategories = fallbackBrands.map((brand) => ({
  category: "Popular",
  link: brand.url,
  status: "active",
  title: brand.name,
}));

export default function SearchExplore({
  scrollToFilter,
  onSearchResult,
  SetSearchInput,
  searchInput,
  handleInputString,
  loading = false,
}) {
  const [categoriesData, setCategoriesData] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    const fallback = setTimeout(() => {
      setCategoriesData(fallbackCategories);
    }, 1800);

    const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {
      clearTimeout(fallback);
      const activeData = (data || []).filter((item) => item?.status === "active");
      setCategoriesData(activeData.length ? activeData : fallbackCategories);
    });

    return () => {
      clearTimeout(fallback);
      unsub && unsub();
    };
  }, []);

  const handleSearch = () => {
    const searchBrand = searchInput.toLowerCase().trim();

    if (!searchBrand) {
      setError("Please enter a brand name");

      onSearchResult(null, null);

      return;
    }

    const matched = categoriesData.filter((item) => {
      const category = (item.category || "").toLowerCase();

      const title = (item.title || "").toLowerCase();

      return category.startsWith(searchBrand) || title.startsWith(searchBrand);
    });

    if (matched.length) {
      setError("");

      onSearchResult(matched);

      setTimeout(() => {
        scrollToFilter();
      }, 200);
    } else {
      setError("No matching brands found. Try another keyword.");

      onSearchResult(null, null);
    }
  };

  if (loading) {
    return <SearchExploreSkeleton />;
  }

  return (
 <section className="bg-(--search-buysmart) rounded-lg px-4 sm:px-6 lg:px-10 pt-6 pb-0 overflow-hidden animate-slide-up">
  <div className="max-w-7xl mx-auto section-container">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      
      {/* Left Content */}
      <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-5 w-full animate-slide-right">
        
        <div className="space-y-3 w-full">
          <h2 className="section-title text-(--foreground) font-normal">
            Find Your Favourite Brand
          </h2>

          <p className="section-subtitle !mx-0 max-w-full">
            Type the brand name and explore directly.
          </p>
        </div>

      
        <div className="flex items-center w-full max-w-full sm:max-w-xl lg:max-w-2xl rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 py-2 shadow-[var(--anslation-ds-shadow-sm)] transition duration-300 focus-within:border-(--primary) focus-within:ring-2 focus-within:ring-(--primary)">
          <Search className="text-(--muted-foreground) shrink-0" size={20} />

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

      {/* Right Image */}
      <div className="flex justify-center lg:justify-end items-end h-full animate-slide-left">
        <img
          src="/searchbrand.png"
          alt="Search Brands"
          className="block w-full max-w-[220px] sm:max-w-xs md:max-w-md lg:max-w-lg object-contain"
        />
      </div>

    </div>
  </div>
</section>
  );
}
