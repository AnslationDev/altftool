"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { toolRuntimeMap } from "@/platform/registry/toolRuntimeMap";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { formatCategoryLabel, getToolCategories } from "../../toolRouteUtils";
import { useToolAds } from "@/ads/AdsProvider";

import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import AdBottomBanner from "@/ads/layouts/shared/AdBottomBanner";
import { ToolModuleSkeleton } from "./ToolDetailSkeleton";

export default function ToolClient({ slug, category = "all" }) {
  const loadTool = toolRuntimeMap[slug];
  const tool = toolMetaMap[slug];
  const toolCategories = getToolCategories(tool);
  const categoryLabel = formatCategoryLabel(category);
  const categoryHref = category === "all" ? "/tools/all" : `/tools/${category}`;
  const toolName = tool?.name || formatCategoryLabel(slug);

  const Tool = useMemo(() => {
    if (!loadTool) return null;

    return dynamic(() => loadTool(), {
      ssr: false,
      loading: () => <ToolModuleSkeleton />,
    });
  }, [loadTool]);

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

  if (!Tool) {
    return (
      <div className="p-10 text-center text-sm text-red-500">
        Tool not registered
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="w-full mx-auto flex gap-6 lg:gap-8">
        <div className="hidden xl:flex w-[250px] h-fit shrink-0 sticky top-24">
          <AdSidebar ad={leftAd?.content} />
        </div>

        <main className="flex-1 min-w-0">
          <nav
            aria-label="Tool route"
            className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-center gap-2 text-xs font-medium text-(--muted-foreground)"
          >
            <Link href="/tools/all" className="hover:text-(--primary)">
              Tools
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={categoryHref} className="hover:text-(--primary)">
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-(--foreground)">{toolName}</span>
          </nav>

          <div className="w-full mx-auto">
            <Tool />
          </div>

          {bottomAd?.content && (
            <div className="mt-8">
              <AdBottomBanner ad={bottomAd.content} />
            </div>
          )}
        </main>

        <div className="hidden xl:flex w-[250px] shrink-0 sticky top-24 h-fit ">
          <AdSidebar ad={rightAd?.content} />
        </div>
      </div>
    </div>
  );
}
