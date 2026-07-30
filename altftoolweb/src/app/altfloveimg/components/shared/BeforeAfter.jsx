"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MoveHorizontal } from "lucide-react";

/** Drag-to-compare before/after slider. */
export default function BeforeAfter({ before, after, beforeLabel = "Original", afterLabel = "Result" }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(50);
  const [boxW, setBoxW] = useState(0);
  const dragging = useRef(false);

  const measure = useCallback(() => {
    if (ref.current) setBoxW(ref.current.clientWidth);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const move = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  const handleKeyDown = useCallback((e) => {
    const STEP = 5;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setPos((p) => Math.max(0, p - STEP));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setPos((p) => Math.min(100, p + STEP));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(100);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full select-none overflow-hidden rounded-2xl ali-checker"
      style={{ touchAction: "none", cursor: "ew-resize" }}
      tabIndex={0}
      role="slider"
      aria-label="Comparison position"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      aria-valuetext={`${Math.round(pos)}% ${beforeLabel}, ${Math.round(100 - pos)}% ${afterLabel}`}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => { dragging.current = true; move(e.clientX); }}
      onMouseMove={(e) => dragging.current && move(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchStart={(e) => move(e.touches[0].clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      <img src={after} alt={afterLabel} className="block w-full" draggable={false} onLoad={measure} />
      <div className="absolute inset-0 overflow-hidden ali-checker" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={beforeLabel}
          className="block h-full object-cover"
          draggable={false}
          style={{ width: boxW || "100%", maxWidth: "none" }}
        />
        <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
          {beforeLabel}
        </span>
      </div>
      <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {afterLabel}
      </span>
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-lg">
          <MoveHorizontal size={18} />
        </div>
      </div>
    </div>
  );
}
