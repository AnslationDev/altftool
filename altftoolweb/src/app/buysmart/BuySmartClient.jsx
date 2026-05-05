"use client";

import { useRef, useState, useEffect } from "react";

import HeroBanner from "./components/HeroBanner";
import AlphabetFilter from "./components/AlphabetFilter";
import Trending from "./components/Trending";
import FeatureBrand from "./components/FeatureBrand";
import Categories from "./components/Categories";
import SearchExplore from "./components/SearchExplore";
import useIdleRedirect from "@/hooks/useIdleRedirect";
import DiscoverBrands from "./components/DiscoverBrands";
import { firebaseBuySmartCategoriesSource } from "./service.js/firebaseBuySmartCategories";


const HEADER_HEIGHT = 72;

export async function generateMetadata() {
  return {
    title: "Buy Smart – Compare & Save on Best Deals",
    description:
      "Find the best prices and deals before you buy smart on AltFTools.",
  };
}

export default function Page() {
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [searchInput, SetSearchInput] = useState("")


  function handleInputString(e) {
    const value = e.target.value.trim();

    if (!value) return;

    SetSearchInput("");



    setTimeout(() => {
      scrollToFilter();

    }, 100);
  }




  useIdleRedirect();
  const alphabetRef = useRef(null);
  const idleTimerRef = useRef(null);

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

      <section className="section">
        <Trending />
      </section>
      <section className="section">
        <FeatureBrand />
      </section>

      <section className="section">
        <DiscoverBrands />
      </section>

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

      <section className="section">
        <AlphabetFilter
          ref={alphabetRef}
          onSelect={handleSelect}
          headerVisible={headerVisible}
          loading={categoryLoading}
        // selectedLetter={selectedLetter}

        />

        <div ref={filterRef}>
          <Categories
            selectedLetter={selectedLetter}
            filteredCategory={filteredCategory}
            searchInput={searchInput}
            SetSearchInput={SetSearchInput}

          />
        </div>
      </section>
    </div>
  );
}
