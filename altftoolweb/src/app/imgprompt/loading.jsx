import { RouteCardGridSkeleton, RouteHeroSkeleton } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading AI Prompt Studio" className="min-h-screen bg-background text-foreground">
      <RouteHeroSkeleton compact />
      <RouteCardGridSkeleton cards={6} />
    </main>
  );
}
