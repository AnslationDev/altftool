"use client";

import { useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Crop, RefreshCw, Maximize2, Minimize2 } from "lucide-react";

export default function ImageEditor({ image, onZoomChange, onRotate, onReset }) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showCrop, setShowCrop] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      const next = Math.min(200, z + 10);
      onZoomChange?.(next);
      return next;
    });
  }, [onZoomChange]);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(50, z - 10);
      onZoomChange?.(next);
      return next;
    });
  }, [onZoomChange]);

  const handleRotateLeft = useCallback(() => {
    setRotation((r) => {
      const next = r - 90;
      onRotate?.(next);
      return next;
    });
  }, [onRotate]);

  const handleRotateRight = useCallback(() => {
    setRotation((r) => {
      const next = r + 90;
      onRotate?.(next);
      return next;
    });
  }, [onRotate]);

  const handleReset = useCallback(() => {
    setZoom(100);
    setRotation(0);
    setShowCrop(false);
    onReset?.();
  }, [onReset]);

  return (
    <div className="space-y-4">
      <div
        className={`relative overflow-hidden rounded-2xl bg-card border border-border mx-auto transition-all duration-300 ${
          expanded ? "max-w-full" : "max-w-md"
        }`}
      >
        <div
          className="flex items-center justify-center p-2"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transition: "transform 0.2s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Uploaded preview"
            className="max-w-full h-auto rounded-xl object-contain"
            style={{ maxHeight: expanded ? "70vh" : "400px" }}
          />
        </div>

        {showCrop && (
          <div className="absolute inset-0 border-2 border-pink-400/50 pointer-events-none rounded-2xl">
            <div className="absolute inset-4 border-2 border-dashed border-pink-400/30 rounded-lg" />
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-mono">
          {zoom}% &middot; {rotation}&deg;
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground min-w-[80px] justify-center">
          <span>{zoom}%</span>
        </div>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={handleRotateLeft}
          className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Rotate left"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={handleRotateRight}
          className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Rotate right"
        >
          <RotateCw size={18} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={() => setShowCrop((c) => !c)}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            showCrop
              ? "border-pink-400 bg-pink-500/10 text-pink-400"
              : "border-border hover:bg-card text-muted-foreground hover:text-foreground"
          }`}
          title="Toggle crop guide"
        >
          <Crop size={18} />
        </button>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={handleReset}
          className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Reset"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
}
