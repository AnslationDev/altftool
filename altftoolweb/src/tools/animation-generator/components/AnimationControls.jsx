"use client";

import React from "react";

import {
  DEFAULT_ANIMATION_CONTROLS,
  updateAnimationControl,
} from "../lib/animationState.js";

export default function AnimationControls({ value = DEFAULT_ANIMATION_CONTROLS, onChange }) {
  const controls = { ...DEFAULT_ANIMATION_CONTROLS, ...value };

  const update = (key, nextValue) => {
    onChange?.((current) => updateAnimationControl(current, key, nextValue));
  };

  return (
    <div className="bg-card p-4 space-y-2 bg-(--card) rounded-lg shadow-card">
      <h2 className="subheading">Animation Controls</h2>

      <div className="grid grid-cols-2 gap-3">

        {/* Duration */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Duration (seconds)
          </label>
          <input
            type="number"
            value={controls.duration}
            step="0.1"
            min="0"
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => update("duration", e.target.value)}
          />
        </div>

        {/* Delay */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Delay (seconds)
          </label>
          <input
            type="number"
            value={controls.delay}
            step="0.1"
            min="0"
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => update("delay", e.target.value)}
          />
        </div>

        {/* Iteration */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Iterations
          </label>
          <select
            value={controls.iterations}
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => update("iterations", e.target.value)}
          >
            <option value="1">1</option>
            <option value="infinite">Infinite</option>
          </select>
        </div>

        {/* Direction */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Direction
          </label>
          <select
            value={controls.direction}
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => update("direction", e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="alternate">Alternate</option>
          </select>
        </div>

        {/* Fill Mode */}
        <div className="space-y-1 col-span-2">
          <label className="text-xs text-(--muted-foreground)">
            Fill Mode
          </label>
          <select
            value={controls.fill}
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => update("fill", e.target.value)}
          >
            <option value="forwards">Forwards</option>
            <option value="backwards">Backwards</option>
            <option value="both">Both</option>
            <option value="none">None</option>
          </select>
        </div>

      </div>
    </div>
  );
}
