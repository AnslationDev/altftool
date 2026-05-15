"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function ComparisonSlider({ position, setPosition, children }) {
  const containerRef = useRef(null);

  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const newPos = ((x - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, newPos)));
  }, [setPosition]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full cursor-col-resize select-none overflow-hidden rounded-2xl border border-(--border) bg-(--card)"
      onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
      onTouchMove={handleMove}
      onMouseDown={handleMove}
    >
      {/* Content */}
      <div className="w-full h-full pointer-events-none">
        {children}
      </div>
      
      {/* The slider line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.5)] z-30 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center border-2 border-white/30 group">
          <div className="flex gap-1">
            <motion.div 
              animate={{ height: [8, 14, 8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
            />
            <motion.div 
              animate={{ height: [14, 8, 14] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
            />
          </div>
          
          {/* Labels */}
          <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[9px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Slide to Compare
          </div>
        </div>
      </div>

      {/* Side Labels */}
      <div className="absolute top-4 left-4 z-40 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
          Original
        </div>
      </div>
      <div className="absolute top-4 right-4 z-40 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/40 backdrop-blur-md border border-blue-400/20 text-white text-[10px] font-bold uppercase tracking-wider">
          Simulated
        </div>
      </div>
    </div>
  );
}
