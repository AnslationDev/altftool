"use client";

import HeroSection from "./components/HeroSection";
import CategoriesSection from "./components/CategoriesSection";
import FAQSection from "./components/FAQSection";
import StatsSection from "./components/StatsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import TrendingSection from "./components/TrendingSection";
import WhyUsersLove from "./components/WhyUsersLove";
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
        <CategoriesSection />
      </div>
      <div className="bg-[var(--section-highlight)]">
        <WhyUsersLove />
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
