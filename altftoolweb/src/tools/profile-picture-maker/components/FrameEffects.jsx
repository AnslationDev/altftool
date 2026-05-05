"use client";

import {
  Sparkles,
  Circle,
  Briefcase,
  Palette,
  Sun,
} from "lucide-react";

export default function FrameEffects({
  frameType,
  setFrameType,
  borderWidth,
  setBorderWidth,
  shadow,
  setShadow,
  glow,
  setGlow,
}) {
  return (
    <div className="w-full  bg-(--card)  border border-(--border) p-3 rounded-2xl shadow space-y-3">

      {/* Title */}
      <div className="flex items-center gap-2 text-pink-600 font-semibold text-sm">
        <Sparkles className="text-pink-500" size={16} />
        Frame & Effects
      </div>

      {/* Frame Type */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFrameType("instagram")}
          className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-xs flex items-center gap-1"
        >
          <Circle size={12} /> Instagram
        </button>

        <button
          onClick={() => setFrameType("linkedin")}
          className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs flex items-center gap-1"
        >
          <Briefcase size={12} /> Open to Work
        </button>

        {/* <button
          onClick={() => setFrameType("custom")}
          className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs flex items-center gap-1"
        >
          <Palette size={12} /> Custom
        </button> */}
        <button
          onClick={() => setFrameType("none")}
          className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs flex items-center gap-1"
        >
          ✕ None
        </button>

      </div>

      
  {/* Border Width */}
      <div>
        <p className="text-xs text-gray-500">Border Thickness</p>
        <input
          type="range"
          min="0"
          max="30"
          value={borderWidth}
          onChange={(e) => setBorderWidth(Number(e.target.value))}
          className="w-full accent-pink-500"
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-2">
        <button
          onClick={() => setShadow(!shadow)}
          className="flex-1 bg-gray-100 text-gray-600 text-xs py-1 rounded flex items-center justify-center gap-1"
        >
          <Sun size={12} /> Shadow
          {shadow ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => setGlow(!glow)}
          className="flex-1 bg-yellow-100 text-yellow-600 text-xs py-1 rounded flex items-center justify-center gap-1"
        >
          ✨ Glow {glow ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}