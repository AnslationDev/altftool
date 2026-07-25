"use client";

// Side rail skyscraper for tool detail pages. Fixed 250×500 token card:
// compact enough to leave the workspace generous, reserved dimensions
// (zero CLS), letterboxes portrait creatives with object-contain, no hover
// zoom (reduced-motion friendly). Rendering/visibility is decided by
// ToolDetailChrome — this component is only ever mounted with a creative.

import ManagedImage from "@/components/ui/ManagedImage";
import { trackAdEvent, useAdImpression } from "../../track";

export default function AdRail({ ad, toolSlug, placement = "tool_detail_rail_right" }) {
  const impressionRef = useAdImpression({
    placement,
    adId: ad?.id,
    toolSlug,
    enabled: Boolean(ad),
  });

  if (!ad) return null;

  return (
    <a
      ref={impressionRef}
      href={ad.redirect}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackAdEvent("click", { placement, adId: ad.id, toolSlug })}
      className="relative block h-[500px] w-[250px] overflow-hidden rounded-lg bg-(--muted) shadow-sm ring-1 ring-(--border) transition-colors duration-150 hover:ring-(--border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) motion-reduce:transition-none"
    >
      <span className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
        Sponsored
      </span>
      <ManagedImage
        src={ad.bannerUrl}
        alt={ad.title || ad.name || "Sponsored content"}
        className="h-full w-full object-contain"
      />
    </a>
  );
}
