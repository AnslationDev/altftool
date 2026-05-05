"use client";

import dynamic from "next/dynamic";
import HeroSection from "./components/HeroSection";
import IntentSelector from "./components/IntentSelector";
import RouteLazySection from "@/components/ui/RouteLazySection";
import { RouteCardGridSkeleton, RouteSectionSkeleton, RouteStripSkeleton } from "@/components/ui/route-loading";
import "../styles/landing.css";

const TrendingSection = dynamic(() => import("./components/TrendingSection"), {
  loading: () => <RouteStripSkeleton items={4} />,
});
const CategoriesSection = dynamic(() => import("./components/CategoriesSection"), {
  loading: () => <RouteCardGridSkeleton cards={6} />,
});
const WhyUsersLove = dynamic(() => import("./components/WhyUsersLove"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const StatsSection = dynamic(() => import("./components/StatsSection"), {
  loading: () => <RouteSectionSkeleton cards={4} />,
});
const FAQSection = dynamic(() => import("./components/FAQSection"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});

export default function Page() {
  return (
    <div className="bg-(--background)">
      <HeroSection />
      <IntentSelector />
      <RouteLazySection fallback={<RouteStripSkeleton items={4} />} minHeight={280}>
        <TrendingSection />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteCardGridSkeleton cards={6} />} minHeight={420}>
        <CategoriesSection />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={280}>
        <WhyUsersLove />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteSectionSkeleton cards={4} />} minHeight={240}>
        <StatsSection />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={280}>
        <FAQSection />
      </RouteLazySection>
    </div>
  );
}
