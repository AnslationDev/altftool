import React, { useState } from "react";

export default function AnimationControls({ onChange }) {
  const [duration, setDuration] = useState(1);
  const [delay, setDelay] = useState(0);
  const [iteration, setIteration] = useState("infinite");
  const [direction, setDirection] = useState("normal");
  const [fillMode, setFillMode] = useState("forwards");

  const update = () => {
    if (onChange) {
      onChange({ duration, delay, iteration, direction, fillMode });
    }
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
            value={duration}
            step="0.1"
            min="0"
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => {
              setDuration(parseFloat(e.target.value));
              update();
            }}
          />
        </div>

        {/* Delay */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Delay (seconds)
          </label>
          <input
            type="number"
            value={delay}
            step="0.1"
            min="0"
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => {
              setDelay(parseFloat(e.target.value));
              update();
            }}
          />
        </div>

        {/* Iteration */}
        <div className="space-y-1">
          <label className="text-xs text-(--muted-foreground)">
            Iterations
          </label>
          <select
            value={iteration}
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => {
              setIteration(e.target.value);
              update();
            }}
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
            value={direction}
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => {
              setDirection(e.target.value);
              update();
            }}
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
            value={fillMode}
            className="p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary) w-full"
            onChange={(e) => {
              setFillMode(e.target.value);
              update();
            }}
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