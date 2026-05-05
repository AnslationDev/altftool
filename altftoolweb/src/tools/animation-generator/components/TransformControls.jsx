import React, { useState } from "react";

export default function TransformControls({ onChange }) {
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  const update = () => {
    if (onChange) {
      onChange({ translateX, translateY, rotate, scale, opacity });
    }
  };

  return (
    <div className="p-4 rounded space-y-2 bg-(--card) rounded-lg shadow-card">
      <h2 className="subheading">Transform Controls</h2>

      <div className="grid grid-cols-2 gap-3">

        {/* Translate X */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Translate X
          </label>
          <input
            type="number"
            value={translateX}
            onChange={(e) => {
              setTranslateX(parseInt(e.target.value));
              update();
            }}
            className="border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) p-1 rounded w-full"
          />
        </div>

        {/* Translate Y */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Translate Y
          </label>
          <input
            type="number"
            value={translateY}
            onChange={(e) => {
              setTranslateY(parseInt(e.target.value));
              update();
            }}
            className="border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) p-1 rounded w-full"
          />
        </div>

        {/* Rotate */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Rotate (deg)
          </label>
          <input
            type="number"
            value={rotate}
            onChange={(e) => {
              setRotate(parseInt(e.target.value));
              update();
            }}
            className="border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) p-1 rounded w-full"
          />
        </div>

        {/* Scale */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Scale
          </label>
          <input
            type="number"
            value={scale}
            step="0.1"
            onChange={(e) => {
              setScale(parseFloat(e.target.value));
              update();
            }}
            className="border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) p-1 rounded w-full"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-1 col-span-2">
          <label className="text-xs text-(--muted-foreground)">
            Opacity (0 - 1)
          </label>
          <input
            type="number"
            value={opacity}
            step="0.1"
            min="0"
            max="1"
            onChange={(e) => {
              setOpacity(parseFloat(e.target.value));
              update();
            }}
            className="border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) p-1 rounded w-full"
          />
        </div>

      </div>
    </div>
  );
}