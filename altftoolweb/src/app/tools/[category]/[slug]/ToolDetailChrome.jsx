"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { formatCategoryLabel, getToolCategories } from "../../toolRouteFormat";
import { useToolAds } from "@/ads/AdsProvider";
import AdRail from "@/ads/layouts/tools/AdRail";
import AdNativeCard from "@/ads/layouts/tools/AdNativeCard";
import AdInlineCard from "@/ads/layouts/tools/AdInlineCard";
import AdToolBanner from "@/ads/layouts/tools/AdToolBanner";
import RouteLazySection from "@/components/ui/RouteLazySection";
import { rememberRecentTool } from "../../toolStorage";
import { isWideWorkspaceTool } from "../../wideWorkspaceTools";

// `tool` comes from the server page, which already looked it up. Reading it
// from the catalogue here instead put all 3,900 entries (1.0 MB raw, 210 KB
// brotli) into the eager client bundle of every tool page.
export default function ToolDetailChrome({ slug, tool, category = "all", seoContent, children }) {
  const toolCategories = getToolCategories(tool);
  const categoryLabel = formatCategoryLabel(category);
  const categoryHref = category === "all" ? "/tools/all" : `/tools/${category}`;
  const toolName = tool?.name || formatCategoryLabel(slug);

  // Placement mapping (backward compatible with existing Firestore keys):
  //   tool_detail_right  → right rail skyscraper (shows once the right gutter is free)
  //   tool_detail_left   → the same creative lands in exactly ONE slot per width:
  //                          mobile inline (<64rem) → in-flow native strip
  //                          (64–97rem) → left rail (≥97rem). Never repeated.
  //   tool_detail_bottom → bottom banner (contained card)
  const rightRailAd = useToolAds({
    placement: "tool_detail_right",
    toolSlug: slug,
    toolCategories,
  })[0];

  // Single left creative reused across the three width-exclusive left slots.
  const leftAd = useToolAds({
    placement: "tool_detail_left",
    toolSlug: slug,
    toolCategories,
  })[0];

  const bottomAd = useToolAds({
    placement: "tool_detail_bottom",
    toolSlug: slug,
    toolCategories,
  })[0];

  // Tools that need the full viewport (canvas/image/PDF/code editors) opt out
  // of the rails and the workspace width cap — either via the curated central
  // list (wideWorkspaceTools) or `wideWorkspace: true` in tool.config.js.
  const wideWorkspace = isWideWorkspaceTool(slug, tool);
  const showRightRail = !wideWorkspace && Boolean(rightRailAd?.content);
  const showLeftRail = !wideWorkspace && Boolean(leftAd?.content);

  useEffect(() => {
    rememberRecentTool(slug, Boolean(tool));
  }, [slug, tool]);

  return (
    // `@container/toolpage` lets the rail respond to the actual content area
    // width (page width minus padding) rather than the viewport, so page
    // chrome, scrollbars and future padding changes are accounted for.
    // Mobile top padding is deliberately small (pt-2 = 8px). The large
    // majority of search clicks arrive on a phone, where the sticky 64px
    // header already owns the top of the viewport; every pixel above the
    // workspace pushes the tool the visitor came for below the 844px fold.
    // Desktop keeps the roomier py-10.
    <div className="@container/toolpage w-full px-4 pb-6 pt-2 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full justify-center gap-6 lg:gap-8">
        {/*
          Order inside <main> is fold-first: the tool workspace is the FIRST
          thing after the header, so a visitor landing from a mobile search
          result sees the app, not chrome. Breadcrumbs, the SEO prose and the
          related-tool band all render below it (breadcrumbs at the very
          bottom, see the trail nav). The BreadcrumbList JSON-LD lives on the
          server page and is unaffected by this visual order.
        */}
        <main className="min-w-0 flex-1">
          <div
            data-testid="tool-workspace-shell"
            data-tool-slug={slug}
            className={`mx-auto w-full ${wideWorkspace ? "max-w-none" : "max-w-6xl"} min-w-0 overflow-x-auto overscroll-x-contain`}
          >
            {children}
          </div>

          {/*
            One left creative, three width-exclusive homes (all container-query
            gated so the ranges never overlap and never leave a blank gap):
              <48rem   → inline card 300×250 (phones)
              48–97rem → native in-flow strip (tablet / mid desktop)
              ≥97rem   → left rail (below, in the gutter)
            No reserved minHeight: at ≥97rem both in-flow slots collapse to 0
            and the rail takes over, so there is no empty space to reserve.
            Reveal via idleDelay (not intersection) because with no reserved
            height the section is 0px until its child renders, and a 0-height
            target never satisfies the observer's ratio threshold.
          */}
          {leftAd?.content && (
            <RouteLazySection className="mx-auto mt-6 w-full max-w-6xl" idleDelay={2500}>
              <div className="@[48rem]/toolpage:hidden">
                <AdInlineCard ad={leftAd.content} toolSlug={slug} />
              </div>
              <div className="hidden @[48rem]/toolpage:block @[97rem]/toolpage:hidden">
                <AdNativeCard ad={leftAd.content} toolSlug={slug} />
              </div>
            </RouteLazySection>
          )}

          {/* Below the tool, always. The H1 and all the indexable prose live
              in here — moved down the page, never removed. The wrapper only
              supplies the gap the section used to get from being a sibling of
              this container. */}
          {seoContent ? <div className="mt-6">{seoContent}</div> : null}

          {bottomAd?.content && (
            <RouteLazySection className="mx-auto mt-8 w-full max-w-6xl" minHeight={120}>
              <AdToolBanner ad={bottomAd.content} toolSlug={slug} />
            </RouteLazySection>
          )}

          {/*
            Breadcrumb trail. Kept in the DOM (same links, same labels) but
            moved from above the workspace to the end of <main>: on a 390px
            phone it cost 40px of the first screen — the pill row plus its
            margin — directly between the visitor and the tool. DOM order and
            visual order still match, so focus order stays correct (WCAG 2.4.3);
            no CSS `order` trick is used.

            The pills carry min-h-11 / min-w-11: at px-2.5 py-1 they measured
            50×24 and 68×24 on a 390px phone, well under the 44px tap target
            master.md requires. They sit at the very end of the page, so the
            extra height costs nothing above the fold.
          */}
          <nav
            aria-label="Tool route"
            className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap items-center gap-1.5 border-t border-(--border) pt-5 text-[13px] font-medium text-(--muted-foreground)"
          >
            <Link
              href="/tools/all"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-(--card) px-3.5 py-2 font-semibold ring-1 ring-(--border) transition-colors duration-150 hover:text-(--primary) hover:ring-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transition-none"
            >
              Tools
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <Link
              href={categoryHref}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-(--card) px-3.5 py-2 font-semibold ring-1 ring-(--border) transition-colors duration-150 hover:text-(--primary) hover:ring-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transition-none"
            >
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="px-1 font-semibold text-(--foreground)" aria-current="page">
              {toolName}
            </span>
          </nav>
        </main>

        {/*
          Right rail skyscraper (250×500). Rendered only when a creative
          exists (no empty wrapper column, ever) and visible only when the
          content area fits the full workspace + rail without squeezing the
          tool: 72rem workspace + 15.625rem rail + 2rem gap ≈ 90rem. If the
          workspace max-width changes, update these thresholds.
        */}
        {showRightRail && (
          <aside
            aria-label="Sponsored"
            className="sticky top-24 order-3 hidden h-fit shrink-0 @[90rem]/toolpage:block"
          >
            <AdRail ad={rightRailAd.content} toolSlug={slug} placement="tool_detail_rail_right" />
          </aside>
        )}

        {/*
          Left rail skyscraper — progressive: right rail first (90rem
          container), left rail joins at 97rem container (≈1616px viewport
          after page padding). With both rails at that point the workspace
          keeps ≥61.75rem (~990px) and grows back to its full 72rem by
          ~107.25rem. Standard dual-skyscraper pattern without crowding the
          tool.
        */}
        {showLeftRail && (
          <aside
            aria-label="Sponsored"
            className="sticky top-24 order-first hidden h-fit shrink-0 @[97rem]/toolpage:block"
          >
            <AdRail ad={leftAd.content} toolSlug={slug} placement="tool_detail_rail_left" />
          </aside>
        )}
      </div>
    </div>
  );
}
