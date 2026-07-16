"use client";
import { useState, useCallback, useRef } from "react";
import { loadImage, computeDiff, computeDiffOverlay, formatFileSize } from "../utils/diff";

export function useScreenshotCompare() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [diffResult, setDiffResult] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState("slider");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const handleUpload1 = useCallback(async (file) => {
    try {
      setError(null);
      const loaded = await loadImage(file);
      setImage1({ ...loaded, file });
      setDiffResult(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleUpload2 = useCallback(async (file) => {
    try {
      setError(null);
      const loaded = await loadImage(file);
      setImage2({ ...loaded, file });
      setDiffResult(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const runDiff = useCallback(async () => {
    if (!image1 || !image2) return;
    setIsProcessing(true);
    setError(null);
    try {
      const diff = computeDiff(image1.img, image2.img);
      const overlayUrl = computeDiffOverlay(image1.img, image2.img);
      setDiffResult({ ...diff, overlayUrl });
    } catch (err) {
      setError("Failed to compute diff: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [image1, image2]);

  const handleSliderChange = useCallback((e) => {
    setSliderPos(Number(e.target.value));
  }, []);

  const reset = useCallback(() => {
    if (image1?.url) URL.revokeObjectURL(image1.url);
    if (image2?.url) URL.revokeObjectURL(image2.url);
    setImage1(null);
    setImage2(null);
    setDiffResult(null);
    setSliderPos(50);
    setError(null);
  }, [image1, image2]);

  const swapImages = useCallback(() => {
    const temp = image1;
    setImage1(image2);
    setImage2(temp);
    setDiffResult(null);
    setSliderPos(50);
  }, [image1, image2]);

  return {
    image1,
    image2,
    diffResult,
    sliderPos,
    viewMode,
    isProcessing,
    error,
    containerRef,
    handleUpload1,
    handleUpload2,
    handleSliderChange,
    setViewMode,
    runDiff,
    reset,
    swapImages,
    formatFileSize,
  };
}
