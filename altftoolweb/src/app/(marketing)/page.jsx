import HeroSection from "./components/HeroSection";
import CuratedToolsSection from "./components/CuratedToolsSection";
import CategoriesSection from "./components/CategoriesSection";
import FAQSection from "./components/FAQSection";
import StatsSection from "./components/StatsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import TrendingSection from "./components/TrendingSection";
import MobileAppsSection from "./components/MobileAppsSection";
import "../styles/landing.css";

export default function Page() {
  return (
    <div className="altf-home bg-[var(--background)]">
      <div className="bg-[var(--background)]">
        <HeroSection />
      </div>
      <div className="bg-[var(--background)]">
        <TrendingSection />
      </div>
      <div className="bg-[var(--background)]">
        <MobileAppsSection />
      </div>
      <div className="bg-[var(--background)]">
        <CuratedToolsSection />
      </div>
      <div className="bg-[var(--background)]">
        <CategoriesSection />
      </div>
      <div className="bg-[var(--background)]">
        <TestimonialsSection />
      </div>
      <div className="bg-[var(--home-accent-soft)]">
        <FAQSection />
      </div>
      <div className="bg-[var(--background)]">
        <StatsSection />
      </div>
    </div>
  );
}
