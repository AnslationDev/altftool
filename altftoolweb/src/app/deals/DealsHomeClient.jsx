"use client";

import dynamic from "next/dynamic";

import RouteLazySection from "@/components/ui/RouteLazySection";
import { RouteCardGridSkeleton, RouteSectionSkeleton, RouteStripSkeleton } from "@/components/ui/route-loading";
import HeroSection from "./components/HeroSection";
import TopNineShelf from "./components/TopNineShelf";

const DealShelf = dynamic(() => import("./components/DealShelf"), {
  loading: () => <RouteStripSkeleton items={4} />,
});
const StaffPicks = dynamic(() => import("./components/StaffPicks"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const BrowseSection = dynamic(() => import("./components/BrowseSection"), {
  loading: () => <RouteCardGridSkeleton cards={6} columns="lg:grid-cols-3" />,
});
const EmailCapture = dynamic(() => import("./components/EmailCapture"), {
  loading: () => <RouteSectionSkeleton cards={1} />,
});

export default function DealsHomeClient() {
  return (
    <main className="altf-deals-page">
      <HeroSection />
      <TopNineShelf />
      <RouteLazySection fallback={<RouteStripSkeleton items={4} />} minHeight={340}>
        <DealShelf
          shelf="justLaunched"
          title="Just launched"
          subtitle="Fresh free deals, straight out of the workshop."
          headingId="just-launched-heading"
        />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteStripSkeleton items={4} />} minHeight={340}>
        <DealShelf
          shelf="endingSoon"
          title="Featured spots ending soon"
          subtitle="These deals rotate off the featured shelf on Sunday — the tools stay free forever."
          headingId="ending-soon-heading"
        />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={380}>
        <StaffPicks />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteStripSkeleton items={4} />} minHeight={340}>
        <DealShelf
          shelf="favorites"
          title="Customer favorites"
          subtitle="The highest-rated deals, loved by thousands of users."
          headingId="favorites-heading"
        />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteStripSkeleton items={4} />} minHeight={340}>
        <DealShelf
          shelf="rising"
          title="Rising stars"
          subtitle="Fast-growing tools racking up reviews right now."
          headingId="rising-heading"
        />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteCardGridSkeleton cards={6} columns="lg:grid-cols-3" />} minHeight={720}>
        <BrowseSection />
      </RouteLazySection>
      <RouteLazySection fallback={<RouteSectionSkeleton cards={1} />} minHeight={320}>
        <EmailCapture />
      </RouteLazySection>
    </main>
  );
}
