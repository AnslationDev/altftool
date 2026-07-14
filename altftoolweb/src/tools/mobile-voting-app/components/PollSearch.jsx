"use client";

import { Search, X, Filter, ArrowUpDown } from "lucide-react";

const PollSearch = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="rounded-2xl p-4 shadow-md border bg-(--card) border-(--border) space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            type="text"
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition text-sm text-(--foreground)"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-(--muted) transition cursor-pointer text-(--muted-foreground)"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-(--muted-foreground)" />
          {["all", "active", "closed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === status
                  ? "bg-(--primary) text-(--primary-foreground)"
                  : "bg-(--muted) text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={14} className="text-(--muted-foreground)" />
          {["newest", "oldest"].map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                sortBy === sort
                  ? "bg-(--primary) text-(--primary-foreground)"
                  : "bg-(--muted) text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              {sort === "newest" ? "Newest" : "Oldest"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PollSearch;
