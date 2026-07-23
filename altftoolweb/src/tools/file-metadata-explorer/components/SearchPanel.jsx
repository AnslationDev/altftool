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
        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
      />
      {search && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-(--muted) text-(--muted-foreground)"
        >
          <X size="14" />
        </button>
      )}
    </div>
  );
}
