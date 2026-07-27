"use client";

import { useState } from "react";
import { Eye, Sliders, Columns2, Layers } from "lucide-react";

export default function VisualComparisonTab({ docA, docB }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [visualMode, setVisualMode] = useState("split"); // split, overlay, side-by-side

  if (!docA || !docB) return null;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Visual Comparison Viewer
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Split slider, visual overlay, and side-by-side page alignment
          </p>
        </div>

        {/* Visual View Selector */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
          <button
            onClick={() => setVisualMode("split")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              visualMode === "split" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Split Slider
          </button>
          <button
            onClick={() => setVisualMode("overlay")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              visualMode === "overlay" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Overlay Mode
          </button>
          <button
            onClick={() => setVisualMode("side-by-side")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              visualMode === "side-by-side" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Split Slider Controls */}
      {visualMode === "split" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500">Split Position: {sliderPos}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
          </div>

          <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 p-6">
            {/* Base Document A */}
            <div className="absolute inset-0 p-8 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200">
              <div className="font-bold text-indigo-600 mb-2">Original: {docA.name}</div>
              <pre className="whitespace-pre-wrap">{docA.text}</pre>
            </div>

            {/* Clipped Overlay Document B */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden bg-slate-900 text-slate-100 border-r-2 border-indigo-500 shadow-2xl transition-all"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="p-8 w-full font-mono text-xs overflow-y-auto h-full">
                <div className="font-bold text-emerald-400 mb-2">Updated: {docB.name}</div>
                <pre className="whitespace-pre-wrap">{docB.text}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Opacity Controls */}
      {visualMode === "overlay" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500">Overlay Opacity: {overlayOpacity}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
          </div>

          <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 p-6">
            <div className="absolute inset-0 p-8 overflow-y-auto font-mono text-xs text-indigo-600 dark:text-indigo-400">
              <pre className="whitespace-pre-wrap">{docA.text}</pre>
            </div>
            <div
              className="absolute inset-0 p-8 overflow-y-auto font-mono text-xs text-emerald-500 transition-opacity"
              style={{ opacity: overlayOpacity / 100 }}
            >
              <pre className="whitespace-pre-wrap">{docB.text}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Render */}
      {visualMode === "side-by-side" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 max-h-[500px] overflow-y-auto font-mono text-xs">
            <h4 className="font-bold text-indigo-600 mb-3">{docA.name}</h4>
            <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{docA.text}</pre>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 max-h-[500px] overflow-y-auto font-mono text-xs">
            <h4 className="font-bold text-emerald-600 mb-3">{docB.name}</h4>
            <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{docB.text}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
