"use client";

import ManagedImage from "@/components/ui/ManagedImage";
export default function AdExtensionCard({ ad }) {
  if (!ad) return null;

  return (
    <a
      href={ad.redirect}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative w-full h-[300px] overflow-hidden "
    >
      {/* Image fills entire card */}
      <ManagedImage
        src={ad.bannerUrl}
        alt="Sponsored"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Sponsored badge */}
      <span className="absolute top-2 right-2 z-10 text-[10px] px-2 py-1 bg-black/70 text-white rounded-full">
        Sponsored
      </span>
    </a>
  );
}
