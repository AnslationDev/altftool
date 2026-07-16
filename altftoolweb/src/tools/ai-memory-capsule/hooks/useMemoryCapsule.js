"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getCapsules,
  getCategories,
  saveCategories,
  createCapsule,
  updateCapsule,
  deleteCapsule,
} from "../utils/capsuleDb";
import { analyzeSentiment, detectTopics, getWordFrequencies, generateInsights } from "../utils/textAnalyzer";

export function useMemoryCapsule() {
  const [capsules, setCapsules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCapsule, setEditingCapsule] = useState(null);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [timePeriod, setTimePeriod] = useState("all");

  useEffect(() => {
    setCapsules(getCapsules());
    setCategories(getCategories());
    setIsLoaded(true);
  }, []);

  const addToast = useCallback((message, tone = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const handleSaveCapsule = useCallback(
    (data) => {
      if (editingCapsule) {
        updateCapsule(editingCapsule.id, data);
        addToast("Memory updated successfully", "success");
      } else {
        createCapsule(data);
        addToast("Memory capsule created", "success");
      }
      setCapsules(getCapsules());
      if (data.category && !categories.includes(data.category)) {
        const newCats = [...categories, data.category];
        setCategories(newCats);
        saveCategories(newCats);
      }
    },
    [editingCapsule, categories, addToast]
  );

  const handleDelete = useCallback(
    (id) => {
      deleteCapsule(id);
      setCapsules(getCapsules());
      if (selectedCapsule?.id === id) setSelectedCapsule(null);
      addToast("Memory deleted", "success");
    },
    [selectedCapsule, addToast]
  );

  const handleToggleFavorite = useCallback(
    (id) => {
      const c = capsules.find((x) => x.id === id);
      if (c) {
        updateCapsule(id, { isFavorite: !c.isFavorite });
        setCapsules(getCapsules());
      }
    },
    [capsules]
  );

  const handleTogglePin = useCallback(
    (id) => {
      const c = capsules.find((x) => x.id === id);
      if (c) {
        updateCapsule(id, { isPinned: !c.isPinned });
        setCapsules(getCapsules());
      }
    },
    [capsules]
  );

  const filteredCapsules = useMemo(() => {
    let result = [...capsules];
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.dateCreated) - new Date(a.dateCreated);
    });

    if (activeTab === "Favorites") result = result.filter((c) => c.isFavorite);
    else if (activeTab === "Sealed") result = result.filter((c) => c.isSealed);
    else if (activeTab !== "All") result = result.filter((c) => c.category === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.content || "").toLowerCase().includes(q) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (timePeriod !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timePeriod === "today") cutoff.setHours(0, 0, 0, 0);
      else if (timePeriod === "week") cutoff.setDate(now.getDate() - 7);
      else if (timePeriod === "month") cutoff.setMonth(now.getMonth() - 1);
      else if (timePeriod === "year") cutoff.setFullYear(now.getFullYear() - 1);
      result = result.filter((c) => new Date(c.dateCreated) >= cutoff);
    }

    return result;
  }, [capsules, activeTab, searchQuery, timePeriod]);

  const insights = useMemo(() => generateInsights(capsules), [capsules]);

  const tabs = useMemo(() => {
    const base = [
      { key: "All", label: "All" },
      { key: "Favorites", label: "Favorites" },
      { key: "Sealed", label: "Sealed" },
    ];
    const catTabs = categories.map((c) => ({ key: c, label: c }));
    return [...base, ...catTabs];
  }, [categories]);

  const getCapsuleAnalysis = useCallback((capsule) => {
    if (!capsule) return null;
    const sentiment = analyzeSentiment(capsule.content);
    const topics = detectTopics(capsule.content);
    const words = getWordFrequencies(capsule.content);
    return { sentiment, topics, words };
  }, []);

  return {
    capsules,
    categories,
    isLoaded,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isFormOpen,
    setIsFormOpen,
    editingCapsule,
    setEditingCapsule,
    selectedCapsule,
    setSelectedCapsule,
    toasts,
    addToast,
    timePeriod,
    setTimePeriod,
    filteredCapsules,
    insights,
    tabs,
    handleSaveCapsule,
    handleDelete,
    handleToggleFavorite,
    handleTogglePin,
    getCapsuleAnalysis,
  };
}
