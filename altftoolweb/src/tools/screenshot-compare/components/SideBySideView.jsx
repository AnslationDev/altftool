"use client";
import { useRef, useState, useCallback, useEffect } from "react";

export default function SideBySideView({ image1Url, image2Url }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs text-(--muted-foreground)">Zoom:</span>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-32 h-1.5 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
        />
        <span className="text-xs text-(--foreground) font-medium w-10">{zoom.toFixed(1)}x</span>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="text-xs px-2 py-1 rounded border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) cursor-pointer"
        >
          Reset
        </button>
      </div>
      <div
        ref={containerRef}
        className="grid grid-cols-2 gap-2 rounded-xl border border-(--border) bg-(--card) p-2 overflow-hidden"
      >
        <div
          className="overflow-hidden rounded-lg bg-(--muted) cursor-grab active:cursor-grabbing"
          style={{ maxHeight: "60vh" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <img
            src={image1Url}
            alt="Screenshot 1"
            className="w-full h-full object-contain transition-transform"
            style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
            draggable={false}
          />
        </div>
        <div
          className="overflow-hidden rounded-lg bg-(--muted) cursor-grab active:cursor-grabbing"
          style={{ maxHeight: "60vh" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <img
            src={image2Url}
            alt="Screenshot 2"
            className="w-full h-full object-contain transition-transform"
            style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
