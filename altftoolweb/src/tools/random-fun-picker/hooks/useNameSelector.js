import { useState, useCallback, useMemo } from "react";
import { generateId } from "../utils/data";
import { parseCSV, removeDuplicates } from "../utils/helpers";

const STORAGE_KEY = "altft-names";
const HISTORY_KEY = "altft-name-history";

export function useNameSelector() {
  const [names, setNames] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [winners, setWinners] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [search, setSearch] = useState("");
  const [multipleCount, setMultipleCount] = useState(1);

  const filteredNames = useMemo(() => {
    return names.filter((n) => {
      if (excluded.includes(n)) return false;
      if (search && !n.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [names, excluded, search]);

  const addName = useCallback((name) => {
    if (!name.trim()) return;
    setNames((prev) => {
      const next = [...prev, name.trim()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addNames = useCallback((items) => {
    const clean = items.map((s) => s.trim()).filter(Boolean);
    if (clean.length === 0) return;
    setNames((prev) => {
      const next = removeDuplicates([...prev, ...clean]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeName = useCallback((name) => {
    setNames((prev) => {
      const next = prev.filter((n) => n !== name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearNames = useCallback(() => {
    setNames([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const pickOne = useCallback(() => {
    if (filteredNames.length === 0) return;
    setIsAnimating(true);
    const interval = setInterval(() => {
      setSelected(filteredNames[Math.floor(Math.random() * filteredNames.length)]);
    }, 70);
    setTimeout(() => {
      clearInterval(interval);
      const winner = filteredNames[Math.floor(Math.random() * filteredNames.length)];
      setSelected(winner);
      setIsAnimating(false);
      setWinners((prev) => [...prev, winner]);
      setHistory((prev) => {
        const next = [{ name: winner, id: generateId(), timestamp: Date.now() }, ...prev].slice(0, 50);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    }, 1200);
  }, [filteredNames]);

  const pickMultiple = useCallback(() => {
    if (filteredNames.length === 0) return;
    const count = Math.min(multipleCount, filteredNames.length);
    const shuffled = [...filteredNames].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    setSelected(picked.join(", "));
    setWinners((prev) => [...prev, ...picked]);
    setHistory((prev) => {
      const records = picked.map((name) => ({ name, id: generateId(), timestamp: Date.now() }));
      const next = [...records, ...prev].slice(0, 50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, [filteredNames, multipleCount]);

  const resetSelection = useCallback(() => {
    setSelected(null);
    setWinners([]);
    setExcluded([]);
  }, []);

  const excludeWinner = useCallback((name) => {
    setExcluded((prev) => [...prev, name]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const duplicates = useMemo(() => {
    const seen = {};
    names.forEach((n) => { seen[n] = (seen[n] || 0) + 1; });
    return Object.entries(seen).filter(([, count]) => count > 1).map(([name]) => name);
  }, [names]);

  return {
    names, winners, selected, history, isAnimating, search, multipleCount, filteredNames, excluded, duplicates,
    setSearch, setMultipleCount, addName, addNames, removeName, clearNames,
    pickOne, pickMultiple, resetSelection, excludeWinner, clearHistory, setSelected,
  };
}
