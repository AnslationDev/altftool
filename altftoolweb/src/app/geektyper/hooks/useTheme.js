"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { INDUSTRIAL_MATRIX } from "../data/INDUSTRIAL_MATRIX";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState("militech");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("geek2_theme");
    if (saved && INDUSTRIAL_MATRIX[saved]) {
      setCurrentTheme(saved);
    }
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem("geek2_theme", currentTheme);
  }, [currentTheme]);

  const themeConfig =
    INDUSTRIAL_MATRIX[currentTheme] || INDUSTRIAL_MATRIX.militech;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        themeConfig,
        themes: INDUSTRIAL_MATRIX,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
