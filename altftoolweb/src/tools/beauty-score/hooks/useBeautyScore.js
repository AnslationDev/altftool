"use client";

import { useState, useCallback, useEffect } from "react";
import { generateResult, STORAGE_KEYS } from "../utils/helpers";

const DEFAULT_SETTINGS = {
  darkMode: false,
  autoSave: true,
  animations: true,
};

export default function useBeautyScore() {
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    if (settings.autoSave) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  }, [history, settings.autoSave]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const handleImageUpload = useCallback((file) => {
    setError(null);
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!image) return;
    setScanning(true);
    setResult(null);
    setShowConfetti(false);
  }, [image]);

  const handleScanComplete = useCallback(() => {
    setScanning(false);
    const newResult = generateResult(imageData || image);
    setResult(newResult);
    if (settings.autoSave) {
      setHistory((prev) => [newResult, ...prev].slice(0, 50));
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  }, [image, imageData, settings.autoSave]);

  const handleReset = useCallback(() => {
    setImage(null);
    setImageData(null);
    setResult(null);
    setScanning(false);
    setShowConfetti(false);
    setError(null);
  }, []);

  const handleDeleteHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    setFavorites((prev) => prev.filter((idf) => idf !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setHistory([]);
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  }, []);

  const handleToggleFavorite = useCallback((id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const currentResult = result || null;

  return {
    image,
    setImage,
    imageData,
    setImageData,
    scanning,
    result: currentResult,
    history,
    favorites,
    settings,
    setSettings,
    showConfetti,
    error,
    showShare,
    setShowShare,
    showSettings,
    setShowSettings,
    handleImageUpload,
    handleAnalyze,
    handleScanComplete,
    handleReset,
    handleDeleteHistory,
    handleClearAll,
    handleToggleFavorite,
  };
}
