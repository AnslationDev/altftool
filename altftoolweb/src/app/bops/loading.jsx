import {
  RouteCardGridSkeleton,
  RouteHeroSkeleton,
} from "@/components/ui/route-loading";

export default function BusinessOpsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading business products" className="min-h-screen bg-background text-foreground">
      <RouteHeroSkeleton compact />
      <RouteCardGridSkeleton cards={4} columns="lg:grid-cols-2" />
    </main>
  );
}
