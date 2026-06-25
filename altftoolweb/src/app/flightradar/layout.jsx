// src/app/flightradar/layout.jsx
"use client";

import "./flightradar.css";
import { useEffect } from "react";

export default function FlightRadarLayout({ children }) {
  useEffect(() => {
    // Add the active class to body to hide the global header via CSS without DOM attribute mutation
    document.body.classList.add("hide-global-header-active");

    return () => {
      // Clean up class on layout unmount to restore the global header on other routes
      document.body.classList.remove("hide-global-header-active");
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-rice text-loam font-sans">
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
