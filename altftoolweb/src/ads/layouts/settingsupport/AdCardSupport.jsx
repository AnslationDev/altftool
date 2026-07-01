"use client";

import ManagedImage from "@/components/ui/ManagedImage";

export default function AdCard({ ad }) {
  if (!ad) return null;

  const image = ad?.content?.bannerUrl;
  const redirect = ad?.content?.redirect;

  return (
    <a
      href={redirect || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="support-setting-ad-card"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[16/9]">
        <ManagedImage
          src={image}
          alt="Ad"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Sponsored Tag */}
      <span
        className="
          support-setting-ad-sponsored
          absolute top-2 right-2
          text-[10px] font-medium
          px-2 py-0.5 rounded
          backdrop-blur
        "
      >
        Sponsored
      </span>
    </a>
  );
}
