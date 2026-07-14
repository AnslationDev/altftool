"use client";

import React from "react";

export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <div className="flex gap-2 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-150
              ${active === cat
                ? "bg-(--primary) text-(--primary-foreground) shadow-sm"
                : "bg-(--muted) text-(--muted-foreground) border border-(--border) hover:bg-(--secondary-hover)"
              }`}
            aria-pressed={active === cat}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
