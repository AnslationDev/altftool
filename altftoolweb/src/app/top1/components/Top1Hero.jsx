"use client";

import { useState } from "react";
import { Search } from "lucide-react";

/**
 * The page heading and its search box.
 *
 * The h1 and the line under it are plain static markup — not animated,
 * not gated on a fetch — so they are in the server-rendered HTML even
 * when every provider is unreachable.
 *
 * The branch shipped three hero chips ("Live highlights", "Premium
 * pacing", "One clear point of view") and a "Curated categories" counter
 * over a randomly shuffled list. Nothing curated the list, so the chips
 * and the counter are gone and the copy says what the page does.
 */
export default function Top1Hero({ onSearch }) {
  const [query, setQuery] = useState("");

  return (
    <section className="section text-center">
      <h1 className="font-primary text-4xl font-extrabold tracking-tight text-(--foreground) sm:text-5xl">
        Top 1: One Pick Per Category
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-(--muted-foreground) font-secondary">
        A single entry from every category AltFTool tracks — whichever one its
        public data source lists first, refreshed live in your browser. No
        score, no vote and no sponsorship decides what appears here.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(query);
        }}
        className="mx-auto mt-6 max-w-xl"
        role="search"
      >
        <label htmlFor="top1-search" className="sr-only">
          Search Top1 categories and Wikipedia
        </label>
        <div className="flex items-center gap-2 rounded-full border border-(--border) bg-(--card) p-1.5">
          <Search
            className="ml-3 h-4 w-4 shrink-0 text-(--muted-foreground)"
            aria-hidden="true"
          />
          <input
            id="top1-search"
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
    </section>
  );
}
