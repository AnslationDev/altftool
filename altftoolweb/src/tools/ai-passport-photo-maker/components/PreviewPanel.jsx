"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Grid3X3, ZoomIn, ZoomOut } from "lucide-react";

export default function PreviewPanel({
  originalImage,
  resultImage,
  template,
  viewMode = "result",
  onViewModeChange,
  gridVisible = false,
  onGridToggle,
}) {
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const currentImage = viewMode === "original" ? originalImage : resultImage;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));

  if (!originalImage && !resultImage) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-(--border) bg-(--card)">
        <p className="text-xs text-(--muted-foreground)">No image to preview</p>
      </div>
    );
  }

  const content = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-(--border) bg-(--card) p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange?.("original")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) ${
              viewMode === "original"
                ? "bg-(--primary) text-(--primary-foreground)"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
            aria-pressed={viewMode === "original"}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.("result")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) ${
              viewMode === "result"
                ? "bg-(--primary) text-(--primary-foreground)"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
            aria-pressed={viewMode === "result"}
          >
            Result
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="min-w-[36px] text-center text-xs text-(--muted-foreground)">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <div className="mx-1 h-5 w-px bg-(--border)" />
          {onGridToggle && (
            <button
              type="button"
              onClick={onGridToggle}
              className={`rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) ${
                gridVisible
                  ? "text-(--primary)"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
              aria-label="Toggle grid overlay"
              aria-pressed={gridVisible}
            >
              <Grid3X3 size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            className="rounded-lg p-1.5 text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-(--border) bg-(--muted) ${
          fullscreen ? "fixed inset-0 z-50 m-0 rounded-none bg-black/90" : "min-h-[320px]"
        }`}
      >
        {currentImage ? (
          <div className="relative" style={{ transform: `scale(${zoom})` }}>
            <img
              src={currentImage}
              alt={viewMode === "original" ? "Original photo" : "Processed result"}
              className="max-h-[60vh] w-auto object-contain"
            />
            {gridVisible && (
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="var(--border-strong)" strokeWidth="0.5" />
                <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="var(--border-strong)" strokeWidth="0.5" />
                <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="var(--border-strong)" strokeWidth="0.5" />
                <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="var(--border-strong)" strokeWidth="0.5" />
              </svg>
            )}
            {template && (
              <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                {template.label || template.name || template}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-(--muted-foreground)">No image</p>
        )}

        {fullscreen && (
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 rounded-lg bg-black/60 p-2 min-w-11 min-h-11 inline-flex items-center justify-center text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
            aria-label="Exit fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        )}
      </div>
    </div>
  );

  if (fullscreen) return content;
  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>{content}</motion.div>;
}
