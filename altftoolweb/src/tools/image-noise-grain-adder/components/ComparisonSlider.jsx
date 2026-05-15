"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ComparisonSlider({ children, show }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const newPos = ((x - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, newPos)));
  };

  if (!show) return <>{children}</>;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full cursor-col-resize select-none overflow-hidden rounded-xl"
      onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
      onTouchMove={handleMove}
      onMouseDown={handleMove}
    >
      {/* Before (Original) - will be implemented by the child canvas if possible, 
          but for simplicity, we'll use CSS clip-path or two canvases.
          Actually, it's better if the ImageCanvas handles the split.
      */}
      {children}
      
      {/* The slider line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-30 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-blue-500">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-blue-500 rounded-full" />
            <div className="w-0.5 h-3 bg-blue-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
