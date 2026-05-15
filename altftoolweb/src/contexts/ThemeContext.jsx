"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext({
  theme: "light",
  resolvedTheme: "light",
  themeMode: "system",
  setThemeMode: () => {},
  toggleTheme: () => {},
});

const DEFAULT_THEME_MODE = "system";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";
const THEME_MODE_KEY = "appThemeMode";
const LEGACY_THEME_KEY = "appTheme";
const LEGACY_MANUAL_KEY = "themeManual";
const VALID_THEME_MODES = new Set([DEFAULT_THEME_MODE, LIGHT_THEME, DARK_THEME]);

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) return LIGHT_THEME;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME
    : LIGHT_THEME;
};

const resolveTheme = (mode) =>
  mode === DEFAULT_THEME_MODE ? getSystemTheme() : mode;

const getStoredThemeMode = () => {
  if (typeof window === "undefined") return DEFAULT_THEME_MODE;

  try {
    const storedMode = localStorage.getItem(THEME_MODE_KEY);

    return VALID_THEME_MODES.has(storedMode) ? storedMode : DEFAULT_THEME_MODE;
  } catch (_) {
    return DEFAULT_THEME_MODE;
  }
};

const persistThemeMode = (mode) => {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);

    if (mode === DEFAULT_THEME_MODE) {
      localStorage.removeItem(LEGACY_THEME_KEY);
      localStorage.removeItem(LEGACY_MANUAL_KEY);
      return;
    }

    localStorage.setItem(LEGACY_THEME_KEY, mode);
    localStorage.setItem(LEGACY_MANUAL_KEY, "true");
  } catch (_) {}
};

const applyThemeToDocument = (mode) => {
  const resolvedTheme = resolveTheme(mode);

  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.setAttribute("data-theme-mode", mode);
  document.documentElement.style.colorScheme = resolvedTheme;

  return resolvedTheme;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(DEFAULT_THEME_MODE);
  const [resolvedTheme, setResolvedTheme] = useState(LIGHT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedThemeMode = getStoredThemeMode();

    setThemeModeState(storedThemeMode);
    setResolvedTheme(applyThemeToDocument(storedThemeMode));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const syncTheme = () => {
      setResolvedTheme(applyThemeToDocument(themeMode));
    };

    syncTheme();

    if (themeMode !== DEFAULT_THEME_MODE || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncTheme);
    } else {
      mediaQuery.addListener?.(syncTheme);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", syncTheme);
      } else {
        mediaQuery.removeListener?.(syncTheme);
      }
    };
  }, [hydrated, themeMode]);

  const setThemeMode = useCallback((nextThemeMode) => {
    if (!VALID_THEME_MODES.has(nextThemeMode)) return;

    persistThemeMode(nextThemeMode);
    setThemeModeState(nextThemeMode);
    setResolvedTheme(applyThemeToDocument(nextThemeMode));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(resolvedTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME);
  }, [resolvedTheme, setThemeMode]);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      resolvedTheme,
      themeMode,
      setThemeMode,
      toggleTheme,
    }),
    [resolvedTheme, setThemeMode, themeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
