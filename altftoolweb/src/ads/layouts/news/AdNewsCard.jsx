"use client";

import AdBannerCard from "@/ads/layouts/shared/AdBannerCard";
export default function AdNewsCard({ ad }) {
  if (!ad) return null;

  return (
    <AdBannerCard
      ad={ad}
      className="block relative w-full h-[400px] overflow-hidden"
      imageClassName="absolute inset-0 w-full h-full object-cover"
    />
  );
}
