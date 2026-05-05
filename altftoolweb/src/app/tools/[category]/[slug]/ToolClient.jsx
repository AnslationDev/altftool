"use client";

import dynamic from "next/dynamic";
import { toolRuntimeMap } from "@/platform/registry/toolRuntimeMap";
import { useToolAds } from "@/ads/AdsProvider";

import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import AdBottomBanner from "@/ads/layouts/shared/AdBottomBanner";

export default function ToolClient({ slug, toolCategories = [] }) {
  const loadTool = toolRuntimeMap[slug];

  if (!loadTool) {
    return (
      <div className="p-10 text-center text-sm text-red-500">
        Tool not registered
      </div>
    );
  }

  const Tool = dynamic(() => loadTool(), {
    ssr: false,
    loading: () => (
      <div className="p-10 text-center text-sm text-[var(--color-muted-foreground)]">
        Loading tool…
      </div>
    ),
  });

  const leftAd = useToolAds({
    placement: "tool_detail_left",
    toolSlug: slug,
    toolCategories,
  })[0];

  const rightAd = useToolAds({
    placement: "tool_detail_right",
    toolSlug: slug,
    toolCategories,
  })[0];

  const bottomAd = useToolAds({
    placement: "tool_detail_bottom",
    toolSlug: slug,
    toolCategories,
  })[0];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

      <div className="w-full mx-auto flex gap-6 lg:gap-8">

        {/* LEFT AD */}
        <div className="hidden xl:flex w-[250px] h-fit shrink-0 sticky top-24">
          <AdSidebar ad={leftAd?.content} />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">

          <div className="w-full mx-auto">
            <Tool />
          </div>

          {/* BOTTOM AD */}
          {bottomAd?.content && (
            <div className="mt-8">
              <AdBottomBanner ad={bottomAd.content} />
            </div>
          )}

        </div>

        {/* RIGHT AD */}
        <div className="hidden xl:flex w-[250px] shrink-0 sticky top-24 h-fit ">
          <AdSidebar ad={rightAd?.content} />
        </div>

      </div>
    </div>
  );
}