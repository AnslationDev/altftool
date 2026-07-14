"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readImageFile } from "../utils/imageUtils";

export function useDesignCompare() {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [mode, setMode] = useState("side-by-side");
  const [opacity, setOpacity] = useState(50);
  const [slider, setSlider] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [highlightDiff, setHighlightDiff] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const previewRef = useRef(null);

  const setImage = useCallback(async (slot, file) => {
    try {
      setError("");
      const image = await readImageFile(file);
      if (slot === "a") setImageA((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return image;
      });
      if (slot === "b") setImageB((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return image;
      });
      setMessage(`${slot === "a" ? "Design A" : "Design B"} uploaded.`);
    } catch (uploadError) {
      setError(uploadError.message);
    }
  }, []);

  useEffect(() => () => {
    if (imageA?.url) URL.revokeObjectURL(imageA.url);
    if (imageB?.url) URL.revokeObjectURL(imageB.url);
  }, [imageA?.url, imageB?.url]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setOpacity(50);
    setSlider(50);
    setMessage("View reset.");
  }, []);

  const clear = useCallback(() => {
    if (imageA?.url) URL.revokeObjectURL(imageA.url);
    if (imageB?.url) URL.revokeObjectURL(imageB.url);
    setImageA(null);
    setImageB(null);
    resetView();
    setMessage("Images cleared.");
  }, [imageA, imageB, resetView]);

  const download = useCallback(() => {
    if (!previewRef.current) return;
    const html = `<!doctype html><html><body>${previewRef.current.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "design-compare-view.html";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Compared view downloaded.");
  }, []);

  return {
    imageA,
    imageB,
    mode,
    opacity,
    slider,
    zoom,
    pan,
    showGrid,
    highlightDiff,
    message,
    error,
    previewRef,
    setImage,
    setMode,
    setOpacity,
    setSlider,
    setZoom,
    setPan,
    setShowGrid,
    setHighlightDiff,
    resetView,
    clear,
    download,
  };
}
