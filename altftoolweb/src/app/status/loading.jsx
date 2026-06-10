import { RouteHeroSkeleton, RouteSectionSkeleton } from "@/components/ui/route-loading";

export default function StatusLoading() {
  return (
    <main className="bg-(--background) text-(--foreground)">
      <RouteHeroSkeleton compact />
      <RouteSectionSkeleton cards={4} />
    </main>
  );
}
