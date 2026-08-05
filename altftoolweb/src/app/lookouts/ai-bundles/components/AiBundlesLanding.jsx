"use client";

import { useCallback, useRef, useState } from "react";
import { TOOL_CATEGORIES } from "../data/tools";
import { EngagementProvider } from "../providers/EngagementProvider";
import { ToolLaunchProvider } from "../providers/ToolLaunchProvider";
import AiBundlesHeader from "./AiBundlesHeader";
import CommunityFavoritesSection from "./CommunityFavoritesSection";
import CompareBar from "./CompareBar";
import FeaturedCollectionsSection from "./FeaturedCollectionsSection";
import FreeSubscriptionsSection from "./FreeSubscriptionsSection";
import Hero from "./Hero";
import LearningResourcesSection from "./LearningResourcesSection";
import NewsletterSection from "./NewsletterSection";
import PopularCategoriesSection from "./PopularCategoriesSection";
import SectionNav from "./SectionNav";
import TrendingPopularSection from "./TrendingPopularSection";

/**
 * Client shell for the AI Bundles landing page. Owns the search query and
 * active category for the explorer below, and wraps everything in
 * EngagementProvider (favorites/compare) and ToolLaunchProvider (the
 * login/sign-up gate shown before any outbound tool link opens).
 */
export default function AiBundlesLanding() {
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(TOOL_CATEGORIES[0].id);
  const explorerRef = useRef(null);

  const scrollToExplorer = useCallback(() => {
    explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToDeals = useCallback(() => {
    document.getElementById("deals")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearQuery = useCallback(() => setQuery(""), []);

  return (
    <EngagementProvider>
      <ToolLaunchProvider>
        {/* Header lives outside the overflow-hidden <main> below — an ancestor
            with overflow:hidden disables position:sticky for its descendants,
            which was silently pinning the header in place instead of letting
            it stick to the viewport on scroll. */}
        <div className="aib-page relative isolate">
          <AiBundlesHeader />
          <main className="overflow-hidden bg-[#f5f9f7] text-slate-900 selection:bg-[#c8e6de] selection:text-[#0d2b22]">
            <SectionNav />

            <Hero query={query} onQueryChange={setQuery} onExplore={scrollToExplorer} onViewDeals={scrollToDeals} />

            <div className="bg-white/70">
              <TrendingPopularSection />
            </div>

            <PopularCategoriesSection
              activeId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
              query={query}
              onClearQuery={clearQuery}
              sectionRef={explorerRef}
            />

            <FreeSubscriptionsSection />

            <FeaturedCollectionsSection />

            <CommunityFavoritesSection />

            <LearningResourcesSection />

            <NewsletterSection onExplore={scrollToExplorer} />

            <CompareBar />
          </main>
        </div>
      </ToolLaunchProvider>
    </EngagementProvider>
  );
}
