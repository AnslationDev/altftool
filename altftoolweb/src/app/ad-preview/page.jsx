
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdToolCard from "@/ads/layouts/tools/AdToolCard";
import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import AdNewsCard from "@/ads/layouts/news/AdNewsCard";
import AdGameCard from "@/ads/layouts/games/AdGameCard";
import AdBottomBanner from "@/ads/layouts/shared/AdBottomBanner";
import AdExtensionCard from "@/ads/layouts/extension/AdExtensionCard";

function AdPreviewContent() {
  const params = useSearchParams();
  const layout = params.get("layout");
  const banner = params.get("banner");

  const ad = {
    bannerUrl: banner,
    redirect: "#",
  };

  switch (layout) {
    case "tool_card":
      return <AdToolCard ad={ad} />;
    case "sidebar":
      return <AdSidebar ad={ad} />;
      case "bottombanner":
        return <AdBottomBanner ad={ad}/>;
    case "news_card":
      return <AdNewsCard ad={ad} />;
    case "game_card":
      return <AdGameCard ad={ad} />;
    case "extension_card":
      return <AdExtensionCard ad={ad} />;
    default:
      return <div>Unknown layout</div>;
  }
}

export default function AdPreviewPage() {
  return (
    <Suspense fallback={null}>
      <AdPreviewContent />
    </Suspense>
  );
}
