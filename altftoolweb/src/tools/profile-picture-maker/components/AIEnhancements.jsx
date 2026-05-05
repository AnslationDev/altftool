"use client";

import React from "react";
import {
  Sparkles,
  Wand2,
  ScanFace,
  Droplets,
  Eye,
  Sun,
  Leaf,
  Moon,
} from "lucide-react";

export default function AIEnhancements({ ai }) {
  return (
    <div className="space-y-4 border border-(--border) p-4 rounded-xl">

      {/* ── Heading ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 font-semibold text-(--foreground)">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        AI Enhancements
      </div>

      {/* ── Auto Enhance ──────────────────────────────────────────────────────── */}
      <button
        onClick={ai.autoEnhance}
        className="w-full bg-(--primary) text-(--primary-foreground) py-2 rounded-lg flex items-center justify-center gap-2"
      >
        <Wand2 size={16} className="text-white" />
        Auto Enhance
      </button>

      {/* ── Toggles ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2 text-sm">

        {/* Face Focus */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2">
            <ScanFace size={15} className="text-blue-400" />
            Face Focus
          </span>
          <input
            type="checkbox"
            checked={ai.faceFocus}
            onChange={() => ai.setFaceFocus(!ai.faceFocus)}
          />
        </label>

        

        {/* Sharpen Eyes */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2">
            <Droplets size={15} className="text-pink-400" />
            Skin Smooth
          </span>
          <input
            type="checkbox"
            checked={ai.eyeSharpen}
            onChange={() => ai.setEyeSharpen(!ai.eyeSharpen)}
          />
        </label>

      </div>

      {/* ── Lighting Presets ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">

        <button
          onClick={() => ai.applyPreset("studio")}
          className="px-3 py-1 border border-(--border) rounded-md text-sm flex items-center gap-1.5"
        >
          <Sun size={13} className="text-yellow-400" />
          Studio
        </button>

        <button
          onClick={() => ai.applyPreset("natural")}
          className="px-3 py-1 border border-(--border) rounded-md text-sm flex items-center gap-1.5"
        >
          <Leaf size={13} className="text-green-400" />
          Natural
        </button>

        <button
          onClick={() => ai.applyPreset("night")}
          className="px-3 py-1 border border-(--border) rounded-md text-sm flex items-center gap-1.5"
        >
          <Moon size={13} className="text-indigo-400" />
          Night
        </button>

      </div>
    </div>
  );
}