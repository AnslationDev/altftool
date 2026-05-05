"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";

import { DomainContext } from "../context/DomainContext";
import { useContext } from "react";

// FILTERS
import FiltersSidebar from "./FiltersSidebar";
import DomainEmpty from "./DomainEmpty";

export default function SearchForm({
  keyword,
  setKeyword,
  onSubmit,
  isLoading,
}) {
  const { suggestions } = useContext(DomainContext);

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword, e.g., AI, travel"
          className="grow p-4 border-2 border-(--border) rounded-xl transition"
          disabled={isLoading}
        />

        <button
          type="submit"
          className={`px-6 py-4 bg-(--primary) text-white font-semibold rounded-xl shadow-lg flex items-center justify-center transition-all whitespace-nowrap ${
            isLoading ? "cursor-not-allowed" : "hover:scale-105"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Generate
            </>
          )}
        </button>
      </form>

      <div className="mt-4">
        <FiltersSidebar />
      </div>

      {!isLoading || suggestions.length === 0 || keyword.trim() && (
        <DomainEmpty />
      )}
    </div>
  );
}