"use client";

import { useState, useRef, use } from "react";
import toast from "react-hot-toast";

export default function GradientMultiColor({ angle }) {
  const [stops, setStops] = useState(["#6366f1", "#8b5cf6", "#0ea5e9"]);
  const dragIndex = useRef(null);

  const gradient = `linear-gradient(${angle}deg, ${stops.join(", ")})`;

  const addStop = () => {
    setStops((prev) => [...prev, "#ec4899"]);
  };

  const removeStop = (i) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateStop = (i, val) => {
    setStops((prev) => prev.map((c, idx) => (idx === i ? val : c)));
  };

  const onDragStart = (i) => {
    dragIndex.current = i;
  };

  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    const updated = [...stops];
    const dragged = updated.splice(dragIndex.current, 1)[0];
    updated.splice(i, 0, dragged);
    dragIndex.current = i;
    setStops(updated);
  };

  const onDragEnd = () => {
    dragIndex.current = null;
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(`background: ${gradient};`);
    toast.success("CSS Copied!");
  };

  return (
    <div className="sm:m-8 p-4 border border-(--border) rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Multi-Color Gradient</h3>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Color Stops</label>

          <div className="space-y-2 mt-1">
            {stops.map((color, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                className="flex items-center gap-3 p-3 bg-(--card) border border-(--border) rounded-lg cursor-grab active:cursor-grabbing"
              >
                {/* Drag handle */}
                <span className="text-(--foreground) select-none text-lg">⠿</span>

                {/* Color picker */}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateStop(i, e.target.value)}
                  className="w-10 h-10 cursor-pointer rounded border"
                />

                {/* Hex value */}
                <span className="text-sm font-mono flex-1">{color}</span>

                {/* Remove button */}
                <button
                  onClick={() => removeStop(i)}
                  disabled={stops.length <= 2}
                  className={`text-lg w-7 h-7 flex items-center justify-center rounded transition ${
                    stops.length <= 2
                      ? "opacity-20 cursor-not-allowed"
                      : "hover:bg-red-100 hover:text-red-500 cursor-pointer"
                  }`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add Stop */}
          <button
            onClick={addStop}
            className="w-full py-2 border border-dashed border-(--border) rounded-lg text-sm hover:bg-(--card) transition cursor-pointer"
          >
            + Add Color Stop
          </button>

          {/* CSS Output */}
          <div className="p-4 bg-(--card) rounded-lg">
            <p className="text-xs font-mono mb-1">CSS:</p>
            <code className="text-xs font-mono break-all">background: {gradient};</code>
          </div>

          <button
            onClick={copyCSS}
            className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Copy CSS
          </button>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Live Preview</label>
          <div
            className="w-full h-52 rounded-xl border border-(--border) mt-1"
            style={{ background: gradient }}
          />
          <p className="text-xs text-(--foreground) text-center">
            {stops.length} color stops · drag to reorder
          </p>
        </div>
      </div>
    </div>
  );
}