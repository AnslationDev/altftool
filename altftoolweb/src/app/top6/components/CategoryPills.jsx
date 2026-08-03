"use client";

import { slugFor } from "../lib/slugFor";

/**
 * Jump links for the categories actually rendered below.
 *
 * The branch shipped a hardcoded pill list ("Trending", "Products",
 * "Software", "Finance", "Health", "More") whose ids matched no category
 * on the page, so every one of them scrolled to a missing anchor. These
 * are built from the same array the sections are built from, so a pill
 * can never point at something that is not there.
 */
export default function CategoryPills({ categories }) {
  if (!categories.length) return null;

  return (
    <nav aria-label="Top6 categories" className="mt-6">
      <ul className="flex flex-wrap justify-center gap-2">
        {categories.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <a
              href={`#${slugFor(id)}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-(--border) bg-(--muted) px-3 py-1.5 text-xs font-medium text-(--foreground) font-secondary transition-colors hover:border-(--primary)/40 hover:text-(--primary-text) motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
