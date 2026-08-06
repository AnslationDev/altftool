"use client";

import React from "react";

import {
  DEFAULT_TRANSFORM,
  updateTransform,
} from "../lib/animationState.js";

export default function TransformControls({ value = DEFAULT_TRANSFORM, onChange }) {
  const transform = { ...DEFAULT_TRANSFORM, ...value };

  const update = (key, nextValue) => {
    onChange?.((current) => updateTransform(current, key, nextValue));
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
            value={transform.x}
            onChange={(e) => update("x", e.target.value)}
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
            value={transform.y}
            onChange={(e) => update("y", e.target.value)}
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
            value={transform.rotate}
            onChange={(e) => update("rotate", e.target.value)}
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
            value={transform.scale}
            step="0.1"
            onChange={(e) => update("scale", e.target.value)}
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
            value={transform.opacity}
            step="0.1"
            min="0"
            max="1"
            onChange={(e) => update("opacity", e.target.value)}
            className="border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) p-1 rounded w-full"
          />
        </div>

      </div>
    </div>
  );
}
