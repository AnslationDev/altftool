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
  MessageSquare,
  GraduationCap,
  PenTool,
  Calendar,
  Code,
} from "lucide-react";

export default function ExtensionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);
  const categorySectionRef = useRef(null);

  const device = useDevice();

  // 🔥 Firebase — replaces getSortedExtensions()
  const {
    extensions: allExtensions,
    loading,
    error,
    refresh,
  } = useFirebaseExtensions();

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

  /* ---------------- CATALOG STATS ---------------- */
  const averageRating = useMemo(() => {
    const rated = allExtensions.filter((e) => typeof e.rating === "number" && e.rating > 0);
    if (!rated.length) return null;
    return rated.reduce((sum, e) => sum + e.rating, 0) / rated.length;
  }, [allExtensions]);

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
                  Boost Productivity{" "}
                  <br />
                  with <span>Smart Extensions</span>
                </h1>

                <p className="extensions-hero-subtitle">
                  Discover high-quality extensions and themes for productivity, security, and creativity.
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
                    aria-label="Search extensions"
                    placeholder="Search extensions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="extensions-hero-search-input"
                  />
                  <button type="submit" className="extensions-hero-search-button">
                    Search
                  </button>
                </form>

                <div className="extensions-hero-stats" aria-label="Extension catalog highlights">
                  {/* The catalogue loads from Firestore after hydration, so
                      before this guard the server HTML — the copy a crawler
                      reads — shipped a literal "0+ Curated add-ons". The "+"
                      is gone too: this is an exact count of the catalogue, not
                      a floor, and there is nothing above it to imply. */}
                  {allExtensions.length ? (
                    <span className="extensions-hero-stat-item">
                      <LayoutGrid className="extensions-hero-stat-icon" aria-hidden="true" />
                      <span className="extensions-hero-stat-value">{allExtensions.length}</span>
                      <span className="extensions-hero-stat-label">Curated add-ons</span>
                    </span>
                  ) : null}
                  {averageRating ? (
                    <span className="extensions-hero-stat-item">
                      <Star className="extensions-hero-stat-icon extensions-hero-stat-icon-gold" aria-hidden="true" />
                      <span className="extensions-hero-stat-value">{averageRating.toFixed(1)}/5</span>
                      {/* "Average Rating" next to a gold star reads as a user
                          rating. These scores are entered by an editor in the
                          admin panel; no extension here carries a review count
                          and nothing collects visitor ratings, which is also
                          why the detail pages deliberately emit no
                          aggregateRating. The label now says whose score it
                          is. */}
                      <span className="extensions-hero-stat-label">Average editor score</span>
                    </span>
                  ) : null}
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
          <div className="extensions-category-grid flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 lg:grid-cols-5">
            {topCategories.map((cat) => (
              <button
                type="button"
                key={cat.label}
                onClick={() => handleCategorySelect(cat.realCat)}
                className={`extensions-category-card flex h-[50px] min-w-[220px] shrink-0 snap-start items-center gap-3 rounded-[8px] border px-3 text-left transition sm:h-[56px] sm:px-4 md:min-w-0 md:shrink ${
                  selectedCategory === cat.realCat
                    ? "extensions-category-card-active border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                <span className="extensions-category-icon">
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
                    className="extensions-load-more-button rounded-[8px] border border-[var(--border)] px-8 py-3 font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
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
