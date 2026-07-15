import { useState, useCallback, useEffect, useRef } from "react";
import {
  generateSeedFromImageData,
  computeLuckyScore,
} from "../utils/helpers";

const STORAGE_KEY = "altftool_lucky_face_score_history";
const FAVORITES_KEY = "altftool_lucky_face_score_favorites";
const SETTINGS_KEY = "altftool_lucky_face_score_settings";

export function useLuckyScore() {
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [settings, setSettings] = useState({
    darkMode: false,
    autoSave: true,
    animationSpeed: "normal",
  });

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch {}
  }, []);

  useEffect(() => {
    if (settings.autoSave && history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, settings.autoSave]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleImageUpload = useCallback((file, data) => {
    setImage(file);
    setImageData(data);
    setResult(null);
    setShowResult(false);
    setShowConfetti(false);
  }, []);

  const revealLuck = useCallback(() => {
    if (!imageData) return;
    setLoading(true);
    setShowResult(false);
    setShowConfetti(false);

    setTimeout(() => {
      const seed = generateSeedFromImageData(imageData);
      const newResult = computeLuckyScore(seed);
      setResult(newResult);
      setLoading(false);
      setShowResult(true);

      if (newResult.score >= 50) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      setHistory((prev) => {
        const updated = [newResult, ...prev].slice(0, 50);
        return updated;
      });
    }, 2000);
  }, [imageData]);

  const selectHistoryItem = useCallback((item) => {
    setResult(item);
    setShowResult(true);
  }, []);

  const deleteHistoryItem = useCallback((id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === id)) {
        return prev.filter((f) => f.id !== id);
      }
      const item = history.find((h) => h.id === id) || result;
      if (item) return [...prev, item];
      return prev;
    });
    showToast("Favorite updated");
  }, [history, result, showToast]);

  const isFavorite = result ? favorites.some((f) => f.id === result.id) : false;

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const toggleAutoSave = useCallback(() => {
    setSettings((prev) => ({ ...prev, autoSave: !prev.autoSave }));
  }, []);

  const setAnimationSpeed = useCallback((speed) => {
    setSettings((prev) => ({ ...prev, animationSpeed: speed }));
  }, []);

  const clearData = useCallback(() => {
    setHistory([]);
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FAVORITES_KEY);
    showToast("All data cleared");
  }, [showToast]);

  const resetAll = useCallback(() => {
    setImage(null);
    setImageData(null);
    setResult(null);
    setShowResult(false);
    setShowConfetti(false);
  }, []);

  const totalReadings = history.length;
  const averageScore = history.length
    ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length)
    : 0;
  const highestScore = history.length
    ? Math.max(...history.map((h) => h.score))
    : 0;
  const earnedBadges = [
    ...new Set(history.map((h) => h.badge?.label).filter(Boolean)),
  ];

  const distribution = [0, 0, 0, 0, 0];
  history.forEach((h) => {
    if (h.score <= 20) distribution[0]++;
    else if (h.score <= 40) distribution[1]++;
    else if (h.score <= 60) distribution[2]++;
    else if (h.score <= 80) distribution[3]++;
    else distribution[4]++;
  });

  return {
    image,
    imageData,
    result,
    loading,
    history,
    favorites,
    showResult,
    showConfetti,
    toastMsg,
    settings,
    isFavorite,
    totalReadings,
    averageScore,
    highestScore,
    earnedBadges,
    distribution,
    handleImageUpload,
    revealLuck,
    selectHistoryItem,
    deleteHistoryItem,
    toggleFavorite,
    toggleDarkMode,
    toggleAutoSave,
    setAnimationSpeed,
    clearData,
    resetAll,
    showToast,
  };
}
