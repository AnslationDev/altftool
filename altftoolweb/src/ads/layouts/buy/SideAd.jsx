"use client";

import AdBannerCard from "@/ads/layouts/shared/AdBannerCard";
export default function SideAd({ ad }) {
  if (!ad) return null;

  return (
    <div className="sticky top-24">
      <AdBannerCard
        ad={ad}
        className="relative block w-[240px] h-[650px] overflow-hidden"
        imageClassName="w-full h-full object-contain"
      />
    </div>
  );
}
