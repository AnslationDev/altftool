"use client";

import clsx from "clsx";

// Reusable category selector rendered as chips. Includes an "All" option.
export default function CategoryChips({ categories, value, onChange }) {
  const options = ["All", ...categories];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((cat) => {
        const active = value === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95",
              active
                ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                : "border-(--border) bg-(--background) text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
            )}
            aria-pressed={active}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
