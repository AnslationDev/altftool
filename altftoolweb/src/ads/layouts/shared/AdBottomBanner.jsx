"use client";

import AdBannerCard from "@/ads/layouts/shared/AdBannerCard";
export default function AdBottomBanner({ ad }) {
  if (!ad) return null;

  return (
    <div className="mt-12 w-full">
      <AdBannerCard
        ad={ad}
        className="relative block w-full h-[200px] overflow-hidden"
        imageClassName="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
