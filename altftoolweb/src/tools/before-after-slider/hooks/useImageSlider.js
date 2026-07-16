"use client";
import { useState, useCallback, useRef } from "react";

export function useImageSlider() {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleBeforeUpload = useCallback((file) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBeforeImage({ file, url, name: file.name, width: img.width, height: img.height });
    };
    img.src = url;
  }, []);

  const handleAfterUpload = useCallback((file) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setAfterImage({ file, url, name: file.name, width: img.width, height: img.height });
    };
    img.src = url;
  }, []);

  const handleSliderChange = useCallback((e) => {
    setSliderPos(Number(e.target.value));
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, percent)));
  }, [isDragging]);

  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percent = (x / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, percent)));
  }, []);

  const reset = useCallback(() => {
    if (beforeImage?.url) URL.revokeObjectURL(beforeImage.url);
    if (afterImage?.url) URL.revokeObjectURL(afterImage.url);
    setBeforeImage(null);
    setAfterImage(null);
    setSliderPos(50);
  }, [beforeImage, afterImage]);

  const swapImages = useCallback(() => {
    setBeforeImage((prev) => {
      setAfterImage((prevAfter) => {
        setBeforeImage(prevAfter);
        return prev;
      });
      return null;
    });
    setSliderPos(50);
  }, []);

  return {
    beforeImage,
    afterImage,
    sliderPos,
    containerRef,
    handleBeforeUpload,
    handleAfterUpload,
    handleSliderChange,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleTouchMove,
    reset,
    swapImages,
  };
}
