"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { loadFromStorage, saveToStorage, computeSimilarity, generateInsights, generateFunFacts } from "../utils/helpers";

const STORAGE_KEYS = {
  history: "altft-twin-history",
  favorites: "altft-twin-favorites",
  settings: "altft-twin-settings",
};

const DEFAULT_SETTINGS = {
  darkMode: false,
  autoSave: true,
  animationSpeed: "normal",
};

export default function useTwinFinder() {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [imageAFile, setImageAFile] = useState(null);
  const [imageBFile, setImageBFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => loadFromStorage(STORAGE_KEYS.history, []));
  const [favorites, setFavorites] = useState(() => loadFromStorage(STORAGE_KEYS.favorites, []));
  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
  const [comparisonMode, setComparisonMode] = useState("side-by-side");
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const canvasARef = useRef(null);
  const canvasBRef = useRef(null);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.history, history);
  }, [history]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [settings.darkMode]);

  const addToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const validateFile = useCallback((file) => {
    if (!file) return "No file selected";
    if (!file.type.startsWith("image/")) return "Only image files are allowed";
    if (file.size > 10 * 1024 * 1024) return "File size must be under 10MB";
    return null;
  }, []);

  const fileToDataURL = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const addImage = useCallback(
    async (file, slot) => {
      const validationError = validateFile(file);
      if (validationError) {
        addToast(validationError);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const dataUrl = await fileToDataURL(file);
        if (slot === "A") {
          setImageA(dataUrl);
          setImageAFile(file);
        } else {
          setImageB(dataUrl);
          setImageBFile(file);
        }
      } catch {
        addToast("Failed to read image file");
      } finally {
        setLoading(false);
      }
    },
    [validateFile, fileToDataURL, addToast]
  );

  const removeImage = useCallback((slot) => {
    if (slot === "A") {
      setImageA(null);
      setImageAFile(null);
    } else {
      setImageB(null);
      setImageBFile(null);
    }
    if (result) setResult(null);
  }, [result]);

  const runComparison = useCallback(() => {
    if (!imageA || !imageB) {
      addToast("Please upload both images first");
      return;
    }
    setComparing(true);
    setError(null);

    setTimeout(() => {
      try {
        const ca = canvasARef.current;
        const cb = canvasBRef.current;
        if (!ca || !cb) {
          addToast("Canvas not ready");
          setComparing(false);
          return;
        }
        const percentage = computeSimilarity(ca, cb);
        const insights = generateInsights(percentage);
        const funFact = generateFunFacts(percentage, Date.now());
        const newResult = {
          id: Date.now(),
          percentage,
          insights,
          funFact,
          timestamp: new Date().toISOString(),
          imageA,
          imageB,
          imageASize: imageAFile?.size || 0,
          imageBSize: imageBFile?.size || 0,
          imageAName: imageAFile?.name || "Image A",
          imageBName: imageBFile?.name || "Image B",
        };
        setResult(newResult);
        if (settings.autoSave) {
          setHistory((prev) => [newResult, ...prev].slice(0, 50));
        }
      } catch {
        addToast("Comparison failed. Please try again.");
      } finally {
        setComparing(false);
      }
    }, 1500);
  }, [imageA, imageB, imageAFile, imageBFile, settings.autoSave, addToast]);

  const selectHistoryItem = useCallback((item) => {
    setImageA(item.imageA);
    setImageB(item.imageB);
    setResult(item);
  }, []);

  const deleteHistoryItem = useCallback((id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    setFavorites((prev) => prev.filter((f) => f !== id));
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    setFavorites([]);
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAll = useCallback(() => {
    setImageA(null);
    setImageB(null);
    setImageAFile(null);
    setImageBFile(null);
    setResult(null);
    setError(null);
    setComparisonMode("side-by-side");
  }, []);

  const getStats = useCallback(() => {
    const total = history.length;
    const avg = total > 0 ? Math.round(history.reduce((s, h) => s + h.percentage, 0) / total) : 0;
    const recent = history.slice(0, 5);
    const favoritesCount = favorites.length;
    return { total, avg, recent, favoritesCount };
  }, [history, favorites]);

  return {
    imageA,
    imageB,
    imageAFile,
    imageBFile,
    loading,
    comparing,
    result,
    history,
    favorites,
    settings,
    comparisonMode,
    error,
    toasts,
    canvasARef,
    canvasBRef,
    addImage,
    removeImage,
    runComparison,
    selectHistoryItem,
    deleteHistoryItem,
    toggleFavorite,
    clearAllHistory,
    updateSettings,
    resetAll,
    getStats,
    setComparisonMode,
    addToast,
  };
}
