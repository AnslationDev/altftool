import { useState, useCallback, useMemo } from "react";
import { RESTAURANTS, generateId } from "../utils/data";

const STORAGE_KEY = "altft-lunch-history";

export function useLunch() {
  const [filters, setFilters] = useState({ cuisine: "", budget: "", type: "" });
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("altft-lunch-favs") || "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [animating, setAnimating] = useState(false);

  const filtered = useMemo(() => {
    return RESTAURANTS.filter((r) => {
      if (filters.cuisine && r.cuisine !== filters.cuisine) return false;
      if (filters.budget && r.budget !== filters.budget) return false;
      if (filters.type && r.type !== filters.type) return false;
      return true;
    });
  }, [filters]);

  const pick = useCallback(() => {
    if (filtered.length === 0) return null;
    setAnimating(true);
    const shuffleInterval = setInterval(() => {
      setSelected(filtered[Math.floor(Math.random() * filtered.length)]);
    }, 80);
    setTimeout(() => {
      clearInterval(shuffleInterval);
      const winner = filtered[Math.floor(Math.random() * filtered.length)];
      setSelected(winner);
      setAnimating(false);
      setRecent((prev) => {
        const next = [{ ...winner, id: generateId(), timestamp: Date.now() }, ...prev].slice(0, 20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }, 1500);
  }, [filtered]);

  const toggleFavorite = useCallback((item) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.name === item.name);
      const next = exists ? prev.filter((f) => f.name !== item.name) : [...prev, item];
      localStorage.setItem("altft-lunch-favs", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { filters, setFilters, filtered, selected, setSelected, favorites, recent, animating, pick, toggleFavorite, clearHistory };
}
