import HeroSection from "./components/HeroSection";
import AiAssistantBox from "@/platform/assistant/AiAssistantBox";
import CuratedToolsSection from "./components/CuratedToolsSection";
import CategoriesSection from "./components/CategoriesSection";
import FAQSection from "./components/FAQSection";
import StatsSection from "./components/StatsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import TrendingSection from "./components/TrendingSection";
import MobileAppsSection from "./components/MobileAppsSection";
import "../styles/landing.css";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool – Free Online Tools, Extensions & Web Apps",
    description:
      "AltFTool is your online tools hub with free tools, software, games, must-have Chrome extensions, and the best web tools to boost productivity and fun.",
    path: "/",
  });
}

export default function Page() {
  return (
    <div className="altf-home bg-[var(--background)]">
      <div className="bg-[var(--background)]">
        <HeroSection />
      </div>
      <div className="bg-[var(--background)]">
        <AiAssistantBox />
      </div>
      <div className="render-deferred bg-[var(--background)]">
        <TrendingSection />
      </div>
      <div className="render-deferred bg-[var(--background)]">
        <MobileAppsSection />
      </div>
      <div className="render-deferred bg-[var(--background)]">
        <CuratedToolsSection />
      </div>
      <div className="render-deferred bg-[var(--background)]">
        <CategoriesSection />
      </div>
      <div className="render-deferred bg-[var(--background)]">
        <TestimonialsSection />
      </div>
      <div className="render-deferred bg-[var(--home-accent-soft)]">
        <FAQSection />
      </div>
      <div className="render-deferred bg-[var(--background)]">
        <StatsSection />
      </div>
    </div>
  );
}
