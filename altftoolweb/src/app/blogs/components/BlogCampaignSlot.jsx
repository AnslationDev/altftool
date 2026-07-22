"use client";

// Dedicated campaign / banner placement zone for the blog homepage. Pulls a
// creative from the existing Ads module by placement so the team can run
// campaigns from the Admin Ads manager without touching code. Renders nothing
// when no ad targets the placement, so the layout stays clean when unsold.

import { useAds } from "@/ads/AdsProvider";
import { useAdImpression, trackAdEvent } from "@/ads/track";
import ManagedImage from "@/components/ui/ManagedImage";

export default function BlogCampaignSlot({ placement, className = "" }) {
  const ads = useAds({ placement });
  const ad = ads?.[0];
  const ref = useAdImpression({ placement, adId: ad?.id, enabled: Boolean(ad) });

  const { bannerUrl, redirect } = ad?.content ?? {};
  if (!ad || !bannerUrl) return null;

  const banner = (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm transition-shadow hover:shadow-[var(--anslation-ds-shadow-md)]"
    >
      <ManagedImage src={bannerUrl} alt={ad.title ?? "Advertisement"} className="h-auto w-full object-cover" />
      <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-[2px] text-[10px] font-semibold text-white backdrop-blur-sm">
        Ad
      </span>
    </div>
  );

  return (
    <section aria-label="Sponsored" className={className}>
      {redirect ? (
        <a
          href={redirect}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackAdEvent("click", { placement, adId: ad.id })}
        >
          {banner}
        </a>
      ) : (
        banner
      )}
    </section>
  );
}
