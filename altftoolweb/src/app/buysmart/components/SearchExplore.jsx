import { useState, useEffect } from "react";

import { Search } from "lucide-react";

import { firebaseBuySmartCategoriesSource } from "../service.js/firebaseBuySmartCategories";
import { SearchExploreSkeleton } from "@/components/ui/skeleton";

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
    const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {
      setCategoriesData(data || []);
    });

    return () => unsub && unsub();
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

    if (matched) {
      setError("");

      onSearchResult(matched.category, matched.title);

      setSearchInput(" ")

      setTimeout(() => {
        scrollToFilter();
      }, 200);
    } else {
      

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

      
        <div className="flex items-center w-full max-w-full sm:max-w-xl lg:max-w-2xl rounded-full px-4 sm:px-5 md:px-7 py-3 sm:py-4 gap-3 bg-white border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] focus-within:ring-1 focus-within:ring-(--primary) transition duration-300">
          <Search className="text-[#979FB4] shrink-0" size={20} />

          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              SetSearchInput(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInputString(e);
            }}
            placeholder="Search brands by name, category, or keyword..."
            className="flex-1 min-w-0 text-black outline-none placeholder-[#979FB4] text-sm sm:text-base bg-transparent "
          />
        </div>
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
