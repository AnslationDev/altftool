"use client";

import ManagedImage from "@/components/ui/ManagedImage";

const DEFAULT_BADGE_CLASSNAME =
  "absolute top-2 right-2 z-10 text-[10px] px-2 py-1 bg-black/70 text-white rounded-full";

export default function AdBannerCard({
  ad,
  className = "relative block w-full h-full overflow-hidden",
  imageWrapperClassName,
  imageClassName = "absolute inset-0 w-full h-full object-cover",
  fill = false,
  alt = "Sponsored",
  badgeClassName = DEFAULT_BADGE_CLASSNAME,
  badgeLabel = "Sponsored",
  imageProps,
}) {
  if (!ad) return null;

  const image = (
    <ManagedImage
      src={ad.bannerUrl}
      alt={alt}
      fill={fill}
      className={imageClassName}
      {...imageProps}
    />
  );

  return (
    // rel includes `sponsored` — these are paid outbound links, and the tool
    // pages that host them live on organic search.
    <a href={ad.redirect} target="_blank" rel="noopener noreferrer sponsored" className={className}>
      {/* Rendered after the image so it always paints on top, since some
          callers pass a badgeClassName with no z-index alongside an
          imageWrapperClassName that creates its own stacking context. */}
      {imageWrapperClassName ? <div className={imageWrapperClassName}>{image}</div> : image}
      <span className={badgeClassName}>{badgeLabel}</span>
    </a>
  );
}
