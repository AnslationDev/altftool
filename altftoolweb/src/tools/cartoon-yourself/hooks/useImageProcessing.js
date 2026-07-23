"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { drawToCanvas, buildFilterString } from "../utils/imageFilters";
import { adjustmentDefaults, cartoonStyles } from "../constants/styles";

export function useImageProcessing() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("classic");
  const [adjustments, setAdjustments] = useState(adjustmentDefaults);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const currentStyle = cartoonStyles.find((s) => s.id === selectedStyle);

  const updateAdjustment = useCallback((key, value) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments(adjustmentDefaults);
  }, []);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith("image/")) {
      handleFile(f);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setAdjustments(adjustmentDefaults);
    setSelectedStyle("classic");
  }, []);

  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        drawToCanvas(canvas, img, adjustments, currentStyle?.filter);
      }
    };

    img.src = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const t = setTimeout(() => {
      drawToCanvas(canvas, img, adjustments, currentStyle?.filter);
    }, 30);

    return () => clearTimeout(t);
  }, [adjustments, selectedStyle, currentStyle?.filter]);

  return {
    file,
    previewUrl,
    canvasRef,
    selectedStyle,
    setSelectedStyle,
    adjustments,
    updateAdjustment,
    resetAdjustments,
    isProcessing,
    setIsProcessing,
    handleFile,
    handleDrop,
    handleDragOver,
    removeImage,
    currentStyle,
  };
}
