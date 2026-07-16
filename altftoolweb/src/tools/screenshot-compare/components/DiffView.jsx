"use client";
import { useState, useCallback, useEffect } from "react";

export default function DiffView({ image1Url, image2Url, diffResult, sliderPos, onSliderChange, containerRef }) {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState("overlay");

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    onSliderChange({ target: { value: Math.max(0, Math.min(100, percent)) } });
  }, [isDragging, containerRef, onSliderChange]);

  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percent = (x / rect.width) * 100;
    onSliderChange({ target: { value: Math.max(0, Math.min(100, percent)) } });
  }, [containerRef, onSliderChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setMode("overlay")}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
            mode === "overlay"
              ? "bg-(--primary) text-(--primary-foreground) shadow-md"
              : "border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          Dim Overlay
        </button>
        <button
          onClick={() => setMode("diff-only")}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
            mode === "diff-only"
              ? "bg-(--primary) text-(--primary-foreground) shadow-md"
              : "border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          Diff Only
        </button>
        <button
          onClick={() => setMode("slider")}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
            mode === "slider"
              ? "bg-(--primary) text-(--primary-foreground) shadow-md"
              : "border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          Diff Slider
        </button>
      </div>

      {mode === "diff-only" && diffResult?.diffUrl && (
        <div className="rounded-xl border border-(--border) shadow-md overflow-hidden bg-(--card)">
          <img src={diffResult.diffUrl} alt="Pixel diff" className="w-full h-auto object-contain max-h-[70vh]" />
        </div>
      )}

      {mode === "overlay" && diffResult?.overlayUrl && (
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-xl border border-(--border) shadow-md select-none bg-(--muted)"
          style={{ minHeight: 300, maxHeight: "70vh", aspectRatio: "16/9" }}
          onMouseDown={handleMouseDown}
          onTouchMove={handleTouchMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          <img
            src={image1Url}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={diffResult.overlayUrl}
              alt="Diff overlay"
              className="absolute top-0 left-0 w-full h-full object-contain max-w-none"
              style={{ width: `${100 / (sliderPos / 100)}%`, minWidth: "100%" }}
              draggable={false}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-col-resize"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-(--border)">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">Original</div>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">Diff</div>
        </div>
      )}

      {mode === "slider" && (
        <>
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-xl border border-(--border) shadow-md select-none bg-(--muted)"
            style={{ minHeight: 300, maxHeight: "70vh", aspectRatio: "16/9" }}
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
          >
            <img
              src={image1Url}
              alt="Original"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={image2Url}
                alt="New"
                className="absolute top-0 left-0 w-full h-full object-contain max-w-none"
                style={{ width: `${100 / (sliderPos / 100)}%`, minWidth: "100%" }}
                draggable={false}
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-col-resize"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-(--border)">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">Original</div>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">New</div>
          </div>
          <div className="px-1">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={onSliderChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-(--border) accent-(--primary)"
            />
          </div>
        </>
      )}

      {diffResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-(--border) bg-(--card) p-3 text-center">
            <div className="text-2xl font-bold text-(--foreground)">{diffResult.diffPercent.toFixed(1)}%</div>
            <div className="text-xs text-(--muted-foreground) mt-1">Difference</div>
          </div>
          <div className="rounded-lg border border-(--border) bg-(--card) p-3 text-center">
            <div className="text-2xl font-bold text-(--foreground)">{diffResult.changedPixels.toLocaleString()}</div>
            <div className="text-xs text-(--muted-foreground) mt-1">Changed Pixels</div>
          </div>
          <div className="rounded-lg border border-(--border) bg-(--card) p-3 text-center">
            <div className="text-2xl font-bold text-(--foreground">{diffResult.totalPixels.toLocaleString()}</div>
            <div className="text-xs text-(--muted-foreground) mt-1">Total Pixels</div>
          </div>
          <div className="rounded-lg border border-(--border) bg-(--card) p-3 text-center">
            <div className="text-2xl font-bold text-(--foreground">{diffResult.width}&times;{diffResult.height}</div>
            <div className="text-xs text-(--muted-foreground) mt-1">Dimensions</div>
          </div>
        </div>
      )}
    </div>
  );
}
