"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toolId } from "../lib/toolId";

const CompareContext = createContext(null);
const MAX_COMPARE = 3;

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const isComparing = useCallback((tool) => compareList.some((t) => toolId(t) === toolId(tool)), [compareList]);

  const toggleCompare = useCallback((tool) => {
    setCompareList((prev) => {
      const id = toolId(tool);
      if (prev.some((t) => toolId(t) === id)) return prev.filter((t) => toolId(t) !== id);
      if (prev.length >= MAX_COMPARE) return prev; // full — ignore until a slot frees up
      return [...prev, tool];
    });
  }, []);

  const removeFromCompare = useCallback((tool) => {
    const id = toolId(tool);
    setCompareList((prev) => prev.filter((t) => toolId(t) !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    setModalOpen(false);
  }, []);

  const openCompareModal = useCallback(() => setModalOpen(true), []);
  const closeCompareModal = useCallback(() => setModalOpen(false), []);

  const value = useMemo(
    () => ({
      compareList,
      isComparing,
      toggleCompare,
      removeFromCompare,
      clearCompare,
      isCompareFull: compareList.length >= MAX_COMPARE,
      maxCompare: MAX_COMPARE,
      modalOpen,
      openCompareModal,
      closeCompareModal,
    }),
    [compareList, isComparing, toggleCompare, removeFromCompare, clearCompare, modalOpen, openCompareModal, closeCompareModal],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
