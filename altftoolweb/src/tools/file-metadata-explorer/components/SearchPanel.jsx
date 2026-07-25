"use client";

import { Search, X } from "lucide-react";

export default function SearchPanel({ search, onChange }) {
  return (
    <div className="relative">
      <Search size="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
      <input
        value={search}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files by name, type, or extension..."
        aria-label="Search files"
        className="w-full min-h-11 pl-9 pr-8 py-2 text-sm rounded-xl border border-(--border) bg-(--card) text-(--foreground) transition focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
      />
      {search && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded hover:bg-(--muted) text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
        >
          <X size="14" />
        </button>
      )}
    </div>
  );
}
