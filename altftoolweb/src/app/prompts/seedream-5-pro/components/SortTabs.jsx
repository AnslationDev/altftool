"use client";

const TABS = [
  { id: "liked", label: "Most Liked" },
  { id: "newest", label: "Newest" },
];

/**
 * Segmented "Most Liked / Newest" control matching Toolify's pill toggle.
 */
export default function SortTabs({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Sort prompts"
      className="inline-flex items-center gap-1 rounded-xl border border-(--color-border) bg-(--color-muted)/50 p-1"
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              active
                ? "bg-(--color-card) text-(--color-primary) shadow-sm"
                : "text-(--color-muted-foreground) hover:text-(--color-foreground)"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
