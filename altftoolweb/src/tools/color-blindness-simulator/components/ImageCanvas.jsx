"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { applyCVDFilter } from "../utils/cvdEngine";

export default function ImageCanvas({ 
  image, 
  settings, 
  mode, 
  sliderPosition,
  onProcessingStart, 
  onProcessingEnd 
}) {
  const canvasRef = useRef(null);
  const bufferCanvasRef = useRef(null);
  const simulatedImageCache = useRef(null);
  const lastSettings = useRef(null);

  // Helper to check if settings changed
  const settingsChanged = useCallback(() => {
    if (!lastSettings.current) return true;
    return (
      lastSettings.current.mode !== mode ||
      lastSettings.current.severity !== settings.severity ||
      lastSettings.current.brightness !== settings.brightness ||
      lastSettings.current.contrast !== settings.contrast ||
      lastSettings.current.saturation !== settings.saturation
    );
  }, [mode, settings]);

  useEffect(() => {
    if (!image) return;

    const render = async () => {
      onProcessingStart?.();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      
      // 1. Calculate dimensions (limit to preview size)
      const maxWidth = 1200;
      const maxHeight = 800;
      let width = image.width;
      let height = image.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        simulatedImageCache.current = null; // Clear cache on resize
      }

      // 2. Prepare Simulated Image Buffer if needed
      if (settingsChanged() || !simulatedImageCache.current) {
        if (!bufferCanvasRef.current) {
          bufferCanvasRef.current = document.createElement("canvas");
        }
        const buffer = bufferCanvasRef.current;
        buffer.width = width;
        buffer.height = height;
        const bctx = buffer.getContext("2d");
        
        bctx.drawImage(image, 0, 0, width, height);
        
        if (mode !== "normal") {
          const imageData = bctx.getImageData(0, 0, width, height);
          applyCVDFilter(imageData, mode, settings.severity, {
            brightness: settings.brightness,
            contrast: settings.contrast,
            saturation: settings.saturation
          });
          bctx.putImageData(imageData, 0, 0);
        }
        
        simulatedImageCache.current = buffer;
        lastSettings.current = { mode, ...settings };
      }

      // 3. Final Render (Original vs Simulated with Split)
      ctx.clearRect(0, 0, width, height);
      
      // Draw Original
      ctx.drawImage(image, 0, 0, width, height);
      
      // Draw Simulated with clipping
      const splitX = (sliderPosition / 100) * width;
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, width - splitX, height);
      ctx.clip();
      
      if (simulatedImageCache.current) {
        ctx.drawImage(simulatedImageCache.current, 0, 0);
      }
      
      ctx.restore();

      onProcessingEnd?.();
    };

    render();
  }, [image, settings, mode, sliderPosition, settingsChanged, onProcessingStart, onProcessingEnd]);

  // Handle Export
  useEffect(() => {
    const handleExport = () => {
      if (!image) return;
      
      onProcessingStart?.();
      
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = image.width;
      exportCanvas.height = image.height;
      const ctx = exportCanvas.getContext("2d");

      ctx.drawImage(image, 0, 0);
      
      if (mode !== "normal") {
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        applyCVDFilter(imageData, mode, settings.severity, {
          brightness: settings.brightness,
          contrast: settings.contrast,
          saturation: settings.saturation
        });
        ctx.putImageData(imageData, 0, 0);
      }

      const link = document.createElement("a");
      link.download = `altftool-cvd-${mode}-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL("image/png");
      link.click();
      
      onProcessingEnd?.();
    };

    window.addEventListener("export-image", handleExport);
    return () => window.removeEventListener("export-image", handleExport);
  }, [image, settings, mode, onProcessingStart, onProcessingEnd]);

  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
    />
  );
}
