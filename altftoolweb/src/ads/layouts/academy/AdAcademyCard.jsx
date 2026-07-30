"use client";

import AdBannerCard from "@/ads/layouts/shared/AdBannerCard";

export default function AdCard({ ad }) {
  if (!ad) return null;

  const image = ad?.content?.bannerUrl;
  const redirect = ad?.content?.redirect;

  return (
    <AdBannerCard
      ad={{ bannerUrl: image, redirect: redirect || "#" }}
      alt={ad.title || "Ad"}
      className="relative block w-full h-full overflow-hidden border border-[var(--border)] group"
      imageWrapperClassName="relative w-full h-full min-h-[180px]"
      imageClassName="object-cover group-hover:scale-105 transition-transform duration-300"
      fill
      badgeClassName="absolute top-2 right-2 text-[10px] font-medium bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur"
    />
  );
}
