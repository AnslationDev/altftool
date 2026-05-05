import { useState, useCallback } from "react";
import { ImageProcessor } from "../utils/ImageProcessor";

export const useImageCompression = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState({
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    format: "jpeg",
  });

  const handleImageUpload = useCallback((file) => {
    const imageFile = {
      file,
      preview: URL.createObjectURL(file),
      size: file.size,
      name: file.name,
    };

    setOriginalImage(imageFile);
    setCompressedImage(null);
    setError(null);
  }, []);

  const compressImage = useCallback(async () => {
    if (!originalImage) return;

    setIsCompressing(true);
    setError(null);

    try {
      const compressed = await ImageProcessor.compressImage(
        originalImage.file,
        settings,
      );

      setCompressedImage(compressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setIsCompressing(false);
    }
  }, [originalImage, settings]);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const reset = useCallback(() => {
    if (originalImage?.preview) {
      URL.revokeObjectURL(originalImage.preview);
    }
    if (compressedImage?.url) {
      URL.revokeObjectURL(compressedImage.url);
    }

    setOriginalImage(null);
    setCompressedImage(null);
    setError(null);
  }, [originalImage, compressedImage]);

  return {
    originalImage,
    compressedImage,
    isCompressing,
    error,
    settings,
    handleImageUpload,
    compressImage,
    updateSettings,
    reset,
  };
};
