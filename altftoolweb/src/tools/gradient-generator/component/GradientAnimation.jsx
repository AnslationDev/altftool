"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const DIRECTIONS = [
  {
    label: "←→  Horizontal",
    value: "horizontal",
    angle: 270,
    keyframes: `0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }`,
  },
  {
    label: "↑ ↓  Vertical",
    value: "vertical",
    angle: 180,
    keyframes: `0% { background-position: 50% 0%; }
  50% { background-position: 50% 100%; }
  100% { background-position: 50% 0%; }`,
  },
  {
    label: "↗ Diagonal",
    value: "diagonal",
    angle: 135,
    keyframes: `0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }`,
  },
  {
    label: "↻  Rotate",
    value: "rotate",
    angle: 0,
    keyframes: `0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 100% 0%; }
  75% { background-position: 0% 0%; }
  100% { background-position: 0% 50%; }`,
  },
];

export default function GradientAnimation({ color1, color2 }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [direction, setDirection] = useState("horizontal");

  const selected = DIRECTIONS.find((d) => d.value === direction);

  const animationName = "gradientMove";

const previewStyle = {
  backgroundImage: `linear-gradient(${selected.angle}deg, ${color1}, ${color2}, ${color1})`,
  backgroundSize: isAnimating ? "400% 400%" : "100% 100%",
  animation: isAnimating ? `${animationName} ${speed}s ease infinite` : "none",
};

  const fullCSS = `background: linear-gradient(${selected.angle}deg, ${color1}, ${color2}, ${color1});
background-size: 400% 400%;
animation: ${animationName} ${speed}s ease infinite;

@keyframes ${animationName} {
  ${selected.keyframes}
}`;

  const copyAnimationCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    toast.success("Animation CSS copied!");
  };

  const speedLabel =
    speed <= 3 ? "Fast" : speed <= 6 ? "Medium" : speed <= 10 ? "Slow" : "Very Slow";

  return (
    <div className="sm:m-8 p-4 border border-(--border) rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Animated Gradient</h3>

        {/* Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-(--foreground)">
            {isAnimating ? "Animating" : "Static"}
          </span>
          <div
            onClick={() => setIsAnimating((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              isAnimating ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                isAnimating ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </div>
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Speed */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Speed:{" "}
              <span className="text-blue-500 font-semibold">
                {speedLabel} ({speed}s)
              </span>
            </label>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-(--foreground)">Fast</span>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-(--foreground)">Slow</span>
            </div>
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Direction</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDirection(d.value)}
                  className={`py-2 px-3 rounded-lg border text-sm transition cursor-pointer ${
                    direction === d.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-(--border) hover:bg-(--card)"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* CSS Output */}
          <div className="p-4 bg-(--card) rounded-lg space-y-1">
            <p className="text-xs font-mono mb-2">Animation CSS:</p>
            <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
              {fullCSS}
            </pre>
          </div>

          <button
            onClick={copyAnimationCSS}
            className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Export Animation CSS
          </button>
        </div>

        {/* Live Preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Live Preview</label>

          {/* Inject keyframes via style tag */}
          <style>{`
            @keyframes ${animationName} {
              ${selected.keyframes}
            }
          `}</style>

          <div
            className="w-full h-52 rounded-xl border border-(--border) mt-1"
            style={previewStyle}
          />

          {isAnimating && (
            <p className="text-xs text-(--foreground) text-center">
              ✦ Animating at <strong>{speed}s</strong> cycle — {selected.label.replace(/[←→↑↓↗↻ ]+/, "").trim()} direction
            </p>
          )}

          {!isAnimating && (
            <p className="text-xs text-(--foreground) text-center">
              Toggle the switch above to see the animation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
