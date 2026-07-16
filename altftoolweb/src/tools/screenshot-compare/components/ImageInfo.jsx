"use client";

export default function ImageInfo({ image, label, formatFileSize }) {
  if (!image) return null;
  return (
    <div className="rounded-lg border border-(--border) bg-(--card) p-3">
      <h4 className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide mb-2">{label}</h4>
      <div className="space-y-1 text-sm text-(--foreground)">
        <div className="flex justify-between">
          <span className="text-(--muted-foreground)">Name</span>
          <span className="font-medium truncate max-w-[150px]" title={image.file?.name}>{image.file?.name || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-(--muted-foreground)">Dimensions</span>
          <span className="font-medium">{image.width}&times;{image.height}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-(--muted-foreground)">Size</span>
          <span className="font-medium">{formatFileSize(image.file?.size)}</span>
        </div>
      </div>
    </div>
  );
}
