"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";

import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { useFirebaseExtensions } from "@/app/extensions/hooks/useFirebaseExtensions";
import { ArrowUpRight } from "lucide-react";


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
      const text = `${item.name} ${item.description || ""}`.toLowerCase();
      return text.includes(trimmedQuery);
    };

    return {
      tools: tools.filter(matchItem),
      extensions: dynamicExtensions.filter(matchItem),
    };
  }, [dynamicExtensions, isValid, tools, trimmedQuery]);

  if (!isValid) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="heading mb-6">Search</h1>
        <p className="description">
          Start typing at least 4 characters to see results.
        </p>
      </div>
    );
  }

  const hasResults =
    results.tools.length ||
    results.extensions.length;

  return (
    <div className="section-container py-20">

      {/* Hero Header */}
      <div className="mb-16 text-center">
        <h1 className="heading mb-4">Search Results</h1>
        <p className="description">
          Showing results for <span className="font-semibold text-[var(--foreground)]">"{query}"</span>
        </p>
      </div>

      {!hasResults && (
        <div className="text-center py-20">
          <h2 className="subheading mb-4">No results found</h2>
          <p className="description">
            Try using a different keyword.
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
    <section className="mb-20">
      <div className="mb-8">
        <h2 className="subheading">{title}</h2>
        <div className="h-[3px] w-16 bg-[var(--primary)] mt-3 rounded-full" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${base}/${item.slug}`}
            className="group relative rounded-2xl p-6 transition-all duration-300 border border-[var(--border)] bg-[var(--card)] hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />
            </div>

            <h3 className="font-primary text-lg font-bold mb-3 group-hover:text-[var(--primary)] transition">
              {item.name}
            </h3>

            <p className="font-secondary text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
              {item.description}
            </p>

            {/* Arrow Icon */}
            <div className="absolute bottom-5 right-5">
              <ArrowUpRight
                className="w-5 h-5 text-[var(--muted-foreground)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
