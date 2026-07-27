"use client";

import React, { useState } from 'react';
import HeroSection from './HeroSection';
import ExploreBestPinterest from './ExploreBestPinterest';
import BrowseByCategory from './BrowseByCategory';
import TrendingTopics from './TrendingTopics';
import WhatsNewOnPinterest from './WhatsNewOnPinterest';
import CTASection from './CTASection';
import ExploreFooter from './ExploreFooter';
import { Search, Compass } from 'lucide-react';

export default function ExploreLanding({ onStartExploring, onNavigateHome, onNavigateExplore }) {
  const [headerSearch, setHeaderSearch] = useState("");

  const handleExplore = (searchTerm) => {
    if (onStartExploring) {
      onStartExploring(searchTerm || "");
    } else if (onNavigateExplore) {
      onNavigateExplore(searchTerm || "");
    }
  };

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#E60023] selection:text-white">

      {/* 1. Header Zone */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">

          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-6 shrink-0">
            <div
              onClick={handleHomeClick}
              className="flex items-center gap-2 cursor-pointer group"
            >
              {/* <div className="w-9 h-9 rounded-full bg-[#E60023] flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                P
              </div> */}
              <span className="font-extrabold text-xl tracking-tight hidden sm:inline text-gray-900 dark:text-white">
                AltPinterest
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-2 font-semibold text-sm">
              <button
                onClick={handleHomeClick}
                className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold shadow-xs cursor-pointer transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleExplore("")}
                className="px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              >
                Explore
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExplore(headerSearch);
              }}
              className="relative flex items-center bg-gray-100 dark:bg-zinc-900 rounded-full px-4 py-2 border border-transparent focus-within:border-[#E60023] focus-within:ring-0 focus-within:outline-none transition-colors"
              style={{ outline: 'none' }}
            >
              <Search size={18} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search for ideas..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-900 dark:text-white border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none placeholder-gray-400"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
            </form>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleExplore("")}
              className="px-5 py-2.5 rounded-full bg-[#E60023] hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass size={16} />
              <span>Enter Feed</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <HeroSection onExplore={handleExplore} onSearchSubmit={handleExplore} />

      {/* 3. SECTION 1: Explore the Best of Pinterest */}
      <ExploreBestPinterest onExplore={handleExplore} />

      {/* 4. SECTION 2: Browse by Category */}
      <BrowseByCategory onSelectCategory={handleExplore} />

      {/* 5. Trending Story Topics */}
      <TrendingTopics onSelectTopic={handleExplore} />

      {/* 6. What's New On Pinterest (Discovery Feed Section) */}
      <WhatsNewOnPinterest onExplorePin={handleExplore} />

      {/* 7. Call-To-Action Banner */}
      <CTASection onExplore={() => handleExplore("")} />

      {/* 8. Footer */}
      <ExploreFooter onExplore={handleExplore} />

    </div>
  );
}
