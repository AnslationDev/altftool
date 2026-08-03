"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { drawToCanvas, buildFilterString } from "../utils/imageFilters";
import { adjustmentDefaults, cartoonStyles, maxFileSize, supportedFormats } from "../constants/styles";

const MAX_FILE_SIZE_LABEL = `${Math.round(maxFileSize / (1024 * 1024))}MB`;

export function useImageProcessing() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("classic");
  const [adjustments, setAdjustments] = useState(adjustmentDefaults);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const previewUrlRef = useRef(null);

  const currentStyle = cartoonStyles.find((s) => s.id === selectedStyle);

  const updateAdjustment = useCallback((key, value) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments(adjustmentDefaults);
  }, []);

  const handleFile = useCallback((f) => {
    if (!f) return;

    if (!Object.prototype.hasOwnProperty.call(supportedFormats, f.type)) {
      setError("Unsupported file type. Please upload a JPG, PNG or WEBP image.");
      return;
    }
    if (f.size > maxFileSize) {
      setError(`That photo is larger than ${MAX_FILE_SIZE_LABEL}. Please choose a smaller file.`);
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const next = URL.createObjectURL(f);
    previewUrlRef.current = next;

    setError(null);
    setFile(f);
    setPreviewUrl(next);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;

    setFile(null);
    setError(null);
    setPreviewUrl(null);
    setAdjustments(adjustmentDefaults);
    setSelectedStyle("classic");
  }, []);

  // Revoke whatever object URL is still outstanding when the tool itself
  // unmounts (e.g. route change away from the page).
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    if (!previewUrl) return undefined;

    // Guard against a slower-loading earlier upload overwriting a faster
    // one: if `previewUrl` has already moved on by the time this image
    // finishes decoding, drop the result instead of drawing it.
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        drawToCanvas(canvas, img, adjustments, currentStyle?.filter);
      }
    };

    img.src = previewUrl;

    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return undefined;

    const t = setTimeout(() => {
      drawToCanvas(canvas, img, adjustments, currentStyle?.filter);
    }, 30);

    return () => clearTimeout(t);
  }, [adjustments, selectedStyle, currentStyle?.filter]);

  return {
    file,
    previewUrl,
    error,
    canvasRef,
    selectedStyle,
    setSelectedStyle,
    adjustments,
    updateAdjustment,
    resetAdjustments,
    handleFile,
    handleDrop,
    handleDragOver,
    removeImage,
    currentStyle,
  };
}
