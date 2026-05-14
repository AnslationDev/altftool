"use client";

import { useState, useCallback, useRef } from "react";
import { getCroppedImg } from "../utils/croppImage";

export function useImageCropper() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [aspect, setAspect] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showThirds, setShowThirds] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [quality, setQuality] = useState(0.7);
  const [beforeSize, setBeforeSize] = useState(null);
  const [afterSize, setAfterSize] = useState(null);
  const [originalCroppedImage, setOriginalCroppedImage] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState("jpeg");
  const [downloadSize, setDownloadSize] = useState("original");

  const [liveInfo, setLiveInfo] = useState({
    width: 0,
    height: 0,
    fileSize: "0 KB",
    aspectRatio: "1:1",
  });
  const fileInputRef = useRef(null);

  const [filters, setFilters] = useState({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    grayscale: 0,
  });

  const [history, setHistory] = useState([]);
  //Save current state to history
  const saveToHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev,
      {
        crop,
        zoom,
        rotation,
        flip,
        filters,
      },
    ]);
  }, [crop, zoom, rotation, flip, filters]);

  // ✅ Undo change
  const handleUndo = () => {
    if (!history.length) return;

    const previous = history[history.length - 1];

    setCrop(previous.crop);
    setZoom(previous.zoom);
    setRotation(previous.rotation);
    setFlip(previous.flip);
    setFilters(previous.filters);

    setHistory((prev) => prev.slice(0, -1));
  };
  // Reset all (but keep image)
  const handleResetAll = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });

    setFilters({
      brightness: 1,
      contrast: 1,
      saturation: 1,
      grayscale: 0,
    });

    setHistory([]);
  }, []);
  // snap logic
  const handleCropChangeWithSnap = useCallback(
    (newCrop) => {
      saveToHistory();
      const SNAP_THRESHOLD = 10;

      let { x, y } = newCrop;

      //  Center snap only
      if (Math.abs(x) < SNAP_THRESHOLD) x = 0;
      if (Math.abs(y) < SNAP_THRESHOLD) y = 0;

      setCrop({ x, y });
    },
    [saveToHistory],
  );

  // onCropComplete
  const onCropComplete = useCallback(
    (_, pixels) => {
      setCroppedAreaPixels(pixels);

      const width = Math.round(pixels.width);
      const height = Math.round(pixels.height);

      let approxSize = "0 KB";

      if (selectedFile) {
        const estimatedBytes =
          selectedFile.size *
          ((width * height) / (selectedFile.width * selectedFile.height));

        if (estimatedBytes > 1024 * 1024) {
          approxSize = `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
        } else {
          approxSize = `${Math.round(estimatedBytes / 1024)} KB`;
        }
      }
      setLiveInfo({
        width,
        height,
        fileSize: approxSize,
        aspectRatio: `${Math.round(aspect * 100) / 100}:1`,
      });
    },
    [selectedFile, aspect],
  );

  // onfilechange
  const onFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {

      setImageSrc(event.target.result);
      const img = new Image();

      img.onload = () => {
        setSelectedFile({
          size: file.size,
          width: img.width,
          height: img.height,
        });
        setLiveInfo({
          width: img.width,
          height: img.height,
          fileSize:
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(file.size / 1024)} KB`,
          aspectRatio: `${Math.round(aspect * 100) / 100}:1`,
        });
        setCroppedAreaPixels({
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      };
      img.src = event.target.result;
      setCroppedImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }, [aspect]);

  const reset = useCallback(() => {
    setImageSrc(null);
    setCroppedImage(null);
    setCroppedAreaPixels(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleCropImage = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setIsProcessing(true);

    try {
      const url = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flip,
        filters,
      );
      if (url) {
        // cropped image save
        setCroppedImage(url);
        setOriginalCroppedImage(url);

        // original cropped image size detect
        const response = await fetch(url);
        const blob = await response.blob();

        setBeforeSize(blob.size);
        setAfterSize(null);
      }
    } catch (error) {
      console.error("Error generating cropped image:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, filters, flip, imageSrc, rotation]);

  // Compress Image using Canvas
  const compressImage = useCallback(async () => {
    if (!croppedImage) return;

    const img = new Image();
    img.src = croppedImage || croppedImage;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      //
      const MAX_WIDTH = 1200;
      const scale = Math.min(1, MAX_WIDTH / img.width);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.filter = `
  brightness(${filters.brightness})
  contrast(${filters.contrast})
  saturate(${filters.saturation})
  grayscale(${filters.grayscale})
`;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let currentQuality = quality;

      //  SAFE COMPRESSION LOOP
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return;

            if (blob.size < beforeSize) {
              const compressedUrl = URL.createObjectURL(blob);

              setCroppedImage(compressedUrl);
              setAfterSize(blob.size);
            } else if (currentQuality > 0.3) {
              currentQuality -= 0.1;
              tryCompress();
            } else {
              // fallback (no improvement)
              setAfterSize(blob.size);
            }
          },
          "image/jpeg", 
          currentQuality,
        );
      };

      tryCompress();
    };
  }, [
    beforeSize,
    croppedImage,
    filters.brightness,
    filters.contrast,
    filters.grayscale,
    filters.saturation,
    quality,
  ]);

  const handleQualityChange = (value) => {
    setQuality(value);
  };

  const downloadCroppedImage = useCallback(() => {
    if (!croppedImage) return;

    const img = new Image();
    img.src = croppedImage;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;

      if (downloadSize === "medium") {
        width = img.width * 0.75;
        height = img.height * 0.75;
      }

      if (downloadSize === "small") {
        width = img.width * 0.5;
        height = img.height * 0.5;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType =
        downloadFormat === "png" ? "image/png" : "image/jpeg";

      const fileQuality = downloadFormat === "png" ? 1 : quality;

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.download = `cropped-image.${downloadFormat === "png" ? "png" : "jpg"}`;
          link.href = url;
          link.click();

          URL.revokeObjectURL(url);
        },
        mimeType,
        fileQuality,
      );
    };
  }, [croppedImage, downloadFormat, downloadSize, quality]);
   
  return {
    // state
    imageSrc,
    crop,
    zoom,
    aspect,
    croppedImage,
    isProcessing,
    fileInputRef,
    // setters
    setCrop: handleCropChangeWithSnap,
    setZoom: (value) => {
      saveToHistory();
      setZoom(value);
    },
    setAspect,
    setCroppedImage,
    // handlers
    onCropComplete,
    onFileChange,
    reset,
    handleCropImage,
    downloadCroppedImage,
    rotation,
    setRotation: (value) => {
      setHistory((prev) => [
        ...prev,
        {
          crop,
          zoom,
          rotation,
          flip,
          filters,
        },
      ]);
      setRotation((prev) =>
        typeof value === "function" ? value(prev) : value,
      );
    },
    flip,
    setFlip: (value) => {
      setHistory((prev) => [
        ...prev,
        {
          crop,
          zoom,
          rotation,
          flip,
          filters,
        },
      ]);
      setFlip((prev) => (typeof value === "function" ? value(prev) : value));
    },
    showGrid,
    setShowGrid,
    showThirds,
    setShowThirds,
    showCrosshair,
    setShowCrosshair,
    liveInfo,
    quality,
    setQuality,
    beforeSize,
    afterSize,
    compressImage,
    handleQualityChange,
    filters,
    setFilters: (value) => {
      setHistory((prev) => [
        ...prev,
        {
          crop,
          zoom,
          rotation,
          flip,
          filters,
        },
      ]);

      setFilters((prev) => (typeof value === "function" ? value(prev) : value));
    },
    handleUndo,
    handleResetAll,
    history,
    downloadFormat,
    setDownloadFormat,
    downloadSize,
    setDownloadSize,
  };
}
