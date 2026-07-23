"use client";

import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for a word..."
        autoFocus
        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-4 text-base font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-sm placeholder:font-normal placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
      />
    </div>
  );
}
