"use client";

import React from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

// Zoom in / out / reset buttons for the preview surface.
export default function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-(--border) bg-(--background) p-1">
      <button
        type="button"
        onClick={onZoomOut}
        className="rounded-lg p-2 text-(--foreground) transition hover:bg-(--muted) hover:text-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <ZoomOut size={16} />
      </button>
      <span className="w-12 text-center text-xs font-semibold tabular-nums text-(--muted-foreground)">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        className="rounded-lg p-2 text-(--foreground) transition hover:bg-(--muted) hover:text-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <ZoomIn size={16} />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg p-2 text-(--foreground) transition hover:bg-(--muted) hover:text-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
        aria-label="Reset zoom"
        title="Reset zoom"
      >
        <Maximize size={16} />
      </button>
    </div>
  );
}
