"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SYSTEM_MODE = "system";
const LIGHT_MODE = "light";
const DARK_MODE = "dark";
const THEME_MODE_KEY = "appThemeMode";
const LEGACY_THEME_KEY = "appTheme";
const LEGACY_MANUAL_KEY = "themeManual";
const VALID_THEME_MODES = new Set([SYSTEM_MODE, LIGHT_MODE, DARK_MODE]);

const AdminThemeContext = createContext({
  resolvedTheme: LIGHT_MODE,
  themeMode: SYSTEM_MODE,
  setThemeMode: () => {},
});

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return LIGHT_MODE;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_MODE
    : LIGHT_MODE;
}

function resolveTheme(mode) {
  return mode === SYSTEM_MODE ? getSystemTheme() : mode;
}

function getStoredThemeMode() {
  if (typeof window === "undefined") return SYSTEM_MODE;

  try {
    const storedMode = localStorage.getItem(THEME_MODE_KEY);
    if (VALID_THEME_MODES.has(storedMode)) return storedMode;

    const manual = localStorage.getItem(LEGACY_MANUAL_KEY) === "true";
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
    if (manual && VALID_THEME_MODES.has(legacyTheme)) return legacyTheme;
  } catch (_) {}

  return SYSTEM_MODE;
}

function persistThemeMode(mode) {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);

    if (mode === SYSTEM_MODE) {
      localStorage.removeItem(LEGACY_THEME_KEY);
      localStorage.removeItem(LEGACY_MANUAL_KEY);
      return;
    }

    localStorage.setItem(LEGACY_THEME_KEY, mode);
    localStorage.setItem(LEGACY_MANUAL_KEY, "true");
  } catch (_) {}
}

function applyTheme(mode) {
  const resolvedTheme = resolveTheme(mode);

  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.setAttribute("data-theme-mode", mode);
  document.documentElement.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

export function AdminThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(SYSTEM_MODE);
  const [resolvedTheme, setResolvedTheme] = useState(LIGHT_MODE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedMode = getStoredThemeMode();
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

    if (themeMode !== SYSTEM_MODE || !window.matchMedia) return undefined;

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
    setResolvedTheme(applyTheme(nextThemeMode));
  }, []);

  const value = useMemo(
    () => ({
      resolvedTheme,
      themeMode,
      setThemeMode,
    }),
    [resolvedTheme, setThemeMode, themeMode],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => useContext(AdminThemeContext);
