"use client";

import { Search, X, Chrome, Tag } from "lucide-react";

export default function AcademyFilters({
  search, setSearch,
  category, setCategory, categories,
  academyFilter, setAcademyFilter,
  totalFiltered, totalAll,
}) {
  const hasFilters = search || category || academyFilter;

  const clearAll = () => {
    setSearch("");
    setCategory("");
    setAcademyFilter("");
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm px-4 py-3 flex flex-wrap items-center gap-3 mb-5">

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search academies..."
          className="w-full pl-8 pr-8 py-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)] placeholder:text-[var(--muted)] transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="relative">
        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="pl-7 pr-8 py-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)] text-[var(--foreground)] appearance-none cursor-pointer transition min-w-[160px]">
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Link filter */}
      <div className="relative">
        <Chrome className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
        <select value={academyFilter} onChange={(e) => setAcademyFilter(e.target.value)}
          className="pl-7 pr-8 py-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)] text-[var(--foreground)] appearance-none cursor-pointer transition min-w-[180px]">
          <option value="">All Academies</option>
          <option value="hasLink">Link available</option>
          <option value="noLink">Link not available</option>
        </select>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center gap-2 ml-auto">
        {typeof totalFiltered === "number" && (
          <span className="text-xs text-[var(--muted)] whitespace-nowrap">
            {totalFiltered} of {totalAll} result{totalAll !== 1 ? "s" : ""}
          </span>
        )}
        {hasFilters && (
          <button onClick={clearAll}
            className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--surface-soft)] hover:bg-[var(--border)] px-2.5 py-1 rounded-lg transition font-medium">
            <X className="w-3 h-3" />Clear
          </button>
        )}
      </div>
    </div>
  );
}