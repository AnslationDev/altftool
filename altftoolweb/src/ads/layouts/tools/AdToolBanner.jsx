"use client";

// Bottom banner for tool detail pages. Contained rounded card with a fixed
// aspect ratio (≈320×100 on mobile, ≈970×250 on larger screens) instead of
// the old full-bleed stretched image — reserved dimensions, object-cover, no
// distortion. Renders nothing without a creative.

import ManagedImage from "@/components/ui/ManagedImage";
import { trackAdEvent, useAdImpression } from "../../track";

const PLACEMENT = "tool_detail_banner";

export default function AdToolBanner({ ad, toolSlug }) {
  const impressionRef = useAdImpression({
    placement: PLACEMENT,
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
      onClick={() => trackAdEvent("click", { placement: PLACEMENT, adId: ad.id, toolSlug })}
      className="relative block aspect-[16/5] w-full overflow-hidden rounded-lg bg-(--muted) shadow-sm ring-1 ring-(--border) transition-colors duration-150 hover:ring-(--border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:aspect-[97/25] motion-reduce:transition-none"
    >
      <span className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
        Sponsored
      </span>
      <ManagedImage
        src={ad.bannerUrl}
        alt={ad.title || ad.name || "Sponsored content"}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </a>
  );
}
