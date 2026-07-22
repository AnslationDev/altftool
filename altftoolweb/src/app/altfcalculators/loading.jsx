import {
  RouteCardGridSkeleton,
  RouteHeroSkeleton,
} from "@/components/ui/route-loading";

export default function CalculatorsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading calculators" className="min-h-screen bg-background text-foreground">
      <RouteHeroSkeleton compact />
      <RouteCardGridSkeleton cards={8} columns="lg:grid-cols-4" />
    </main>
  );
}
