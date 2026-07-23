"use client";

import { useState, useCallback, useMemo } from "react";
import { parseSessionData } from "../utils/sessionParser";
import { generateId } from "../utils/helpers";

const HISTORY_KEY = "altft-session-history";

export function useSessionAnalyzer() {
  const [tabs, setTabs] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("openOrder");
  const [groups, setGroups] = useState([]);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const [inputText, setInputText] = useState("");

  const processInput = useCallback((text, format = "auto") => {
    if (!text.trim()) return;
    const result = parseSessionData(text, format);
    if (result.tabs.length === 0) return;

    setTabs(result.tabs);
    setStats(result.stats);

    const record = {
      id: generateId(),
      count: result.tabs.length,
      domains: result.stats.uniqueDomains,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const next = [record, ...prev].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addManualUrl = useCallback((url) => {
    if (!url.trim()) return;
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const singleInput = JSON.stringify([fullUrl]);
    const result = parseSessionData(singleInput, "json");
    if (result.tabs.length > 0) {
      setTabs((prev) => [...prev, ...result.tabs]);
      setStats(result.stats);
    }
  }, []);

  const clearAll = useCallback(() => {
    setTabs([]);
    setStats(null);
    setGroups([]);
    setInputText("");
  }, []);

  const createGroup = useCallback((name, tabIds) => {
    const group = {
      id: generateId(),
      name,
      collapsed: false,
      tabIds,
    };
    setGroups((prev) => [...prev, group]);
  }, []);

  const toggleGroupCollapse = useCallback((id) => {
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, collapsed: !g.collapsed } : g));
  }, []);

  const deleteGroup = useCallback((id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const renameGroup = useCallback((id, name) => {
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, name } : g));
  }, []);

  const filteredTabs = useMemo(() => {
    let result = [...tabs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.url.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.title && t.title.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }
    if (sortBy === "domain") result.sort((a, b) => a.domain.localeCompare(b.domain));
    else if (sortBy === "category") result.sort((a, b) => a.category.localeCompare(b.category));
    else result.sort((a, b) => a.openOrder - b.openOrder);
    return result;
  }, [tabs, search, categoryFilter, sortBy]);

  const categories = useMemo(() => {
    const cats = {};
    tabs.forEach((t) => { cats[t.category] = (cats[t.category] || 0) + 1; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [tabs]);

  return {
    tabs, stats, search, categoryFilter, sortBy, groups, history, inputText, filteredTabs, categories,
    setSearch, setCategoryFilter, setSortBy, setInputText, setTabs,
    processInput, addManualUrl, clearAll,
    createGroup, toggleGroupCollapse, deleteGroup, renameGroup,
  };
}
