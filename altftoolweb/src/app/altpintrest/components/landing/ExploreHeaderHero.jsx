"use client";

import React, { useState } from 'react';
import { Search, ChevronDown, Hourglass, ArrowRight, Grid, Filter, Sparkles, Layers } from 'lucide-react';
import AllCategoriesModal from './AllCategoriesModal';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80";

const CATEGORY_OPTIONS = [
  "Photos",
  "Vectors",
  "Illustrations",
  "3D Models",
  "AI Generated"
];

const POPULAR_TOPICS = [
  {
    name: "All",
    count: "All Pins",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Rain",
    count: "1.2k pins",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Fifa World Cup",
    count: "950 pins",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Art",
    count: "3.4k pins",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "ROSE",
    count: "1.8k pins",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80"
  }
];

const TRENDING_COLLECTIONS = [
  {
    name: "car",
    count: "2.1k pins",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "cool wallpaper",
    count: "5.8k pins",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Flowers",
    count: "1.6k pins",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Food & Recipes",
    count: "2.9k pins",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Nature",
    count: "4.5k pins",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80"
  }
];

export default function ExploreHeaderHero({ onSelectCategory, activeCategory, activeNavTab, setActiveNavTab, categories = [] }) {
  const [selectedDropdownCat, setSelectedDropdownCat] = useState("Photos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilterSort, setSelectedFilterSort] = useState("Trending");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Dynamic Navigation Tabs derived from Firebase Categories
  const navTabs = React.useMemo(() => {
    const list = Array.isArray(categories) && categories.length > 0
      ? categories.map((cat, idx) => {
          const name = typeof cat === 'string' ? cat : (cat.name || cat.title || `Category ${idx + 1}`);
          return {
            id: typeof cat === 'object' && cat.id ? cat.id : `cat-${name.toLowerCase().replace(/\s+/g, '-')}`,
            label: name,
            isNew: typeof cat === 'object' ? Boolean(cat.isNew) : false
          };
        })
      : [
          { id: "photos", label: "Photos" },
          { id: "vectors", label: "Vectors" },
          { id: "illustrations", label: "Illustrations" },
          { id: "3d-models", label: "3D Models" }
        ];

    return [{ id: "all", label: "All" }, ...list.slice(0, 4)];
  }, [categories]);

  // Dynamic Search Dropdown Categories derived from Firebase
  const dropdownCategories = React.useMemo(() => {
    const options = Array.isArray(categories) && categories.length > 0
      ? categories.map(c => typeof c === 'string' ? c : (c.name || c.title)).filter(Boolean)
      : CATEGORY_OPTIONS;

    return ["All Categories", ...options.slice(0, 5)];
  }, [categories]);

  const currentDropdownLabel = activeCategory && activeCategory !== "All"
    ? activeCategory
    : (selectedDropdownCat && dropdownCategories.includes(selectedDropdownCat) ? selectedDropdownCat : dropdownCategories[0]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim() && onSelectCategory) {
      onSelectCategory(searchQuery);
      const elem = document.getElementById("pins-feed-section");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-transparent text-[var(--foreground)] pt-4 pb-8 select-none">
      {/* All Categories Modal with Blurred Backdrop */}
      <AllCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategory={onSelectCategory}
        activeCategory={activeCategory}
      />

      <div className="max-w-[1560px] mx-auto w-full px-2 sm:px-4 lg:px-6">
        {/* ========================================================= */}
        {/* HERO SECTION: 2 COLUMNS (LEFT 60%, RIGHT 40%)             */}
        {/* ========================================================= */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 pt-4 pb-12">

          {/* LEFT HERO CONTENT */}
          <div className="w-full lg:w-[58%] flex flex-col justify-center items-start">

            {/* Large Marketing Headline */}
            <h1 className="text-[32px] xs:text-[40px] sm:text-[54px] lg:text-[68px] font-[800] leading-[1.08] sm:leading-[1.05] tracking-[-0.03em] text-gray-900 dark:text-white max-w-[750px]">
              Discover your next visual story
            </h1>

            {/* Oversized Search Bar */}
            <div className="mt-6 sm:mt-10 w-full max-w-[750px]">
              <form
                onSubmit={handleSearchSubmit}
                className="relative bg-[#F6F6F6] dark:bg-zinc-800/90 rounded-[20px] min-h-[58px] sm:h-[72px] p-1.5 sm:p-2 flex items-center shadow-none border border-gray-200/80 dark:border-zinc-700 focus-within:border-gray-400 dark:focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-gray-200/60 dark:focus-within:ring-zinc-700/60 transition-all"
              >
                {/* Category Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-white dark:bg-zinc-900 rounded-[14px] px-2.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-[12px] shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  >
                    <Layers size={16} className="text-[#111111] dark:text-white shrink-0" />
                    <span className="text-xs sm:text-[16px] font-medium text-[#111111] dark:text-white whitespace-nowrap max-w-[90px] sm:max-w-none truncate">
                      {currentDropdownLabel}
                    </span>
                    <ChevronDown size={14} className={`text-[#666666] dark:text-gray-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 sm:w-52 bg-white dark:bg-zinc-900 border border-[#ECECEC] dark:border-zinc-700 rounded-[16px] shadow-xl py-2 z-30">
                      {dropdownCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedDropdownCat(cat);
                            setIsDropdownOpen(false);
                            onSelectCategory?.(cat === "All Categories" ? "All" : cat);
                            const elem = document.getElementById("pins-feed-section");
                            if (elem) elem.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs sm:text-[15px] font-medium transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 ${currentDropdownLabel === cat ? 'text-black dark:text-white font-bold bg-gray-50 dark:bg-zinc-800' : 'text-[#666666] dark:text-gray-400'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search for free photos"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-2 sm:px-6 text-xs sm:text-[16px] text-[#111111] dark:text-white placeholder-[#888888] dark:placeholder-gray-400 outline-none border-none focus:outline-none focus:ring-0 focus-visible:outline-none shadow-none w-full min-w-0"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                />

                {/* Search Icon Button */}
                <button
                  type="submit"
                  className="w-[44px] h-[44px] sm:w-[56px] sm:h-[56px] rounded-full bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0 shadow-sm border-none outline-none focus:outline-none focus:ring-0"
                  style={{ outline: 'none', border: 'none' }}
                  title="Search"
                >
                  <Search size={18} strokeWidth={2.2} className="sm:w-[22px] sm:h-[22px]" />
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT HERO PROMOTIONAL CARDS */}
          <div className="w-full lg:w-[42%] grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

            {/* Card 1 */}
            <div
              onClick={() => {
                onSelectCategory?.("Art");
                const elem = document.getElementById("pins-feed-section");
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative h-[260px] sm:h-[290px] lg:h-[320px] rounded-[28px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent dark:border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80"
                alt="Weddings and Love Stories"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-end text-white">
                {/* Countdown Label */}
                <div className="flex items-center gap-2 text-white/90 text-[13px] font-semibold mb-2">
                  <Hourglass size={15} className="text-white shrink-0 animate-pulse" />
                  <span>3 days left</span>
                </div>

                {/* Title */}
                <h3 className="text-[22px] sm:text-[25px] lg:text-[26px] font-bold leading-[1.2] text-white tracking-tight mb-2 group-hover:underline">
                  Weddings and Love Stories
                </h3>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-white group-hover:translate-x-1 transition-transform">
                  <span>Explore Collection</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => {
                onSelectCategory?.("Nature");
                const elem = document.getElementById("pins-feed-section");
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative h-[260px] sm:h-[290px] lg:h-[320px] rounded-[28px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent dark:border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&auto=format&fit=crop&q=80"
                alt="Summer Vibes on Video"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-end text-white">
                {/* Countdown Label */}
                <div className="flex items-center gap-2 text-white/90 text-[13px] font-semibold mb-2">
                  <Hourglass size={15} className="text-white shrink-0 animate-pulse" />
                  <span>5 days left</span>
                </div>

                {/* Title */}
                <h3 className="text-[22px] sm:text-[25px] lg:text-[26px] font-bold leading-[1.2] text-white tracking-tight mb-2 group-hover:underline">
                  Summer Vibes on Video
                </h3>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-white group-hover:translate-x-1 transition-transform">
                  <span>Explore Collection</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* CENTER NAVIGATION TABS (FIREBASE DYNAMIC CATEGORIES)      */}
        {/* ========================================================= */}
        <nav className="w-full overflow-x-auto no-scrollbar py-2 sm:py-6 my-2 sm:my-4">
          <div className="flex items-center justify-start sm:justify-center flex-nowrap sm:flex-wrap gap-2 sm:gap-4 md:gap-6 lg:gap-8 px-1">
            {navTabs.map((tab) => {
              const isSelectedCategory = activeCategory
                ? (activeCategory.toLowerCase() === tab.label.toLowerCase() || (activeCategory === "All" && tab.label.toLowerCase() === "all"))
                : (activeNavTab ? activeNavTab === tab.id : tab.id === "all");

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveNavTab?.(tab.id);
                    onSelectCategory?.(tab.label);
                    const elem = document.getElementById("pins-feed-section");
                    if (elem) elem.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${isSelectedCategory
                      ? "bg-black dark:bg-white text-white dark:text-black font-semibold px-3.5 sm:px-5 md:px-[24px] py-2 sm:py-3 md:py-[12px] text-xs sm:text-base md:text-[18px] rounded-full shadow-sm"
                      : "text-[#4A5565] dark:text-gray-300 font-medium text-xs sm:text-base md:text-[18px] hover:bg-[#F3F4F6] dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full"
                    }`}
                >
                  <span>{tab.label}</span>
                  {tab.isNew && (
                    <span className="bg-[#F3E8FF] dark:bg-purple-900/60 text-[#7C3AED] dark:text-purple-300 text-[10px] sm:text-[12px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ========================================================= */}
        {/* CONTENT SECTION HEADER: TITLE & FILTER DROPDOWN           */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 sm:mt-12 mb-6 sm:mb-8 pt-4">
          <h2 className="text-[26px] sm:text-[36px] md:text-[42px] font-bold text-gray-900 dark:text-white tracking-tight text-center sm:text-left">
            {activeCategory && activeCategory !== "All" ? `${activeCategory} Pins` : "Free Stock Photos"}
          </h2>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="bg-white dark:bg-zinc-900 border border-[#ECECEC] dark:border-zinc-800 rounded-[14px] px-5 py-[14px] flex items-center gap-3 shadow-2xs hover:border-gray-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <span className="text-[16px] font-medium text-[#111111] dark:text-white">
                {activeCategory && activeCategory !== "All" ? activeCategory : (selectedFilterSort && dropdownCategories.includes(selectedFilterSort) ? selectedFilterSort : dropdownCategories[0])}
              </span>
              <ChevronDown size={18} className={`text-[#666666] dark:text-gray-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-[#ECECEC] dark:border-zinc-800 rounded-[16px] shadow-xl py-2 z-30">
                {dropdownCategories.map((sortOption) => (
                  <button
                    key={sortOption}
                    onClick={() => {
                      setSelectedFilterSort(sortOption);
                      setIsSortOpen(false);
                      onSelectCategory?.(sortOption === "All Categories" ? "All" : sortOption);
                      const elem = document.getElementById("pins-feed-section");
                      if (elem) elem.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-gray-100 ${(activeCategory && activeCategory !== "All" ? activeCategory : selectedFilterSort) === sortOption ? 'text-black font-bold bg-gray-50' : 'text-[#666666]'}`}
                  >
                    {sortOption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CATEGORY PANELS: TWO SIDE-BY-SIDE PANELS                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

          {/* Popular Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-[#ECECEC] dark:border-zinc-800 rounded-[22px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[22px] font-bold text-[#111111] dark:text-white">
                Popular Topics
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-[#0D9488] hover:text-[#0f766e] font-bold text-[15px] flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <span>See All</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Category Chips Container */}
            <div className="flex flex-wrap gap-3.5">
              {POPULAR_TOPICS.map((topic) => (
                <div
                  key={topic.name}
                  onClick={() => {
                    onSelectCategory?.(topic.name);
                    const elem = document.getElementById("pins-feed-section");
                    if (elem) elem.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`border rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:border-gray-400 dark:hover:border-zinc-600 hover:shadow-xs transition-all cursor-pointer ${activeCategory?.toLowerCase() === topic.name?.toLowerCase() ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 bg-gray-100 dark:bg-zinc-800 font-bold shadow-xs' : 'bg-white dark:bg-zinc-800/80 border-[#ECECEC] dark:border-zinc-700'}`}
                >
                  <img
                    src={topic.image}
                    alt={topic.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="w-[40px] h-[40px] rounded-full object-cover shrink-0 border border-gray-100 dark:border-zinc-700"
                  />
                  <span className="text-[16px] font-medium text-[#111111] dark:text-white">
                    {topic.name}
                  </span>
                  <span className="text-[13px] text-[#666666] dark:text-gray-400">
                    {topic.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-[#ECECEC] dark:border-zinc-800 rounded-[22px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[22px] font-bold text-[#111111] dark:text-white">
                Trending Collections
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-[#0D9488] hover:text-[#0f766e] font-bold text-[15px] flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <span>See All</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Category Chips Container */}
            <div className="flex flex-wrap gap-3.5">
              {TRENDING_COLLECTIONS.map((topic) => (
                <div
                  key={topic.name}
                  onClick={() => {
                    onSelectCategory?.(topic.name);
                    const elem = document.getElementById("pins-feed-section");
                    if (elem) elem.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`border rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:border-gray-400 dark:hover:border-zinc-600 hover:shadow-xs transition-all cursor-pointer ${activeCategory?.toLowerCase() === topic.name?.toLowerCase() ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 bg-gray-100 dark:bg-zinc-800 font-bold shadow-xs' : 'bg-white dark:bg-zinc-800/80 border-[#ECECEC] dark:border-zinc-700'}`}
                >
                  <img
                    src={topic.image}
                    alt={topic.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="w-[40px] h-[40px] rounded-full object-cover shrink-0 border border-gray-100 dark:border-zinc-700"
                  />
                  <span className="text-[16px] font-medium text-[#111111] dark:text-white">
                    {topic.name}
                  </span>
                  <span className="text-[13px] text-[#666666] dark:text-gray-400">
                    {topic.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
