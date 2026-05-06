"use client";

import { useState } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function AdSidebar({ ad }) {
  const [imgError, setImgError] = useState(false);

  if (!ad || imgError) return null;

  return (
    <div className="max-h-screen">
      <a
        href={ad.redirect}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden h-full max-h-screen"
      >
        {/* LABEL */}
        <span className="absolute top-2 right-2 z-10 text-[10px] px-2 py-1 bg-black/70 text-white rounded-full">
          Sponsored
        </span>

        {/* IMAGE */}
        <div className="bg-(--muted) w-full h-full max-h-screen flex items-center justify-center">
          <ManagedImage
            src={ad.bannerUrl}
            alt="Sponsored Ad"
            onError={() => setImgError(true)}
            className="max-h-screen w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </a>
    </div>
  );
}