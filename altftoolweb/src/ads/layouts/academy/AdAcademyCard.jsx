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
      className="
        relative block w-full h-full
 overflow-hidden
        border border-[var(--border)]
        group
      "
    >
      {/* Image */}
      <div className="relative w-full h-full min-h-[180px]">
        <ManagedImage
          src={image}
          alt={ad.title || "Ad"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Sponsored Tag */}
      <span className="
        absolute top-2 right-2
        text-[10px] font-medium
        bg-black/70 text-white
        px-2 py-0.5 rounded
        backdrop-blur
      ">
        Sponsored
      </span>
    </a>
  );
}
