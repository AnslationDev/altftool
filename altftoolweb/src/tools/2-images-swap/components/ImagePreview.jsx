"use client";

import React from "react";
import { ArrowRightLeft, Download, RefreshCcw } from "lucide-react";

export default function ImagePreview({
  displayImages,
  imageA,
  imageB,
  isSwapped,
  onSwap,
  onReset,
  onDownload,
}) {
  const hasBoth = !!imageA && !!imageB;

  return (
    <section className="rounded-lg border border-(--border) bg-(--card) p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-(--foreground)">Preview</h2>
        {hasBoth && (
          <span className="text-xs font-semibold rounded-lg border border-(--border) bg-(--background) px-2.5 py-1 text-(--muted-foreground)">
            {isSwapped ? "Swapped" : "Original"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left panel */}
        <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
          <div className="px-3 py-2 border-b border-(--border) bg-(--muted)">
            <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
              {isSwapped ? "Image B" : "Image A"}
            </span>
          </div>
          <div className="flex items-center justify-center p-3 min-h-[12rem] sm:min-h-[16rem]">
            {displayImages.left ? (
              <img
                src={displayImages.left.preview}
                alt={`${isSwapped ? "Image B" : "Image A"} preview`}
                className="max-h-48 sm:max-h-56 w-auto object-contain rounded"
              />
            ) : (
              <p className="text-sm text-(--muted-foreground)">No image</p>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="rounded-lg border border-(--border) bg-(--background) overflow-hidden">
          <div className="px-3 py-2 border-b border-(--border) bg-(--muted)">
            <span className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
              {isSwapped ? "Image A" : "Image B"}
            </span>
          </div>
          <div className="flex items-center justify-center p-3 min-h-[12rem] sm:min-h-[16rem]">
            {displayImages.right ? (
              <img
                src={displayImages.right.preview}
                alt={`${isSwapped ? "Image A" : "Image B"} preview`}
                className="max-h-48 sm:max-h-56 w-auto object-contain rounded"
              />
            ) : (
              <p className="text-sm text-(--muted-foreground)">No image</p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onSwap}
          disabled={!hasBoth}
          className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRightLeft size={16} />
          {isSwapped ? "Restore Original" : "Swap Images"}
        </button>

        <button
          onClick={() => onDownload(displayImages.left, "left")}
          disabled={!displayImages.left}
          className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download size={16} />
          Download Left
        </button>

        <button
          onClick={() => onDownload(displayImages.right, "right")}
          disabled={!displayImages.right}
          className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download size={16} />
          Download Right
        </button>

        <button
          onClick={onReset}
          disabled={!imageA && !imageB}
          className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={16} />
          Reset
        </button>
      </div>
    </section>
  );
}
