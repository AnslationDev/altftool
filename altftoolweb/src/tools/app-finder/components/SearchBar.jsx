 "use client" 
 import { Search, Filter } from "lucide-react";
import { useState } from "react";

export const SearchBar = ({
  query,
  setQuery,
  onSearch,
  loading,
  categories = [],
  handleCategory,
}) => {
  const [showFilter, setShowFilter] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full ">

        {/* INPUT */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search for apps... (e.g., Spotify, Instagram, WhatsApp)"
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-(--foreground) bg-(--card)"
          />
        </div>

        {/* FILTER BUTTON */}
        <div className="relative self-end sm:self-auto">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="p-3 rounded-xl hover:bg-(--muted) transition"
          >
            <Filter className="w-5 h-5 text-(--foreground)" />
          </button>

          {/* DROPDOWN */}
          {showFilter && (
            <div className="absolute right-0 top-12 bg-(--card) border border-(--border) rounded-lg shadow-lg w-44 z-50">
              {categories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => {
                    handleCategory(cat);
                    setShowFilter(false);
                  }}
                  className="px-4 py-2 text-sm text-(--foreground) hover:bg-(--muted) cursor-pointer"
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}
        <button
          onClick={onSearch}
          disabled={loading}
          className=" w-full sm:w-auto px-6 py-3 bg-(--primary) text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? (
            "Searching..."
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search
            </>
          )}
        </button>

      </div>
    </div>
  );
};