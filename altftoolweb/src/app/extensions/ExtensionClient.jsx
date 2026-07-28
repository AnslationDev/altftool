"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useFirebaseExtensions } from "./hooks/useFirebaseExtensions"; // 👈 NEW
import ListingCard from "./components/ListingCard";
import Image from "next/image";
import "./extensions-hero.css";
import { useAds } from "@/ads/AdsProvider";
import useDevice from "@/hooks/useDevice";
import { injectRandomAds } from "@/ads/adInjector";
import AdExtensionCard from "@/ads/layouts/extension/AdExtensionCard";
import DataStateNotice from "@/components/ui/DataStateNotice";
import { AltftoolLoader, LoadingBone } from "@/components/ui/route-loading";

import {
  ArrowRight,
  Search,
  Star,
  LayoutGrid,
  Layers,
  Chrome,
  MessageSquare,
  GraduationCap,
  PenTool,
  Calendar,
  Code,
} from "lucide-react";

export default function ExtensionsPage({
  initialExtensions = [],
  extensionCount = 0,
  categoryCount = 0,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);
  const categorySectionRef = useRef(null);

  const device = useDevice();

  // Seeded from the server catalog read; falls back to the live client read.
  const {
    extensions: allExtensions,
    loading,
    error,
    refresh,
  } = useFirebaseExtensions(initialExtensions);

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleCount(18);
  }, [selectedCategory, debouncedSearchQuery]);

  /* ---------------- FILTERING ---------------- */
  const filteredExtensions = useMemo(() => {
    let result = allExtensions;

    if (selectedCategory !== "All") {
      result = result.filter((e) => e.category === selectedCategory);
    }

    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [selectedCategory, debouncedSearchQuery, allExtensions]);

  /* ---------------- ADS ---------------- */
  const extensionAds = useAds({
    placement: "extensions_listing",
    layout: "extension_card",
    device,
  });

  const extensionsWithAds = useMemo(() => {
    const sliced = filteredExtensions.slice(0, visibleCount);
    return injectRandomAds(sliced, extensionAds, 4);
  }, [filteredExtensions, visibleCount, extensionAds]);

  /* ---------------- TOP CATEGORIES ---------------- */
  const topCategories = [
    { label: "Communication", icon: MessageSquare, realCat: "Productivity & Focus" },
    { label: "Education", icon: GraduationCap, realCat: "Text, Writing & Content" },
    { label: "Tools", icon: PenTool, realCat: "Utilities & Calculators" },
    { label: "Workflow & Planning", icon: Calendar, realCat: "Forms, Data & Automation" },
    { label: "Developer Tools", icon: Code, realCat: "File, Data & Formatter Tools" },
  ];

  const handleCategorySelect = (nextCategory) => {
    setSelectedCategory(nextCategory);
    window.requestAnimationFrame(() => {
      categorySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="extensions-page bg-[var(--background)] text-[var(--foreground)]">

      <main className="pb-20">

        {/* HERO */}
        <div className="extensions-hero-shell animate-slide-up">
          <div className="section extensions-hero-section">
            <section className="extensions-hero-card" aria-labelledby="extensions-hero-title">
              <div className="extensions-hero-copy">
                <h1 id="extensions-hero-title" className="extensions-hero-title">
                  Chrome Extensions{" "}
                  <br />
                  from <span>AltFTool</span>
                </h1>

                {/* Answer-first: what this page is, in one self-contained sentence. */}
                <p className="extensions-hero-subtitle">
                  {extensionCount > 0
                    ? `AltFTool lists ${extensionCount} Chrome extensions across ${categoryCount} categories — calculators, formatters, SEO and analytics, writing, accessibility and developer tools. Every listing links to the extension's official Chrome Web Store page.`
                    : "AltFTool lists Chrome extensions for calculators, formatters, SEO and analytics, writing, accessibility and developer workflows. Every listing links to the extension's official Chrome Web Store page."}
                </p>

                <form
                  className="extensions-hero-search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setDebouncedSearchQuery(searchQuery);
                  }}
                >
                  <Search className="extensions-hero-search-icon h-5 w-5" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search extensions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="extensions-hero-search-input"
                  />
                  <button type="submit" className="extensions-hero-search-button active:scale-[0.98] motion-reduce:transform-none">
                    Search
                  </button>
                </form>

                <div className="extensions-hero-stats" aria-label="Extension catalog facts">
                  {extensionCount > 0 ? (
                    <span className="extensions-hero-stat-item">
                      <LayoutGrid className="extensions-hero-stat-icon" aria-hidden="true" />
                      <span className="extensions-hero-stat-value">{extensionCount}</span>
                      <span className="extensions-hero-stat-label">Extensions listed</span>
                    </span>
                  ) : null}
                  {categoryCount > 0 ? (
                    <span className="extensions-hero-stat-item">
                      <Layers className="extensions-hero-stat-icon" aria-hidden="true" />
                      <span className="extensions-hero-stat-value">{categoryCount}</span>
                      <span className="extensions-hero-stat-label">Categories</span>
                    </span>
                  ) : null}
                  <span className="extensions-hero-stat-item">
                    <Chrome className="extensions-hero-stat-icon" aria-hidden="true" />
                    <span className="extensions-hero-stat-value">Chrome</span>
                    <span className="extensions-hero-stat-label">Install via Web Store</span>
                  </span>
                </div>
              </div>

              <div className="extensions-hero-visual" aria-hidden="true">
                <div className="extensions-hero-wave" />
                <Image
                  src="/assets/extensions-hero-visual.png"
                  alt=""
                  width={768}
                  height={512}
                  sizes="(max-width: 900px) 92vw, 48vw"
                  className="extensions-hero-image"
                  priority
                />
              </div>
            </section>
          </div>
        </div>

        {/* TOP CATEGORIES */}
        <div ref={categorySectionRef} className="section extensions-category-section">
          <div className="mb-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Browse
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Top categories</h2>
            <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
          </div>
          <div className="extensions-category-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ">
            {topCategories.map((cat) => (
              <button
                type="button"
                key={cat.label}
                onClick={() => handleCategorySelect(cat.realCat)}
                className={`extensions-category-card group flex h-[50px] items-center gap-3 rounded-[8px] border px-3 text-left transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:h-[56px] sm:px-4 ${
                  selectedCategory === cat.realCat
                    ? "extensions-category-card-active border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                <span className="extensions-category-icon transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none">
                  <cat.icon className="h-5 w-5 shrink-0" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-5">{cat.label}</span>
                <span className="extensions-category-arrow" aria-hidden="true">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="section extensions-results-section">
          <div className="mb-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              <Star className="h-4 w-4" aria-hidden="true" />
              Extension library
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">All extensions</h2>
            <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
          </div>
          {error ? (
            <DataStateNotice
              className="mb-6"
              title="Live extensions could not refresh"
              message="The extension catalog is temporarily using any cached content available on this device. Retry once the connection is stable."
              actionLabel="Retry"
              onAction={() => refresh()}
            />
          ) : null}

          {loading ? (
            <>
              <AltftoolLoader
                label="Loading extensions"
                detail="Refreshing the AltFTool extension catalog"
                className="mb-6"
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)]">
                    <LoadingBone className="aspect-[16/10] rounded-[var(--anslation-ds-radius)]" />
                    <div className="mt-4 space-y-2">
                      <LoadingBone className="h-5 w-3/4 rounded-full" />
                      <LoadingBone className="h-4 w-11/12 rounded-full" />
                      <LoadingBone className="h-4 w-1/2 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : extensionsWithAds.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
                {extensionsWithAds.map((item) => {
                  if (item.type === "ad-single") {
                    return <AdExtensionCard key={item.id} ad={item.ad} />;
                  }
                  const { slug, ...ext } = item;
                  return <ListingCard key={slug} slug={slug} extension={ext} />;
                })}
              </div>
              {visibleCount < filteredExtensions.length && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="extensions-load-more-button rounded-[8px] border border-[var(--border)] px-8 py-3 font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="extensions-empty-state rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-4 py-14 text-center">
              <h3 className="text-lg font-semibold">No extensions found</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Try another keyword or switch back to all categories.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
