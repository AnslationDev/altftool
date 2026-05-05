// app/blogs/page.jsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import BlogCard              from "./components/BlogCard";
import AdCard                from "./components/AdCard";
import CategoryFilter        from "./components/CategoryFilter";
import FeaturedSection       from "./components/FeaturedSection";
import BlogHeroSection       from "./components/BlogHeroSection";
import FeaturedPostsSection  from "./components/FeaturedPostsSection";
import BlogPageTwoColumn     from "./components/BlogPageTwoColumn";
import { useBlogs }          from "./context/BlogsProvider";
import { useCategories }     from "./context/CategoriesProvider";
import { useAds }            from "@/ads/AdsProvider";
import { useBlogSearch }     from "./hooks/useBlogSearch";
import {
  Search, X, BookOpen, Layers, ArrowRight,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// ─────────────────────────────────────────────
//  Ad interleaving
// ─────────────────────────────────────────────
function interleaveAds(posts, ads, minGap = 3) {
  if (!ads?.length) return posts.map((data) => ({ type: "blog", data }));
  const items = posts.map((data) => ({ type: "blog", data }));
  const slots = [];
  for (let i = minGap; i < items.length; i += minGap + 1) slots.push(i);
  const shuffled = [...slots].sort(() => Math.random() - 0.5);
  const toInsert = ads
    .slice(0, shuffled.length)
    .map((ad, i) => ({ index: shuffled[i], ad }))
    .sort((a, b) => b.index - a.index);
  toInsert.forEach(({ index, ad }) =>
    items.splice(index, 0, { type: "ad", data: ad })
  );
  return items;
}

// ─────────────────────────────────────────────
//  Skeleton primitives
// ─────────────────────────────────────────────
function Bone({ className = "" }) {
  return (
    <div className={`rounded-xl bg-(--card) relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite]
                      bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}
function SkeletonBlogCard() {
  return (
    <div className="rounded-2xl border border-(--border) overflow-hidden bg-(--card) shadow-sm">
      <Bone className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Bone className="h-3 w-16 rounded-full" /><Bone className="h-4 w-full" />
        <Bone className="h-4 w-3/4" /><Bone className="h-3 w-1/2" />
      </div>
    </div>
  );
}
function SkeletonBlogGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {[...Array(count)].map((_, i) => <SkeletonBlogCard key={i} />)}
    </div>
  );
}
function SkeletonHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-4 mt-6">
      <Bone className="h-[340px] lg:h-[420px] rounded-2xl" />
      <div className="space-y-3">{[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Bone className="w-20 h-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2 py-1">
            <Bone className="h-3 w-full rounded-full" />
            <Bone className="h-3 w-3/4 rounded-full" />
          </div>
        </div>
      ))}</div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Bone className="w-20 h-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2 py-1">
            <Bone className="h-3 w-full rounded-full" />
            <Bone className="h-3 w-3/4 rounded-full" />
          </div>
        </div>
      ))}</div>
    </div>
  );
}
function SkeletonHorizontalCard() {
  return (
    <div className="flex gap-4 border border-(--border) rounded-2xl overflow-hidden bg-(--card) p-3 shadow-sm">
      <Bone className="w-28 h-20 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2 py-1">
        <Bone className="h-3 w-20 rounded-full" />
        <Bone className="h-4 w-full" />
        <Bone className="h-3 w-3/4 rounded-full" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Lazy section wrapper (IntersectionObserver)
// ─────────────────────────────────────────────
function LazySection({ children, skeleton, rootMargin = "200px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [rootMargin]);
  return <div ref={ref}>{visible ? children : skeleton}</div>;
}

// ─────────────────────────────────────────────
//  Infinite scroll sentinel
// ─────────────────────────────────────────────
function LoadMoreSentinel({ onVisible, loading, hasMore }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !hasMore) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) onVisible(); },
      { rootMargin: "400px" }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [hasMore, onVisible]);

  return (
    <div ref={ref} className="py-8 flex justify-center">
      {loading && hasMore && (
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i}
              className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Search bar
// ─────────────────────────────────────────────
function SearchBar({ value, onChange, onClear }) {
  const inputRef = useRef(null);
  return (
    <div className="relative w-full max-w-xl mx-auto group">
      <div className="absolute inset-0 rounded-2xl bg-blue-500/10 opacity-0
                      group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm scale-105" />
      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--foreground)
                 group-focus-within:text-blue-500 transition-colors duration-200 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles, topics, categories…"
        className="w-full pl-10 pr-10 py-3 rounded-2xl border border-(--border) bg-(--card) text-(--foreground) text-sm
          placeholder:text-(--muted-foreground) shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25
          focus:border-blue-400 hover:border-(--border) transition-all duration-200"
      />
      {value && (
        <button onClick={onClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center
            justify-center rounded-full bg-(--card) hover:bg-blue-100 text-(--muted-foreground)
            hover:text-blue-600 transition-all duration-200"
          aria-label="Clear search">
          <X size={11} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Blog grid
// ─────────────────────────────────────────────
function BlogGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {items.map((item, idx) =>
        item.type === "ad" ? (
          <AdCard key={`ad-${idx}`} src={item.data} height="h-64" />
        ) : (
          <BlogCard key={item.data.id ?? idx} blog={item.data} />
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Section heading
// ─────────────────────────────────────────────
function SectionHeading({ children, subtitle, icon: Icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Icon size={14} className="text-(--foreground)" />
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--foreground)">
          {children}
        </h2>
      </div>
      {subtitle && <p className="text-sm text-(--muted-foreground) mt-1 ml-11">{subtitle}</p>}
      <div className="mt-2.5 h-0.5 w-16 bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full ml-11" />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Page header
// ─────────────────────────────────────────────
function PageHeader({ title, subtitle, isSearching }) {
  return (
    <div className="flex flex-col gap-2 items-center text-center">
      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100
                      text-blue-600 text-[10px] font-bold uppercase tracking-widest
                      px-3 py-1.5 rounded-full mb-1">
        <BookOpen size={10} />
        {isSearching ? "Search" : "Blog"}
      </div>
      <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl
                     bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-400
                     bg-clip-text text-transparent tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-gray-500 max-w-md mt-1 px-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
export default function BlogsPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const urlCategory = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("q") || "";

  const {
    // Layer 1 — above-the-fold sections
    initialBlogs,
    booting,
    // Layer 2 — infinite scroll grid
    blogs,
    loading,
    hasMore,
    loadMore,
    setCategory,
  } = useBlogs();

  const blogListAds    = useAds({ placement: "blog_list" });
  const categoriesData = useCategories();

  // Sync URL category → provider
  useEffect(() => {
    setCategory(urlCategory);
  }, [urlCategory, setCategory]);

  const setUrlCategory = (cat) => {
    const p = new URLSearchParams(searchParams.toString());
    cat === "All" ? p.delete("category") : p.set("category", cat);
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const setSearchQuery = (val) => {
    const p = new URLSearchParams(searchParams.toString());
    val.trim() ? p.set("q", val) : p.delete("q");
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("q");
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const categories = useMemo(
    () => ["All", ...categoriesData.map((c) => c.name)],
    [categoriesData]
  );

  // ── Search: runs over paginated blogs (fast, client-side) ──────────────────
  const searchFiltered = useBlogSearch(blogs, searchQuery);
  const isSearching    = Boolean(searchQuery.trim());
  const displayBlogs   = isSearching ? searchFiltered : blogs;

  // ── Section data — ALWAYS from initialBlogs (Layer 1) ─────────────────────
  // These slices are stable: initialBlogs is fetched once and never changes.
  const heroBlogs     = initialBlogs.slice(0, 10);   // carousel + side lists
  const trendingBlogs = initialBlogs.slice(9, 18);   // trending grid (up to 9)
  const featured      = initialBlogs[0] ?? null;     // featured hero card
  const sideBlogs     = initialBlogs.slice(1, 5);    // featured sidebar (4 posts)
  const twoColBlogs   = initialBlogs.slice(5, 17);   // two-column section (12 posts)
  const moreBlogs     = initialBlogs.slice(17);      // horizontal "more you may like"

  // ── Grid data — from paginated blogs (Layer 2) ─────────────────────────────
  const gridWithAds = useMemo(
    () => interleaveAds(blogs, blogListAds, 3),
    // Recompute only when lengths change, not on every reference update
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blogs.length, blogListAds.length]
  );

  const filteredWithAds = useMemo(
    () => interleaveAds(displayBlogs, blogListAds, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayBlogs.length, blogListAds.length]
  );

  const isAllView = !isSearching && urlCategory === "All";

  const pageTitle = isSearching
    ? "Search Results"
    : urlCategory === "All" ? "Explore Blogs" : `${urlCategory} Blogs`;

  return (
    <>
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(200%); } }
      `}</style>

      <div className="bg-(--background) text-(--foreground) overflow-x-hidden">
        <div id="blogs-container" className="px-3 sm:px-4 md:px-6 py-6 md:py-10 w-full mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col gap-4">
            <PageHeader
              title={pageTitle}
              subtitle={isAllView ? "Discover curated articles across different categories." : undefined}
              isSearching={isSearching}
            />
            <div className="mt-1">
              {booting
                ? <Bone className="h-12 w-full max-w-xl mx-auto rounded-2xl" />
                : <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={clearSearch} />
              }
            </div>
            {!isSearching && (
              <div className="sticky top-0 z-10 backdrop-blur-md py-2 rounded-xl">
                {booting
                  ? <div className="flex gap-3 mt-2 overflow-hidden">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-9 w-24 rounded-full bg-(--card) animate-pulse shrink-0" />
                      ))}
                    </div>
                  : <CategoryFilter
                      categories={categories}
                      activeCategory={urlCategory}
                      setActiveCategory={setUrlCategory}
                      blogs={blogs}
                    />
                }
              </div>
            )}
          </div>

          {/* ════ SEARCH MODE ════ */}
          {isSearching && (
            <div id="search-grid" className="mt-4">
              {booting ? <SkeletonBlogGrid count={9} /> : (
                <>
                  <div className="mt-6 mb-5 flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                      <Search size={11} className="text-blue-500" />
                      <span className="text-[12px] font-semibold text-blue-700">
                        {displayBlogs.length === 0
                          ? "No results"
                          : `${displayBlogs.length} result${displayBlogs.length !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                    <span className="text-sm text-(---muted-foreground)">
                      for <span className="font-semibold text-(--foreground)">"{searchQuery}"</span>
                    </span>
                  </div>
                  {displayBlogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-(--muted-foreground)">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Search size={28} strokeWidth={1.5} className="text-blue-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-(--foreground)">No articles found</p>
                        <p className="text-sm mt-1">Try a different keyword or browse by category.</p>
                      </div>
                    </div>
                  ) : (
                    <BlogGrid items={filteredWithAds} />
                  )}
                </>
              )}
            </div>
          )}

          {/* ════ ALL CATEGORY VIEW ════ */}
          {isAllView && (
            <>
              {/* Hero — uses initialBlogs, shows skeleton until booting resolves */}
              {booting ? <SkeletonHero /> : (
                <div className="mt-8">
                  <BlogHeroSection
                    carouselBlogs={heroBlogs}
                    leftBlogs={heroBlogs.slice(0, 4)}
                    rightBlogs={heroBlogs.slice(5, 9)}
                  />
                </div>
              )}

              {/* Trending — uses initialBlogs */}
              <div className="mt-14 md:mt-16">
                <LazySection
                  rootMargin="300px"
                  skeleton={<SkeletonBlogGrid count={9} />}
                >
                  <FeaturedPostsSection posts={trendingBlogs} title="Trending Now" />
                </LazySection>
              </div>

              {/* What's New — uses initialBlogs */}
              <div className="mt-14 md:mt-16">
                <SectionHeading icon={Layers} subtitle="The freshest content, just published">
                  What's New
                </SectionHeading>
                <LazySection skeleton={
                  <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                    <Bone className="h-[340px] rounded-2xl" />
                    <div className="space-y-3">{[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Bone className="w-24 h-20 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2 py-1">
                          <Bone className="h-3 w-full rounded-full" />
                          <Bone className="h-3 w-3/4 rounded-full" />
                        </div>
                      </div>
                    ))}</div>
                  </div>
                }>
                  {featured && <FeaturedSection featured={featured} sideBlogs={sideBlogs} />}
                </LazySection>

                <div className="mt-6">
                  <LazySection skeleton={
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[...Array(6)].map((_, i) => <SkeletonBlogCard key={i} />)}
                    </div>
                  } rootMargin="300px">
                    <BlogPageTwoColumn blogs={twoColBlogs} />
                  </LazySection>
                </div>
              </div>

              {/* Infinite scroll grid — uses paginated blogs (Layer 2) */}
              <div id="main-blog-grid" className="mt-10">
                <LazySection skeleton={<SkeletonBlogGrid count={9} />} rootMargin="400px">
                  <BlogGrid items={gridWithAds} />
                </LazySection>
                <LoadMoreSentinel onVisible={loadMore} loading={loading} hasMore={hasMore} />
              </div>

              {/* More Blogs horizontal — uses initialBlogs tail */}
              <LazySection rootMargin="400px" skeleton={
                <section className="mt-14">
                  <Bone className="h-8 w-64 mb-6 rounded-xl" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {[...Array(8)].map((_, i) => <SkeletonHorizontalCard key={i} />)}
                  </div>
                </section>
              }>
                {moreBlogs.length > 0 && (
                  <section className="mt-14 md:mt-16">
                    <SectionHeading icon={ArrowRight} subtitle="Handpicked reads you shouldn't miss">
                      More Blogs You May Like
                    </SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      {interleaveAds(moreBlogs.slice(0, 14), blogListAds.slice(0, 2), 4)
                        .map((item, idx) =>
                          item.type === "ad"
                            ? <AdCard key={`ad-${idx}`} src={item.data} height="h-50" />
                            : <BlogCard key={item.data.id} blog={item.data} variant="horizontal" />
                        )
                      }
                    </div>
                  </section>
                )}
              </LazySection>
            </>
          )}

          {/* ════ FILTERED CATEGORY VIEW ════ */}
          {!isSearching && urlCategory !== "All" && (
            <div id="category-grid" className="mt-6">
              {booting ? <SkeletonBlogGrid count={9} /> : (
                <>
                  <BlogGrid items={filteredWithAds} />
                  <LoadMoreSentinel onVisible={loadMore} loading={loading} hasMore={hasMore} />
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}