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

export default function ExploreLanding({ onStartExploring, onNavigateHome, onNavigateExplore, onSelectPin, dynamicData, heading }) {
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#0D9488] selection:text-white">

      {/* 1b. Page heading. Rendered on the server and passed down from
          app/altpintrest/page.jsx — everything else in this subtree is a client
          component and the sections below only go as high as h2, so before this
          the route shipped no h1 at all. It sits above the hero because the
          hero is a full-viewport image collage with no text of its own. */}
      {heading ? (
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-4 sm:px-6 lg:px-8">
          {heading}
        </div>
      ) : null}

      {/* 2. Hero Section */}
      <HeroSection onExplore={handleExplore} onSearchSubmit={handleExplore} />

      {/* 3. SECTION 1: Explore the Best of Pinterest */}
      <ExploreBestPinterest onExplore={handleExplore} />

      {/* 4. SECTION 2: Browse by Category */}
      <BrowseByCategory onSelectCategory={handleExplore} />

      {/* 5. Trending Story Topics */}
      <TrendingTopics onSelectTopic={handleExplore} />

      {/* 6. What's New On Pinterest (Discovery Feed Section) */}
      <WhatsNewOnPinterest
        onExplorePin={handleExplore}
        onSelectPin={onSelectPin}
        pinsData={dynamicData}
      />

      {/* 7. Call-To-Action Banner */}
      <CTASection onExplore={() => handleExplore("")} />

      {/* 8. Footer */}
      <ExploreFooter onExplore={handleExplore} />

    </div>
  );
}
