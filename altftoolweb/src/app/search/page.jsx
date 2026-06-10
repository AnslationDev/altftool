import { Suspense } from "react";
import SearchContent from "./SearchContent";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { RouteLoadingShell } from "@/components/ui/route-loading";

export const metadata = {
  ...createPageMetadata({
    title: "Search AltFTool",
    description:
      "Search AltFTool tools, extensions, guides, deals, academy resources, and digital workflows from one focused route.",
    path: "/search",
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return (
    <Suspense fallback={<RouteLoadingShell variant="listing" />}>
      <SearchContent />
    </Suspense>
  );
}
