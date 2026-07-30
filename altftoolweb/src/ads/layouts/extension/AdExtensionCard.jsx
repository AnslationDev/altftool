"use client";

import AdBannerCard from "@/ads/layouts/shared/AdBannerCard";
export default function AdExtensionCard({ ad }) {
  if (!ad) return null;

  return (
    <AdBannerCard
      ad={ad}
      className="extension-ad-card block relative w-full h-[300px] overflow-hidden"
      imageClassName="absolute inset-0 w-full h-full object-contain"
    />
  );
}
