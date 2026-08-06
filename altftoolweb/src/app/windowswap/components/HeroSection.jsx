"use client";

import React from "react";
import { Coffee, Upload, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import "../style/HeroSection.css";

export default function HeroSection({ onStartPlaying, onOpenSubmit, onOpenSupport }) {
  const { resolvedTheme, setThemeMode } = useTheme();
  const isDark = resolvedTheme === "dark";
  const ThemeIcon = isDark ? Moon : Sun;
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between p-6 sm:p-12 overflow-hidden bg-primary">

      {/* Local animated background mesh and texture overlay */}
      <div className="absolute inset-0 windowswap-hero-mesh z-0" />
      <img
        src="/windowswap-assets/hero section background.webp"
        alt="Immersive ambient window loop"
        className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
      />
      <div className="absolute inset-0 windowswap-radial-glow z-0 animate-pulse duration-[8000ms]" />
      <div className="absolute inset-0 windowswap-hero-contrast z-0" />

      {/* Hero Header Navbar */}
      <header className="relative w-full flex items-center justify-between z-10">

        {/* Left links */}
        <div className="windowswap-hero-nav-text hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide text-white">
          <button
            onClick={onOpenSupport}
            className="windowswap-primary-button px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
          >
            <Coffee className="h-3 w-3" /> Payments unavailable
          </button>

          <button onClick={onOpenSubmit} className="hover:text-white transition duration-200 cursor-pointer">Window draft</button>

        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <span className="windowswap-hero-title font-display text-2xl md:text-3xl tracking-[0.25em] font-extrabold text-white hover:opacity-95 transition-opacity cursor-pointer">
            WindowSwap
          </span>
        </div>

        {/* Right links */}
        <div className="windowswap-hero-nav-text flex items-center gap-4 sm:gap-6 text-sm font-medium tracking-wide text-white">
          <button
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            className="windowswap-secondary-button p-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
            aria-label="Toggle Theme"
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenSubmit}
            className="windowswap-secondary-button px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 font-semibold flex items-center gap-1 text-xs cursor-pointer"
          >
            <Upload className="h-3 w-3" /> Save local draft
          </button>
        </div>

      </header>

      {/* Central Immersive CTA Trigger */}
      <div className="relative flex-1 flex flex-col justify-center items-center z-10 text-center px-4">
        <motion.button
          onClick={onStartPlaying}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="group relative px-8 py-5 rounded-full windowswap-glass text-white transition-all duration-300 cursor-pointer"
        >
          <span className="windowswap-hero-cta-text font-display text-lg md:text-2xl tracking-[0.05em] font-bold text-white flex items-center gap-3">
            Open a window somewhere in the world
          </span>
          <div className="absolute inset-0 rounded-full border border-transparent group-hover:border-white/20 transition-colors pointer-events-none" />
        </motion.button>

        <p className="windowswap-hero-subtitle mt-6 text-white font-sans text-sm font-semibold tracking-wide">
          Browse embedded views. Drafts stay only in this browser.
        </p>
      </div>

      {/* Bottom info credits row */}


    </section>
  );
}
