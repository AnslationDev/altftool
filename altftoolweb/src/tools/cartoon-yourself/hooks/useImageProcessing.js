"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { drawToCanvas } from "../utils/imageFilters";
import { adjustmentDefaults, cartoonStyles, maxFileSize, supportedFormats } from "../constants/styles";

const MAX_FILE_SIZE_LABEL = `${Math.round(maxFileSize / (1024 * 1024))}MB`;

export function useImageProcessing() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("classic");
  const [adjustments, setAdjustments] = useState(adjustmentDefaults);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const previewUrlRef = useRef(null);
  const pendingUrlRef = useRef(null);
  const loadSequenceRef = useRef(0);

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

    const next = URL.createObjectURL(f);
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    pendingUrlRef.current = next;
    const sequence = loadSequenceRef.current + 1;
    loadSequenceRef.current = sequence;

    setError(null);
    setIsProcessing(true);

    // Decode the candidate before replacing the current image. A corrupt file
    // therefore cannot leave the preview pointing at one image while the
    // export canvas still contains another.
    const candidate = new Image();
    candidate.onload = () => {
      if (loadSequenceRef.current !== sequence) {
        if (pendingUrlRef.current === next) pendingUrlRef.current = null;
        URL.revokeObjectURL(next);
        return;
      }
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = next;
      pendingUrlRef.current = null;
      imageRef.current = candidate;
      setFile(f);
      setPreviewUrl(next);
      setIsProcessing(false);
    };
    candidate.onerror = () => {
      if (pendingUrlRef.current === next) pendingUrlRef.current = null;
      URL.revokeObjectURL(next);
      if (loadSequenceRef.current !== sequence) return;
      setError("That file has an image type but could not be decoded. The previous image was kept.");
      setIsProcessing(false);
    };
    candidate.src = next;
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
    loadSequenceRef.current += 1;
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    pendingUrlRef.current = null;
    previewUrlRef.current = null;
    imageRef.current = null;

    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

    setFile(null);
    setError(null);
    setIsProcessing(false);
    setPreviewUrl(null);
    setAdjustments(adjustmentDefaults);
    setSelectedStyle("classic");
  }, []);

  // Revoke whatever object URL is still outstanding when the tool itself
  // unmounts (e.g. route change away from the page).
  useEffect(() => () => {
    loadSequenceRef.current += 1;
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    if (!previewUrl) return undefined;
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !img) return undefined;
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    drawToCanvas(canvas, img, adjustments, currentStyle?.filter);
    return undefined;
  }, [adjustments, currentStyle?.filter, previewUrl]);

  return {
    file,
    previewUrl,
    error,
    isProcessing,
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
