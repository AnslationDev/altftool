// src/app/live-activity-simulation/layout.jsx
"use client";

import "./index.css";
import { useEffect } from "react";

export default function LiveActivitySimulationLayout({ children }) {
  useEffect(() => {
    // Add the active class to body to hide the global header/footer via CSS without DOM attribute mutation
    document.body.classList.add("hide-global-header-active");

    return () => {
      // Clean up class on layout unmount to restore the global header/footer on other routes
      document.body.classList.remove("hide-global-header-active");
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--playful-paper)] text-slate-800 font-sans">
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
