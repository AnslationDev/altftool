"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isManual, setIsManual] = useState(false);
  const [mounted, setMounted] = useState(false);




  // Initial load: system → stored manual
  useEffect(() => {
    const storedTheme = localStorage.getItem("appTheme");
    const storedManual = localStorage.getItem("themeManual") === "true";

    if (storedTheme && storedManual) {
      setTheme(storedTheme);
      setIsManual(true);
    } else {
      setTheme(getSystemTheme());
    }
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Listen to OS changes ONLY if not manual
  useEffect(() => {
    if (isManual) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(getSystemTheme());

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [isManual]);

  const toggleTheme = () => {
    setIsManual(true);

    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("appTheme", next);
      localStorage.setItem("themeManual", "true");
      return next;
    });
  };

  useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return null;
}

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
