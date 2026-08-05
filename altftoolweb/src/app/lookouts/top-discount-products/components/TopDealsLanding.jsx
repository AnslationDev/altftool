"use client";

import { useMemo, useRef, useState } from "react";
import TopDealsHeader from "./TopDealsHeader";
import { useProducts } from "../hooks/useProducts";
import { useProductFilters } from "../hooks/useProductFilters";
import { useWishlist } from "../hooks/useWishlist";
import {
  buildCategories,
  buildBrands,
  buildPriceRanges,
  buildDiscountRanges,
} from "../lib/derive";
import HeroSection from "./HeroSection";
import DealHighlights from "./DealHighlights";
import CategorySlider from "./CategorySlider";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "./ProductGrid";
import TrendingCarousel from "./TrendingCarousel";
import FeaturedCollections from "./FeaturedCollections";
import WhyChooseUs from "./WhyChooseUs";
import FaqSection from "./FaqSection";

const GRID_ID = "deals-grid";

export default function TopDealsLanding() {
  const { products, status } = useProducts();
  const wishlist = useWishlist();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const gridRef = useRef(null);

  const categories = useMemo(() => buildCategories(products), [products]);
  const brands = useMemo(() => buildBrands(products), [products]);
  const priceRanges = useMemo(() => buildPriceRanges(products), [products]);
  const discountRanges = useMemo(() => buildDiscountRanges(products), [products]);

  const categoryCounts = useMemo(() => {
    const map = {};
    for (const c of categories) map[c.key] = c.count;
    return map;
  }, [categories]);

  const highlightMetrics = useMemo(() => {
    if (!products.length) return { biggestDiscount: 0, trendingCount: 0, topRating: 0, recentCount: 0 };
    return {
      biggestDiscount: Math.max(...products.map((p) => p.discountPercent)),
      trendingCount: products.filter((p) => p.trending).length,
      topRating: Math.max(...products.map((p) => p.rating)),
      recentCount: Math.min(products.length, 12),
    };
  }, [products]);

  const trendingProducts = useMemo(() => {
    const trending = products.filter((p) => p.trending);
    const pool = trending.length ? trending : products;
    return [...pool].sort((a, b) => b.boughtCount - a.boughtCount).slice(0, 12);
  }, [products]);

  const {
    filters,
    setFilter,
    toggleFilter,
    resetFilters,
    filteredCount,
    pageItems,
    page,
    pageCount,
    setPage,
    activeFilterCount,
  } = useProductFilters(products);

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleExplore() {
    scrollToGrid();
  }

  function handleTopDiscounts() {
    setFilter("sort", "discount-desc");
    setFilter("discountMins", [70]);
    scrollToGrid();
  }

  function handleHighlightSelect(key) {
    if (key === "biggest-discounts") setFilter("sort", "discount-desc");
    else if (key === "trending") setFilter("status", ["trending"]);
    else if (key === "top-rated") setFilter("sort", "rating-desc");
    else if (key === "recent") setFilter("sort", "newest");
    scrollToGrid();
  }

  function handleCategorySelect(key) {
    setFilter("categories", key ? [key] : []);
    scrollToGrid();
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    scrollToGrid();
  }

  const activeCategory = filters.categories.length === 1 ? filters.categories[0] : null;

  return (
    <div className="tdp-page relative isolate">
      <TopDealsHeader />

      <main>
        <HeroSection onExplore={handleExplore} onTopDiscounts={handleTopDiscounts} />

        <DealHighlights metrics={highlightMetrics} onSelect={handleHighlightSelect} />

        <CategorySlider
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />

        <section className="px-6 py-10">
          <div ref={gridRef} className="mx-auto flex max-w-6xl items-start gap-6">
            <FilterSidebar
              categories={categories}
              brands={brands}
              priceRanges={priceRanges}
              discountRanges={discountRanges}
              filters={filters}
              setFilter={setFilter}
              toggleFilter={toggleFilter}
              resetFilters={resetFilters}
              filteredCount={filteredCount}
              activeFilterCount={activeFilterCount}
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
            />

            <ProductGrid
              id={GRID_ID}
              items={pageItems}
              status={status}
              filteredCount={filteredCount}
              page={page}
              pageCount={pageCount}
              onPageChange={handlePageChange}
              onOpenFilters={() => setMobileFiltersOpen(true)}
              wishlist={wishlist}
            />
          </div>
        </section>

        <TrendingCarousel products={trendingProducts} />

        <FeaturedCollections categoryCounts={categoryCounts} onSelect={handleCategorySelect} />

        <WhyChooseUs />

        <FaqSection />
      </main>
    </div>
  );
}
