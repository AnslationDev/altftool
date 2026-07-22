// src/app/fode_new/components/AdSlot.jsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Enhanced AdSlot component for left/right gutter placements.
 * Features:
 * - Absolute layout filling 100% space from top to bottom.
 * - Replaced object-fit contain with full vertical space coverage wrappers.
 */
export default function AdSlot({
  placement = "left-gutter",
  maxHeight = "h-full", // Default updated to full space cover
  className = "",
  redirect = "#",
}) {
  const bannerMap = {
    "left-gutter": "/banners/vertical.jpg",
    "right-gutter": "/banners/vertical.jpg",
    "top-banner": "/banners/top-bottom.png",
    "bottom-banner": "/banners/top-bottom.png",
    default: "/banners/vertical.jpg",
  };

  const [bannerUrl, setBannerUrl] = useState(bannerMap[placement] || bannerMap.default);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBannerUrl(bannerMap[placement] || bannerMap.default);
  }, [placement]);

  return (
    // Fixed: Forced w-full h-full implementation so it spreads completely from top to bottom
    <div className={`relative w-full h-full ${className} flex items-stretch justify-center overflow-hidden bg-gray-50 dark:bg-neutral-900 rounded-xl transition-all duration-300`}>
      <a href={redirect} target="_blank" rel="noopener noreferrer" className="relative block w-full h-full group">
        <Image
          src={bannerUrl}
          alt={`Ad slot ${placement}`}
          fill
          sizes="(max-width: 1280px) 100vw, 320px"
          style={{ objectFit: "fill" }} // Fixed: This makes the image stretch and perfectly cover the entire height layout bounds
          priority
          onLoad={() => setLoaded(true)}
          className={`rounded-xl shadow-xs transition-all duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {/* Modern Hover Glassmorphism Sponsored Overlay Screen Layer */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 backdrop-blur-0 transition-all duration-300">
          <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-2.5 py-1 rounded">
            Sponsored
          </span>
        </div>
      </a>
    </div>
  );
}
