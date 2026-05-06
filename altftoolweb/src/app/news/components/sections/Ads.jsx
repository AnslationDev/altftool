"use client";

import { useAds } from "@/ads/AdsProvider";
import { useMemo } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function Ads() {
  const ads = useAds({ placement: "news_sideads" });

  const sidebarAds = useMemo(() => {
    if (!ads.length) return [];
    return ads.slice(0, 2);
  }, [ads]);

  if (!sidebarAds.length) return null;

  return (
    <div className="space-y-6">
      {sidebarAds.map((ad, i) => (
        <AdCard
          key={ad.id || i}
          ad={ad}
        />
      ))}
    </div>
  );
}
function AdCard({ ad, }) {
  const image = ad?.content?.bannerUrl;
  const redirect = ad?.content?.redirect;

  return (
    <a
      href={redirect || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block overflow-hidden rounded-sm"
    >
      {/* Image */}
      <ManagedImage
        src={image}
        alt={ad?.title || "Sponsored Ad"}
        className={` w-full object-cover`}
        loading="lazy"
      />

      {/* Sponsored badge */}
      <div
        className="
          absolute top-3 left-3
          rounded-full
          bg-black/70
          px-3 py-1
          text-xs font-semibold
          text-white
          backdrop-blur-sm
        "
      >
        Sponsored
      </div>
    </a>
  );
}
