"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Pencil, Download, RotateCcw, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";

import Dropzone from "../components/Dropzone";
import Controls from "../components/Controls";
import Preview from "../components/Preview";
import ZoomControls from "../components/ZoomControls";
import { useSketch } from "../hooks/useSketch";
import { useZoom } from "../hooks/useZoom";
import { loadImageElement } from "../utils/sketch";

const DEFAULT_SETTINGS = {
  blurRadius: 6,
  contrast: 20,
  intensity: 0.85,
  colored: false,
};

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export default function ToolHome() {
  const [image, setImage] = useState(null);
  const [originalSrc, setOriginalSrc] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [busyDownload, setBusyDownload] = useState(false);
  const urlRef = useRef(null);

  const { sketchCanvas, isProcessing, error } = useSketch(image, settings);
  const { scale, zoomIn, zoomOut, reset: resetZoom } = useZoom();

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokeUrl(), [revokeUrl]);

  const handleFile = useCallback(
    async (file) => {
      if (file.size > MAX_FILE_BYTES) {
        toast.error("Image is too large (max 25 MB).");
        return;
      }
      try {
        const { img, url } = await loadImageElement(file);
        revokeUrl();
        urlRef.current = url;
        setOriginalSrc(url);
        setImage(img);
        resetZoom();
        toast.success("Photo loaded — sketching now!");
      } catch (err) {
        toast.error(err.message || "Could not load that image.");
      }
    },
    [revokeUrl, resetZoom],
  );

  const update = useCallback(
    (key, value) => setSettings((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    resetZoom();
    toast.success("Controls reset");
  }, [resetZoom]);

  const handleClear = useCallback(() => {
    revokeUrl();
    setImage(null);
    setOriginalSrc(null);
    setSettings(DEFAULT_SETTINGS);
    resetZoom();
  }, [revokeUrl, resetZoom]);

  const handleDownload = useCallback(async () => {
    if (!sketchCanvas) return;
    setBusyDownload(true);
    try {
      const blob = await new Promise((resolve) =>
        sketchCanvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Export failed");
      saveAs(blob, `altftool-sketch-${Date.now()}.png`);
      toast.success("Sketch downloaded as PNG");
    } catch (err) {
      toast.error("Download failed. Please try again.");
    } finally {
      setBusyDownload(false);
    }
  }, [sketchCanvas]);

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-(--primary-foreground) transition active:scale-95 hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)";
  const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm font-medium text-(--foreground) transition active:scale-95 hover:bg-(--muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)";

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <div className="mb-8 pt-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
          <Pencil size={14} />
          Client-side Pencil Sketch
        </div>
        <h1 className="section-title tool-heading-accent">Photo to Sketch</h1>
        <p className="description mx-auto mt-3 max-w-2xl text-(--muted-foreground)">
          Turn any photo into a realistic pencil sketch with adjustable
          intensity, zoom, a before/after compare slider, and one-click PNG
          download. Everything runs privately in your browser.
        </p>
      </div>

      {!image ? (
        <Dropzone onFile={handleFile} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="flex flex-col gap-4">
            <Preview
              originalSrc={originalSrc}
              sketchCanvas={sketchCanvas}
              isProcessing={isProcessing}
              error={error}
              zoomScale={scale}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm">
              <ZoomControls
                scale={scale}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onReset={resetZoom}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className={ghostBtn}
                >
                  <RotateCcw size={16} />
                  New Photo
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!sketchCanvas || isProcessing || busyDownload}
                  className={primaryBtn}
                >
                  {busyDownload ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Download PNG
                </button>
              </div>
            </div>
          </div>

          <Controls
            settings={settings}
            update={update}
            onReset={handleReset}
          />
        </motion.div>
      )}

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-(--muted-foreground)">
        Tip: increase the blur radius for softer shading, or raise contrast for
        bolder lines. Toggle colored pencil to keep the original hues.
      </p>
    </div>
  );
}
