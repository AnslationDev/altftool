"use client";

import { useState, useCallback } from "react";
import { TRUTHS, DARES, generateId } from "../utils/data";

const STORAGE_KEY = "altft-td-custom";

export function useTruthDare() {
  const [mode, setMode] = useState("truth");
  const [difficulty, setDifficulty] = useState("medium");
  const [pack, setPack] = useState("friends");
  const [current, setCurrent] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [customQuestions, setCustomQuestions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [skipped, setSkipped] = useState(0);

  const getPool = useCallback(() => {
    const base = mode === "truth" ? TRUTHS[difficulty] || TRUTHS.medium : DARES[difficulty] || DARES.medium;
    const customs = customQuestions.filter((q) => q.mode === mode && q.difficulty === difficulty).map((q) => q.text);
    return [...base, ...customs];
  }, [mode, difficulty, customQuestions]);

  const pick = useCallback(() => {
    const pool = getPool();
    if (pool.length === 0) return;
    setIsAnimating(true);
    setShowCountdown(true);

    setTimeout(() => {
      setShowCountdown(false);
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setCurrent({ id: generateId(), text: randomItem, mode, difficulty, timestamp: Date.now() });
      setIsAnimating(false);
    }, 2000);
  }, [getPool, mode, difficulty]);

  const skip = useCallback(() => {
    setSkipped((s) => s + 1);
    setCurrent(null);
    pick();
  }, [pick]);

  const toggleFavorite = useCallback(() => {
    if (!current) return;
    setFavorites((prev) => {
      const exists = prev.find((f) => f.text === current.text);
      return exists ? prev.filter((f) => f.text !== current.text) : [...prev, current];
    });
  }, [current]);

  const addCustom = useCallback((text, modeType, diff) => {
    const newQ = { id: generateId(), text, mode: modeType || mode, difficulty: diff || difficulty };
    setCustomQuestions((prev) => {
      const next = [...prev, newQ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [mode, difficulty]);

  const removeCustom = useCallback((id) => {
    setCustomQuestions((prev) => {
      const next = prev.filter((q) => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSkipped = useCallback(() => setSkipped(0), []);

  return {
    mode, setMode, difficulty, setDifficulty, pack, setPack,
    current, showCountdown, favorites, customQuestions, isAnimating, skipped,
    pick, skip, toggleFavorite, addCustom, removeCustom, resetSkipped,
  };
}
