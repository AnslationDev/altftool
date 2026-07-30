"use client";

import { useState } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function AdSidebar({ ad }) {
  const [imgError, setImgError] = useState(false);

  if (!ad || imgError) return null;

  return (
    // Reserved 1:2 skyscraper box (300×600 at full width, 250×500 inside the
    // 250px desktop rail). The slot's height is known before the creative
    // loads, so nothing below it moves when the image arrives — the previous
    // `h-full` + `w-auto` image sized itself only after decode, which shifted
    // the page, and on a phone it could grow to the full viewport height.
    <div className="mx-auto w-full max-w-[300px]">
      <a
        href={ad.redirect}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group relative block aspect-[1/2] max-h-[80vh] w-full overflow-hidden bg-(--muted)"
      >
        {/* LABEL */}
        <span className="absolute top-2 right-2 z-10 text-[10px] px-2 py-1 bg-black/70 text-white rounded-full">
          Sponsored
        </span>

        {/* IMAGE */}
        <ManagedImage
          src={ad.bannerUrl}
          alt="Sponsored Ad"
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
        />
      </a>
    </div>
  );
}