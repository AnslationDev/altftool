"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";

import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { useFirebaseExtensions } from "@/app/extensions/hooks/useFirebaseExtensions";
import { ArrowUpRight, Puzzle, Search, Wrench } from "lucide-react";

const POPULAR_SEARCHES = ["json", "pdf", "image", "base64", "regex", "coupon", "news", "academy"];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { extensions: dynamicExtensions, loading } = useFirebaseExtensions();

  const trimmedQuery = query.trim().toLowerCase();
  const isValid = trimmedQuery.length >= 2;

  const tools = useMemo(
    () =>
      Object.entries(toolMetaMap).map(([slug, data]) => ({
        slug,
        ...data,
      })),
    [],
  );

  const results = useMemo(() => {
    if (!isValid) return null;
    const matchItem = (item) => {
      const category = Array.isArray(item.category) ? item.category.join(" ") : item.category || "";
      const text = `${item.slug || ""} ${item.name} ${item.description || ""} ${category}`.toLowerCase();
      return text.includes(trimmedQuery);
    };
    const rankItem = (item) => {
      const name = String(item.name || "").toLowerCase();
      const slug = String(item.slug || "").replace(/-/g, " ");
      if (name === trimmedQuery || slug === trimmedQuery) return 0;
      if (name.startsWith(trimmedQuery) || slug.startsWith(trimmedQuery)) return 1;
      return 2;
    };

    return {
      tools: tools.filter(matchItem).sort((a, b) => rankItem(a) - rankItem(b) || a.name.localeCompare(b.name)),
      extensions: dynamicExtensions.filter(matchItem).sort((a, b) => rankItem(a) - rankItem(b) || a.name.localeCompare(b.name)),
    };
  }, [dynamicExtensions, isValid, tools, trimmedQuery]);

  if (!isValid) {
    return (
      <div className="section-container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-[8px] border border-(--border) bg-(--card) text-(--primary)">
            <Search className="h-5 w-5" />
          </div>
          <h1 className="heading mt-5 mb-4">Search AltFTool</h1>
          <p className="description">
            Type at least 2 characters to find tools, extensions, guides, and feature routes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-[7px] border border-(--border) bg-(--card) px-3 py-2 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasResults =
    results.tools.length ||
    results.extensions.length;

  return (
    <div className="section-container py-16">

      {/* Hero Header */}
      <div className="mb-10 text-center">
        <h1 className="heading mb-4">Search Results</h1>
        <p className="description">
          Showing results for <span className="font-semibold text-[var(--foreground)]">&quot;{query}&quot;</span>
        </p>
        {loading ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Refreshing extension results
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href={`/tools/all?search=${encodeURIComponent(query.trim())}`}
            className="inline-flex items-center gap-2 rounded-[7px] border border-(--border) bg-(--card) px-3 py-2 text-xs font-semibold text-(--foreground) transition hover:border-(--primary)"
          >
            <Wrench className="h-3.5 w-3.5" />
            Search tools directory
          </Link>
          <Link
            href="/extensions"
            className="inline-flex items-center gap-2 rounded-[7px] border border-(--border) bg-(--card) px-3 py-2 text-xs font-semibold text-(--foreground) transition hover:border-(--primary)"
          >
            <Puzzle className="h-3.5 w-3.5" />
            Browse extensions
          </Link>
        </div>
      </div>

      {!hasResults && (
        <div className="rounded-[8px] border border-(--border) bg-(--card) px-4 py-16 text-center">
          <h2 className="subheading mb-4">No results found</h2>
          <p className="description">
            Try a shorter keyword or open the tools directory search.
          </p>
        </div>
      )}

      <ResultSection title="Tools" items={results.tools} base="/tools/all" />
      <ResultSection title="Extensions" items={results.extensions} base="/extensions" />
    </div>
  );
}

function ResultSection({ title, items, base }) {
  if (!items.length) return null;

  return (
    <section className="mb-14">
      <div className="mb-8">
        <h2 className="subheading">{title}</h2>
        <div className="h-[3px] w-16 bg-[var(--primary)] mt-3 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${base}/${item.slug}`}
            className="group relative rounded-[8px] p-4 transition-all duration-200 border border-[var(--border)] bg-[var(--card)] hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-md"
          >
            <h3 className="font-primary text-base font-bold mb-2 group-hover:text-[var(--primary)] transition">
              {item.name}
            </h3>

            <p className="font-secondary text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
              {item.description}
            </p>
            {item.category ? (
              <div className="mt-4 flex flex-wrap gap-1">
                {(Array.isArray(item.category) ? item.category : [item.category]).slice(0, 3).map((category) => (
                  <span
                    key={category}
                    className="rounded-[6px] bg-(--muted) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Arrow Icon */}
            <div className="absolute bottom-4 right-4">
              <ArrowUpRight
                className="w-4 h-4 text-[var(--muted-foreground)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
