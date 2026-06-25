"use client";

import React from "react";
import { Coffee, Upload } from "lucide-react";
import { motion } from "framer-motion";
import "../style/HeroSection.css";

export default function HeroSection({ onStartPlaying, onOpenSubmit, onOpenSupport }) {
  return (
    <section className="relative w-full h-[92vh] flex flex-col justify-between p-6 sm:p-12 overflow-hidden bg-black">

      {/* Local animated background mesh and texture overlay */}
      <div className="absolute inset-0 windowswap-hero-mesh opacity-70 z-0" />
      <div className="absolute inset-0 windowswap-radial-glow z-0 animate-pulse duration-[8000ms]" />
      <img
        src="/windowswap-assets/hero section background.gif"
        alt="Immersive ambient window loop"
        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 select-none pointer-events-none"
      />

      {/* Hero Header Navbar */}
      <header className="relative w-full flex items-center justify-between z-10">

        {/* Left links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide text-windowswap-cream">
          <button
            onClick={onOpenSupport}
            className="bg-windowswap-terracotta hover:bg-[#b05434] text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
          >
            <Coffee className="h-3 w-3" /> Buy us a coffee
          </button>

          <button onClick={onOpenSubmit} className="hover:text-white transition duration-200 cursor-pointer">Contact</button>

        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <span className="font-serif text-2xl md:text-3xl tracking-[0.25em] font-medium text-white hover:opacity-95 transition-opacity cursor-pointer">
            WindowSwap
          </span>
        </div>

        {/* Right links */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium tracking-wide text-windowswap-cream">

          <button
            onClick={onOpenSubmit}
            className="bg-white hover:bg-zinc-100 text-zinc-950 px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 font-semibold shadow-md flex items-center gap-1 text-xs cursor-pointer"
          >
            <Upload className="h-3 w-3" /> Submit
          </button>
        </div>

      </header>

      {/* Central Immersive CTA Trigger */}
      <div className="relative flex-1 flex flex-col justify-center items-center z-10 text-center px-4">
        <motion.button
          onClick={onStartPlaying}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="group relative px-8 py-5 border border-white/60 hover:border-white rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 shadow-[0_0_40px_-5px_rgba(255,255,255,0.05)] cursor-pointer"
        >
          <span className="font-serif text-lg md:text-2xl tracking-[0.05em] font-light text-white flex items-center gap-3">
            Open a window somewhere in the world
          </span>
          <div className="absolute inset-0 rounded-full border border-transparent group-hover:border-white/20 transition-colors pointer-events-none" />
        </motion.button>

        <p className="mt-6 text-windowswap-cream/75 font-serif text-sm italic tracking-wide">
          Share your view. Travel without moving.
        </p>
      </div>

      {/* Bottom info credits row */}


    </section>
  );
}
