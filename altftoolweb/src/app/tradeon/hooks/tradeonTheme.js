// src/app/tradeon/hooks/tradeonTheme.js
"use client";

import { createContext, useContext } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const TradeonThemeContext = createContext({
  theme: "light",
  themeMode: "system",
  mounted: true,
  toggle: () => {},
  setTheme: () => {},
});

export function TradeonThemeProvider({ children }) {
  const { resolvedTheme, themeMode, setThemeMode, toggleTheme } = useTheme();

  return (
    <TradeonThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeMode,
        mounted: true,
        toggle: toggleTheme,
        setTheme: setThemeMode,
      }}
    >
      <div className="tradeon-shell" data-tradeon-theme={resolvedTheme}>
        {children}
      </div>
    </TradeonThemeContext.Provider>
  );
}

export const useTradeonTheme = () => useContext(TradeonThemeContext);
