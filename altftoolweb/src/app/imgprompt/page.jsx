import { AuroraBackground } from "./components/shared/aurora-background";
import { Hero } from "./components/landing/hero";
import { ModelMarquee } from "./components/landing/model-marquee";
import { IntelligenceShowcase } from "./components/landing/intelligence-showcase";
import { TrendingSection } from "./components/landing/trending-section";
import { PromptStudioSection } from "./components/landing/prompt-studio-section";
import { CategoriesSection } from "./components/landing/categories-section";
import { ReviewsSection } from "./components/landing/reviews-section";
import { FaqSection } from "./components/landing/faq-section";
import { CtaBand } from "./components/landing/cta-band";

export default function ImgPromptPage() {
  return (
    <div className="relative">
      <AuroraBackground />
      <main className="relative">
        <Hero />
        <IntelligenceShowcase />
        <TrendingSection />
        <PromptStudioSection />
        <CategoriesSection />
        <ReviewsSection />
        <FaqSection />
        <CtaBand />
      </main>
    </div>
  );
}
