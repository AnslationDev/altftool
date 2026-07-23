"use client";

import { useState, useCallback, useRef } from "react";
import { generateId, shuffleArray } from "../utils/helpers";
import { generateColors } from "../utils/colors";

const STORAGE_KEY = "altft-decision-wheel";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
}

const TEMPLATES = {
  movies: ["Inception", "The Matrix", "Interstellar", "Parasite", "Tenet", "Dune", "Oppenheimer", "Barbie"],
  food: ["Pizza", "Sushi", "Burgers", "Pasta", "Salad", "Tacos", "Ramen", "Steak"],
  games: ["Chess", "Sudoku", "Minecraft", "Valorant", "FIFA", " Zelda", "Elden Ring", "Stardew Valley"],
  tasks: ["Read emails", "Write report", "Code review", "Design mockup", "Team standup", "Research", "Exercise", "Meditate"],
  workout: ["Push-ups", "Squats", "Plank", "Burpees", "Lunges", "Jump Rope", "Yoga", "Deadlift"],
  travel: ["Paris", "Tokyo", "Bali", "New York", "London", "Dubai", "Sydney", "Rome"],
};

export function useWheel() {
  const saved = loadState();
  const [entries, setEntries] = useState(saved?.entries || []);
  const [history, setHistory] = useState(saved?.history || []);
  const [favorites, setFavorites] = useState(saved?.favorites || []);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(5);
  const [wheelTheme, setWheelTheme] = useState(saved?.wheelTheme || "ocean");
  const [mode, setMode] = useState("wheel");
  const [selectedEntries, setSelectedEntries] = useState([]);
  // Stable mutable containers (created once). Every mutation is paired with a
  // setEntries call, so renders always observe the fresh stack lengths.
  const [undoStack] = useState(() => ({ current: [] }));
  const [redoStack] = useState(() => ({ current: [] }));

  function save() {
    saveState({ entries, history, favorites, wheelTheme });
  }

  const colors = entries.length > 0 ? generateColors(entries.length) : [];

  const addEntry = useCallback((name) => {
    if (!name.trim()) return;
    const entry = { id: generateId(), name: name.trim(), weight: 1 };
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries((prev) => [...prev, entry]);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const addEntries = useCallback((names) => {
    const newEntries = names.filter(Boolean).map((n) => ({ id: generateId(), name: n.trim(), weight: 1 }));
    if (newEntries.length === 0) return;
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries((prev) => [...prev, ...newEntries]);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const removeEntry = useCallback((id) => {
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const editEntry = useCallback((id, name) => {
    if (!name.trim()) return;
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, name: name.trim() } : e)));
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const duplicateEntry = useCallback((id) => {
    const source = entries.find((e) => e.id === id);
    if (!source) return;
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries((prev) => [...prev, { ...source, id: generateId(), name: `${source.name} (copy)` }]);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const shuffleEntries = useCallback(() => {
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries(shuffleArray(entries));
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const clearEntries = useCallback(() => {
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries([]);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const loadTemplate = useCallback((templateKey) => {
    const names = TEMPLATES[templateKey] || [];
    const newEntries = names.map((n) => ({ id: generateId(), name: n, weight: 1 }));
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries(newEntries);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const importEntries = useCallback((data) => {
    if (!Array.isArray(data)) return;
    const newEntries = data.map((item) => {
      const name = typeof item === "string" ? item : item.name || item.label || "";
      return { id: generateId(), name: name.trim(), weight: 1 };
    }).filter((e) => e.name);
    if (newEntries.length === 0) return;
    undoStack.current.push(entries);
    redoStack.current = [];
    setEntries(newEntries);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const spin = useCallback(() => {
    if (entries.length < 2 || isSpinning) return;
    setIsSpinning(true);
    const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
    let rand = Math.random() * totalWeight;
    let winner = entries[0];
    for (const entry of entries) {
      rand -= entry.weight;
      if (rand <= 0) { winner = entry; break; }
    }
    const spinDuration = 2000 + (spinSpeed * 800);
    setTimeout(() => {
      setCurrentWinner(winner);
      setIsSpinning(false);
      const record = { id: generateId(), winner: winner.name, timestamp: Date.now(), entries: entries.length };
      setHistory((prev) => [record, ...prev].slice(0, 100));
      setTimeout(save, 0);
    }, spinDuration);
    return { winner, duration: spinDuration };
  }, [entries, isSpinning, spinSpeed, history, favorites, wheelTheme]);

  const teamSelect = useCallback(() => {
    const available = entries.filter((e) => !selectedEntries.find((s) => s.id === e.id));
    if (available.length === 0) return;
    const winner = available[Math.floor(Math.random() * available.length)];
    setCurrentWinner(winner);
    setSelectedEntries((prev) => [...prev, winner]);
    return winner;
  }, [entries, selectedEntries]);

  const resetTeam = useCallback(() => {
    setSelectedEntries([]);
    setCurrentWinner(null);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop();
    redoStack.current.push(entries);
    setEntries(prev);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    undoStack.current.push(entries);
    setEntries(next);
    setTimeout(save, 0);
  }, [entries, history, favorites, wheelTheme]);

  const toggleFavorite = useCallback(() => {
    if (!currentWinner) return;
    setFavorites((prev) => {
      const exists = prev.find((f) => f === currentWinner.name);
      return exists ? prev.filter((f) => f !== currentWinner.name) : [...prev, currentWinner.name];
    });
    setTimeout(save, 0);
  }, [currentWinner, entries, history, favorites, wheelTheme]);

  const setThemeAndSave = useCallback((theme) => {
    setWheelTheme(theme);
    setTimeout(save, 0);
  }, [entries, history, favorites]);

  const saveWheel = useCallback((name) => {
    const savedWheels = JSON.parse(localStorage.getItem("altft-saved-wheels") || "[]");
    savedWheels.push({ id: generateId(), name, entries: [...entries], theme: wheelTheme, createdAt: Date.now() });
    localStorage.setItem("altft-saved-wheels", JSON.stringify(savedWheels));
  }, [entries, wheelTheme]);

  const loadWheel = useCallback((wheelData) => {
    setEntries(wheelData.entries || []);
    setThemeAndSave(wheelData.theme || "ocean");
  }, [setThemeAndSave]);

  const stats = {
    totalSpins: history.length,
    mostSelected: (() => {
      const counts = {};
      history.forEach((h) => { counts[h.winner] = (counts[h.winner] || 0) + 1; });
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return entries.length > 0 ? { name: entries[0][0], count: entries[0][1] } : null;
    })(),
    leastSelected: (() => {
      const counts = {};
      history.forEach((h) => { counts[h.winner] = (counts[h.winner] || 0) + 1; });
      const entries = Object.entries(counts).sort((a, b) => a[1] - b[1]);
      return entries.length > 0 ? { name: entries[0][0], count: entries[0][1] } : null;
    })(),
  };

  return {
    entries, colors, history, favorites, currentWinner, isSpinning, spinSpeed, wheelTheme,
    mode, selectedEntries, undoStack: undoStack.current.length, redoStack: redoStack.current.length,
    stats, TEMPLATES,
    addEntry, addEntries, removeEntry, editEntry, duplicateEntry, shuffleEntries,
    clearEntries, loadTemplate, importEntries, spin, teamSelect, resetTeam,
    undo, redo, setCurrentWinner, setIsSpinning, setSpinSpeed, setThemeAndSave,
    saveWheel, loadWheel, setMode, toggleFavorite, setHistory, save,
  };
}
