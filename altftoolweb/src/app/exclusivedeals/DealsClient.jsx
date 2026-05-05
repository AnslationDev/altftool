"use client";

import dynamic from "next/dynamic";
import HeroSection from "./(componnets)/HeroSection";
import OutletDealsCard from "./(componnets)/OutletDealsCard";
import data from "./(data)/db.json";
import RouteLazySection from "@/components/ui/RouteLazySection";
import { RouteCardGridSkeleton, RouteSectionSkeleton, RouteStripSkeleton } from "@/components/ui/route-loading";

const BrowserCategory = dynamic(() => import("./(componnets)/BrowserCategory"), {
  loading: () => <RouteStripSkeleton items={6} />,
});
const TreindingPrice = dynamic(() => import("./(componnets)/TreindingPrice"), {
  loading: () => <RouteStripSkeleton items={4} />,
});
const Online = dynamic(() => import("./(componnets)/Online"), {
  loading: () => <RouteCardGridSkeleton cards={6} />,
});
const TopStore = dynamic(() => import("./(componnets)/TopStore"), {
  loading: () => <RouteStripSkeleton items={5} />,
});
const HowItWorks = dynamic(() => import("./(componnets)/HowItWorks"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const SmartDeals = dynamic(() => import("./(componnets)/SmartDeals"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const UpcomingDeals = dynamic(() => import("./(componnets)/UpcomingDeals"), {
  loading: () => <RouteCardGridSkeleton cards={4} />,
});
const DealGuides = dynamic(() => import("./(componnets)/DealGuides"), {
  loading: () => <RouteStripSkeleton items={3} />,
});
const Feedback = dynamic(() => import("./(componnets)/Feedback"), {
  loading: () => <RouteSectionSkeleton cards={3} />,
});
const FAQ = dynamic(() => import("./(componnets)/FAQ"), {
  loading: () => <RouteSectionSkeleton cards={2} />,
});

export default function DealsPage() {

  const { store, popularSales } = data;
 

  return (
    <div  className="bg-(--dealspage-background) text-(--foreground)">
          <HeroSection/>
          <OutletDealsCard/>
          <RouteLazySection fallback={<RouteStripSkeleton items={6} />} minHeight={260}>
            <BrowserCategory/>
          </RouteLazySection>
          <RouteLazySection fallback={<RouteStripSkeleton items={4} />} minHeight={360}>
            <TreindingPrice/>
          </RouteLazySection>
          <RouteLazySection fallback={<RouteCardGridSkeleton cards={6} />} minHeight={520}>
            <Online data={popularSales} />
          </RouteLazySection>
          <RouteLazySection fallback={<RouteStripSkeleton items={5} />} minHeight={320}>
            <TopStore store={store} />
          </RouteLazySection>
          <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={280}>
            <HowItWorks/>
          </RouteLazySection>
          <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={320}>
            <SmartDeals/>
          </RouteLazySection>
          <RouteLazySection fallback={<RouteCardGridSkeleton cards={4} />} minHeight={420}>
            <UpcomingDeals/>
          </RouteLazySection>
          <RouteLazySection fallback={<RouteStripSkeleton items={3} />} minHeight={320}>
            <DealGuides/>
          </RouteLazySection>
          <RouteLazySection fallback={<RouteSectionSkeleton cards={3} />} minHeight={300}>
            <Feedback/>
          </RouteLazySection>
          <RouteLazySection fallback={<RouteSectionSkeleton cards={2} />} minHeight={260}>
            <FAQ/>
          </RouteLazySection>
    </div>
  );
}
