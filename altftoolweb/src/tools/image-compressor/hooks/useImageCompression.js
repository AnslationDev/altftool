import { useState, useCallback } from "react";
import { ImageProcessor } from "../utils/ImageProcessor";

export const useImageCompression = () => {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(null);
  const [results, setResults] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const [settings, setSettings] = useState({
    quality: 75,
    maxWidth: 1920,
    maxHeight: 1080,
    format: "webp",
    resizeEnabled: false,
  });

  const addFiles = useCallback((files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      size: file.size,
      name: file.name,
    }));
    setImages(prev => {
      const updated = [...prev, ...newImages];
      if (activeIdx === null && updated.length > 0) setActiveIdx(0);
      return updated;
    });
    setError(null);
    setStats(null);
  }, [activeIdx]);

  const removeImage = useCallback((idx) => {
    setImages(prev => {
      const img = prev[idx];
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== idx);
    });
    setResults(prev => {
      const r = { ...prev };
      if (r[idx]?.url) URL.revokeObjectURL(r[idx].url);
      delete r[idx];
      return r;
    });
    setActiveIdx(prev => {
      if (prev === idx) return 0;
      if (prev > idx) return prev - 1;
      return prev;
    });
  }, []);

  const selectImage = useCallback((idx) => {
    setActiveIdx(idx);
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const compressOne = useCallback(async (idx) => {
    const image = images[idx];
    if (!image) return;

    setIsCompressing(true);
    setError(null);

    try {
      const result = await ImageProcessor.compressImage(image.file, {
        quality: settings.quality,
        format: settings.format,
        maxWidth: settings.resizeEnabled ? settings.maxWidth : 99999,
        maxHeight: settings.resizeEnabled ? settings.maxHeight : 99999,
      });

      const ratio = ImageProcessor.getCompressionRatio(image.size, result.size);

      const enriched = { ...result, ratio };

      setResults(prev => ({ ...prev, [idx]: enriched }));

      // Update cumulative stats
      setResults(prev => {
        const all = { ...prev, [idx]: enriched };
        let totalOrig = 0;
        let totalComp = 0;
        Object.keys(all).forEach(i => {
          totalOrig += images[parseInt(i)]?.size || 0;
          totalComp += all[i]?.size || 0;
        });
        setStats({
          original: totalOrig,
          compressed: totalComp,
          saved: totalOrig - totalComp,
          percentage: totalOrig > 0 ? Math.round(((totalOrig - totalComp) / totalOrig) * 100) : 0,
        });
        return all;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setIsCompressing(false);
    }
  }, [images, settings]);

  const compressAll = useCallback(async () => {
    if (images.length === 0) return;
    setIsCompressing(true);
    setError(null);
    setStats(null);

    try {
      for (let i = 0; i < images.length; i++) {
        setActiveIdx(i);
        await compressOne(i);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch compression failed");
    } finally {
      setIsCompressing(false);
    }
  }, [images, compressOne]);

  const resetAll = useCallback(() => {
    images.forEach(img => {
      if (img?.preview) URL.revokeObjectURL(img.preview);
    });
    Object.values(results).forEach(r => {
      if (r?.url) URL.revokeObjectURL(r.url);
    });
    setImages([]);
    setActiveIdx(null);
    setResults({});
    setError(null);
    setStats(null);
  }, [images, results]);

  return {
    images, activeIdx, results, settings, isCompressing, error, stats,
    addFiles, removeImage, selectImage, updateSettings,
    compressOne, compressAll, resetAll,
  };
};
