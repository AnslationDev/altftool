"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

import HeroBanner from "./components/HeroBanner";
import useIdleRedirect from "@/hooks/useIdleRedirect";
import { firebaseBuySmartCategoriesSource } from "./service.js/firebaseBuySmartCategories";
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
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [searchInput, SetSearchInput] = useState("");


  function handleInputString(e) {
    const value = e.target.value.trim();

    if (!value) return;

    SetSearchInput("");

    setTimeout(() => {
      scrollToFilter();
    }, 100);
  }

  useIdleRedirect();
  const [headerVisible, setHeaderVisible] = useState(true);

  const filterRef = useRef(null);
  const scrollToFilter = () => {
    filterRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /* ---------------- HEADER VISIBILITY ---------------- */
  useEffect(() => {
    const header = document.getElementById("main-header");
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeaderVisible(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const fallback = setTimeout(() => {
      setCategoryLoading(false);
    }, 1800);

    const unsub = firebaseBuySmartCategoriesSource.subscribe(() => {
      clearTimeout(fallback);
      setCategoryLoading(false);
    });

    return () => {
      clearTimeout(fallback);
      unsub && unsub();
    };
  }, []);

  /* ---------------- ALPHABET SCROLL ---------------- */
  const handleSelect = (char) => {
    // document
    //   .getElementById(`alpha-${char}`)
    //   ?.scrollIntoView({ behavior: "smooth", block: "start" });
    //   window.dispatchEvent(new CustomEvent("alphabet-change"));
    setSelectedLetter(char);
  };

  return (
    <div className="mx-auto bg-[var(--background)] text-[var(--foreground)]  ">

      <section className="section ">
        <HeroBanner />
      </section>

      <RouteLazySection fallback={<TrendingSkeleton />} minHeight={360}>
        <section className="section">
          <Trending />
        </section>
      </RouteLazySection>

      <RouteLazySection fallback={<CategoriesSkeleton cards={6} />} minHeight={620}>
        <section className="section">
          <SavingsHub />
        </section>
      </RouteLazySection>

      <RouteLazySection fallback={<FeatureBrandSkeleton />} minHeight={520}>
        <section className="section">
          <FeatureBrand />
        </section>
      </RouteLazySection>

      <RouteLazySection fallback={<DiscoverBrandsSkeleton />} minHeight={260}>
        <section className="section">
          <DiscoverBrands />
        </section>
      </RouteLazySection>

      <RouteLazySection fallback={<SearchExploreSkeleton />} minHeight={380}>
        <section className="section">
          <SearchExplore
            loading={categoryLoading}
            scrollToFilter={scrollToFilter}
            SetSearchInput={SetSearchInput}
            searchInput={searchInput}
            handleInputString={handleInputString}

            onSearchResult={(category, title) => {
              setFilteredCategory(category, title);
            }}
          />
        </section>
      </RouteLazySection>

      <RouteLazySection fallback={<CategoriesSkeleton />} minHeight={680}>
        <section className="section">
          {categoryLoading ? (
            <AlphabetFilterSkeleton />
          ) : (
            <AlphabetFilter
              onSelect={handleSelect}
              headerVisible={headerVisible}
              loading={categoryLoading}
            />
          )}

          <div ref={filterRef}>
            <Categories
              selectedLetter={selectedLetter}
              filteredCategory={filteredCategory}
              searchInput={searchInput}
              SetSearchInput={SetSearchInput}

            />
          </div>
        </section>
      </RouteLazySection>
    </div>
  );
}
