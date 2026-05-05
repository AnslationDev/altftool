"use client";

import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ searchQuery = "", setSearchQuery }) => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          className="
            p-6 md:p-8
            rounded-2xl
            bg-(--card)
            border border-(--border)
            transition
            hover:border-(--primary)
          "
        >
          {/* Title */}
          <h2 className="text-center subheading mb-2">🔍 Search Timezones</h2>

          <p className="text-center description mb-6">
            Search by country, city, or timezone name
          </p>

          {/* Search Input */}
          <div
            className="
              flex items-center gap-3
              px-4 py-3
              rounded-xl
              bg-(--background)
              border border-(--border)
              focus-within:border-(--primary)
              transition
            "
          >
            <Search className="w-5 h-5 text-(--primary)" />

            <input
              type="text"
              placeholder="Search (e.g., London, Tokyo, America)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              className="
                w-full
                bg-transparent
                outline-none
                text-(--foreground)
                placeholder:text-(--muted-foreground)
                text-sm sm:text-base
              "
            />
          </div>

          {/* Tip */}
          <p className="mt-5 text-center text-(--muted-foreground) text-sm sm:text-base">
            💡 Tip: Search “America”, “Europe”, “Asia” to see regions!
          </p>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
