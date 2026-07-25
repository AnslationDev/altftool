"use client";

// Mobile/tablet in-flow ad card for tool detail pages: centered 300×250
// (IAB medium rectangle) with reserved dimensions. Renders nothing without a
// creative.

import ManagedImage from "@/components/ui/ManagedImage";
import { trackAdEvent, useAdImpression } from "../../track";

const PLACEMENT = "tool_detail_inline";

export default function AdInlineCard({ ad, toolSlug, className = "" }) {
  const impressionRef = useAdImpression({
    placement: PLACEMENT,
    adId: ad?.id,
    toolSlug,
    enabled: Boolean(ad),
  });

  if (!ad) return null;

  return (
    <div ref={impressionRef} className={`flex justify-center ${className}`}>
      <a
        href={ad.redirect}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackAdEvent("click", { placement: PLACEMENT, adId: ad.id, toolSlug })}
        className="relative block h-[250px] w-[300px] overflow-hidden rounded-lg bg-(--muted) shadow-sm ring-1 ring-(--border) transition-colors duration-150 hover:ring-(--border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) motion-reduce:transition-none"
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
    </div>
  );
}
