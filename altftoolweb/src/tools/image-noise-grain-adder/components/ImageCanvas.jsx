"use client";

import React, { useRef, useEffect } from "react";
import { 
  generateNoiseCanvas, 
  generateDustAndScratches, 
  applyFilters, 
  drawVignette, 
  applyWarmth 
} from "../utils/noiseGenerator";

export default function ImageCanvas({ 
  image, 
  settings, 
  showOriginal, 
  onProcessingStart, 
  onProcessingEnd 
}) {
  const canvasRef = useRef(null);
  const bufferCanvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!image) return;

    const render = () => {
      onProcessingStart?.();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      // Set dimensions
      const maxWidth = 1200;
      let width = image.width;
      let height = image.height;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = image.height * ratio;
      }
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (showOriginal) {
        ctx.drawImage(image, 0, 0, width, height);
        onProcessingEnd?.();
        return;
      }

      if (!bufferCanvasRef.current) {
        bufferCanvasRef.current = document.createElement("canvas");
      }
      const buffer = bufferCanvasRef.current;
      buffer.width = width;
      buffer.height = height;
      const bctx = buffer.getContext("2d");
      
      bctx.filter = applyFilters(bctx, settings);
      bctx.drawImage(image, 0, 0, width, height);
      
      ctx.drawImage(buffer, 0, 0);
      ctx.filter = "none";

      applyWarmth(ctx, width, height, settings.warmth);

      if (settings.intensity > 0) {
        const noiseCanvas = generateNoiseCanvas(width, height, {
          intensity: settings.intensity,
          size: settings.size,
          monochrome: settings.monochrome,
          type: settings.type || "grain"
        });
        
        ctx.globalAlpha = settings.opacity / 100;
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(noiseCanvas, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
      }

      if (settings.dust > 0 || settings.scratches > 0) {
        const dustCanvas = generateDustAndScratches(width, height, settings.dust, settings.scratches);
        ctx.globalAlpha = 0.6;
        ctx.drawImage(dustCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
      }

      drawVignette(ctx, width, height, settings.vignette);

      onProcessingEnd?.();

      if (settings.animated) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    if (settings.animated) {
      animationFrameId.current = requestAnimationFrame(render);
    } else {
      render();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [image, settings, showOriginal]);

  // Handle Export
  useEffect(() => {
    const handleExport = () => {
      if (!image) return;
      
      onProcessingStart?.();
      
      // Create high-res export canvas
      const exportCanvas = document.createElement("canvas");
      const width = image.width;
      const height = image.height;
      exportCanvas.width = width;
      exportCanvas.height = height;
      const ctx = exportCanvas.getContext("2d");

      // 1. Base Image with Filters
      ctx.filter = applyFilters(ctx, settings);
      ctx.drawImage(image, 0, 0, width, height);
      ctx.filter = "none";

      // 2. Warmth
      applyWarmth(ctx, width, height, settings.warmth);

      // 3. Grain
      if (settings.intensity > 0) {
        const noiseCanvas = generateNoiseCanvas(width, height, {
          intensity: settings.intensity,
          size: settings.size,
          monochrome: settings.monochrome
        });
        ctx.globalAlpha = settings.opacity / 100;
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(noiseCanvas, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
      }

      // 4. Dust/Scratches
      if (settings.dust > 0 || settings.scratches > 0) {
        const dustCanvas = generateDustAndScratches(width, height, settings.dust, settings.scratches);
        ctx.globalAlpha = 0.6;
        ctx.drawImage(dustCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
      }

      // 5. Vignette
      drawVignette(ctx, width, height, settings.vignette);

      // Trigger download
      const link = document.createElement("a");
      link.download = `altftool-grained-image-${Date.now()}.jpg`;
      link.href = exportCanvas.toDataURL("image/jpeg", 0.95);
      link.click();
      
      onProcessingEnd?.();
    };

    window.addEventListener("export-image", handleExport);
    return () => window.removeEventListener("export-image", handleExport);
  }, [image, settings]);

  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
    />
  );
}
