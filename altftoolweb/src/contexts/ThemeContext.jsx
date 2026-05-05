"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

const getSystemTheme = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isManual, setIsManual] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("appTheme");
    const storedManual = localStorage.getItem("themeManual") === "true";
    const nextTheme = storedTheme && storedManual ? storedTheme : getSystemTheme();

    setIsManual(storedManual);
    setTheme(nextTheme);
    setHydrated(true);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [hydrated, theme]);

  // Listen to OS changes ONLY if not manual
  useEffect(() => {
    if (!hydrated) return;
    if (isManual) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(getSystemTheme());

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [hydrated, isManual]);

  const toggleTheme = () => {
    setIsManual(true);

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
