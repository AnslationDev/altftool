"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, matchCount, filtersActive }) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search files and folders…"
        aria-label="Search files and folders"
        className="w-full rounded-xl border border-(--border) bg-(--card) py-2.5 pl-10 pr-10 text-sm text-(--foreground) shadow-sm outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {filtersActive && value && (
        <span className="absolute right-3 top-full mt-1 text-xs text-(--muted-foreground)">
          {matchCount} match{matchCount === 1 ? "" : "es"}
        </span>
      )}
    </div>
  );
}
