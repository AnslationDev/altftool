"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Trending from "./components/Trending";
import ContentArea from "./components/ContentArea";
import FeaturedList from "./components/FeaturedList";
import { blogs } from "./data/blogs";

function Top9Content() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const category = searchParams.get("category") || "";

  const filteredBlogs = useMemo(() => {
    const q = query.toLowerCase();
    return blogs.filter((item) => {
      const matchesQuery = !q || item.title.toLowerCase().includes(q);
      const matchesCategory = !category || item.cat === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const isFiltering = Boolean(query || category);

  return (
    <>
      <Hero />
      {isFiltering && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="top9-panel rounded-full px-5 py-3 flex items-center justify-between mb-4">
            <p className="text-sm">
              Showing results
              {query && <> for &quot;{query}&quot;</>}
              {category && (
                <>
                  {" "}
                  in <span className="font-semibold">{category}</span>
                </>
              )}
            </p>
            <Link href="/top9" className="top9-link text-sm font-semibold">
              Clear
            </Link>
          </div>
        </div>
      )}

      <div className="top9-shell top9-main-grid top9-page-flow">
        <div>
          <Categories activeCategory={category} />
          <Trending searchQuery={query} />
          <ContentArea searchQuery={query} />
          <FeaturedList
            blogs={filteredBlogs}
            activeCategory={category}
            searchQuery={query}
          />
        </div>
        <ContentArea sidebarOnly />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <main className="top9-page min-h-screen">
      <Suspense fallback={null}>
        <Top9Content />
      </Suspense>
    </main>
  );
}
