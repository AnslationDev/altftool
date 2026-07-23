"use client";

import { useState, useCallback, useRef } from "react";

export function useImageSwap() {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [isSwapped, setIsSwapped] = useState(false);
  const [error, setError] = useState(null);
  const fileInputA = useRef(null);
  const fileInputB = useRef(null);

  const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/bmp"];
  const MAX_SIZE = 20 * 1024 * 1024;

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const validateFile = useCallback((file) => {
    if (!file) return "No file selected.";
    if (!ACCEPTED_TYPES.includes(file.type)) return "Unsupported format. Use PNG, JPG, GIF, WebP, or BMP.";
    if (file.size > MAX_SIZE) return "File too large. Maximum size is 20MB.";
    return null;
  }, []);

  const loadImage = useCallback((file, setter) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      setter({
        file,
        preview: url,
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Failed to load image. The file may be corrupted.");
    };

    img.src = url;
  }, [validateFile]);

  const handleFileA = useCallback((file) => {
    if (imageA?.preview) URL.revokeObjectURL(imageA.preview);
    loadImage(file, setImageA);
    setIsSwapped(false);
  }, [imageA, loadImage]);

  const handleFileB = useCallback((file) => {
    if (imageB?.preview) URL.revokeObjectURL(imageB.preview);
    loadImage(file, setImageB);
    setIsSwapped(false);
  }, [imageB, loadImage]);

  const handleDrop = useCallback((e, slot) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (slot === "a") handleFileA(file);
      else handleFileB(file);
    }
  }, [handleFileA, handleFileB]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const swapImages = useCallback(() => {
    if (!imageA || !imageB) return;
    setIsSwapped((prev) => !prev);
  }, [imageA, imageB]);

  const removeImage = useCallback((slot) => {
    if (slot === "a") {
      if (imageA?.preview) URL.revokeObjectURL(imageA.preview);
      setImageA(null);
    } else {
      if (imageB?.preview) URL.revokeObjectURL(imageB.preview);
      setImageB(null);
    }
    setIsSwapped(false);
  }, [imageA, imageB]);

  const reset = useCallback(() => {
    if (imageA?.preview) URL.revokeObjectURL(imageA.preview);
    if (imageB?.preview) URL.revokeObjectURL(imageB.preview);
    setImageA(null);
    setImageB(null);
    setIsSwapped(false);
    setError(null);
  }, [imageA, imageB]);

  const getDisplayImages = useCallback(() => {
    if (isSwapped) return { left: imageB, right: imageA };
    return { left: imageA, right: imageB };
  }, [imageA, imageB, isSwapped]);

  const downloadImage = useCallback((image, label) => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image.preview;
    a.download = `swapped-${label}-${image.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  return {
    imageA,
    imageB,
    isSwapped,
    error,
    fileInputA,
    fileInputB,
    handleFileA,
    handleFileB,
    handleDrop,
    handleDragOver,
    swapImages,
    removeImage,
    reset,
    getDisplayImages,
    downloadImage,
    formatFileSize,
  };
}
