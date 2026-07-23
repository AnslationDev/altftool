"use client";

import { useCallback, useRef, useState } from "react";
import { TOOL_CATEGORIES } from "../data/tools";
import { AuthProvider } from "../providers/AuthProvider";
import AuthDialog from "./AuthDialog";
import ComboPacksSection from "./ComboPacksSection";
import EditorsPicksSection from "./EditorsPicksSection";
import FaqSection from "./FaqSection";
import Hero from "./Hero";
import NewlyAddedSection from "./NewlyAddedSection";
import NewsletterCtaSection from "./NewsletterCtaSection";
import SectionNav from "./SectionNav";
import TestimonialsSection from "./TestimonialsSection";
import ToolsExplorer from "./ToolsExplorer";
import TrendingSection from "./TrendingSection";
import ValuePropsSection from "./ValuePropsSection";

/**
 * Client shell for the Free AI Tools landing page. Owns search query and the
 * active category so the hero (search bar + category grid) and the sidebar
 * explorer below drive the same result grid instead of separate state.
 * Fixed light palette regardless of the site-wide theme. Wrapped in
 * AuthProvider so every tool card can gate its "Open Tool" click behind
 * sign-in/sign-up (see ToolCard.jsx and HeroSearchPreview.jsx).
 */
export default function FreeAiToolsLanding() {
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(TOOL_CATEGORIES[0].id);
  const explorerRef = useRef(null);

  const scrollToExplorer = useCallback(() => {
    explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearQuery = useCallback(() => setQuery(""), []);

  const selectCategoryAndScroll = useCallback(
    (id) => {
      setQuery("");
      setActiveCategoryId(id);
      scrollToExplorer();
    },
    [scrollToExplorer],
  );

  return (
    <AuthProvider>
      <main className="relative isolate overflow-hidden bg-[#f7f7fc] text-slate-900 selection:bg-violet-200 selection:text-violet-950">
        <SectionNav />
        <AuthDialog />

        <Hero
          query={query}
          onQueryChange={setQuery}
          onExplore={scrollToExplorer}
          onSelectCategory={selectCategoryAndScroll}
        />

        <div className="bg-white/70">
          <TrendingSection />
        </div>

        <NewlyAddedSection />

        <ToolsExplorer
          activeId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
          query={query}
          onClearQuery={clearQuery}
          sectionRef={explorerRef}
        />

        <ComboPacksSection />

        <div className="bg-white/70">
          <EditorsPicksSection />
        </div>

        <ValuePropsSection />

        <div className="bg-white/70">
          <TestimonialsSection />
        </div>

        <FaqSection />

        <NewsletterCtaSection onExplore={scrollToExplorer} />
      </main>
    </AuthProvider>
  );
}
