"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downscaleImage, sketchFromImageData } from "../utils/sketch";

// Runs the (potentially heavy) sketch conversion off the paint path using
// requestAnimationFrame, keeping the UI responsive. Returns the resulting
// canvas plus processing/error state.
export function useSketch(image, settings) {
  const [sketchCanvas, setSketchCanvas] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!image) return undefined;

    let cancelled = false;

    rafRef.current = requestAnimationFrame(() => {
      if (cancelled) return;
      setIsProcessing(true);
      setError(null);
      try {
        const { canvas, width, height } = downscaleImage(image);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const imageData = ctx.getImageData(0, 0, width, height);
        const result = sketchFromImageData(imageData, settings);

        const out = document.createElement("canvas");
        out.width = width;
        out.height = height;
        out.getContext("2d").putImageData(result, 0, 0);

        if (!cancelled) {
          setSketchCanvas(out);
          setIsProcessing(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Conversion failed. Please try again.");
          setIsProcessing(false);
        }
      }
    });

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [image, settings]);

  return { sketchCanvas, isProcessing, error };
}
