"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import HeroBanner from "./components/HeroBanner";
import useIdleRedirect from "@/hooks/useIdleRedirect";
import RouteLazySection from "@/components/ui/RouteLazySection";
import {
  AlphabetFilterSkeleton,
  CategoriesSkeleton,
  DiscoverBrandsSkeleton,
  FeatureBrandSkeleton,
  SearchExploreSkeleton,
  TrendingSkeleton,
} from "@/components/ui/skeleton";

const Trending = dynamic(() => import("./components/Trending"), {
  loading: () => <TrendingSkeleton />,
});
const SavingsHub = dynamic(() => import("./components/SavingsHub"), {
  loading: () => <CategoriesSkeleton cards={6} />,
});
const FeatureBrand = dynamic(() => import("./components/FeatureBrand"), {
  loading: () => <FeatureBrandSkeleton />,
});
const DiscoverBrands = dynamic(() => import("./components/DiscoverBrands"), {
  loading: () => <DiscoverBrandsSkeleton />,
});
const SearchExplore = dynamic(() => import("./components/SearchExplore"), {
  loading: () => <SearchExploreSkeleton />,
});
const AlphabetFilter = dynamic(() => import("./components/AlphabetFilter"), {
  loading: () => <AlphabetFilterSkeleton />,
});
const Categories = dynamic(() => import("./components/Categories"), {
  loading: () => <CategoriesSkeleton />,
});

export default function Page() {
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [searchInput, SetSearchInput] = useState("");

  useIdleRedirect();

  const filterRef = useRef(null);
  const scrollToFilter = () => {
    filterRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleSelect = (char) => {
    setSelectedLetter(char);
  };

  return (
    <div
      data-testid="buysmart-page"
      className="mx-auto bg-[var(--background)] text-[var(--foreground)]"
    >
      <section data-testid="buysmart-hero-section" className="section">
        <HeroBanner />
      </section>

      <RouteLazySection
        fallback={<TrendingSkeleton />}
        idleDelay={700}
        minHeight={360}
        rootMargin="900px 0px"
      >
        <section className="section">
          <Trending />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<CategoriesSkeleton cards={6} />}
        idleDelay={800}
        minHeight={620}
        rootMargin="900px 0px"
      >
        <section className="section">
          <SavingsHub />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<FeatureBrandSkeleton />}
        idleDelay={900}
        minHeight={520}
        rootMargin="900px 0px"
      >
        <section className="section">
          <FeatureBrand />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<DiscoverBrandsSkeleton />}
        idleDelay={1000}
        minHeight={260}
        rootMargin="900px 0px"
      >
        <section className="section">
          <DiscoverBrands />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<SearchExploreSkeleton />}
        idleDelay={1100}
        minHeight={380}
        rootMargin="900px 0px"
      >
        <section className="section">
          <SearchExplore
            scrollToFilter={scrollToFilter}
            SetSearchInput={SetSearchInput}
            searchInput={searchInput}
            onSearchResult={(category) => {
              setFilteredCategory(category);
            }}
          />
        </section>
      </RouteLazySection>

      <RouteLazySection
        fallback={<CategoriesSkeleton />}
        idleDelay={1200}
        minHeight={680}
        rootMargin="900px 0px"
      >
        <section className="section">
          <AlphabetFilter
            onSelect={handleSelect}
            selectedLetter={selectedLetter}
          />

          <div ref={filterRef}>
            <Categories
              selectedLetter={selectedLetter}
              filteredCategory={filteredCategory}
            />
          </div>
        </section>
      </RouteLazySection>
    </div>
  );
}
