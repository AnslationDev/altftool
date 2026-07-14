"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";

// Preview surface: original photo + sketch overlay with a draggable
// before/after compare divider, zoom transform, loading and error states.
export default function Preview({
  originalSrc,
  sketchCanvas,
  isProcessing,
  error,
  zoomScale,
}) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50); // % of sketch revealed from the left
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-(--border) pb-4">
        <h3 className="text-lg font-bold text-(--foreground)">Preview</h3>
        <span className="rounded-lg bg-(--primary)/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-(--primary)">
          Drag to compare
        </span>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertTriangle size={22} className="text-red-500" />
          <p className="text-sm font-medium text-(--foreground)">{error}</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative mx-auto overflow-hidden rounded-xl bg-(--muted)"
          style={{ maxWidth: "100%" }}
        >
          <div
            className="origin-center transition-transform"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {/* Original (bottom layer) */}
            {originalSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={originalSrc}
                alt="Original photo"
                className="block max-h-[60vh] w-auto select-none"
                draggable={false}
              />
            )}

            {/* Sketch (top layer, clipped to the left of the divider) */}
            {sketchCanvas && (
              <canvas
                ref={(node) => {
                  if (node && sketchCanvas) {
                    node.width = sketchCanvas.width;
                    node.height = sketchCanvas.height;
                    node
                      .getContext("2d")
                      .drawImage(sketchCanvas, 0, 0);
                  }
                }}
                className="absolute inset-0 block max-h-[60vh] w-auto select-none"
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-(--background)/50 backdrop-blur-[2px]">
              <Loader2 size={28} className="animate-spin text-(--primary)" />
              <span className="text-xs font-medium text-(--foreground)">
                Rendering sketch&hellip;
              </span>
            </div>
          )}

          {/* Compare divider + handle */}
          {sketchCanvas && !isProcessing && (
            <div
              className="absolute inset-y-0 z-10"
              style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
            >
              <div className="h-full w-0.5 bg-(--primary)" />
              <button
                type="button"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-(--primary) bg-(--background) text-(--primary) shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                aria-label="Drag to compare before and after"
              >
                <span className="text-xs font-bold">↔</span>
              </button>
            </div>
          )}

          {/* Keyboard-accessible slider for compare position */}
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="sr-only"
            aria-label="Compare position between original and sketch"
            tabIndex={sketchCanvas && !isProcessing ? 0 : -1}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-(--muted-foreground)">
        <span>Original</span>
        <span>Sketch</span>
      </div>
    </div>
  );
}
