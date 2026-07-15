"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Columns2, Blend, MoveHorizontal } from "lucide-react";

const modes = [
  { key: "side-by-side", icon: Columns2, label: "Side by Side" },
  { key: "overlay", icon: Blend, label: "Overlay" },
  { key: "slider", icon: MoveHorizontal, label: "Slider" },
];

export default function ComparisonViewer({ imageA, imageB, mode, onModeChange }) {
  const [opacity, setOpacity] = useState(50);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleSliderMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging.current) handleSliderMove(e.clientX);
    };
    const handleTouchMove = (e) => {
      if (isDragging.current) handleSliderMove(e.touches[0].clientX);
    };
    const handleUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [handleSliderMove]);

  if (!imageA || !imageB) return null;

  const renderSideBySide = () => (
    <div className="grid grid-cols-2 gap-2">
      <div className="overflow-hidden rounded-xl border border-(--border)">
        <img src={imageA} alt="Image A" className="h-full w-full object-contain" />
      </div>
      <div className="overflow-hidden rounded-xl border border-(--border)">
        <img src={imageB} alt="Image B" className="h-full w-full object-contain" />
      </div>
    </div>
  );

  const renderOverlay = () => (
    <div className="relative overflow-hidden rounded-xl border border-(--border)">
      <img src={imageA} alt="Image A" className="w-full object-contain" />
      <div className="absolute inset-0" style={{ opacity: opacity / 100 }}>
        <img src={imageB} alt="Image B" className="w-full object-contain" />
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-3 rounded-lg bg-(--card)/80 px-3 py-2 backdrop-blur-sm">
          <span className="text-[11px] font-medium text-(--muted-foreground)">Blend</span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="flex-1 accent-(--primary)"
          />
          <span className="text-[11px] font-medium text-(--foreground)">{opacity}%</span>
        </div>
      </div>
    </div>
  );

  const renderSlider = () => (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-(--border) cursor-col-resize select-none"
      style={{ touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <img src={imageA} alt="Image A" className="w-full object-contain" draggable={false} />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={imageB}
          alt="Image B"
          className="absolute top-0 left-0 h-full w-full object-contain"
          draggable={false}
          style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: "none" }}
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-(--foreground) shadow-lg"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-(--card) border-2 border-(--foreground) shadow-md">
          <MoveHorizontal size={14} className="text-(--foreground)" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 rounded-xl bg-(--muted) p-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onModeChange(m.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-(--card) text-(--foreground) shadow-sm"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              <Icon size={14} />
              {m.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {mode === "side-by-side" && renderSideBySide()}
          {mode === "overlay" && renderOverlay()}
          {mode === "slider" && renderSlider()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
