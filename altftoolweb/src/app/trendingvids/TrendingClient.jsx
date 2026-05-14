"use client";

import VideoGridSection from "./components/VideoGridSection";
import CategorySection from "./components/CategorySection";
import ContinueWatching from "./components/ContinueWatching";
import ExploreVideo from "./components/ExploreVideo";
import { useRef, useState } from "react";
import { useTrendingCategories } from "./hooks/useTrendingCategories";

import WatchPage from "./components/TrendingHero";

export default function TrendingClient() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { categories } = useTrendingCategories(4);

  const exploreRef = useRef(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchResults([]);

    const section = document.getElementById("explore-videos");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <>
      <WatchPage />

      <VideoGridSection />

      <CategorySection
        onCategoryClick={handleCategoryClick}
        categories={categories}
      />

      <ContinueWatching />

      <ExploreVideo
        categories={categories}
        searchResults={searchResults}
        ref={exploreRef}
        activeCategory={selectedCategory}
        onClearSearch={() => setSearchResults([])}
      />
    </>
  );
}
