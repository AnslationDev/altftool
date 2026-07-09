"use client";

import { useMemo } from "react";
import { SORT_OPTIONS } from "@/app/buysmart/constants/categories";
import { ArrowUpDown, ChevronDown, Tags } from "lucide-react";

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
          <Tags
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--primary)"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="
              buy-smart-filter-select
              appearance-none
              px-4 py-2.5 pl-10 pr-10
              rounded-[var(--anslation-ds-radius)]
              text-(--muted-foreground)
              text-sm font-bold
              cursor-pointer
              outline-none
              w-full sm:w-auto
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
          <ArrowUpDown
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--primary)"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="
              buy-smart-filter-select
              appearance-none
              px-4 py-2.5 pl-10 pr-10
              rounded-[var(--anslation-ds-radius)]
              text-(--muted-foreground)
              text-sm font-bold
              cursor-pointer
              outline-none
              w-full sm:w-auto
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
