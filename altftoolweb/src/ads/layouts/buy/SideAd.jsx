"use client";

import ManagedImage from "@/components/ui/ManagedImage";
export default function SideAd({ ad }) {
  if (!ad) return null;

  return (
    <div className="sticky top-24">
      <a
        href={ad.redirect}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-[240px] h-[650px] overflow-hidden"
      >
        <span className="absolute top-2 right-2 z-10 text-[10px] px-2 py-1 bg-black/70 text-white rounded-full">
          Sponsored
        </span>

        <ManagedImage
          src={ad.bannerUrl}
          alt="Sponsored"
          className="w-full h-full object-fit"
        />
      </a>
    </div>
  );
}
