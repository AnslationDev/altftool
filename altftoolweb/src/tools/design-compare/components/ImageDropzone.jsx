"use client";

import { Upload, X } from "lucide-react";
import { formatBytes } from "../utils/imageUtils";

export default function ImageDropzone({ slot, label, image, onImage }) {
  function handleDrop(event) {
    event.preventDefault();
    onImage(slot, event.dataTransfer.files?.[0]);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Drag and drop or browse</p>
        </div>
        <Upload className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <label className="mt-4 flex min-h-40 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-center focus-within:shadow-[var(--anslation-ds-focus-ring)]">
        <input type="file" accept="image/*" className="sr-only" onChange={(event) => onImage(slot, event.target.files?.[0])} />
        {image ? (
          <span className="relative block w-full p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={`${label} preview`} className="mx-auto max-h-44 rounded-md object-contain" />
          </span>
        ) : (
          <span className="px-4 text-sm font-semibold text-[var(--muted-foreground)]">Upload {label}</span>
        )}
      </label>
      {image && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
          <span>{image.width} x {image.height} · {formatBytes(image.size)} · {image.type}</span>
          <X className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
