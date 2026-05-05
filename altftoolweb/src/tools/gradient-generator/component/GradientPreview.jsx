import { useState, useRef } from "react";
import ContrastChecker from "./ContrastChecker";

const SWATCHES = [
  "#6366f1","#8b5cf6","#ec4899","#f43f5e",
  "#f97316","#f59e0b","#10b981","#06b6d4",
  "#0ea5e9","#3b82f6","#000000","#ffffff",
];

export default function GradientPreview({ gradient, color1, color2, setColor1, setColor2 }) {
  const [dragColor, setDragColor] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const previewRef = useRef(null);

  const onSwatchDragStart = (color) => {
    setDragColor(color);
  };


  const onDropOnPreview = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!dragColor) return;

  
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;

    if (x < half) {
      setColor1(dragColor); 
    } else {
      setColor2(dragColor); 
    }
    setDragColor(null);
  };

  return (
    <div className="p-4 border border-(--border) rounded-xl shadow-sm">
      <h3 className="subheading mb-1">Live Preview</h3>
      <p className="text-xs text-(--foreground) mb-4">
       Pick a color from below and drop it onto the preview.
      </p>

      <div
        ref={previewRef}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDropOnPreview}
        className={`relative w-full h-64 rounded-xl border-2 transition-all ${
          isDragOver
            ? "border-blue-500 border-dashed scale-[1.01]"
            : "border-(--border)"
        }`}
        style={{ background: gradient }}
      >
  
        {isDragOver && (
          <>
            <div className="absolute left-0 top-0 w-1/2 h-full rounded-l-xl bg-black/20 flex items-center justify-center ">
              <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-lg">
                Color 1
              </span>
            </div>
            <div className="absolute right-0 top-0 w-1/2 h-full rounded-r-xl bg-black/20 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-lg">
                Color 2
              </span>
            </div>
          </>
        )}

        {/* Current colors badge */}
        {!isDragOver && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full">
              <div className="w-3 h-3 rounded-full border border-white" style={{ background: color1 }} />
              <span className="text-white text-xs">{color1}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full">
              <div className="w-3 h-3 rounded-full border border-white" style={{ background: color2 }} />
              <span className="text-white text-xs">{color2}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-(--foreground)">
          Pick any color and drop it onto the preview above.
        </p>
        <div className="flex flex-wrap gap-2">
          {SWATCHES.map((color) => (
            <div
              key={color}
              draggable
              onDragStart={() => onSwatchDragStart(color)}
              onDragEnd={() => setDragColor(null)}
              className={`w-8 h-8 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-transform hover:scale-110 active:scale-95 ${
                dragColor === color ? "border-blue-500 scale-110" : "border-(--border)"
              }`}
              style={{ background: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Manual change buttons */}
      <div className="flex gap-3 mt-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs border border-(--border) px-3 py-1.5 rounded-lg hover:bg-(--card) transition flex-1 justify-center">
          <div className=" hidden sm:inline-flex w-3.5 h-3.5 rounded-full border border-gray-300" style={{ background: color1 }} />
          Change Color 1
          <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="sr-only" />
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs border border-(--border) px-3 py-1.5 rounded-lg hover:bg-(--card) transition flex-1 justify-center">
          <div className="hidden sm:inline-flex w-3.5 h-3.5 rounded-full border border-gray-300" style={{ background: color2 }} />
          Change Color 2
          <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="sr-only" />
        </label>
      </div>
      <ContrastChecker gradient={gradient} color1={color1} color2={color2} />
    </div>
  );
}