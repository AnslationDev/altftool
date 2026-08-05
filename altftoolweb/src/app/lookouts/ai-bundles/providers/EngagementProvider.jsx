"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";

const EngagementContext = createContext(null);

const RECENT_LIMIT = 8;
const COMPARE_LIMIT = 3;

export const toolKey = (tool) => `${tool.name}|${tool.domain}`;

/**
 * Cross-section engagement state: favorites and recently-viewed persist to
 * localStorage; the compare tray is session-only. Centralized here so
 * ToolCard, the category explorer's "favorites only" filter, and the
 * compare bar all read/write the same source of truth.
 */
export function EngagementProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorageState("AIB_FAVORITES_V1", []);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorageState("AIB_RECENT_V1", []);
  const [compareList, setCompareList] = useLocalStorageState("AIB_COMPARE_SESSION", []);

  const isFavorite = useCallback((tool) => favorites.some((item) => toolKey(item) === toolKey(tool)), [favorites]);

  const toggleFavorite = useCallback(
    (tool) => {
      setFavorites((prev) => {
        const key = toolKey(tool);
        const exists = prev.some((item) => toolKey(item) === key);
        return exists ? prev.filter((item) => toolKey(item) !== key) : [tool, ...prev];
      });
    },
    [setFavorites],
  );

  const addRecentlyViewed = useCallback(
    (tool) => {
      setRecentlyViewed((prev) => {
        const key = toolKey(tool);
        const withoutDup = prev.filter((item) => toolKey(item) !== key);
        return [tool, ...withoutDup].slice(0, RECENT_LIMIT);
      });
    },
    [setRecentlyViewed],
  );

  const isComparing = useCallback((tool) => compareList.some((item) => toolKey(item) === toolKey(tool)), [compareList]);

  const toggleCompare = useCallback(
    (tool) => {
      setCompareList((prev) => {
        const key = toolKey(tool);
        const exists = prev.some((item) => toolKey(item) === key);
        if (exists) return prev.filter((item) => toolKey(item) !== key);
        if (prev.length >= COMPARE_LIMIT) return prev;
        return [...prev, tool];
      });
    },
    [setCompareList],
  );

  const removeFromCompare = useCallback(
    (tool) => {
      setCompareList((prev) => prev.filter((item) => toolKey(item) !== toolKey(tool)));
    },
    [setCompareList],
  );

  const clearCompare = useCallback(() => setCompareList([]), [setCompareList]);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      recentlyViewed,
      addRecentlyViewed,
      compareList,
      isComparing,
      toggleCompare,
      removeFromCompare,
      clearCompare,
      compareLimit: COMPARE_LIMIT,
    }),
    [favorites, isFavorite, toggleFavorite, recentlyViewed, addRecentlyViewed, compareList, isComparing, toggleCompare, removeFromCompare, clearCompare],
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

export function useEngagement() {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error("useEngagement must be used within EngagementProvider");
  return ctx;
}
