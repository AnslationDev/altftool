"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const SYSTEM_THEME_MODE = "system";
export const LIGHT_THEME_MODE = "light";
export const DARK_THEME_MODE = "dark";
export const THEME_MODE_STORAGE_KEY = "appThemeMode";

const LEGACY_THEME_KEY = "appTheme";
const LEGACY_MANUAL_KEY = "themeManual";
const VALID_THEME_MODES = new Set([
  SYSTEM_THEME_MODE,
  LIGHT_THEME_MODE,
  DARK_THEME_MODE,
]);

const ThemeModeContext = createContext({
  theme: LIGHT_THEME_MODE,
  resolvedTheme: LIGHT_THEME_MODE,
  themeMode: SYSTEM_THEME_MODE,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return LIGHT_THEME_MODE;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME_MODE
    : LIGHT_THEME_MODE;
}

function resolveTheme(mode) {
  return mode === SYSTEM_THEME_MODE ? getSystemTheme() : mode;
}

function getStoredThemeMode() {
  if (typeof window === "undefined") return SYSTEM_THEME_MODE;

  try {
    const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (VALID_THEME_MODES.has(storedMode)) return storedMode;

    const manual = localStorage.getItem(LEGACY_MANUAL_KEY) === "true";
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
    if (manual && VALID_THEME_MODES.has(legacyTheme)) return legacyTheme;
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  return SYSTEM_THEME_MODE;
}

function persistThemeMode(mode) {
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);

    if (mode === SYSTEM_THEME_MODE) {
      localStorage.removeItem(LEGACY_THEME_KEY);
      localStorage.removeItem(LEGACY_MANUAL_KEY);
      return;
    }

    localStorage.setItem(LEGACY_THEME_KEY, mode);
    localStorage.setItem(LEGACY_MANUAL_KEY, "true");
  } catch {
    // Theme selection still applies for the current page without storage.
  }
}

function applyTheme(mode) {
  const resolvedTheme = resolveTheme(mode);

  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.setAttribute("data-theme-mode", mode);
  document.documentElement.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(SYSTEM_THEME_MODE);
  const [resolvedTheme, setResolvedTheme] = useState(LIGHT_THEME_MODE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedMode = getStoredThemeMode();
    persistThemeMode(storedMode);
    setThemeModeState(storedMode);
    setResolvedTheme(applyTheme(storedMode));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return undefined;

    const syncTheme = () => {
      setResolvedTheme(applyTheme(themeMode));
    };

    syncTheme();

    if (themeMode !== SYSTEM_THEME_MODE || !window.matchMedia) {
      return undefined;
    }

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

  const setThemeMode = useCallback((nextMode) => {
    if (!VALID_THEME_MODES.has(nextMode)) return;

    persistThemeMode(nextMode);
    setThemeModeState(nextMode);
    setResolvedTheme(applyTheme(nextMode));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(
      resolvedTheme === DARK_THEME_MODE ? LIGHT_THEME_MODE : DARK_THEME_MODE,
    );
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
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
