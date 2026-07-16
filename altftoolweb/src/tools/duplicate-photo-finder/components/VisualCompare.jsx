"use client";
import React, { useState } from "react";
import {
  Sliders,
  Columns,
  Info,
  X,
  Scan,
} from "lucide-react";

export default function VisualCompare({ imgA, imgB, titleA, titleB, onClose }) {
  const [viewMode, setViewMode] = useState("slider");
  const [sliderPos, setSliderPos] = useState(50);

  const handleSliderDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, x)));
  };

  const modes = [
    { id: "slider", label: "Before / After Slider", icon: Sliders, description: "Drag the divider to compare halves" },
    { id: "sidebyside", label: "Side-by-Side", icon: Columns, description: "View images next to each other" },
    { id: "difference", label: "Difference Heatmap", icon: Scan, description: "Overlay with blend modes to spot changes" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Visual comparison modal"
    >
      <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="font-extrabold text-sm text-foreground">Visual Compare</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pixel-level image comparison</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all"
            aria-label="Close comparison"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex bg-secondary/30 border-b border-border p-2 gap-2 overflow-x-auto" role="tablist">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              role="tab"
              aria-selected={viewMode === mode.id}
              aria-label={mode.description}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                viewMode === mode.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <mode.icon className="w-3.5 h-3.5" aria-hidden="true" />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex items-center justify-center bg-secondary/10 min-h-[300px]">
          {viewMode === "slider" && (
            <div
              className="relative w-full aspect-video max-w-2xl border border-border rounded-xl overflow-hidden cursor-ew-resize select-none bg-black"
              onMouseMove={handleSliderDrag}
              role="slider"
              aria-label="Comparison slider"
              aria-valuenow={sliderPos}
            >
              <img src={imgA} alt={titleA} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
              >
                <img src={imgB} alt={titleB} className="absolute inset-0 w-full h-full object-contain" />
              </div>
              <div className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                  <Sliders className="w-3 h-3" aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          {viewMode === "sidebyside" && (
            <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
              <div className="space-y-2 text-center">
                <div className="aspect-square bg-black rounded-xl overflow-hidden border border-border">
                  <img src={imgA} alt={titleA} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] text-muted-foreground truncate block font-bold">{titleA}</span>
              </div>
              <div className="space-y-2 text-center">
                <div className="aspect-square bg-black rounded-xl overflow-hidden border border-border">
                  <img src={imgB} alt={titleB} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] text-muted-foreground truncate block font-bold">{titleB}</span>
              </div>
            </div>
          )}

          {viewMode === "difference" && (
            <div className="relative w-full aspect-video max-w-2xl border border-border rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img src={imgA} alt={titleA} className="absolute inset-0 w-full h-full object-contain" />
              <img
                src={imgB}
                alt={titleB}
                className="absolute inset-0 w-full h-full object-contain mix-blend-difference opacity-90 filter invert pointer-events-none"
              />
              <div className="absolute bottom-3 left-3 bg-black/80 text-white text-[9px] font-mono px-2.5 py-1 rounded border border-white/10 flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400" aria-hidden="true" />
                Glowing pixels highlight differences
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
