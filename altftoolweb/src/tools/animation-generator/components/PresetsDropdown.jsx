import React from "react";

export default function PresetsDropdown({ onSelect }) {
  const presets = ["Fade In", "Slide Up", "Zoom In", "Bounce", "Pulse", "Shake", "Fade Out", "Slide Down"];

  return (
    <div className="bg-(--card) p-4 rounded-lg shadow-card space-y-3 border border-(--border)">
      <h2 className="subheading text-(--foreground) font-semibold">Animation Presets</h2>

      <select
        className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
        onChange={(e) => onSelect && onSelect(e.target.value)}
      >
        <option value="">Select Preset</option>
        {presets.map((preset, idx) => (
          <option key={idx} value={preset}>
            {preset}
          </option>
        ))}
      </select>
    </div>
  );
}