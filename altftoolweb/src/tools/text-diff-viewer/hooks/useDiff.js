"use client";

import { useState, useCallback, useMemo } from "react";
import { computeDiff, computeStats } from "../utils/diffEngine";
import { generateId } from "../utils/helpers";

const VERSIONS_KEY = "altft-diff-versions";
const SETTINGS_KEY = "altft-diff-settings";

export function useDiff() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [viewMode, setViewMode] = useState("side-by-side");
  const [diffMode, setDiffMode] = useState("word");
  const [ignoreSpaces, setIgnoreSpaces] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [versions, setVersions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) || "[]"); } catch { return []; }
  });
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // Stable mutable containers (created once). Every mutation is paired with a
  // setTextA/setTextB call, so renders always observe the fresh stack lengths.
  const [undoStack] = useState(() => ({ current: [] }));
  const [redoStack] = useState(() => ({ current: [] }));
  const [toast, setToast] = useState(null);

  const diffResult = useMemo(() => {
    return computeDiff(textA, textB, { ignoreSpaces, ignoreCase, mode: diffMode });
  }, [textA, textB, ignoreSpaces, ignoreCase, diffMode]);

  const stats = useMemo(() => {
    return computeStats(textA, textB);
  }, [textA, textB]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const saveVersion = useCallback((name) => {
    const version = {
      id: generateId(),
      name: name || `Version ${versions.length + 1}`,
      textA, textB,
      timestamp: Date.now(),
    };
    setVersions((prev) => {
      const next = [version, ...prev].slice(0, 50);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(next));
      return next;
    });
    showToast("Version saved!");
  }, [textA, textB, versions.length, showToast]);

  const loadVersion = useCallback((version) => {
    undoStack.current.push({ textA, textB });
    redoStack.current = [];
    setTextA(version.textA);
    setTextB(version.textB);
    setSelectedVersionId(version.id);
    showToast("Version restored");
  }, [textA, textB, showToast]);

  const deleteVersion = useCallback((id) => {
    setVersions((prev) => {
      const next = prev.filter((v) => v.id !== id);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(next));
      return next;
    });
    if (selectedVersionId === id) setSelectedVersionId(null);
  }, [selectedVersionId]);

  const renameVersion = useCallback((id, name) => {
    setVersions((prev) => {
      const next = prev.map((v) => v.id === id ? { ...v, name } : v);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const compareWithVersion = useCallback((version) => {
    setTextB(version.textA);
    showToast(`Comparing with "${version.name}"`);
  }, [showToast]);

  const swapTexts = useCallback(() => {
    setTextA(textB);
    setTextB(textA);
  }, [textA, textB]);

  const clearAll = useCallback(() => {
    undoStack.current.push({ textA, textB });
    redoStack.current = [];
    setTextA("");
    setTextB("");
  }, [textA, textB]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop();
    redoStack.current.push({ textA, textB });
    setTextA(prev.textA);
    setTextB(prev.textB);
  }, [textA, textB]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    undoStack.current.push({ textA, textB });
    setTextA(next.textA);
    setTextB(next.textB);
  }, [textA, textB]);

  const filteredDiff = useMemo(() => {
    if (!searchQuery) return diffResult;
    return diffResult.filter((part) =>
      part.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [diffResult, searchQuery]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, []);

  return {
    textA, setTextA, textB, setTextB,
    viewMode, setViewMode, diffMode, setDiffMode,
    ignoreSpaces, setIgnoreSpaces, ignoreCase, setIgnoreCase,
    versions, selectedVersionId, diffResult, filteredDiff, stats,
    searchQuery, setSearchQuery, showSearch, setShowSearch,
    showAnalytics, setShowAnalytics, fullscreen, toast,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    saveVersion, loadVersion, deleteVersion, renameVersion,
    compareWithVersion, swapTexts, clearAll, undo, redo,
    toggleFullscreen, showToast,
  };
}
