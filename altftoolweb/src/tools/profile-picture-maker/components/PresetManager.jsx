"use client";

import React, { useEffect } from "react";
import { Heart } from "lucide-react";

export default function PresetManager({
  presets,
  savePreset,
  applyPreset,
}) {

  // 🔁 Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("presets");

    if (stored) {
      const parsed = JSON.parse(stored);

      // 👉 load each preset using savePreset
      parsed.forEach((p) => savePreset(p));
    }
  }, [savePreset]);

  // 💾 Save to localStorage whenever presets change
  useEffect(() => {
    localStorage.setItem("presets", JSON.stringify(presets));
  }, [presets]);

  return (
    <div className="w-full space-y-4 p-4 rounded-2xl border border-(--border) bg-(--card)">
      
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-gray-300 font-semibold flex items-center gap-2">
          <Heart size={16} className="text-pink-400" />
          Saved Presets
        </h3>

        {/* ➕ Save button */}
        <button
          onClick={savePreset}
          className="text-xs px-3 py-1 bg-pink-500 hover:bg-pink-600 rounded-md text-white"
        >
          Save
        </button>
      </div>

      {presets.length === 0 && (
        <p className="text-xs text-gray-500">
          No presets yet
        </p>
      )}

      {/* 📦 Preset list */}
      <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => applyPreset(p)}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Preset {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
