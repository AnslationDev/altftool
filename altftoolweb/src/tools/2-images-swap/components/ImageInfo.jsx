"use client";

import React from "react";
import { Info } from "lucide-react";

export default function ImageInfo({ imageA, imageB, formatFileSize }) {
  if (!imageA && !imageB) return null;

  const InfoRow = ({ label, image }) => (
    <div className="flex items-center justify-between py-2 border-b border-(--border) last:border-0">
      <span className="text-xs font-medium text-(--muted-foreground)">{label}</span>
      {image ? (
        <div className="flex flex-wrap gap-2 text-xs text-(--foreground) justify-end">
          <span className="font-medium truncate max-w-[140px]">{image.name}</span>
          <span className="text-(--muted-foreground)">{image.type.split("/")[1].toUpperCase()}</span>
          <span className="text-(--muted-foreground)">{formatFileSize(image.size)}</span>
          <span className="text-(--muted-foreground)">{image.width} × {image.height}</span>
        </div>
      ) : (
        <span className="text-xs text-(--muted-foreground)">—</span>
      )}
    </div>
  );

  return (
    <section className="rounded-lg border border-(--border) bg-(--card) p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Info size={16} className="text-(--primary)" />
        <h2 className="text-sm font-semibold text-(--foreground)">Image Details</h2>
      </div>
      <div className="space-y-0">
        <InfoRow label="First Image" image={imageA} />
        <InfoRow label="Second Image" image={imageB} />
      </div>
    </section>
  );
}
