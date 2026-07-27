import { RouteLoadingShell } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <>
      <h1 className="sr-only">
        Top9 ranked guides for entertainment, sports, tools, lifestyle, and trending topics
      </h1>
      <RouteLoadingShell variant="listing" />
    </>
  );
}
