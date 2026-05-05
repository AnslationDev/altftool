"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { formatCategoryLabel, getToolCategories } from "../../toolRouteUtils";
import { useToolAds } from "@/ads/AdsProvider";
import AdSidebar from "@/ads/layouts/shared/AdSidebar";
import AdBottomBanner from "@/ads/layouts/shared/AdBottomBanner";

export default function ToolDetailChrome({ slug, category = "all", children }) {
  const tool = toolMetaMap[slug];
  const toolCategories = getToolCategories(tool);
  const categoryLabel = formatCategoryLabel(category);
  const categoryHref = category === "all" ? "/tools/all" : `/tools/${category}`;
  const toolName = tool?.name || formatCategoryLabel(slug);

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
    <div className="w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full gap-6 lg:gap-8">
        <div className="sticky top-24 hidden h-fit w-[250px] shrink-0 xl:flex">
          <AdSidebar ad={leftAd?.content} />
        </div>

        <main className="min-w-0 flex-1">
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

          <div className="mx-auto w-full">{children}</div>

          {bottomAd?.content && (
            <div className="mt-8">
              <AdBottomBanner ad={bottomAd.content} />
            </div>
          )}
        </main>

        <div className="sticky top-24 hidden h-fit w-[250px] shrink-0 xl:flex">
          <AdSidebar ad={rightAd?.content} />
        </div>
      </div>
    </div>
  );
}
