"use client";

import { useMemo } from "react";
import { SORT_OPTIONS } from "@/app/buysmart/constants/categories";
import { ChevronDown } from "lucide-react";

export default function FilterRow({
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categoryDropDown = [],
}) {
  const categories = useMemo(() => {
    const formatted = categoryDropDown
      .map((cat) => (typeof cat === "string" ? cat : cat?.category || cat?.value || ""))
      .map((cat) => cat.trim())
      .filter(Boolean);

    const uniqueCategories = [...new Set(formatted)].sort((a, b) => a.localeCompare(b));

    return [
      { value: "All", label: "All Categories" },
      ...uniqueCategories.map((category) => ({
        value: category,
        label: category,
      })),
    ];
  }, [categoryDropDown]);

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="
              appearance-none
              px-4 py-2.5 pr-10
              rounded-[var(--anslation-ds-radius)]
              border border-(--border)
              bg-(--background)
              text-(--muted-foreground)
              text-sm sm:text-base font-medium
              shadow-[var(--anslation-ds-shadow-sm)]
              cursor-pointer
              outline-none
              w-full sm:w-auto
              focus:border-(--primary) focus:ring-2 focus:ring-(--primary)
            "
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
        <span className="whitespace-nowrap text-sm font-medium text-(--muted-foreground) sm:text-base">
          Sort by:
        </span>

        <div className="relative w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="
              appearance-none
              px-4 py-2.5 pr-10
              rounded-[var(--anslation-ds-radius)]
              border border-(--border)
              bg-(--background)
              text-(--muted-foreground)
              text-sm sm:text-base font-medium
              shadow-[var(--anslation-ds-shadow-sm)]
              cursor-pointer
              outline-none
              w-full sm:w-auto
              focus:border-(--primary) focus:ring-2 focus:ring-(--primary)
            "
          >
            {SORT_OPTIONS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
          />
        </div>
      </div>
    </div>
  );
}
