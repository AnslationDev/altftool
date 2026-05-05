"use client";

import React from "react";

export default function ShadowControls({ settings, onChange }) {
  const update = (key, value) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="mt-10 p-6 rounded-2xl border border-(--border) bg-(--card) shadow-md max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Shadow Settings</h3>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-medium">Enable Shadow</span>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => update("enabled", e.target.checked)}
        />
      </div>

      {/* Controls */}
      {settings.enabled && (
        <div className="space-y-5">

          {/* Angle */}
          <div>
            <label className="text-sm font-medium">Angle: {settings.angle}°</label>
            <input
              type="range"
              min="0"
              max="360"
              value={settings.angle}
              onChange={(e) => update("angle", parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Distance */}
          <div>
            <label className="text-sm font-medium">
              Distance: {settings.distance}px
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.distance}
              onChange={(e) => update("distance", parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Blur */}
          <div>
            <label className="text-sm font-medium">
              Blur: {settings.blur}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={settings.blur}
              onChange={(e) => update("blur", parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Opacity */}
          <div>
            <label className="text-sm font-medium">
              Opacity: {settings.opacity}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.opacity}
              onChange={(e) => update("opacity", parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

        </div>
      )}
    </div>
  );
}