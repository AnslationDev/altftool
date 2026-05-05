"use client";

import HeroSection from "./components/HeroSection";
import FeaturedSection from "./components/FeaturedSection";
import BuildSection from "./components/BuildSection";
import CategoriesSection from "./components/CategoriesSection";
import FAQSection from "./components/FAQSection";
import { useTheme } from "@/contexts/ThemeContext";
import TrendingSection from "./components/TrendingSection";
import IntentSelector from "./components/IntentSelector";
import WhyUsersLove from "./components/WhyUsersLove";
import StatsSection from "./components/StatsSection";
import "../styles/landing.css";


export default function Page() {
  const { theme } = useTheme();

  return (
    <div className="bg-(--background)">
      <HeroSection />
      <IntentSelector />
      {/* <FeaturedSection /> */}
      <TrendingSection />
      {/* <BuildSection /> */}
      <CategoriesSection />
      <WhyUsersLove />
      <StatsSection />
      <FAQSection />
    </div>
  );
}