"use client";

import AdBannerCard from "@/ads/layouts/shared/AdBannerCard";

export default function AdCard({ ad }) {
  if (!ad) return null;

  const image = ad?.content?.bannerUrl;
  const redirect = ad?.content?.redirect;

  return (
    <AdBannerCard
      ad={{ bannerUrl: image, redirect: redirect || "#" }}
      alt="Ad"
      className="support-setting-ad-card"
      imageWrapperClassName="relative w-full aspect-[16/9]"
      imageClassName="h-full w-full object-cover"
      badgeClassName="support-setting-ad-sponsored absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur"
    />
  );
}
