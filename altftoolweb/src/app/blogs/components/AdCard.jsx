"use client";
import ManagedImage from "@/components/ui/ManagedImage";

export default function AdCard({ src, height}) {
  // Normalize: src can be a full ad object or a plain image string
  const isObject = src && typeof src === "object";
  const imgSrc   = isObject ? src?.content?.bannerUrl : src;
  const href     = isObject ? src?.content?.redirect  : null;

  if (!imgSrc) return null;

  const card = (
    <div className={`relative overflow-hidden shadow-md ${height}`}>
      <ManagedImage
        src={imgSrc}
        alt="Advertisement"
        fill
        className="object-cover"
      />
      <span className="absolute top-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
        Sponsored
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer sponsored">
        {card}
      </a>
    );
  }

  return card;
}
