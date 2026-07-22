// src/app/tradeon/layout.jsx
"use client";

import "./tradeon.css";
import { useEffect } from "react";
import { TradeonThemeProvider } from "./hooks/tradeonTheme";

export default function TradeonLayout({ children }) {
  useEffect(() => {
    // Belt-and-suspenders: the GlobalChromeGate already removes AltFTool's
    // header/footer for /tradeon; this class hides any legacy global chrome too.
    document.body.classList.add("hide-global-header-active", "tradeon-active");
    return () => {
      document.body.classList.remove("hide-global-header-active", "tradeon-active");
    };
  }, []);

  // The scoped wrapper maps the global system/light/dark preference to Tradeon.
  return <TradeonThemeProvider>{children}</TradeonThemeProvider>;
}
