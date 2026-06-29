// src/app/flightradar/layout.jsx
"use client";

import "./flightradar.css";
import { useEffect } from "react";

export default function FlightRadarLayout({ children }) {
  useEffect(() => {
    document.body.classList.add("hide-global-header-active");

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = (isDark) => {
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    };
    applyTheme(mq.matches);
    mq.addEventListener("change", (e) => applyTheme(e.matches));

    return () => {
      document.body.classList.remove("hide-global-header-active");
      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-card text-foreground font-sans">
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
