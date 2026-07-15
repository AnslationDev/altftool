"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export default function BeforeAfterSlider({ before, after }) {
  const containerRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => setDragging(true);
  const handleTouchStart = () => setDragging(true);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const cx = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
      updatePosition(cx);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, updatePosition]);

  if (!before && !after) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-(--border) bg-(--card)">
        <p className="text-xs text-(--muted-foreground)">Upload an image to compare</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-xs font-medium text-(--muted-foreground)">
        Drag the slider to compare before and after
      </p>
      <div
        ref={containerRef}
        className={`relative mx-auto h-64 max-w-lg cursor-ew-resize overflow-hidden rounded-xl border border-(--border) bg-(--muted) select-none sm:h-80 ${
          dragging ? "cursor-ew-resize" : ""
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label="Before and after comparison slider"
        aria-valuenow={Math.round(sliderPos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setSliderPos((p) => Math.min(p + 2, 100));
          if (e.key === "ArrowLeft") setSliderPos((p) => Math.max(p - 2, 0));
        }}
      >
        <img
          src={after}
          alt="Processed result"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={before}
            alt="Original photo"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ width: `${100 / (sliderPos / 100)}%` }}
            draggable={false}
          />
        </div>
        <div
          className="absolute inset-y-0 flex items-center"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="h-full w-0.5 bg-white shadow-md" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 3L2 7L5 11" stroke="#607083" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 3L12 7L9 11" stroke="#607083" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
          Original
        </div>
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
          Result
        </div>
      </div>
    </div>
  );
}
