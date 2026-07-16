"use client";
import { useState, useCallback, useRef } from "react";
import { loadImage, drawImageOnCanvas, removeWatermarkSimple, createSelectionMask, featherMask, expandMask, shrinkMask, smoothMask, applyEnhancement, upscaleCanvas, canvasToBlob, formatFileSize } from "../utils/imageProcessor";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/avif"];

export function useWatermarkRemover() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedCanvas, setProcessedCanvas] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState("after");
  const [removalMode, setRemovalMode] = useState("balanced");
  const [selectionType, setSelectionType] = useState("ai-auto");
  const [brushSize, setBrushSize] = useState(20);
  const [brushHardness, setBrushHardness] = useState(80);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [brushPoints, setBrushPoints] = useState([]);
  const [selectionRect, setSelectionRect] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [featherRadius, setFeatherRadius] = useState(3);
  const [enhancementSettings, setEnhancementSettings] = useState({});
  const [exportFormat, setExportFormat] = useState("png");
  const [exportQuality, setExportQuality] = useState(92);
  const [keepExif, setKeepExif] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError("File exceeds 50 MB limit"); return; }
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|bmp|tiff|avif)$/i)) {
      setError("Unsupported file format"); return;
    }
    try {
      setError(null);
      setIsProcessing(true);
      setProgress(10);
      const loaded = await loadImage(file);
      setProgress(40);
      const canvas = drawImageOnCanvas(loaded.img);
      setProgress(70);
      setOriginalImage({ ...loaded, file, canvas });
      setProcessedCanvas(canvas);
      setHistory([canvas]);
      setHistoryIndex(0);
      setBrushPoints([]);
      setSelectionRect(null);
      setZoom(1);
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    } catch (err) {
      setError("Failed to load image: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "pasted-image." + blob.type.split("/")[1], { type: blob.type });
            await handleFile(file);
            return;
          }
        }
      }
      setError("No image found in clipboard");
    } catch {
      setError("Unable to read clipboard");
    }
  }, [handleFile]);

  const handleDrop = useCallback((files) => {
    if (files.length > 0) handleFile(files[0]);
  }, [handleFile]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setProcessedCanvas(history[newIdx]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setProcessedCanvas(history[newIdx]);
    }
  }, [history, historyIndex]);

  const reset = useCallback(() => {
    if (originalImage?.canvas) {
      const c = originalImage.canvas;
      const clone = document.createElement("canvas");
      clone.width = c.width;
      clone.height = c.height;
      clone.getContext("2d").drawImage(c, 0, 0);
      setProcessedCanvas(clone);
      setHistory([clone]);
      setHistoryIndex(0);
      setBrushPoints([]);
      setSelectionRect(null);
      setZoom(1);
    }
  }, [originalImage]);

  const pushHistory = useCallback((canvas) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setProcessedCanvas(canvas);
  }, [history, historyIndex]);

  const computeRemoval = useCallback(async () => {
    if (!processedCanvas) return;
    let mask;
    if (selectionType === "brush" && brushPoints.length > 0) {
      mask = createSelectionMask(processedCanvas.width, processedCanvas.height, "brush", { points: brushPoints });
    } else if (selectionType === "rect" && selectionRect) {
      mask = createSelectionMask(processedCanvas.width, processedCanvas.height, "rect", { rect: selectionRect });
    } else {
      setError("No selection made. Use Brush or Rectangle tool to select watermark.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    await new Promise(r => setTimeout(r, 50));

    const feathered = featherRadius > 0 ? featherMask(mask, processedCanvas.width, processedCanvas.height, featherRadius) : mask;
    const uintMask = new Uint8Array(processedCanvas.width * processedCanvas.height);
    for (let i = 0; i < mask.length; i++) {
      uintMask[i] = feathered[i] > 0.5 ? 1 : 0;
    }

    setProgress(40);
    const modeMap = { fast: "fast", balanced: "balanced", "high-quality": "high-quality", ultra: "ultra", professional: "professional" };
    const result = removeWatermarkSimple(processedCanvas, uintMask, modeMap[removalMode] || "balanced");
    setProgress(80);

    pushHistory(result);
    setProgress(100);
    setTimeout(() => setProgress(0), 300);
    setIsProcessing(false);
  }, [processedCanvas, selectionType, brushPoints, selectionRect, removalMode, featherRadius, pushHistory]);

  const applyAIAutoDetect = useCallback(async () => {
    if (!processedCanvas) return;
    setIsProcessing(true);
    setProgress(20);
    await new Promise(r => setTimeout(r, 200));

    const w = processedCanvas.width;
    const h = processedCanvas.height;
    const ctx = processedCanvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, w, h);
    const mask = new Uint8Array(w * h);

    const edgeThreshold = 15;
    const corners = [
      { x: 0, y: 0 }, { x: Math.floor(w / 2), y: 0 }, { x: w - 1, y: 0 },
      { x: 0, y: Math.floor(h / 2) }, { x: w - 1, y: Math.floor(h / 2) },
      { x: 0, y: h - 1 }, { x: Math.floor(w / 2), y: h - 1 }, { x: w - 1, y: h - 1 },
    ];
    const cornerColors = corners.map(c => {
      const i = (c.y * w + c.x) * 4;
      return { r: imgData.data[i], g: imgData.data[i + 1], b: imgData.data[i + 2] };
    });

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const px = { r: imgData.data[i], g: imgData.data[i + 1], b: imgData.data[i + 2] };
        let minDist = Infinity;
        for (const cc of cornerColors) {
          const d = Math.sqrt((px.r - cc.r) ** 2 + (px.g - cc.g) ** 2 + (px.b - cc.b) ** 2);
          if (d < minDist) minDist = d;
        }
        const isEdge = x === 0 || x === w - 1 || y === 0 || y === h - 1 ||
          (x < 5 && y < 5) || (x > w - 6 && y < 5) || (x < 5 && y > h - 6) || (x > w - 6 && y > h - 6);

        if (isEdge) continue;

        if (minDist > edgeThreshold) {
          let edgeCount = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const ni = (ny * w + nx) * 4;
              const np = { r: imgData.data[ni], g: imgData.data[ni + 1], b: imgData.data[ni + 2] };
              if (dist(px, np) > edgeThreshold * 2) edgeCount++;
            }
          }
          if (edgeCount >= 4) mask[y * w + x] = 1;
        }
      }
    }

    setProgress(60);
    const result = removeWatermarkSimple(processedCanvas, mask, "high-quality");
    setProgress(90);
    pushHistory(result);
    setProgress(100);
    setTimeout(() => setProgress(0), 300);
    setIsProcessing(false);
  }, [processedCanvas, pushHistory]);

  const applyEnhancements = useCallback(async (enhancements) => {
    if (!processedCanvas) return;
    setIsProcessing(true);
    let canvas = processedCanvas;
    for (const [key, value] of Object.entries(enhancements)) {
      if (value > 0) {
        canvas = applyEnhancement(canvas, key, value);
      }
    }
    pushHistory(canvas);
    setIsProcessing(false);
  }, [processedCanvas, pushHistory]);

  const exportImage = useCallback(async (format, quality) => {
    if (!processedCanvas) return null;
    const blob = await canvasToBlob(processedCanvas, format, quality / 100);
    return blob;
  }, [processedCanvas]);

  const downloadImage = useCallback(async (format, quality) => {
    const blob = await exportImage(format, quality);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `watermark-removed.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportImage]);

  const clearAll = useCallback(() => {
    if (originalImage?.url) URL.revokeObjectURL(originalImage.url);
    setOriginalImage(null);
    setProcessedCanvas(null);
    setHistory([]);
    setHistoryIndex(-1);
    setBrushPoints([]);
    setSelectionRect(null);
    setZoom(1);
    setError(null);
  }, [originalImage]);

  return {
    originalImage, processedCanvas, isProcessing, progress, error,
    zoom, viewMode, removalMode, selectionType, brushSize, brushHardness, brushOpacity,
    brushPoints, selectionRect, history, historyIndex, featherRadius,
    enhancementSettings, exportFormat, exportQuality, keepExif,
    canvasRef, selectionCanvasRef, fileInputRef,
    setZoom, setViewMode, setRemovalMode, setSelectionType,
    setBrushSize, setBrushHardness, setBrushOpacity,
    setFeatherRadius, setEnhancementSettings, setExportFormat, setExportQuality, setKeepExif,
    setIsDrawing, setBrushPoints, setSelectionRect,
    handleFile, handlePaste, handleDrop, undo, redo, reset,
    computeRemoval, applyAIAutoDetect, applyEnhancements,
    exportImage, downloadImage, clearAll, formatFileSize,
  };
}
