"use client";

import { DESIGN_CATEGORIES, FEATURED_DESIGN_TOOLS, LATEST_DESIGN_RESOURCES, ESSENTIAL_DESIGN_TOOLS, PARTNER_DESIGN_PICKS, DESIGNER_TOOLKITS } from "../data/designTools";
import { getHeroSequenceTimings } from "../lib/heroTiming";
import { AuthProvider } from "../providers/AuthProvider";
import { CompareProvider } from "../providers/CompareProvider";
import { ToolStatsProvider } from "../providers/ToolStatsProvider";
import AuthDialog from "./AuthDialog";
import CompareBar from "./CompareBar";
import CompareModal from "./CompareModal";
import FreeAiToolHeader from "./FreeAiToolHeader";
import ScrollReveal from "./ScrollReveal";
import HeroSection from "./HeroSection";
import CategoriesGridSection from "./CategoriesGridSection";
import CommunityFavoritesSection from "./CommunityFavoritesSection";
import SavedToolsSection from "./SavedToolsSection";
import FeaturedDesignToolsSection from "./FeaturedDesignToolsSection";
import LatestDesignResourcesSection from "./LatestDesignResourcesSection";
import EssentialDesignToolsSection from "./EssentialDesignToolsSection";
import PartnerPicksSection from "./PartnerPicksSection";
import DesignerToolkitsSection from "./DesignerToolkitsSection";
import AllDesignToolsSection from "./AllDesignToolsSection";

const HERO_TITLE = "Discover the Best Design Resources & Tools";
const HERO_DESCRIPTION =
  "A carefully curated directory of 200+ design tools, hand-picked for quality, innovation, and ease of use. Updated regularly for the community.";
const { categoriesStart } = getHeroSequenceTimings(HERO_TITLE, HERO_DESCRIPTION);

export default function FreeAiToolsLanding() {
  return (
    <AuthProvider>
      <ToolStatsProvider>
        <CompareProvider>
          {/* Header lives outside the overflow-hidden <main> below — an
              ancestor with overflow:hidden disables position:sticky for its
              descendants, which would silently pin the header in place
              instead of letting it stick to the viewport on scroll. */}
          <div className="fat-page relative isolate">
            <FreeAiToolHeader />
            <main className="overflow-hidden bg-[#F3F4FD] text-[#0A0523]">
              <AuthDialog />
              <CompareBar />
              <CompareModal />
              {/* The hero's pale violet wash has to darken with the theme, or it
                  stays a bright band under a dark header. `dark:` maps to
                  [data-theme="dark"] via the @custom-variant in globals.css. */}
              <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-violet-100 via-fuchsia-50 to-violet-50 dark:from-[#171033] dark:via-[#120e26] dark:to-[#0b0a18]">
                <HeroSection title={HERO_TITLE} description={HERO_DESCRIPTION} />
                <CategoriesGridSection categories={DESIGN_CATEGORIES} startDelay={categoriesStart} />
              </div>
              <ScrollReveal><SavedToolsSection /></ScrollReveal>
              {/* <FeaturedDesignToolsSection tools={FEATURED_DESIGN_TOOLS} /> */}
              <ScrollReveal><LatestDesignResourcesSection tools={LATEST_DESIGN_RESOURCES} /></ScrollReveal>
              <ScrollReveal><EssentialDesignToolsSection tools={ESSENTIAL_DESIGN_TOOLS} /></ScrollReveal>
              <ScrollReveal>
                {/* <PartnerPicksSection tools={PARTNER_DESIGN_PICKS} /> */}
              </ScrollReveal>
              <ScrollReveal>
                <DesignerToolkitsSection toolkits={DESIGNER_TOOLKITS} />
              </ScrollReveal>
              <ScrollReveal><CommunityFavoritesSection /></ScrollReveal>
              <ScrollReveal><AllDesignToolsSection categories={DESIGN_CATEGORIES} /></ScrollReveal>
            </main>
          </div>
        </CompareProvider>
      </ToolStatsProvider>
    </AuthProvider>
  );
}
