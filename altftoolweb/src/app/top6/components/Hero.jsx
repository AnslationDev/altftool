"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import CategoryPills from "./CategoryPills";

/**
 * The page heading and its search box.
 *
 * The h1 and the paragraph under it are plain static markup, not
 * animated and not gated on any fetch, so they are in the server-
 * rendered HTML even when every provider is down.
 *
 * The branch's subheading read "Smart picks, expert rankings, and real
 * reviews - all in one place." There are no experts, no reviews and no
 * ranking step; the line below says what the page actually does.
 */
export default function Hero({ categories, onSearch }) {
  const [query, setQuery] = useState("");

  return (
    <section className="section text-center">
      <h1 className="font-primary text-4xl font-extrabold tracking-tight text-(--foreground) sm:text-5xl">
        Top 6 Lists
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-(--muted-foreground) font-secondary">
        Six picks per category, pulled from the same public data sources that
        power Top10 and shown in each source&rsquo;s own order. Nothing here is
        scored, voted on, or sponsored.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(query);
        }}
        className="mx-auto mt-6 max-w-xl"
        role="search"
      >
        <label htmlFor="top6-search" className="sr-only">
          Search Top6 categories and Wikipedia
        </label>
        <div className="flex items-center gap-2 rounded-full border border-(--border) bg-(--card) p-1.5">
          <Search
            className="ml-3 h-4 w-4 shrink-0 text-(--muted-foreground)"
            aria-hidden="true"
          />
          <input
            id="top6-search"
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a category, or anything else"
            className="w-full bg-transparent py-2 text-sm font-secondary text-(--foreground) outline-none placeholder:text-(--muted-foreground)"
          />
          <button
            type="submit"
            className="flex h-11 shrink-0 items-center rounded-full bg-(--primary) px-5 text-sm font-semibold text-(--primary-foreground) font-secondary transition-colors hover:bg-(--primary-hover) motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            Search
          </button>
        </div>
      </form>

      <CategoryPills categories={categories} />
    </section>
  );
}
