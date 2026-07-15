"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCw, Trash2, Maximize2 } from "lucide-react";

export default function ImagePreview({ imageA, imageB, onRemove, onCanvasReady, canvasARef, canvasBRef }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ A: 0, B: 0 });

  useEffect(() => {
    if (imageA && canvasARef?.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasARef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        onCanvasReady?.("A", canvas);
      };
      img.src = imageA;
    }
  }, [imageA]);

  useEffect(() => {
    if (imageB && canvasBRef?.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasBRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        onCanvasReady?.("B", canvas);
      };
      img.src = imageB;
    }
  }, [imageB]);

  const handleRotate = useCallback((slot) => {
    setRotation((prev) => ({ ...prev, [slot]: prev[slot] + 90 }));
  }, []);

  if (!imageA && !imageB) return null;

  const renderPreview = (src, slot) => {
    if (!src) return null;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-xl border border-(--border) bg-(--card)"
      >
        <div
          className="flex items-center justify-center overflow-hidden p-2"
          style={{ maxHeight: 300 }}
        >
          <img
            src={src}
            alt={`Image ${slot}`}
            className="max-h-[280px] w-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation[slot]}deg)`,
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-1 border-t border-(--border) bg-(--muted) px-3 py-2">
          <span className="text-[10px] font-medium text-(--muted-foreground) uppercase tracking-wider">
            Image {slot}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="rounded-lg p-1 text-(--muted-foreground) hover:bg-(--background) hover:text-(--foreground) transition"
              aria-label="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
              className="rounded-lg p-1 text-(--muted-foreground) hover:bg-(--background) hover:text-(--foreground) transition"
              aria-label="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => handleRotate(slot)}
              className="rounded-lg p-1 text-(--muted-foreground) hover:bg-(--background) hover:text-(--foreground) transition"
              aria-label="Rotate"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={() => onRemove(slot)}
              className="rounded-lg p-1 text-(--muted-foreground) hover:bg-red-500/10 hover:text-red-500 transition"
              aria-label={`Remove Image ${slot}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <canvas ref={canvasARef} className="hidden" />
      <canvas ref={canvasBRef} className="hidden" />
      {renderPreview(imageA, "A")}
      {renderPreview(imageB, "B")}
    </div>
  );
}
