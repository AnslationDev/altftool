// src/app/flightradar/layout.jsx
"use client";

import "./flightradar.css";
import { useEffect } from "react";

export default function FlightRadarLayout({ children }) {
  useEffect(() => {
    document.body.classList.add("hide-global-header-active");

    return () => {
      document.body.classList.remove("hide-global-header-active");
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
