"use client";

import { useState, useCallback, useEffect } from "react";
import { generateSeedFromImage, pickAuraFromSeed, getRandomAura, getRandomQuote } from "../utils/helpers";

const STORAGE_KEY = "aura-color-generator-history";
const FAVORITES_KEY = "aura-color-generator-favorites";
const SETTINGS_KEY = "aura-color-generator-settings";

export default function useAuraGenerator() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [aura, setAura] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState({
    darkMode: true,
    autoSave: true,
    animations: true,
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("File too large. Max 10MB.", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file.", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setImage(file);
    setImagePreview(url);
    setAura(null);
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview("");
    setAura(null);
  };

  const generateAura = async () => {
    if (!image) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const { seed } = await generateSeedFromImage(image);
      const auraData = pickAuraFromSeed(seed);
      const quote = getRandomQuote();
      const result = { ...auraData, quote, timestamp: Date.now() };
      setAura(result);
      if (settings.autoSave) {
        setHistory((prev) => [result, ...prev].slice(0, 50));
      }
      showToast("Your aura has been revealed!");
    } catch {
      showToast("Failed to generate aura. Try again.", "error");
    }
    setLoading(false);
  };

  const generateRandomAura = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const auraData = getRandomAura();
    const quote = getRandomQuote();
    const result = { ...auraData, quote, timestamp: Date.now() };
    setAura(result);
    if (settings.autoSave) {
      setHistory((prev) => [result, ...prev].slice(0, 50));
    }
    setLoading(false);
    showToast("Surprise! Your random aura awaits.");
  };

  const toggleFavorite = (auraItem) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.timestamp === auraItem.timestamp);
      if (exists) {
        showToast("Removed from favorites.");
        return prev.filter((f) => f.timestamp !== auraItem.timestamp);
      }
      showToast("Added to favorites!");
      return [auraItem, ...prev];
    });
  };

  const isFavorited = (auraItem) => {
    return favorites.some((f) => f.timestamp === auraItem?.timestamp);
  };

  const deleteHistoryItem = (timestamp) => {
    setHistory((prev) => prev.filter((h) => h.timestamp !== timestamp));
    showToast("Removed from history.");
  };

  const clearHistory = () => {
    setHistory([]);
    showToast("History cleared.");
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast("Settings updated.");
  };

  return {
    image,
    imagePreview,
    aura,
    loading,
    history,
    favorites,
    settings,
    toast,
    handleImageUpload,
    clearImage,
    generateAura,
    generateRandomAura,
    toggleFavorite,
    isFavorited,
    deleteHistoryItem,
    clearHistory,
    updateSettings,
    showToast,
    setAura,
  };
}
