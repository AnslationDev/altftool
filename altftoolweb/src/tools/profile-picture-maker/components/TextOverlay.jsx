"use client";

import React from "react";
import { Flame, Target, Briefcase, Gamepad2, BadgeCheck, Star } from "lucide-react";

export default function TextOverlay({
  text,
  setText,
  subText,
  setSubText,
  textSize,
  setTextSize,
  textColor,
  setTextColor,
  
}) {
  return (
    <div className="w-full bg-(--card) border border(--border) shadow rounded-2xl p-4 space-y-4 border border-white/10">
      
      {/* TITLE */}
      <h2 className="text-lg font-semibold flex items-center gap-2 text-(--foreground)">
        📝 Text  Overlay
      </h2>

      {/* TEXT INPUT */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name (e.g. Priyanka)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-black/30 text-(--foreground) outline-none"
        />

        <input
          type="text"
          placeholder="Title (e.g. Engineer)"
          value={subText}
          onChange={(e) => setSubText(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-black/30 text-(--foreground) outline-none"
        />
      </div>

      {/* TEXT SIZE */}
      <div>
        <label className="text-sm text-(--foreground)">Text Size</label>
        <input
          type="range"
          min="12"
          max="40"
          value={textSize}
          onChange={(e) => setTextSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* COLOR */}
      <div>
        <label className="text-sm text-">Text Color</label>
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="w-full h-10 rounded-md"
        />
      </div>

      {/* BADGES */}
      {/* <div>
        <p className="text-sm text-gray-300 mb-2">Badges</p>
        <div className="flex gap-3 flex-wrap">
          
          <button onClick={() => setBadge("fire")} className="p-2 rounded-xl bg-orange-500/20">
            <Flame className="text-orange-500" />
          </button>

          <button onClick={() => setBadge("target")} className="p-2 rounded-xl bg-red-500/20">
            <Target className="text-red-500" />
          </button>

          <button onClick={() => setBadge("work")} className="p-2 rounded-xl bg-blue-500/20">
            <Briefcase className="text-blue-500" />
          </button>

          <button onClick={() => setBadge("game")} className="p-2 rounded-xl bg-purple-500/20">
            <Gamepad2 className="text-purple-500" />
          </button>

          <button onClick={() => setBadge(null)} className="text-xs text-gray-400">
            Clear
          </button>

        </div>
      </div> */}

      {/* STICKERS */}
      {/* <div>
        <p className="text-sm text-gray-300 mb-2">Stickers</p>
        <div className="flex gap-3">

          <button onClick={() => setSticker("verified")} className="p-2 rounded-xl bg-blue-500/20">
            <BadgeCheck className="text-blue-500" />
          </button>

          <button onClick={() => setSticker("star")} className="p-2 rounded-xl bg-yellow-400/20">
            <Star className="text-yellow-400" />
          </button>

          <button onClick={() => setSticker(null)} className="text-xs text-gray-400">
            Clear
          </button>

        </div>
      </div> */}

    </div>
  );
}