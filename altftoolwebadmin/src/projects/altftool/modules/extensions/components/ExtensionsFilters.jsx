"use client";

import { Search, X, Chrome, Tag } from "lucide-react";

export default function ExtensionsFilters({
  search, setSearch,
  category, setCategory, categories,
  chromeFilter, setChromeFilter,
  totalFiltered, totalAll,
}) {
  const hasFilters = search || category || chromeFilter;

  const clearAll = () => {
    setSearch("");
    setCategory("");
    setChromeFilter("");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search extensions…"
          className="w-full pl-8 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-gray-400 transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="relative">
        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="pl-7 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-gray-700 appearance-none cursor-pointer transition min-w-[160px]">
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Chrome filter */}
      <div className="relative">
        <Chrome className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <select value={chromeFilter} onChange={(e) => setChromeFilter(e.target.value)}
          className="pl-7 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-gray-700 appearance-none cursor-pointer transition min-w-[180px]">
          <option value="">All Extensions</option>
          <option value="chrome">On Chrome Store</option>
          <option value="noChrome">Not on Chrome Store</option>
        </select>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center gap-2 ml-auto">
        {typeof totalFiltered === "number" && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {totalFiltered} of {totalAll} result{totalAll !== 1 ? "s" : ""}
          </span>
        )}
        {hasFilters && (
          <button onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition font-medium">
            <X className="w-3 h-3" />Clear
          </button>
        )}
      </div>
    </div>
  );
}