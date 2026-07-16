"use client";

// Native in-flow sponsored strip for tool detail pages (desktop/tablet).
// Styled like platform content cards — icon tile, title, description, CTA —
// so it reads as part of the page, not an overlay. Renders nothing without a
// creative (no empty placeholder).

import { ArrowUpRight } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import { trackAdEvent, useAdImpression } from "../../track";

const PLACEMENT = "tool_detail_native";

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function AdNativeCard({ ad, toolSlug, className = "" }) {
  const impressionRef = useAdImpression({
    placement: PLACEMENT,
    adId: ad?.id,
    toolSlug,
    enabled: Boolean(ad),
  });

  if (!ad) return null;

  const host = hostnameOf(ad.redirect);
  const title = ad.title || ad.name || host || "Sponsored content";
  const description = ad.description || ad.subtitle || (ad.title || ad.name ? host : "");

  return (
    <a
      ref={impressionRef}
      href={ad.redirect}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackAdEvent("click", { placement: PLACEMENT, adId: ad.id, toolSlug })}
      className={`group relative flex min-h-[76px] items-center gap-4 rounded-lg border border-(--border) bg-(--card) p-4 shadow-sm transition-colors hover:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) ${className}`}
    >
      <span className="absolute right-3 top-3 rounded-full border border-(--border) bg-(--background) px-2 py-0.5 text-[10px] font-semibold text-(--muted-foreground)">
        Sponsored
      </span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-(--muted)">
        <ManagedImage
          src={ad.iconUrl || ad.bannerUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
      <span className="min-w-0 flex-1 pr-20">
        <span className="block truncate text-sm font-semibold text-(--foreground) group-hover:text-(--primary)">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block truncate text-xs text-(--muted-foreground)">{description}</span>
        ) : null}
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-(--muted-foreground) group-hover:text-(--primary) sm:inline-flex">
        Visit <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
