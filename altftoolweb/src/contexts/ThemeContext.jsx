"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

const DEFAULT_THEME = "dark";
const VALID_THEMES = new Set(["dark", "light"]);

const getStoredTheme = () => {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const storedTheme = localStorage.getItem("appTheme");
  const storedManual = localStorage.getItem("themeManual") === "true";

  return storedManual && VALID_THEMES.has(storedTheme) ? storedTheme : DEFAULT_THEME;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [hydrated, theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("appTheme", next);
      localStorage.setItem("themeManual", "true");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
