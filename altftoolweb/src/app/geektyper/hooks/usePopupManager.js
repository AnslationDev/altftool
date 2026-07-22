"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const PopupContext = createContext();

export function PopupProvider({ children }) {
  const [activePopups, setActivePopups] = useState([]);

  const showPopup = useCallback((moduleId, x, y) => {
    const newPopup = {
      id: `${moduleId}-${Date.now()}`,
      moduleId,
      x: x || 100,
      y: y || 80,
    };
    setActivePopups((prev) => [...prev, newPopup]);
  }, []);

  const closePopup = useCallback((popupId) => {
    setActivePopups((prev) => prev.filter((p) => p.id !== popupId));
  }, []);

  return (
    <PopupContext.Provider value={{ activePopups, showPopup, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopupManager() {
  const context = useContext(PopupContext);
  if (!context)
    throw new Error("usePopupManager must be used within PopupProvider");
  return context;
}
